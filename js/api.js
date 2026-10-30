/**
 * Pollachi Coconut DataSphere - Client API Service
 * Handles Authentication, Dataset Fetching, Local Updates, and Meteorological Feeds.
 */

const API = (function() {
  const BASE_URL = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000';
  const TOKEN_KEY = 'pollachi_auth_token';
  const USER_KEY = 'pollachi_user_profile';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Login
  async function login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setAuth(data.token, data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (err) {
      // Fallback client validation for standalone execution with RBAC
      const u = (username || '').toLowerCase().trim();
      if (u === 'admin' && (password === 'admin123' || password === 'admin')) {
        const user = { username: 'admin', name: 'Administrator', role: 'admin' };
        setAuth('session-admin-token', user);
        return { success: true, user };
      } else if (u === 'student' || u === 'faculty' || u.length > 0) {
        const role = u === 'faculty' ? 'faculty' : 'student';
        const name = u === 'faculty' ? 'Faculty Evaluator' : 'Student Researcher';
        const user = { username: u, name: name, role: role };
        setAuth(`session-${role}-token`, user);
        return { success: true, user };
      }
      return { success: false, message: 'Invalid User ID or password.' };
    }
  }

  function logout() {
    clearAuth();
  }

  // Fetch Dataset
  async function getDataset() {
    // 1. Check if client has custom saved edits in localStorage first (persists across sessions & on GitHub Pages)
    const localSaved = localStorage.getItem('pollachi_custom_dataset');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed) return parsed;
      } catch (e) {
        console.warn("Could not parse saved local dataset", e);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/api/coconut/data?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Status " + res.status);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      throw new Error("Invalid format");
    } catch (err) {
      try {
        const res2 = await fetch(`data/pollachi_datasets.json?_t=${Date.now()}`);
        if (res2.ok) return await res2.json();
      } catch (e) {}
      if (typeof POLLACHI_STATIC_DATA !== 'undefined' && POLLACHI_STATIC_DATA) {
        return POLLACHI_STATIC_DATA;
      }
      return window.POLLACHI_COCONUT_DATA || window.POLLACHI_STATIC_DATA || null;
    }
  }

  // Update Dataset
  async function updateDataset(updatedData) {
    // Always store immediately in localStorage for client persistence
    try {
      localStorage.setItem('pollachi_custom_dataset', JSON.stringify(updatedData));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }

    try {
      const res = await fetch(`${BASE_URL}/api/coconut/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(updatedData)
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Records updated and saved locally.' };
    }
  }

  return {
    getToken,
    getUser,
    login,
    logout,
    getDataset,
    updateDataset
  };
})();
