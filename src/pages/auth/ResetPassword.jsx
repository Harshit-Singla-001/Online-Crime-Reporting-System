import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine } from 'react-icons/ri';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [verifiedToken, setVerifiedToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.verifiedToken) {
      navigate('/auth/forgot-password');
      return;
    }
    setVerifiedToken(location.state.verifiedToken);
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/reset-password', {
        password,
        confirmPassword,
        verifiedToken
      });
      setLoading(false);
      setSuccess('Password reset successful. Redirecting to login...');
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset failed. Token may have expired.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <RiShieldKeyholeLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">Reset Password</h2>
          <p className="text-muted">Define a brand new security code for your citizen account</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">New Password</Form.Label>
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
            disabled={loading || success}
          >
            {loading ? 'Updating security credentials...' : 'Reset Code & Re-authenticate'}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default ResetPassword;
