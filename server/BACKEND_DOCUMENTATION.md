# Backend Documentation

## Overview

The backend is a Node.js/Express application that provides a RESTful API for the leaderboard application. It uses MongoDB for data persistence and Socket.IO for real-time communication.

## 🏗️ Architecture

### Technology Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Project Structure
```
server/
├── src/
│   ├── index.js              # Main server file
│   ├── db.js                 # Database connection
│   ├── models/               # MongoDB models
│   │   ├── User.js           # User model
│   │   └── ClaimHistory.js   # Claim history model
│   ├── routes/               # API routes
│   │   ├── users.js          # User management routes
│   │   ├── claims.js         # Point claiming routes
│   │   └── leaderboard.js    # Leaderboard routes
│   └── seed.js               # Database seeding script
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

**Purpose**: Main server entry point that sets up Express, Socket.IO, and routes.

**Key Features**:
- Express server setup
- Socket.IO integration
- CORS configuration
- Route mounting
- Database connection
- Error handling

**Server Setup**:
```javascript
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
```

**Middleware Configuration**:
```javascript
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
```

**Route Mounting**:
```javascript
app.use('/api/users', usersRouter);
app.use('/api/claim', claimsRouter);
app.use('/api/leaderboard', leaderboardRouter);
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

### Claims Routes

**Location**: `src/routes/claims.js`

**Endpoints**:

#### `POST /api/claim`
- **Purpose**: Claim points for a user
- **Body**: `{ userId: string }`
- **Validation**: userId required
- **Process**:
  1. Find user by ID
  2. Generate random points (1-10)
  3. Update user's total points
  4. Create claim history record
  5. Emit Socket.IO event
- **Response**: Claim result with user info
- **Socket Event**: Emits `leaderboard:updated`
- **Error Handling**: 400 for missing userId, 404 for user not found

**Point Generation**:
```javascript
function randomPoints() {
    return Math.floor(Math.random() * 10) + 1; // 1-10
}
```

### Leaderboard Routes

**Location**: `src/routes/leaderboard.js`

**Endpoints**:

#### `GET /api/leaderboard`
- **Purpose**: Get ranked leaderboard
- **Process**:
  1. Fetch all users
  2. Sort by total points (descending)
  3. Add rank numbers
  4. Return ranked array
- **Sorting**: By totalPoints (descending), then by updatedAt (ascending)
- **Response**: Array of ranked user objects
- **Error Handling**: 500 for server errors

**Ranking Logic**:
```javascript
const ranked = users.map((user, idx) => ({
    _id: user._id,
    name: user.name,
    totalPoints: user.totalPoints,
    rank: idx + 1,
}));
```

## 🔌 Socket.IO Integration

### Real-time Events

**Events Emitted**:

#### `leaderboard:updated`
- **Triggered**: After point claims
- **Purpose**: Notify clients of leaderboard changes
- **Usage**: Frontend refreshes leaderboard

#### `users:updated`
- **Triggered**: After user creation
- **Purpose**: Notify clients of user list changes
- **Usage**: Frontend refreshes user dropdown

**Event Emission**:
```javascript
const io = req.app.get('io');
io.emit('leaderboard:updated');
```

## 🔧 Configuration


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
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));
```

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection
- Check MongoDB service is running
- Verify connection string
- Check network connectivity

#### CORS Errors
- Verify `CLIENT_ORIGIN` environment variable
- Check frontend URL matches CORS configuration

#### Socket.IO Issues
- Ensure Socket.IO server is properly initialized
- Check client connection URL
- Verify CORS settings for Socket.IO

### Postman Collection
Create a Postman collection for API testing and documentation.



---

**Backend Development Team** 🚀 