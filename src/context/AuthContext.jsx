import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data && response.data.role) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, captchaAnswer, captchaToken) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
        captchaAnswer,
        captchaToken
      });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check network.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Force clear local user anyway
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkLoggedInStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
