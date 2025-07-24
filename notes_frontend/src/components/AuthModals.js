import React, { useState } from "react";
import { registerUser, loginUser } from "../api";

// PUBLIC_INTERFACE
export function AuthModal({ mode = "login", onClose, onAuth }) {
  /** Modal for login or registration. */
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser({
          username: form.username,
          password: form.password,
        });
      } else {
        await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        // Auto-login after registration
        data = await loginUser({
          username: form.username,
          password: form.password,
        });
      }
      onAuth(data);
    } catch (e) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
            minLength={3}
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            minLength={isLogin ? 1 : 8}
          />
          {error && <div className="modal-error">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
