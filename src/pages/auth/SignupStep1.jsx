import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { RiUser3Line, RiCalendarLine, RiRoadMapLine, RiSmartphoneLine, RiMailLine, RiShieldUserLine } from 'react-icons/ri';

const SignupStep1 = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

    // Age validation: Must be at least 13
    if (age < 13) {
      setError('You must be at least 13 years old to register.');
      setLoading(false);
      return;
    }

    // Aadhaar validation: Exactly 12 numeric digits
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(formData.aadhaar_number)) {
      setError('Aadhaar number must be exactly 12 numeric digits.');
      setLoading(false);
      return;
    }

    // PAN validation if age >= 18
    if (age >= 18 && formData.pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_number.toUpperCase())) {
        setError('PAN Card number must be in a valid format (e.g. ABCDE1234F).');
        setLoading(false);
        return;
      }
    }

    try {
      const submitData = {
        full_name: formData.full_name,
        dob: formData.dob,
        address: formData.address,
        phone_number: formData.phone_number,
        email: formData.email,
        aadhaar_number: formData.aadhaar_number,
      };

      if (age >= 18 && formData.pan_number) {
        submitData.pan_number = formData.pan_number;
      }

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

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Full Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                    <RiUser3Line />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="full_name"
                    placeholder="e.g. John Doe"
                    value={formData.full_name}
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
                <Form.Label className="form-label-custom">Date of Birth</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)' }}>
                    <RiCalendarLine />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="input-custom"
                    required
                    readOnly={isEmailOnlyMode}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Permanent Address</Form.Label>
            <div className="d-flex">
              <span className="input-group-text px-3 rounded-start" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-glass)', color: 'var(--color-text-muted)', borderRight: '0' }}>
                <RiRoadMapLine />
              </span>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                placeholder="e.g. 123 Main St, New Delhi"
                value={formData.address}
                onChange={handleChange}
                className="input-custom rounded-start-0"
                required
                readOnly={isEmailOnlyMode}
              />
            </div>
          </Form.Group>

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
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-custom"
                    required
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={age >= 18 ? 6 : 12}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Aadhaar Card Number</Form.Label>
                <Form.Control
                  type="text"
                  name="aadhaar_number"
                  placeholder="e.g. 123456789012"
                  value={formData.aadhaar_number}
                  onChange={handleChange}
                  className="input-custom"
                  required
                  readOnly={isEmailOnlyMode}
                />
              </Form.Group>
            </Col>

            {age >= 18 && (
              <Col md={6}>
                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">PAN Card Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="pan_number"
                    placeholder="e.g. ABCDE1234F"
                    value={formData.pan_number}
                    onChange={handleChange}
                    className="input-custom"
                    readOnly={isEmailOnlyMode}
                  />
                </Form.Group>
              </Col>
            )}
          </Row>

          <Button 
            type="submit" 
            className="btn-grad w-100 py-3 mt-3"
            disabled={loading}
          >
            {loading ? 'Sending verification code...' : 'Verify Email & Proceed'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted mb-0">
            Already have an account?{' '}
            <Link to="/auth/login" style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: '500' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
};

export default SignupStep1;
