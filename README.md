# CareConnect 🚨

**CareConnect** is a web-based Emergency Help Platform dedicated to connecting people in emergency situations with qualified volunteers and professional help. Our mission is to create a safer, more connected community where help is always just a click away.

---

## 📖 Problem & Solution

**The Problem:** In times of crisis, finding immediate, localized help can be challenging. Traditional emergency services might face delays, while qualified individuals nearby—such as off-duty nurses, CPR-certified neighbors, or local volunteers—remain unaware of the situation just a block away.

**The Solution:** CareConnect bridges this gap by providing a real-time, geo-location-enabled platform. Users experiencing an emergency can instantly broadcast their situation and exact location. Registered volunteers in the vicinity can view these alerts on a live dashboard map and navigate to the scene to offer immediate assistance until professional help arrives.

---

## 💡 Real-World Use Case

**Imagine this scenario:** An elderly person experiences a sudden medical issue while home alone, or a bystander witnesses a severe road accident. 

By opening CareConnect, the user quickly issues an emergency broadcast (e.g., "Medical Emergency", "Accident"). The application uses their GPS location to instantly notify nearby registered volunteers. A volunteer accepts the request, views the live location and event details on their dashboard map, and arrives on the scene to provide critical first-aid or support, potentially saving a life before the ambulance arrives.

---

## ✨ Features

- **Role-Based Access Control:** Separate, intuitive interfaces for 'Users' (requesters) and 'Volunteers' (responders).
- **Secure Authentication:** User signup, login, and robust session management featuring password hashing (BCrypt) for enhanced security.
- **Emergency Broadcast System:** Users can quickly submit detailed emergency requests including the type of emergency, a description, and contact information.
- **Live Location Integration:** Automatic GPS tracking and manual map-pinning using the Google Maps API.
- **Interactive Volunteer Dashboard:** Volunteers can view all active emergencies plotted on an interactive map.
- **Request Management:** View full details of an emergency and accept/decline incoming requests in real-time.
- **RESTful API Backend:** A robust Node.js and Express backend securely handling data with MongoDB.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Express-Session, BCrypt
- **APIs:** Google Maps API (Geolocation & Maps Integration)

---

## 🚀 Setup Instructions

Follow these step-by-step instructions to get CareConnect running on your local machine:

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally
- Google Maps API Key (for full map functionality)

### Installation

1. **Clone or Download the Repository**
   Navigate to the project directory in your terminal:
   ```bash
   cd Care-Connect
   ```

2. **Install Dependencies**
   Run the following command to install required Node.js packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the `backend/` directory with the following variables:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017
     SESSION_SECRET=your_super_secret_key
     GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     NODE_ENV=development
     ```
   - Ensure your local MongoDB instance is running on `mongodb://localhost:27017`.

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔌 API Documentation

| Endpoint | Method | Description | Request Body Example |
| :--- | :---: | :--- | :--- |
| `/api/signup` | `POST` | Register a new user or volunteer. | `{ "userType": "volunteer", "username": "JohnDoe", "email": "john@example.com", "phone": "1234567890", "password": "password123" }` |
| `/api/login` | `POST` | Authenticate an existing user. | `{ "username": "JohnDoe", "password": "password123" }` |
| `/api/check-auth`| `GET` | Check if the current session is authenticated. | None |
| `/api/logout` | `POST` | Destroy the current user session. | None |
| `/api/requests` | `POST` | Create a new emergency request. | `{ "name": "Jane", "emergencyType": "Medical", "location": "17.437,78.448", "description": "Needs first aid", "shareLocation": true, "timestamp": "2023-10-01T12:00:00.000Z" }` |
| `/api/requests` | `GET` | Retrieve a list of all active emergency requests. | None |
| `/api/config/maps` | `GET` | Retrieve the Google Maps API Key safely. | None |

---

## 📂 Folder Structure

```text
Care-Connect/
├── backend/
│   ├── .env                 # Environment variables (Secrets & API Keys)
│   └── server.js            # Node.js + Express backend server
├── frontend/
│   ├── assets/              # Logos and images
│   ├── js/                  # Modular JavaScript files (api, auth, map, ui)
│   ├── style.css            # Stylesheets
│   ├── index.html           # Landing page
│   ├── login.html           # Login portal
│   ├── signup.html          # Registration portal
│   ├── request.html         # Emergency request dashboard (Users)
│   └── dashboard.html       # Emergency viewer dashboard (Volunteers)
├── package.json             # NPM dependencies
└── package-lock.json        # NPM lockfile
```

---

## 🔮 Future Enhancements

- **Real-Time Updates via WebSockets:** Implement [Socket.io](https://socket.io/) for instant, unpolled map updates whenever a new emergency request is logged.
- **In-App Messaging:** Secure real-time chat functionality between the person in need and the responding volunteer.
- **Push Notifications:** Send browser-based or mobile push notifications to volunteers when an emergency occurs in their immediate vicinity.
- **Resource Dispatching:** Direct integration with public APIs for local 911/emergency dispatch services.
- **User Verification:** Implement KYC/ID verification for volunteers to ensure utmost safety and trust within the platform.
- **Mobile Application:** Port the existing web application to a native mobile app framework like React Native or Flutter to leverage native device capabilities.

---
*Built to assist communities and connect help where it's needed most.*
