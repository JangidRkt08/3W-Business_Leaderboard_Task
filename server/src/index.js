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

const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ORIGIN || '*',
		methods: ['GET', 'POST']
	}
});

// Expose io to routes via request
app.set('io', io);

app.use(cors({
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

app.get('/', (req, res) => {
	res.json({ status: 'ok', message: 'Leaderboard API running' });
});

app.use('/api/users', usersRouter);
app.use('/api/claim', claimsRouter);
app.use('/api/leaderboard', leaderboardRouter);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}).catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
}); 