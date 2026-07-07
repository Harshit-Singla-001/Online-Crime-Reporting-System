import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine, RiShieldKeyholeLine } from 'react-icons/ri';
import Captcha from '../../components/Captcha';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState({ token: '', answer: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = (data) => {
    setCaptcha(prev => ({
      token: data.token !== undefined ? data.token : prev.token,
      answer: data.answer !== undefined ? data.answer : prev.answer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captcha.answer) {
      setError('Please solve the CAPTCHA first.');
      return;
    }

    setLoading(true);

    const res = await login(email, password, captcha.answer, captcha.token);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/home');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-4">
          <RiShieldKeyholeLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">System Login</h2>
          <p className="text-muted">Enter credentials to access Online Crime Reporting System</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                <RiMailLine />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-custom"
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="form-group-custom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="form-label-custom mb-0">Password</Form.Label>
              <Link to="/auth/forgot-password" style={{ color: 'var(--color-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <InputGroup>
              <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                <RiLockPasswordLine />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-custom"
                required
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Captcha 
            onCaptchaChange={handleCaptchaChange}
            value={captcha.answer}
          />

          <Button 
            type="submit" 
            className="btn-grad w-100 py-3 mt-2" 
            disabled={loading}
          >
            {loading ? 'Validating credentials...' : 'Access Dashboard'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Link to="/auth/signup" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: '500' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Login;
