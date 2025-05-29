"use client";
import React, { useState } from "react";

export default function AuthModal({ open, onClose, onAuth }: { open: boolean; onClose: () => void; onAuth: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || res.statusText);
      } else {
        if (mode === "login") {
          localStorage.setItem("token", data.access_token);
        } else {
          // auto-login after register
          const loginRes = await fetch("http://localhost:8000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) localStorage.setItem("token", loginData.access_token);
        }
        setEmail(""); setPassword("");
        onAuth();
        onClose();
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-8 w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4 text-center">{mode === "login" ? "Login" : "Register"}</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            className="border rounded p-2"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="border rounded p-2"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded p-2 mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (mode === "login" ? "Logging in..." : "Registering...") : (mode === "login" ? "Login" : "Register")}
          </button>
        </form>
        {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <span>
              New user?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode("register")}>Register</button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode("login")}>Login</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
