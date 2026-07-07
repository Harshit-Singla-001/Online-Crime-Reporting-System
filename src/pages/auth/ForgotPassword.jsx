import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, InputGroup, Card, Row, Col } from 'react-bootstrap';
import { RiMailLine, RiShieldKeyholeLine, RiArrowLeftLine, RiMailSendLine, RiKey2Line } from 'react-icons/ri';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/forgot-password', { email });
      setLoading(false);
      setEmailChecked(true);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'This email is not registered.');
    }
  };

  const handleSelectOtp = () => {
    navigate('/auth/forgot-otp', { state: { email } });
  };

  const handleSelectKey = () => {
    navigate('/auth/forgot-key', { state: { email } });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="mb-3 text-start">
          <Link to="/auth/login" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
            <RiArrowLeftLine /> Back to Login
          </Link>
        </div>

        <div className="text-center mb-4">
          <RiShieldKeyholeLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">Account Recovery</h2>
          <p className="text-muted">Retrieve dashboard access by resetting your security code</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!emailChecked ? (
          <Form onSubmit={handleCheckEmail}>
            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Register Email Address</Form.Label>
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

            <Button 
              type="submit" 
              className="btn-grad w-100 py-3 mt-2" 
              disabled={loading}
            >
              {loading ? 'Searching account records...' : 'Verify Email Address'}
            </Button>
          </Form>
        ) : (
          <div className="animate-fade-in">
            <Alert variant="success">
              Email verified! Select recovery method for: <strong>{email}</strong>
            </Alert>
            
            <Row className="gy-3 mt-2">
              <Col xs={12}>
                <Card 
                  onClick={handleSelectOtp}
                  className="p-3 text-start crs-card cursor-pointer hover-glow" 
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-glass)', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded bg-info-subtle text-info">
                      <RiMailSendLine size={28} />
                    </div>
                    <div>
                      <h5 className="text-light mb-1 fw-bold">Verify via Email OTP</h5>
                      <p className="text-muted mb-0 style-desc" style={{ fontSize: '0.85rem' }}>
                        Send a 6-digit verification code to your email inbox.
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={12}>
                <Card 
                  onClick={handleSelectKey}
                  className="p-3 text-start crs-card cursor-pointer hover-glow" 
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-glass)', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded bg-warning-subtle text-warning">
                      <RiKey2Line size={28} />
                    </div>
                    <div>
                      <h5 className="text-light mb-1 fw-bold">Verify via Recovery Key</h5>
                      <p className="text-muted mb-0 style-desc" style={{ fontSize: '0.85rem' }}>
                        Drag & Drop your 10 security words in sequence to reset.
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Button 
              variant="outline-secondary" 
              className="w-100 py-2 mt-4" 
              onClick={() => setEmailChecked(false)}
            >
              Change Email Address
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ForgotPassword;
