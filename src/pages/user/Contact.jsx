import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { RiMailSendLine, RiContactsLine, RiUserLine, RiQuestionLine, RiMailLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.message.length < 10) {
      setError('Your message must be at least 10 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/user/messages', formData);
      setLoading(false);
      setSuccess(response.data.message || 'Your message has been sent successfully.');
      
      // Clear form
      setFormData({
        name: user ? user.full_name : '',
        email: user ? user.email : '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit contact query.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="text-center mb-5">
        <h2 className="text-light fw-bold mb-1">Submit Inquiries / Queries</h2>
        <p className="text-muted">Need support or have academic suggestions? Reach out using the form below</p>
      </div>

      <Row className="gy-4 justify-content-center">
        {/* Contact Form */}
        <Col lg={7}>
          <Card className="crs-card p-4">
            <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
              <RiMailSendLine className="text-info" /> Send A Message
            </h4>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="form-group-custom">
                    <Form.Label className="form-label-custom">Your Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Random Person"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-custom"
                      required
                      disabled={loading || !!user}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="form-group-custom">
                    <Form.Label className="form-label-custom">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-custom"
                      required
                      disabled={loading || !!user}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Subject / Topic</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  placeholder="e.g. Account recovery assistance, Project feedback"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-custom"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Message Content (Min 10 characters)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="message"
                  placeholder="Detail your request or inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  className="input-custom"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Button 
                type="submit" 
                className="btn-grad w-100 py-3 mt-3"
                disabled={loading}
              >
                {loading ? 'Sending message...' : 'Submit Inquiry'}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Developer Contact Side Panel */}
        <Col lg={5}>
          <Card className="crs-card p-4 h-100 justify-content-between">
            <div>
              <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
                <RiContactsLine className="text-warning" /> Developer Directory
              </h4>
              <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                For official queries regarding university roll validations, code deployment testing, or grading evaluations, contact the student designer directly.
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3 text-muted">
                  <div className="p-2 rounded bg-secondary-subtle text-info mt-1">
                    <RiUserLine size={20} />
                  </div>
                  <div>
                    <h6 className="text-light mb-0 fw-bold">Academic Lead</h6>
                    <span style={{ fontSize: '0.85rem' }}>Harshit Singla (BTech AI & DS)</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 text-muted">
                  <div className="p-2 rounded bg-secondary-subtle text-info mt-1">
                    <RiMailLine size={20} />
                  </div>
                  <div>
                    <h6 className="text-light mb-0 fw-bold">Email Inbox</h6>
                    <span style={{ fontSize: '0.85rem' }}>harshitsingla72@gmail.com</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3 text-muted">
                  <div className="p-2 rounded bg-secondary-subtle text-info mt-1">
                    <RiQuestionLine size={20} />
                  </div>
                  <div>
                    <h6 className="text-light mb-0 fw-bold">Academic Identifier</h6>
                    <span style={{ fontSize: '0.85rem' }}>Passing Year: 2024–2028</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-top border-secondary text-center text-muted" style={{ fontSize: '0.8rem' }}>
              Educational Sandbox - All inquiries logged in server JSON.
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
