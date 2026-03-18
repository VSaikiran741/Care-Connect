const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('.'));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS in production
}));

// MongoDB connection
const uri = 'mongodb://localhost:27017';
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
            res.sendFile(__dirname + '/index.html');
        });

        // Signup endpoint
        app.post('/api/signup', async (req, res) => {
            try {
                const { userType, username, email, phone, password } = req.body;

                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
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

                // Find user by username
                const user = await usersCollection.findOne({ username });
                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Compare password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Store user in session
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
            if (req.session.user) {
                res.status(200).json({ isLoggedIn: true, user: req.session.user });
            } else {
                res.status(200).json({ isLoggedIn: false });
            }
        });

        // Logout endpoint
        app.post('/api/logout', (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Logout failed' });
                }
                res.status(200).json({ message: 'Logged out successfully' });
            });
        });

        // Emergency request endpoints
        app.post('/api/requests', async (req, res) => {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const requestData = {
                ...req.body,
                username: req.session.user.username,
                email: req.session.user.email,
                phone: req.session.user.phone
            };

            await requestsCollection.insertOne(requestData);
            res.status(201).json({ message: 'Request saved!' });
        });

        app.get('/api/requests', async (req, res) => {
            const requests = await requestsCollection.find().toArray();
            res.json(requests);
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Oops! MongoDB connection failed:', error);
    }
}

startServer();