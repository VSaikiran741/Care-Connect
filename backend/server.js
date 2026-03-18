require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB! Yay!');

        const db = client.db('careconnect');
        const usersCollection = db.collection('users');
        const requestsCollection = db.collection('requests');

        // Serve the homepage
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        // Config endpoint for Maps API (Frontend fetches this instead of hardcoding)
        app.get('/api/config/maps', (req, res) => {
            res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY || '' });
        });

        // Signup endpoint
        app.post('/api/signup', async (req, res) => {
            try {
                const { userType, username, email, phone, password } = req.body;
                
                // Input validation
                if (!userType || !username || !email || !phone || !password) {
                    return res.status(400).json({ message: 'All fields are required' });
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                     return res.status(400).json({ message: 'Invalid email format' });
                }
                
                if (password.length < 6) {
                    return res.status(400).json({ message: 'Password must be at least 6 characters' });
                }

                const existingUser = await usersCollection.findOne({ $or: [{ email }, { username }] });
                if (existingUser) {
                    return res.status(400).json({ message: 'User with this email or username already exists' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const newUser = {
                    userType,
                    username,
                    email,
                    phone,
                    password: hashedPassword,
                    createdAt: new Date()
                };

                await usersCollection.insertOne(newUser);
                res.status(201).json({ message: 'Signup successful! Please login.' });
            } catch (error) {
                console.error('Signup error:', error);
                res.status(500).json({ message: 'An error occurred during signup.' });
            }
        });

        // Login endpoint
        app.post('/api/login', async (req, res) => {
            try {
                const { username, password } = req.body;

                if (!username || !password) {
                    return res.status(400).json({ message: 'Username and password are required' });
                }

                const user = await usersCollection.findOne({ username });
                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                req.session.user = {
                    userType: user.userType,
                    username: user.username,
                    email: user.email,
                    phone: user.phone
                };

                res.status(200).json({ message: 'Login successful!', userType: user.userType });
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ message: 'An error occurred during login.' });
            }
        });

        // Check authentication status
        app.get('/api/check-auth', (req, res) => {
            try {
                if (req.session.user) {
                    res.status(200).json({ isLoggedIn: true, user: req.session.user });
                } else {
                    res.status(200).json({ isLoggedIn: false });
                }
            } catch(error) {
                res.status(500).json({ message: 'Auth check failed' });
            }
        });

        // Logout endpoint
        app.post('/api/logout', (req, res) => {
            try {
                req.session.destroy((err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Logout failed' });
                    }
                    res.clearCookie('connect.sid');
                    res.status(200).json({ message: 'Logged out successfully' });
                });
            } catch(error) {
                res.status(500).json({ message: 'Error during logout' });
            }
        });

        // Emergency request endpoints
        app.post('/api/requests', async (req, res) => {
            try {
                if (!req.session.user) {
                    return res.status(401).json({ message: 'Unauthorized. Please login.' });
                }

                const { name, emergencyType, location, description, shareLocation, timestamp } = req.body;
                
                if (!name || !emergencyType || !location || !description) {
                     return res.status(400).json({ message: 'Please fill out all required fields.' });
                }

                const requestData = {
                    name,
                    emergencyType,
                    location,
                    description,
                    shareLocation,
                    timestamp: timestamp || new Date().toISOString(),
                    username: req.session.user.username,
                    email: req.session.user.email,
                    phone: req.session.user.phone
                };

                await requestsCollection.insertOne(requestData);
                res.status(201).json({ message: 'Request saved successfully!' });
            } catch(error) {
                console.error('Save request error:', error);
                res.status(500).json({ message: 'An error occurred while saving the request.' });
            }
        });

        app.get('/api/requests', async (req, res) => {
            try {
                 if (!req.session.user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const requests = await requestsCollection.find().toArray();
                res.json(requests);
            } catch(error) {
                res.status(500).json({ message: 'Failed to fetch requests' });
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Oops! MongoDB connection failed:', error);
        process.exit(1);
    }
}

startServer();