const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDb = require('./db');
const ClaimHistory = require('./models/ClaimHistory');
const { getLeaderboard } = require('./services/socketService');
const usersRouter = require('./routes/users');
const User = require('./models/User');

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

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Leaderboard API running" });
});

app.use("/api/users", usersRouter);

io.on('connection', (socket) => {
	getLeaderboard().then((data) => socket.emit('leaderboard:data', data)).catch(() => {});

	socket.on('claim:submit', async (payload, ack) => {
		try {
			const { userId } = payload || {};
			if (!userId) {
				const error = 'userId is required';
				return typeof ack === 'function'
					? ack({ ok: false, error })
					: socket.emit('claim:error', { message: error });
			}

			const user = await User.findById(userId);
			if (!user) {
				const error = 'User not found';
				return typeof ack === 'function'
					? ack({ ok: false, error })
					: socket.emit('claim:error', { message: error });
			}

			const points = Math.floor(Math.random() * 10) + 1; // 1..10
			user.totalPoints += points;
			await user.save();
			const history = await ClaimHistory.create({ user: user._id, points });
			io.emit('claim:history', history);

			const data = await getLeaderboard();
			io.emit('leaderboard:data', data);
		} catch (err) {
			if (typeof ack === 'function') return ack({ ok: false, error: 'Failed to process claim' });
			socket.emit('claim:error', { message: 'Failed to process claim' });
		}
	});
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