import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [isServerDown, setIsServerDown] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRestoredToast, setShowRestoredToast] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(15);
  const [errorMessage, setErrorMessage] = useState('');

  const isServerDownRef = useRef(isServerDown);
  isServerDownRef.current = isServerDown;

  const isCheckingRef = useRef(isChecking);
  isCheckingRef.current = isChecking;

  // Mark server as down
  const markServerDown = useCallback((reason = '') => {
    setIsServerDown(true);
    if (reason) setErrorMessage(reason);
    setLastChecked(new Date());
  }, []);

  // Mark server as recovered/online
  const markServerOnline = useCallback(() => {
    if (isServerDownRef.current) {
      setIsServerDown(false);
      setErrorMessage('');
      setIsDismissed(false);
      setShowRestoredToast(true);
      setTimeout(() => {
        setShowRestoredToast(false);
      }, 4500);
    }
    setLastChecked(new Date());
  }, []);

  // Actively check server health
  const checkServerHealth = useCallback(async (isManual = false) => {
    if (isCheckingRef.current) return;
    setIsChecking(true);

    try {
      // Use short timeout for health ping
      const res = await axios.get('/health', {
        timeout: 8000,
        headers: { 'X-Health-Check': 'true' }
      });

      if (res.status === 200 || res.status === 304 || res.data?.status === 'ok') {
        markServerOnline();
      }
    } catch (error) {
      // If error is network error or 502/503/504
      if (!error.response || (error.response && error.response.status >= 502 && error.response.status <= 504) || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        markServerDown(error.message || 'Unable to connect to backend server');
      }
    } finally {
      setIsChecking(false);
      setRetryCountdown(15);
    }
  }, [markServerOnline, markServerDown]);

  // Install Global Axios Response Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Successful response received - if server was down, recover it
        if (isServerDownRef.current) {
          markServerOnline();
        }
        return response;
      },
      (error) => {
        // Detect network failure, offline, connection refusal, timeout, or gateway errors (502, 503, 504)
        const isNetworkError = 
          !error.response || 
          error.code === 'ERR_NETWORK' || 
          error.code === 'ECONNABORTED' ||
          error.message?.toLowerCase().includes('network error') ||
          (error.response && error.response.status >= 502 && error.response.status <= 504);

        if (isNetworkError) {
          markServerDown(error.message || 'Backend server is unreachable');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [markServerDown, markServerOnline]);

  // Initial health check on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      checkServerHealth();
    }, 600);
    return () => clearTimeout(timer);
  }, [checkServerHealth]);

  // Automatic interval polling & countdown timer when server is down
  useEffect(() => {
    if (!isServerDown) {
      setRetryCountdown(15);
      return;
    }

    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          checkServerHealth();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isServerDown, checkServerHealth]);

  return (
    <ServerStatusContext.Provider
      value={{
        isServerDown,
        isChecking,
        isDismissed,
        setIsDismissed,
        showRestoredToast,
        setShowRestoredToast,
        lastChecked,
        retryCountdown,
        errorMessage,
        checkServerHealth
      }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatus = () => useContext(ServerStatusContext);
