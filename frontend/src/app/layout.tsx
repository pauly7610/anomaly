import "../globals.css";
import type { ReactNode } from "react";

"use client";
import React, { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="w-full bg-blue-700 text-white py-3 px-6 flex justify-between items-center shadow">
          <span className="font-bold text-lg tracking-wide">Anomaly Detection Dashboard</span>
          {isAuthenticated ? (
            <button
              className="bg-blue-900 px-4 py-1 rounded hover:bg-blue-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="bg-white text-blue-700 px-4 py-1 rounded hover:bg-blue-100"
              onClick={() => setAuthOpen(true)}
            >
              Login / Register
            </button>
          )}
        </nav>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuth={handleAuth} />
        {children}
      </body>
    </html>
  );
}
