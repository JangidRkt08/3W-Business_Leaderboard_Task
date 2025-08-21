# Backend Documentation

## Overview

The backend is a Node.js/Express application that provides a RESTful API for the leaderboard application. It uses MongoDB for data persistence and Socket.IO for real-time communication with integrated claim handling.

## 🏗️ Architecture

### Technology Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication with integrated claim processing
- **CORS** - Cross-origin resource sharing (allows all origins)
- **dotenv** - Environment variable management

### Project Structure
```
server/
├── src/
│   ├── index.js              # Main server file with Socket.IO logic
│   ├── db.js                 # Database connection
│   ├── models/               # MongoDB models
│   │   ├── User.js           # User model
│   │   └── ClaimHistory.js   # Claim history model
│   ├── routes/               # API routes
│   │   └── users.js          # User management routes
│   ├── services/             # Business logic services
│       └── socketService.js  # Leaderboard calculation service
│             
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Docker)
- npm or yarn

### Installation
```bash
cd server
npm install
```

### Environment Setup
Create a `.env` file in the server directory:
```env
MONGODB_URI=mongodb://localhost:27017/leaderboard
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

### Development
```bash
npm run dev
```
This starts the server with nodemon for auto-reload at `http://localhost:5000`

### Production
```bash
npm start
```

### Database Seeding
```bash
npm run seed
```

## 📁 Core Components

### index.js - Main Server File

**Location**: `src/index.js`

**Purpose**: Main server entry point that sets up Express, Socket.IO with integrated claim handling, and routes.

**Key Features**:
- Express server setup
- Socket.IO integration with claim processing
- CORS configuration (allows all origins)
- Route mounting
- Database connection
- Error handling

**Server Setup**:
```javascript
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST']
    }
});
```

**Middleware Configuration**:
```javascript
app.use(cors({
    origin: true
}));
app.use(express.json());
```

**Route Mounting**:
```javascript
app.use('/api/users', usersRouter);
```

**Socket.IO Claim Handling**:
```javascript
io.on('connection', (socket) => {
    // Send initial leaderboard data
    getLeaderboard().then((data) => 
        socket.emit('leaderboard:data', data)
    ).catch(() => {});

    socket.on('claim:submit', async (payload, ack) => {
        // Process point claims directly through Socket.IO
        // Generate random points (1-10)
        // Update user total points
        // Create claim history
        // Emit updates to all clients
    });
});
```

### db.js - Database Connection

**Location**: `src/db.js`

**Purpose**: Manages MongoDB connection using Mongoose.

**Configuration**:
```javascript
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leaderboard';
mongoose.set('strictQuery', true);
```

**Connection Options**:
- `serverSelectionTimeoutMS: 5000` - 5 second timeout
- Automatic connection retry
- Error handling and logging

## 📊 Database Models

### User Model

**Location**: `src/models/User.js`

**Schema**:
```javascript
{
    name: { 
        type: String, 
        required: true, 
        trim: true, 
        unique: true 
    },
    totalPoints: { 
        type: Number, 
        default: 0 
    }
}
```

**Features**:
- Unique user names
- Automatic timestamps
- Point tracking
- Name trimming

**Methods**:
- Automatic `createdAt` and `updatedAt` timestamps
- Unique index on name field

### ClaimHistory Model

**Location**: `src/models/ClaimHistory.js`

**Schema**:
```javascript
{
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    points: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 10 
    }
}
```

**Features**:
- Reference to User model
- Point validation (1-10 range)
- Automatic timestamps
- Indexed for performance

## 🛣️ API Routes

### Users Routes

**Location**: `src/routes/users.js`

**Endpoints**:

#### `GET /api/users`
- **Purpose**: Get all users
- **Response**: Array of user objects
- **Sorting**: By creation date (oldest first)
- **Error Handling**: 500 for server errors

#### `POST /api/users`
- **Purpose**: Create a new user
- **Body**: `{ name: string }`
- **Validation**: Name required and trimmed
- **Response**: Created user object
- **Socket Event**: Emits `users:updated`
- **Error Handling**: 400 for validation, 409 for duplicates

#### `GET /api/users/:userId/history`
- **Purpose**: Get user's claim history
- **Params**: `userId` (MongoDB ObjectId)
- **Response**: Array of claim history objects
- **Sorting**: By creation date (newest first)
- **Limit**: 100 records
- **Error Handling**: 500 for server errors

## 🔌 Socket.IO Integration

### Real-time Events

**Events Handled**:

#### `claim:submit`
- **Triggered**: When client submits a point claim
- **Payload**: `{ userId: string }`
- **Process**:
  1. Validate userId
  2. Find user in database
  3. Generate random points (1-10)
  4. Update user's total points
  5. Create claim history record
  6. Emit updates to all clients
- **Response**: Acknowledgment callback or error event

**Events Emitted**:

#### `leaderboard:data`
- **Triggered**: On connection and after point claims
- **Purpose**: Send current leaderboard rankings
- **Data**: Array of ranked user objects

#### `claim:history`
- **Triggered**: After successful point claims
- **Purpose**: Notify all clients of new claim
- **Data**: Claim history object with user, points, timestamp

#### `claim:error`
- **Triggered**: When claim processing fails
- **Purpose**: Notify client of errors
- **Data**: Error message

### Socket.IO Configuration

**CORS Settings**:
```javascript
const io = new Server(server, {
    cors: {
        origin: true,  // Allows all origins
        methods: ['GET', 'POST']
    }
});
```

**Connection Handling**:
```javascript
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial data
    getLeaderboard().then((data) => 
        socket.emit('leaderboard:data', data)
    ).catch(() => {});
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
```

## 🌱 Database Seeding

### seed.js - Database Seeder

**Location**: `src/seed.js`

**Purpose**: Populates database with sample users for development.

**Features**:
- Checks if users already exist (prevents duplicate seeding)
- Creates 10 sample users with Indian names
- Handles duplicate key errors gracefully
- Logs seeding results

**Event Emission**:
```javascript
const io = req.app.get('io');
io.emit('leaderboard:updated');
```

## 🔧 Configuration

### Environment Variables

**Required Variables**:
```env
MONGODB_URI=mongodb://localhost:27017/leaderboard
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

**Optional Variables**:
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `CLIENT_ORIGIN` - Allowed CORS origin (currently allows all)

### Package Scripts

```json
{
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
}
```

## 🔒 Security & Validation

### Input Validation
- **User Names**: Required, trimmed, unique
- **User IDs**: Valid MongoDB ObjectId format
- **Points**: Range validation (1-10)
- **Request Bodies**: JSON parsing with size limits

### Error Handling
- **400 Bad Request**: Invalid input data
- **404 Not Found**: User not found
- **409 Conflict**: Duplicate user names
- **500 Internal Server Error**: Server/database errors

### CORS Configuration
```javascript
app.use(cors({
    origin: true  // Allows all origins
}));
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection
- Check MongoDB service is running
- Verify connection string
- Check network connectivity

#### CORS Errors
- Current configuration allows all origins
- Check if frontend is making requests to correct backend URL
- Verify Socket.IO connection URL

#### Socket.IO Issues
- Ensure Socket.IO server is properly initialized
- Check client connection URL
- Verify CORS settings for Socket.IO

### Postman Collection
Create a Postman collection for API testing and documentation.

---

**Backend Development Team** 🚀 