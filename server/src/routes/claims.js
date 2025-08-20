const express = require('express');
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

const router = express.Router();

function randomPoints() {
	return Math.floor(Math.random() * 10) + 1; // 1-10
}

router.post('/', async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) return res.status(400).json({ error: 'userId is required' });

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: 'User not found' });

		const points = randomPoints();

		user.totalPoints += points;
		await user.save();

		const history = await ClaimHistory.create({ user: user._id, points });

		// emit live update
		const io = req.app.get('io');
		io.emit('leaderboard:updated');

		res.json({ userId: user._id, name: user.name, earned: points, totalPoints: user.totalPoints, historyId: history._id });
	} catch (err) {
		res.status(500).json({ error: 'Failed to process claim' });
	}
});

module.exports = router; 