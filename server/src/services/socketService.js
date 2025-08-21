const User = require('../models/User');


async function getLeaderboard() {
	const users = await User.find().sort({ totalPoints: -1, updatedAt: 1 });
	return users.map((u, idx) => ({
		_id: u._id,
		name: u.name,
		totalPoints: u.totalPoints,
		rank: idx + 1,
	}));
}

module.exports = {
	getLeaderboard,
};