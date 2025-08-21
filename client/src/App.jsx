import { useEffect, useMemo, useState } from 'react';
import socket from './lib/socket';
import { getUsers, createUser, getUserHistory } from "./api";
import "./app.css";

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    refreshUsers();
    socket.on("leaderboard:data", (rows) => setLeaderboard(rows));
    socket.on("users:updated", () => refreshUsers());
    return () => {
      socket.off("leaderboard:data");
      socket.off("users:updated");
    };
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      getUserHistory(selectedUserId).then((res) => setHistory(res.data));
    }
  }, [selectedUserId]);

  useEffect(() => {
    const onClaimHistory = (item) => {
      if (item && item.user === selectedUserId) {
        setHistory((prev) => [item, ...prev]);
      }
    };
    socket.on("claim:history", onClaimHistory);
    return () => socket.off("claim:history", onClaimHistory);
  }, [selectedUserId]);

  const selectedUser = useMemo(
    () => users.find((u) => u._id === selectedUserId),
    [users, selectedUserId]
  );

  async function refreshUsers() {
    const res = await getUsers();
    setUsers(res.data);
    if (!selectedUserId && res.data.length) setSelectedUserId(res.data[0]._id);
  }

  async function handleAddUser(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    await createUser(name);
    form.reset();
    await refreshUsers();
  }

  async function handleClaim() {
    if (!selectedUserId) return;
    setLoading(true);
    setMessage("");
    try {
      socket.emit("claim:submit", { userId: selectedUserId });
      setMessage("Claim submitted");
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
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <button onClick={handleClaim} disabled={loading || !selectedUserId}>
            {loading ? "Claiming..." : "Claim"}
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
            {leaderboard.map((row) => (
              <li
                key={row._id}
                className={row._id === selectedUserId ? "active" : ""}
              >
                <span className="rank">#{row.rank}</span>
                <span className="name">{row.name}</span>
                <span className="points">{row.totalPoints}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Claim History {selectedUser ? `- ${selectedUser.name}` : ""}</h2>
          <ul className="history">
            {history.map((item) => (
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
