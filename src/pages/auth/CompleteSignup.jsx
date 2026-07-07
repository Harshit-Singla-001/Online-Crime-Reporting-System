import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiKey2Line, RiFileCopyLine, RiCheckLine, RiAlertLine } from 'react-icons/ri';

const CompleteSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [verifiedToken, setVerifiedToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [strength, setStrength] = useState({ score: 0, text: 'Weak', color: 'danger' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Recovery key state
  const [recoveryWords, setRecoveryWords] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.verifiedToken) {
      navigate('/auth/signup');
      return;
    }
    setVerifiedToken(location.state.verifiedToken);
  }, [location, navigate]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, text: 'Empty', color: 'secondary' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let text = 'Weak';
    let color = 'danger';
    if (score >= 4) {
      text = 'Strong';
      color = 'success';
    } else if (score >= 3) {
      text = 'Medium';
      color = 'warning';
    }

    setStrength({ score, text, color });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strength.score < 4) {
      setError('Please choose a stronger password (must contain uppercase, lowercase, numbers, and special characters).');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/complete-signup', {
        password,
        confirmPassword,
        verifiedToken
      });

      setLoading(false);
      setRecoveryWords(response.data.recoveryWords);
      setIsCompleted(true);
      // Wait, do not call setUser yet. Let them copy the recovery key!
      // When they click "Go to Home", we set the user to log them in!
      // The backend has already set the HttpOnly cookie token.
      
      // Save user data returned from backend for later login activation
      localStorage.setItem('temp_user', JSON.stringify(response.data.user));
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to complete registration.');
    }
  };

  const handleCopy = () => {
    const text = recoveryWords.join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceed = () => {
    const tempUser = localStorage.getItem('temp_user');
    if (tempUser) {
      setUser(JSON.parse(tempUser));
      localStorage.removeItem('temp_user');
    }
    navigate('/user/home');
  };

  if (isCompleted) {
    return (
      <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
        <div className="crs-card p-4 p-md-5" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="text-center mb-4">
            <RiKey2Line size={52} className="text-warning mb-2" />
            <h2 className="text-light fw-bold">Save Recovery Key</h2>
            <p className="text-muted">
              Use these 10 random words in order to retrieve access to your account if you forget your password.
            </p>
          </div>

          <Alert variant="warning" className="d-flex align-items-center gap-3">
            <RiAlertLine size={32} className="text-warning flex-shrink-0" />
            <div>
              <strong>CRITICAL WARNING:</strong> Save this recovery key immediately. You cannot view it again once you leave this screen.
            </div>
          </Alert>

          <div 
            className="p-3 my-4 rounded border border-warning position-relative" 
            style={{ background: 'rgba(251, 191, 36, 0.05)', letterSpacing: '0.5px' }}
          >
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {recoveryWords.map((word, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-2 rounded text-light"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '1.05rem', fontWeight: '500' }}
                >
                  <span className="text-muted me-1" style={{ fontSize: '0.75rem' }}>{idx+1}.</span>
                  {word}
                </span>
              ))}
            </div>
            
            <Button 
              size="sm"
              variant="outline-warning" 
              onClick={handleCopy} 
              className="mt-3 mx-auto d-flex align-items-center gap-2"
            >
              {copied ? (
                <>
                  <RiCheckLine /> Copied!
                </>
              ) : (
                <>
                  <RiFileCopyLine /> Copy Recovery Key
                </>
              )}
            </Button>
          </div>

          <Button onClick={handleProceed} className="btn-grad w-100 py-3 mt-2">
            I Have Saved the Key - Go to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <RiLockPasswordLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">Set Security Code</h2>
          <p className="text-muted">Step 3: Define a secure password for portal access</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Password</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                <RiLockPasswordLine />
              </InputGroup.Text>
              <Form.Control
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-custom"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowPass(!showPass)}
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}
              >
                {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
              </Button>
            </InputGroup>
            
            {password && (
              <div className="mt-2" style={{ fontSize: '0.85rem' }}>
                Password Strength: <strong className={`text-${strength.color}`}>{strength.text}</strong>
                <div className="progress mt-1" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar bg-${strength.color}`} 
                    role="progressbar" 
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                    aria-valuenow={strength.score} 
                    aria-valuemin="0" 
                    aria-valuemax="5"
                  />
                </div>
              </div>
            )}
          </Form.Group>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Confirm Password</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                <RiLockPasswordLine />
              </InputGroup.Text>
              <Form.Control
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-custom"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}
              >
                {showConfirmPass ? <RiEyeOffLine /> : <RiEyeLine />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button 
            type="submit" 
            className="btn-grad w-100 py-3 mt-3"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account & Generate Key'}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default CompleteSignup;
