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
    phone_number: '',
    dob: '',
    address: '',
    aadhaar_number: '',
    pan_number: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/profile');
      setAdmin(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || '',
        dob: response.data.dob ? response.data.dob.split('T')[0] : '',
        address: response.data.address || '',
        aadhaar_number: response.data.aadhaar_number || '',
        pan_number: response.data.pan_number || ''
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

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.full_name)) {
      setError('Name must contain only alphabetic characters and spaces.');
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError('Phone number must be exactly 10 numeric digits.');
      return;
    }

    // Age validation
    const dobDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 13) {
      setError('You must be at least 13 years old.');
      return;
    }

    // Aadhaar validation
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(formData.aadhaar_number)) {
      setError('Aadhaar number must be exactly 12 numeric digits.');
      return;
    }

    // PAN validation
    if (formData.pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_number.toUpperCase())) {
        setError('PAN Card number must be in a valid format (e.g. ABCDE1234F).');
        return;
      }
    }

    // Compare with current data to check if changed
    const originalDob = admin.dob ? admin.dob.split('T')[0] : '';
    const formDob = formData.dob;
    const isChanged =
      formData.full_name !== admin.full_name ||
      formData.phone_number !== admin.phone_number ||
      formData.address !== (admin.address || '') ||
      formDob !== originalDob ||
      formData.aadhaar_number !== (admin.aadhaar_number || '') ||
      formData.pan_number !== (admin.pan_number || '');

    if (!isChanged) {
      setIsEditing(false);
      setSuccess('No changes were made.');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put('/admin/profile', formData);
      setSuccess(response.data.message || 'Admin profile updated successfully.');
      setAdmin(prev => ({
        ...prev,
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number,
        dob: response.data.user.dob,
        address: response.data.user.address,
        aadhaar_number: response.data.user.aadhaar_number,
        pan_number: response.data.user.pan_number,
        updated_at: response.data.user.updated_at
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

  if (!admin) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: '80vh' }}>
        <Alert variant="danger" className="mx-auto" style={{ maxWidth: '600px' }}>
          {error || 'Failed to load administrative profile credentials.'}
        </Alert>
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
                <Row>
                  <Col md={6}>
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
                  </Col>

                  <Col md={6}>
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
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="form-group-custom">
                      <Form.Label className="form-label-custom">Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="input-custom"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="form-group-custom">
                      <Form.Label className="form-label-custom">Aadhaar Identification</Form.Label>
                      <Form.Control
                        type="text"
                        name="aadhaar_number"
                        value={formData.aadhaar_number}
                        onChange={handleInputChange}
                        className="input-custom"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="form-group-custom">
                      <Form.Label className="form-label-custom">Residential Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-custom"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="form-group-custom">
                      <Form.Label className="form-label-custom">PAN Identification</Form.Label>
                      <Form.Control
                        type="text"
                        name="pan_number"
                        value={formData.pan_number}
                        onChange={handleInputChange}
                        className="input-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
                        phone_number: admin.phone_number || '',
                        dob: admin.dob ? admin.dob.split('T')[0] : '',
                        address: admin.address || '',
                        aadhaar_number: admin.aadhaar_number || '',
                        pan_number: admin.pan_number || ''
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
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>AADHAAR IDENTIFICATION</span>
                  <span className="text-light fw-bold fs-5">{admin.aadhaar_number || 'N/A'}</span>
                </Col>

                <Col md={6}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>PAN IDENTIFICATION</span>
                  <span className="text-light fw-bold fs-5">{admin.pan_number || 'N/A'}</span>
                </Col>

                <Col md={12}>
                  <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem' }}>RESIDENTIAL ADDRESS</span>
                  <span className="text-light fw-bold fs-5">{admin.address || 'N/A'}</span>
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
