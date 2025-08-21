const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDb = require('./db');

const usersRouter = require('./routes/users');
const claimsRouter = require('./routes/claims');
const leaderboardRouter = require('./routes/leaderboard');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allow every origin for Socket.IO
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

// Expose io to routes via request
app.set('io', io);

// Allow every origin for Express routes
app.use(cors({
	origin: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
	res.json({ status: 'ok', message: 'Leaderboard API running' });
});

app.use('/api/users', usersRouter);
app.use('/api/claim', claimsRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Helpful 404 for wrong base URL
app.use('/api', (req, res) => {
	res.status(404).json({ error: 'Not Found', path: req.path });
});

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}).catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
}); 