import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://iplbsbhaiyyugutmddpr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwbGJzYmhhaXl5dWd1bWRkcHIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MjIyNDQxNiwiZXhwIjoyMDY3ODAwNDE2fQ.ezDIsmf12mxj6dTNi5WOXUSFtwsxDsy0rmaVjKuuB34"
);

const Dashboard = () => {
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState(0);

  useEffect(() => {
    if (auth) {
      fetchMessages();
    }
  }, [auth]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("bonnie_memory")
      .select("*")
      .order("timestamp", { ascending: false });

    if (data) {
      setMessages(data);
      const users = new Set(data.map((msg) => msg.session_id));
      setUniqueUsers(users.size);
    }
    setLoading(false);
  };

  const handleAuth = () => {
    if (password === "secret123") {
      setAuth(true);
    }
  };

  if (!auth) {
    return (
      <div style={styles.authBox}>
        <h2>Enter Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAuth} style={styles.btn}>
          Access Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Bonnie Activity Dashboard</h1>
      <p><strong>Total Messages:</strong> {messages.length}</p>
      <p><strong>Unique Users:</strong> {uniqueUsers}</p>
      <div style={styles.list}>
        {messages.slice(0, 20).map((msg) => (
          <div key={msg.id} style={styles.card}>
            <strong>{msg.sender}</strong>: {msg.message}
            <br />
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  authBox: {
    padding: "2rem",
    textAlign: "center",
    maxWidth: "400px",
    margin: "100px auto",
    background: "#222",
    color: "#fff",
    borderRadius: "12px",
  },
  input: {
    padding: "0.6rem",
    width: "100%",
    marginTop: "1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "none",
  },
  btn: {
    padding: "0.6rem 1rem",
    background: "#e91e63",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  container: {
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
    maxWidth: "960px",
    margin: "0 auto",
  },
  list: {
    marginTop: "2rem",
  },
  card: {
    background: "#f9f9f9",
    padding: "1rem",
    marginBottom: "1rem",
    borderRadius: "8px",
  },
};

export default Dashboard;
