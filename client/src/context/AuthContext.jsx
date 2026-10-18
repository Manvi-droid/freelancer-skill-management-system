import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fsms_token') || null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then(data => {
          setUser(data.user);
          setUnreadNotifications(data.unreadNotifications || 0);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('fsms_token');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      // Default to demo freelancer Riya Kapoor on first visit for zero-friction evaluation
      switchDemoRole('freelancer').finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('fsms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('fsms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const switchDemoRole = async (roleName) => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleName }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('fsms_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
      }
    } catch (err) {
      console.error('Demo switch error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('fsms_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setUnreadNotifications(data.unreadNotifications || 0);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        loading,
        unreadNotifications,
        setUnreadNotifications,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
