import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You might want to verify the token with the server here
      // For simplicity, we'll just refetch user data
      const user = JSON.parse(localStorage.getItem('currentUser'));
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const { token, user } = await res.json();
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const register = async (username, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const { user } = await res.json();
      return user;
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login');
  };

  const updateUser = async (updatedData) => {
    if (!currentUser) return;
    
    // This should be an API call to update the user in the database
    // For now, we'll just update the local state
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Example API call (you'll need to create this endpoint)
    /*
    const res = await fetch(`/api/users/${currentUser._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatedData),
    });
    if(res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    */
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};