import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://threew-business-leaderboard-task.onrender.com', {
	autoConnect: true,
});

export default socket; 