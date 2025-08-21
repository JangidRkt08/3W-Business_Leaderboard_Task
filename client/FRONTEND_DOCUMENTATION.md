# Frontend Documentation

## Overview

The frontend is a React application built with Vite that provides a real-time leaderboard interface. It communicates with the backend via REST API calls for user management and Socket.IO for real-time updates and point claiming.

## 🏗️ Architecture

### Technology Stack
- **React 19.1.1** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - Real-time communication and direct point claiming
- **Axios** - HTTP client for API requests
- **CSS3** - Modern styling with responsive design

### Project Structure
```
client/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── api.js               # API service functions
│   ├── lib/
│   │   └── socket.js        # Socket.IO client setup
│   ├── app.css              # Main application styles
│   ├── index.css            # Global styles
│   └── assets/              # Static assets
├── public/                  # Public assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── eslint.config.js         # ESLint configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
cd client
npm install
```

### Development
```bash
npm run dev
```
This starts the development server at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 📁 Component Documentation

### App.jsx - Main Application Component

**Location**: `src/App.jsx`

**Purpose**: Main application component that manages the entire leaderboard interface.

**Key Features**:
- User management (add, select users)
- Point claiming functionality via Socket.IO
- Real-time leaderboard display
- Claim history tracking
- Socket.IO integration for live updates

**State Management**:
```javascript
const [users, setUsers] = useState([]);           // All users
const [selectedUserId, setSelectedUserId] = useState(''); // Currently selected user
const [leaderboard, setLeaderboard] = useState([]); // Ranked leaderboard
const [history, setHistory] = useState([]);       // Selected user's history
const [loading, setLoading] = useState(false);    // Loading states
const [message, setMessage] = useState('');       // Success/error messages
```

**Key Methods**:

#### `refreshUsers()`
- **Purpose**: Fetches all users from the API
- **API Call**: `GET /api/users`
- **Updates**: `users` state and auto-selects first user if none selected

#### `handleClaim()`
- **Purpose**: Claims points for selected user via Socket.IO
- **Socket Event**: Emits `claim:submit` with `{ userId }`
- **Features**: Loading state, success message, history update
- **Updates**: Leaderboard and user history via Socket.IO events

**Socket.IO Integration**:
```javascript
useEffect(() => {
    // Listen for real-time updates
    socket.on('leaderboard:data', (data) => setLeaderboard(data));
    socket.on('claim:history', (item) => {
        if (item && item.user === selectedUserId) {
            setHistory((prev) => [item, ...prev]);
        }
    });
    
    return () => {
        socket.off('leaderboard:data');
        socket.off('claim:history');
    };
}, [selectedUserId]);
```

## 🔌 API Integration

### api.js - API Service Layer

**Location**: `src/api.js`

**Purpose**: Centralized API service functions using Axios.

**Configuration**:
```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
```

**Available Functions**:

#### `getUsers()`
- **Method**: GET
- **Endpoint**: `/users`
- **Returns**: Promise with users array
- **Usage**: Fetching all users for dropdown

#### `createUser(name)`
- **Method**: POST
- **Endpoint**: `/users`
- **Body**: `{ name: string }`
- **Returns**: Promise with created user
- **Usage**: Adding new users

#### `getUserHistory(userId)`
- **Method**: GET
- **Endpoint**: `/users/${userId}/history`
- **Returns**: Promise with claim history
- **Usage**: Showing user's claim history

**Note**: Point claiming is now handled directly through Socket.IO, not via REST API.

## 🔌 Socket.IO Integration

### socket.js - Real-time Communication

**Location**: `src/lib/socket.js`

**Purpose**: Configures Socket.IO client for real-time updates and point claiming.

**Configuration**:
```javascript
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    autoConnect: true,
});
```

**Events Handled**:
- `leaderboard:updated` - Triggers leaderboard refresh
- `users:updated` - Triggers users list refresh

**Responsive Design**:
```css
@media (min-width: 800px) {
    .grid {
        grid-template-columns: 1fr 1fr;
    }
}
```

## 🔧 Configuration

### Vite Configuration

**File**: `vite.config.js`

**Features**:
- React plugin for JSX support
- Hot module replacement (HMR)
- Fast development server

### ESLint Configuration

**File**: `eslint.config.js`

**Rules**:
- React hooks rules
- React refresh plugin
- Unused variables detection
- Modern JavaScript features

## 🌍 Environment Variables

**File**: `.env` (create in client directory)

**Variables**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Note**: All Vite environment variables must be prefixed with `VITE_`

---
