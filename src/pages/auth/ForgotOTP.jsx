import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { RiMailCheckLine, RiArrowLeftLine, RiKey2Line } from 'react-icons/ri';

const ForgotOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = useRef([]);

  // Send OTP on mount
  useEffect(() => {
    if (!location.state || !location.state.email) {
      navigate('/auth/forgot-password');
      return;
    }
    setEmail(location.state.email);
    triggerOtp(location.state.email);
  }, [location, navigate]);

  // Resend Countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const triggerOtp = async (targetEmail) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/auth/forgot-otp', { email: targetEmail });
      setResetToken(response.data.resetToken);
      setLoading(false);
      setError('A 6-digit verification code has been dispatched to your email.');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to dispatch verification code.');
    }
  };

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/forgot-otp-verify', {
        otp: otpCode,
        resetToken
      });
      setLoading(false);
      
      // Route to Reset Password page with verifiedToken
      navigate('/auth/reset-password', {
        state: { verifiedToken: response.data.verifiedToken }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Verification failed. Incorrect code.');
    }
  };

  const handleResend = () => {
    setTimer(60);
    setResendDisabled(true);
    triggerOtp(email);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5 text-center" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/auth/forgot-password" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
            <RiArrowLeftLine /> Back
          </Link>
          <Link to="/auth/forgot-key" state={{ email }} className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
            <RiKey2Line /> Reset via Key
          </Link>
        </div>

        <RiMailCheckLine size={48} className="text-info mb-3" />
        <h2 className="text-light fw-bold">Enter OTP Code</h2>
        <p className="text-muted">
          Provide the security code sent to <strong className="text-light">{email}</strong> to verify ownership.
        </p>

        {error && (
          <Alert variant={error.includes('dispatched') ? 'success' : 'danger'} className="text-start">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleVerify}>
          <div className="d-flex justify-content-center gap-2 my-4">
            {otpValues.map((val, idx) => (
              <Form.Control
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="1"
                value={val}
                onChange={(e) => handleChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="text-center fw-bold fs-4 input-custom"
                style={{ width: '48px', height: '56px', background: 'var(--bg-input)', borderColor: 'var(--border-glass)' }}
                disabled={loading}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <Button type="submit" className="btn-grad w-100 py-3 mb-3" disabled={loading}>
            {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
          </Button>
        </Form>

        <p className="text-muted mb-0">
          {timer > 0 ? (
            <span>Resend code in <strong className="text-light">{timer}s</strong></span>
          ) : (
            <Button 
              variant="link" 
              onClick={handleResend} 
              disabled={resendDisabled || loading} 
              className="p-0 border-0 text-decoration-none"
              style={{ color: 'var(--color-secondary)', fontWeight: '500' }}
            >
              Resend Code
            </Button>
          )}
        </p>
      </div>
    </Container>
  );
};

export default ForgotOTP;
