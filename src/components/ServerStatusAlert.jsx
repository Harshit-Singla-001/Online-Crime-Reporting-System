import React from 'react';
import { useServerStatus } from '../context/ServerStatusContext';
import { 
  RiServerLine, 
  RiRefreshLine, 
  RiCloseLine, 
  RiCheckDoubleLine, 
  RiTimeLine,
  RiCloudOffLine,
  RiArrowDownSLine
} from 'react-icons/ri';
import { Spinner } from 'react-bootstrap';

const ServerStatusAlert = () => {
  const { 
    isServerDown, 
    isChecking, 
    isDismissed, 
    setIsDismissed, 
    showRestoredToast, 
    setShowRestoredToast,
    retryCountdown, 
    checkServerHealth 
  } = useServerStatus();

  return (
    <>
      {/* 1. Connection Restored Success Toast */}
      {showRestoredToast && (
        <div className="server-restored-toast animate-fade-in" role="alert">
          <div className="d-flex align-items-center gap-2">
            <div className="server-status-dot online"></div>
            <RiCheckDoubleLine size={20} className="text-success" />
            <div>
              <span className="fw-bold d-block text-white" style={{ fontSize: '0.9rem' }}>
                Backend Connected
              </span>
              <span className="text-light" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Server connection has been successfully restored.
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white ms-3" 
            aria-label="Close"
            onClick={() => setShowRestoredToast(false)}
          />
        </div>
      )}

      {/* 2. Full Server Offline / Waking Up Top Alert Banner */}
      {isServerDown && !isDismissed && (
        <div className="server-status-banner-container animate-fade-in">
          <div className="server-status-banner">
            <div className="server-banner-content">
              {/* Icon & Pulse Indicator */}
              <div className="server-banner-icon-wrapper">
                <div className="server-icon-pulse-ring"></div>
                <div className="server-icon-box">
                  <RiCloudOffLine size={24} className="text-danger" />
                </div>
              </div>

              {/* Text Message Content */}
              <div className="server-banner-text">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h6 className="server-banner-title mb-0">
                    Backend Server Unavailable / Waking Up
                  </h6>
                  <span className="server-badge-offline">
                    <span className="server-status-dot offline"></span>
                    Offline
                  </span>
                  <span className="server-badge-countdown d-none d-sm-inline-flex">
                    <RiTimeLine className="me-1" />
                    Auto-retry in {retryCountdown}s
                  </span>
                </div>
                <p className="server-banner-desc mb-0">
                  Unable to connect to the backend API server. If hosted on a free cloud platform (e.g. Render), the server may take <strong>30–50 seconds</strong> to spin up from sleep. The application will automatically reconnect once available.
                </p>
                <div className="d-sm-none mt-2">
                  <span className="server-badge-countdown">
                    <RiTimeLine className="me-1" />
                    Auto-reconnecting in {retryCountdown}s
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="server-banner-actions">
                <button
                  type="button"
                  className="server-retry-btn"
                  onClick={() => checkServerHealth(true)}
                  disabled={isChecking}
                  title="Check server status immediately"
                >
                  {isChecking ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <RiRefreshLine size={17} className={`me-1.5 ${isChecking ? 'animate-spin' : ''}`} />
                      <span>Retry Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="server-dismiss-btn"
                  onClick={() => setIsDismissed(true)}
                  title="Minimize notification"
                >
                  <RiCloseLine size={18} />
                  <span className="d-none d-md-inline ms-1">Minimize</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Minimized Status Pill (Shown when dismissed but still offline) */}
      {isServerDown && isDismissed && (
        <div className="server-minimized-pill animate-fade-in" role="status">
          <div 
            className="server-pill-inner"
            onClick={() => setIsDismissed(false)}
            title="Server is offline. Click to expand details."
          >
            <div className="server-status-dot offline"></div>
            <RiServerLine size={16} className="text-danger" />
            <span className="server-pill-text">Backend Offline</span>
            <span className="server-pill-timer">({retryCountdown}s)</span>
            <RiArrowDownSLine size={16} className="text-muted ms-1" style={{ transform: 'rotate(180deg)' }} />
          </div>
          <button
            type="button"
            className="server-pill-retry-btn"
            onClick={(e) => {
              e.stopPropagation();
              checkServerHealth(true);
            }}
            disabled={isChecking}
            title="Retry connection"
          >
            <RiRefreshLine size={14} className={isChecking ? 'animate-spin' : ''} />
          </button>
        </div>
      )}
    </>
  );
};

export default ServerStatusAlert;
