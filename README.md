# Leaderboard Application

A real-time leaderboard application built with React (Frontend) and Node.js/Express (Backend) with MongoDB database and Socket.IO for real-time updates.

## 🚀 Features

- **Real-time Updates**: Live leaderboard updates using Socket.IO
- **User Management**: Add new users and track their points
- **Point System**: Random point allocation (1-10 points per claim)
- **Claim History**: Track all point claims with timestamps
- **Responsive Design**: Modern UI that works on all devices
- **Live Rankings**: Automatic ranking updates based on total points

## 📁 Project Structure

```
3W/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── api.js         # API service functions
│   │   ├── lib/
│   │   │   └── socket.js  # Socket.IO client configuration
│   │   └── app.css        # Application styles
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── index.js       # Main server file
│   │   ├── db.js          # Database connection
│   │   ├── models/        # MongoDB models
│   │   │   ├── User.js
│   │   │   └── ClaimHistory.js
│   │   ├── routes/        # API routes
│   │       ├── users.js
│   │       ├── claims.js
│   │       └── leaderboard.js
│   │           
│   └── package.json 
└── docker-compose.yml     # MongoDB container setup
```

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite** - Build tool and dev server
- **Socket.IO Client** - For Real-time Leaderboard updation
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Atlas or Docker for local)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 3W
   ```

2. **Configure Database (choose ONE option)**
   - MongoDB Atlas (recommended): See "Database Setup > MongoDB Atlas" below and set `MONGODB_URI`
   - Local (Docker minimal): `docker-compose up -d` then use local `MONGODB_URI`

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Set up Environment Variables**
   Create a `.env` file in `server` (see examples in Environment Variables section).


   ```

7. **Start the Application**
   ```bash
   # Terminal 1 - Start Backend
   cd server
   npm run dev
   
   # Terminal 2 - Start Frontend
   cd client
   npm run dev
   ```

8. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🗄️ Database Setup

### Option A: MongoDB Atlas (recommended)
1. Create a cluster on MongoDB Atlas
2. Create a database user (username/password)
3. Network Access: Allow your IP (or 0.0.0.0/0 for development)
4. Get the connection string (Drivers > Node.js)
5. Set `MONGODB_URI` in `server/.env` using your credentials and database name, e.g.:
   ```env
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/leaderboard?retryWrites=true&w=majority
   ```
6. Run `npm run seed` (works with Atlas too) to create sample users

### Option B: Docker (local)
```bash
# From project root
docker-compose up -d
```
Use this connection string in `server/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/leaderboard
```

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Users
- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:userId/history` - Get user's claim history

#### Claims
- `POST /claim` - Claim points for a user

#### Leaderboard
- `GET /leaderboard` - Get ranked leaderboard

### Socket.IO Events
- `leaderboard:updated` - Emitted when leaderboard changes
- `users:updated` - Emitted when users list changes

## 🎯 Usage

1. **Adding Users**: Use the "Add new user name" form to create users
2. **Claiming Points**: Select a user and click "Claim" to award random points (1-10)
3. **Viewing Rankings**: The leaderboard automatically updates in real-time
4. **History**: Click on a user to view their claim history

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Starts Vite dev server with HMR
```


## 📝 Environment Variables

### Backend (.env)
Use ONE of the following based on your setup.

MongoDB Atlas example:
```env
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/leaderboard?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

Local Docker example:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/leaderboard
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🐳 Docker Support (local minimal)

The project includes Docker Compose for easy MongoDB setup:

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required, unique),
  totalPoints: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### ClaimHistory Model
```javascript
{
  user: ObjectId (ref: 'User'),
  points: Number (1-10),
  createdAt: Date
}
```

## 🔒 Security Considerations

- CORS is configured for development
- Input validation on all endpoints
- MongoDB injection protection via Mongoose
- Rate limiting can be added for production


---
