const express = require('express');
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
	try {
		const users = await User.find().sort({ createdAt: 1 });
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch users' });
	}
});

// POST create a new user
router.post('/', async (req, res) => {
	try {
		const { name } = req.body;
		if (!name || !name.trim()) {
			return res.status(400).json({ error: 'Name is required' });
		}
		const user = await User.create({ name: name.trim() });
		res.status(201).json(user);
		// broadcast updated leaderboard trigger
		const io = req.app.get('io');
		io.emit('users:updated');
	} catch (err) {
		if (err.code === 11000) {
			return res.status(409).json({ error: 'User with this name already exists' });
		}
		res.status(500).json({ error: 'Failed to create user' });
	}
});

// GET claim history for a user
router.get('/:userId/history', async (req, res) => {
	try {
		const { userId } = req.params;
		const history = await ClaimHistory.find({ user: userId })
			.sort({ createdAt: -1 })
			.limit(100);
		res.json(history);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch history' });
	}
});

module.exports = router; 