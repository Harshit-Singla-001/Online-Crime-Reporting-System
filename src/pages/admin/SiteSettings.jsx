import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { RiSettings4Line, RiToggleLine, RiShieldKeyholeLine, RiToolsFill, RiAlertFill } from 'react-icons/ri';

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    firSubmission: true,
    userRegistration: true,
    captchaEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    alert("This page is not completely built and it is recommended not to open or use.");
    fetchSettings();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/settings');
      setSettings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await axios.put('/admin/settings', settings);
      setSuccess(response.data.message || 'System settings successfully updated.');
      setSettings(response.data.settings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Global System Parameters</h2>
        <p className="text-muted">Configure active services, registration rules, database checks, and server status</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="justify-content-center">
        <Col lg={8}>
          <Form onSubmit={handleSubmit}>
            <Card className="crs-card p-4 text-start">
              <h4 className="text-light fw-bold mb-4 d-flex align-items-center gap-2">
                <RiSettings4Line className="text-info" /> Core System Switches
              </h4>

              {/* Maintenance Mode */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                <div style={{ maxWidth: '80%' }}>
                  <h6 className="text-light fw-bold mb-1 d-flex align-items-center gap-2">
                    <RiToolsFill className="text-warning" /> System Maintenance Mode
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    When active, the public citizen portal will show a maintenance warning and suspend all report filing endpoints.
                  </p>
                </div>
                <Form.Check 
                  type="switch"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                  style={{ fontSize: '1.5rem' }}
                />
              </div>

              {/* FIR Submissions */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                <div style={{ maxWidth: '80%' }}>
                  <h6 className="text-light fw-bold mb-1 d-flex align-items-center gap-2">
                    <RiAlertFill className="text-info" /> Online FIR Submission
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Toggling this OFF blocks users from submitting new FIR reports. Existing FIR logs remain searchable.
                  </p>
                </div>
                <Form.Check 
                  type="switch"
                  id="firSubmission"
                  checked={settings.firSubmission}
                  onChange={() => handleToggle('firSubmission')}
                  style={{ fontSize: '1.5rem' }}
                />
              </div>

              {/* User Registration */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                <div style={{ maxWidth: '80%' }}>
                  <h6 className="text-light fw-bold mb-1 d-flex align-items-center gap-2">
                    <RiToggleLine className="text-info" /> Citizen Self-Registration
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Allow visitors to create new accounts. When disabled, signups will be blocked.
                  </p>
                </div>
                <Form.Check 
                  type="switch"
                  id="userRegistration"
                  checked={settings.userRegistration}
                  onChange={() => handleToggle('userRegistration')}
                  style={{ fontSize: '1.5rem' }}
                />
              </div>

              {/* Captcha Enabled */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div style={{ maxWidth: '80%' }}>
                  <h6 className="text-light fw-bold mb-1 d-flex align-items-center gap-2">
                    <RiShieldKeyholeLine className="text-info" /> Server CAPTCHA Verification
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Enforce SVG CAPTCHA solvers during login to prevent automated brute-force attempts on admin and user accounts.
                  </p>
                </div>
                <Form.Check 
                  type="switch"
                  id="captchaEnabled"
                  checked={settings.captchaEnabled}
                  onChange={() => handleToggle('captchaEnabled')}
                  style={{ fontSize: '1.5rem' }}
                />
              </div>

              <Button 
                type="submit" 
                className="btn-grad w-100 py-3 mt-4"
                disabled={saving}
              >
                {saving ? 'Updating parameters...' : 'Save Configuration Parameters'}
              </Button>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SiteSettings;
