import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const BASE_URL = 'https://nexivo.onrender.com';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  // Login with email + OTP + userId (if needed)
  async function login(email, otp, userId) {
    setLoading(true);
    const res = await fetch(BASE_URL + '/v1/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId ? { email, otp, userId } : { email, otp })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.token) {
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  }

  // Send OTP (returns accounts if multiple)
  async function sendOTP(email) {
    setLoading(true);
    const res = await fetch(BASE_URL + '/v1/api/user/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setLoading(false);
    return await res.json();
  }

  // Register
  async function register({ username, email, password, phone }) {
    setLoading(true);
    const res = await fetch(BASE_URL + '/v1/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, phone })
    });
    setLoading(false);
    return await res.json();
  }

  // Verify Email
  async function verifyEmail(email, code) {
    setLoading(true);
    const res = await fetch(BASE_URL + '/v1/api/user/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    setLoading(false);
    return data;
  }

  // Logout
  function logout() {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  }

  // Fetch profile (if token)
  async function fetchProfile() {
    if (!token) return;
    setLoading(true);
    const res = await fetch(BASE_URL + '/v1/api/user/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setUser(data);
  }

  useEffect(() => { if (token) fetchProfile(); }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, sendOTP, register, verifyEmail, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
} 