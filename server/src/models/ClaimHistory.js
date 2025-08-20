const mongoose = require('mongoose');

const claimHistorySchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		points: { type: Number, required: true, min: 1, max: 10 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('ClaimHistory', claimHistorySchema); 