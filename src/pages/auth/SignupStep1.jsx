import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { RiUser3Line, RiCalendarLine, RiRoadMapLine, RiSmartphoneLine, RiMailLine, RiShieldUserLine, RiErrorWarningLine } from 'react-icons/ri';

const SignupStep1 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [registrationDisabled, setRegistrationDisabled] = useState(false);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const res = await axios.get('/auth/settings');
        if (res.data.userRegistration === false) {
          setRegistrationDisabled(true);
        }
      } catch (err) {
        console.error('Failed to load signup settings:', err);
      }
    };
    checkSettings();
  }, []);

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    address: '',
    phone_number: '',
    email: '',
    aadhaar_number: '',
    pan_number: ''
  });
  
  const [age, setAge] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailOnlyMode = location.state?.editEmailOnly || false;

  // Pre-populate if redirected from OTP page (Change Email)
  useEffect(() => {
    if (location.state && location.state.formData) {
      setFormData(location.state.formData);
    }
  }, [location.state]);

  // Dynamically calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(0);
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Name validation: Only alphabetic characters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.full_name)) {
      setError('Name must contain only alphabetic characters and spaces.');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Phone validation: Exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError('Phone number must be exactly 10 numeric digits.');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email
      };

      const response = await axios.post('/auth/signup', submitData);
      
      setLoading(false);
      
      // Store token and email in state and redirect to OTP Verification page
      navigate('/auth/verify-otp', { 
        state: { 
          signupToken: response.data.signupToken,
          email: formData.email
        } 
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit signup data. Please try again.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '85vh' }}>
      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '640px' }}>
        <div className="text-center mb-4">
          <RiShieldUserLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">Citizen Registration</h2>
          <p className="text-muted">Step 1: Provide demographic and identity verification details</p>
        </div>

        {registrationDisabled && (
          <Alert variant="danger" className="d-flex align-items-center gap-2 mb-4">
            <RiErrorWarningLine size={20} className="flex-shrink-0" />
            <span>This feature is temporarily turned off by the admin. You cannot register a new account at this moment.</span>
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={12}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Full Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                    <RiUser3Line />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="full_name"
                    placeholder="e.g. Random Person"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-custom"
                    required
                    readOnly={isEmailOnlyMode}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Phone Number</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                    <RiSmartphoneLine />
                  </InputGroup.Text>
                  <Form.Control
                    type="tel"
                    name="phone_number"
                    placeholder="e.g. 9876543210"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="input-custom"
                    required
                    readOnly={isEmailOnlyMode}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Email Address</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                    <RiMailLine />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="e.g. example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-custom"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Button 
            type="submit" 
            className="btn-grad w-100 py-3 mt-3"
            disabled={loading || registrationDisabled}
          >
            {loading ? 'Sending verification code...' : 'Verify Email & Proceed'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Link to="/" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: '500' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default SignupStep1;
