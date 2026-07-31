import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Add Axios Request Interceptor to attach the token if it exists in localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/auth/me');
      if (response.data && response.data.role) {
        setUser(response.data);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      setUser(null);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
      }
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
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
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
      localStorage.removeItem('token');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
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
