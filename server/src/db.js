const mongoose = require('mongoose');

async function connectDb() {
	const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leaderboard';
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 5000
	});
	console.log('Connected to MongoDB');
}

module.exports = connectDb; 