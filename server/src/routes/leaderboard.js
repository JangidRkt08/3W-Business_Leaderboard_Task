const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const users = await User.find().sort({ totalPoints: -1, updatedAt: 1 });
		const ranked = users.map((u, idx) => ({
			_id: u._id,
			name: u.name,
			totalPoints: u.totalPoints,
			rank: idx + 1,
		}));
		res.json(ranked);
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch leaderboard' });
	}
});

module.exports = router; 