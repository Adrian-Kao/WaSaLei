"use client";

import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      setResult(data.message ?? "No message returned");
    } catch (error) {
      setResult("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>{result}</p>
    </main>
  );
}
