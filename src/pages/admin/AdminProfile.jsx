import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Container, Card, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { RiUser3Line, RiEdit2Line, RiSaveLine, RiCloseCircleLine } from 'react-icons/ri';

const AdminProfile = () => {
  const { checkLoggedInStatus } = useAuth();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/profile');
      setAdmin(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await axios.put('/admin/profile', formData);
      setSuccess(response.data.message || 'Admin profile updated successfully.');
      setAdmin(prev => ({
        ...prev,
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number
      }));
      setIsEditing(false);
      
      // Update global context
      await checkLoggedInStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
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
        <h2 className="text-light fw-bold mb-1">Administrative Profile Settings</h2>
        <p className="text-muted">Review credentials, account status, security keys, and log histories</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="crs-card p-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-light fw-bold mb-0 d-flex align-items-center gap-2">
                <RiUser3Line className="text-info" /> Profile Credentials
              </h4>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline-info" className="d-flex align-items-center gap-1">
                  <RiEdit2Line /> Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">Admin Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="input-custom"
                    required
                  />
                </Form.Group>

                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="input-custom"
                    required
                  />
                </Form.Group>

                <div className="d-flex gap-2 mt-4">
                  <Button 
                    type="submit" 
                    className="btn-grad px-4 py-2"
                    disabled={saving}
                  >
                    <RiSaveLine className="me-1" /> {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button 
                    variant="outline-light" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: admin.full_name || '',
                        phone_number: admin.phone_number || ''
                      });
                    }}
                    disabled={saving}
                    className="d-flex align-items-center gap-1"
                  >
                    <RiCloseCircleLine /> Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <Row className="g-4">
                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>FULL LEGAL NAME</span>
                  <span className="text-light fw-bold fs-5">{admin.full_name}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>EMAIL ADDRESS</span>
                  <span className="text-light fw-bold fs-5">{admin.email}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>TELEPHONE</span>
                  <span className="text-light fw-bold fs-5">{admin.phone_number}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>DATE OF BIRTH</span>
                  <span className="text-light fw-bold fs-5">
                    {admin.dob ? new Date(admin.dob).toLocaleDateString() : 'N/A'}
                  </span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>ROLE ASSIGNED</span>
                  <span className="badge-status badge-approved text-uppercase">{admin.role}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>SECURITY LOCK STATUS</span>
                  <span className="badge-status badge-solved text-uppercase">{admin.status}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>LAST ACCOUNT LOGIN</span>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                  </span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>LAST PROFILE UPDATE</span>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    {admin.updated_at ? new Date(admin.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminProfile;
