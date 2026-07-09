import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { RiMailCheckLine, RiArrowLeftLine } from 'react-icons/ri';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [signupToken, setSignupToken] = useState('');
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  const inputRefs = useRef([]);

  // Check state on mount
  useEffect(() => {
    if (!location.state || !location.state.signupToken || !location.state.email) {
      navigate('/auth/signup');
      return;
    }
    setSignupToken(location.state.signupToken);
    setEmail(location.state.email);
    
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [location, navigate]);

  // Resend Timer Countdown
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

  // Handle auto-submit when all 6 numbers are entered
  useEffect(() => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6) {
      handleVerification(fullOtp);
    }
  }, [otpValues]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1); // Get last char entered
    setOtpValues(newOtpValues);

    // Focus next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace key handling to focus previous field
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

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      setOtpValues(pasteData.split(''));
    }
  };

  const handleVerification = async (otpCode) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/verify-otp', {
        otp: otpCode,
        signupToken
      });
      setLoading(false);
      
      // Redirect to Complete Signup with verifiedToken
      navigate('/auth/complete-signup', {
        state: {
          verifiedToken: response.data.verifiedToken
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Incorrect OTP. Try again.');
      // Reset fields
      setOtpValues(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    setResendDisabled(true);
    setTimer(60);

    try {
      // Decode JWT fields or send a simple request
      // For this, we need to extract details from the JWT.
      // Easiest is to send the user back to step 1 OR we can just hit signup step 1 endpoint again with state!
      // But wait! We can decode the token client-side or parse it if we want.
      // Let's decode it: JWT payload is easily readable using base64!
      const payloadBase64 = signupToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const response = await axios.post('/auth/signup', {
        full_name: decodedPayload.full_name,
        dob: decodedPayload.dob,
        address: decodedPayload.address,
        phone_number: decodedPayload.phone_number,
        email: decodedPayload.email,
        aadhaar_number: decodedPayload.aadhaar_number,
        pan_number: decodedPayload.pan_number
      });
      
      setSignupToken(response.data.signupToken);
      setLoading(false);
      setError('A new verification code has been sent to your email.');
    } catch (err) {
      setLoading(false);
      setError('Failed to resend verification code. Please try sign up again.');
    }
  };

  const handleBackToSignup = (e) => {
    e.preventDefault();
    try {
      const payloadBase64 = signupToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      navigate('/auth/signup', {
        state: {
          formData: {
            full_name: decodedPayload.full_name || '',
            dob: decodedPayload.dob ? decodedPayload.dob.split('T')[0] : '',
            address: decodedPayload.address || '',
            phone_number: decodedPayload.phone_number || '',
            email: decodedPayload.email || '',
            aadhaar_number: decodedPayload.aadhaar_number || '',
            pan_number: decodedPayload.pan_number || ''
          },
          editEmailOnly: true
        }
      });
    } catch (err) {
      navigate('/auth/signup');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5 text-center" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="mb-3 text-start">
          <Button 
            variant="link" 
            onClick={handleBackToSignup} 
            className="text-decoration-none d-flex align-items-center gap-1 p-0" 
            style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}
          >
            <RiArrowLeftLine /> Change Email
          </Button>
        </div>

        <RiMailCheckLine size={48} className="text-info mb-3" />
        <h2 className="text-light fw-bold">Verify Email</h2>
        <p className="text-muted">
          We've sent a 6-digit OTP code to <strong className="text-light">{email}</strong>. Please enter it below.
        </p>
        {window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
          <Alert variant="warning" className="text-start py-2 px-3 mb-3" style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255, 193, 7, 0.1)', borderColor: 'rgba(255, 193, 7, 0.3)', color: '#ffc107' }}>
            <strong>[Notice]:</strong> OTP system is not working or broken in the process of deployment we are fixing this. No OTP verification is needed for now until this issue is solved. You can enter any 6 digits (e.g., 123456) to proceed.
          </Alert>
        )}
        {error && (
          <Alert variant={error.includes('sent') ? 'success' : 'danger'} className="text-start">
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-center gap-2 my-4" onPaste={handlePaste}>
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

        <p className="text-muted mb-4">
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
              Resend OTP
            </Button>
          )}
        </p>

        {loading && <p className="text-info">Verifying code...</p>}
      </div>
    </Container>
  );
};

export default VerifyOTP;
