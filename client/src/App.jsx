import { useEffect, useMemo, useState } from 'react';
import socket from './lib/socket';
import { getUsers, createUser, claimPoints, getLeaderboard, getUserHistory } from './api';
import './app.css';

export default function App() {
	const [users, setUsers] = useState([]);
	const [selectedUserId, setSelectedUserId] = useState('');
	const [leaderboard, setLeaderboard] = useState([]);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	useEffect(() => {
		refreshUsers();
		refreshLeaderboard();
		// live updates
		socket.on('leaderboard:updated', () => refreshLeaderboard());
		socket.on('users:updated', () => refreshUsers());
		return () => {
			socket.off('leaderboard:updated');
			socket.off('users:updated');
		};
	}, []);

	useEffect(() => {
		if (selectedUserId) {
			getUserHistory(selectedUserId).then((res) => setHistory(res.data));
		}
	}, [selectedUserId]);

	const selectedUser = useMemo(() => users.find(user => user._id === selectedUserId), [users, selectedUserId]);

	async function refreshUsers() {
		const res = await getUsers();
		setUsers(res.data);
		if (!selectedUserId && res.data.length) setSelectedUserId(res.data[0]._id);
	}

	async function refreshLeaderboard() {
		const res = await getLeaderboard();
		setLeaderboard(res.data);
	}

	async function handleAddUser(e) {
		e.preventDefault();
		const form = e.target;
		const name = form.name.value.trim();
		if (!name) return;
		await createUser(name);
		form.reset();
		await refreshUsers();
		await refreshLeaderboard();
	}

	async function handleClaim() {
		if (!selectedUserId) return;
		setLoading(true);
		setMessage('');
		try {
			const res = await claimPoints(selectedUserId);
			setMessage(`${res.data.name} earned +${res.data.earned} points! Total: ${res.data.totalPoints}`);
			await refreshLeaderboard();
			const hist = await getUserHistory(selectedUserId);
			setHistory(hist.data);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="container">
			<h1>Leaderboard</h1>
			<div className="panel">
				<div className="controls">
					<label>
						<span>Select user</span>
						<select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
							{users.map(user => (
								<option key={user._id} value={user._id}>{user.name}</option>
							))}
						</select>
					</label>
					<button onClick={handleClaim} disabled={loading || !selectedUserId}>
						{loading ? 'Claiming...' : 'Claim'}
					</button>
				</div>
				{message && <div className="message">{message}</div>}

				<form className="add-user" onSubmit={handleAddUser}>
					<input name="name" placeholder="Add new user name" />
					<button type="submit">Add</button>
				</form>
			</div>

			<div className="grid">
				<section>
					<h2>Top Rankings</h2>
					<ul className="leaderboard">
						{leaderboard.map(row => (
							<li key={row._id} className={row._id === selectedUserId ? 'active' : ''}>
								<span className="rank">#{row.rank}</span>
								<span className="name">{row.name}</span>
								<span className="points">{row.totalPoints}</span>
							</li>
						))}
					</ul>
				</section>
				<section>
					<h2>Claim History {selectedUser ? `- ${selectedUser.name}` : ''}</h2>
					<ul className="history">
						{history.map(item => (
							<li key={item._id}>
								<span>+{item.points}</span>
								<time>{new Date(item.createdAt).toLocaleString()}</time>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
