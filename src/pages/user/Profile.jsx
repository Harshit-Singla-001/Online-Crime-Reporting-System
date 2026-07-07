import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { RiUser3Line, RiLock2Line, RiCalendarLine, RiSmartphoneLine, RiMailLine, RiRoadMapLine, RiShieldUserLine } from 'react-icons/ri';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    address: ''
  });
  
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/user/profile');
      setProfile(response.data);
      setEditForm({
        full_name: response.data.full_name,
        phone_number: response.data.phone_number,
        address: response.data.address
      });
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaveLoading(true);

    try {
      const response = await axios.put('/user/profile', editForm);
      setProfile(prev => ({
        ...prev,
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number,
        address: response.data.user.address,
        profile_edited: response.data.user.profile_edited
      }));
      setSuccess('Profile updated successfully! Editing has been permanently locked.');
      setIsEditing(false);
      setSaveLoading(false);
    } catch (err) {
      setSaveLoading(false);
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container className="py-5" style={{ minHeight: '80vh' }}>
        <Alert variant="danger">{error || 'Could not find user profile.'}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-4 pb-3 border-bottom border-secondary">
          <RiShieldUserLine size={52} className="text-info mb-2" />
          <h2 className="text-light fw-bold">Citizen Profile</h2>
          <p className="text-muted">Manage demographics and official security credentials</p>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {!profile.profile_edited && !isEditing && (
          <Alert variant="warning" className="mb-4">
            ⚠️ <strong>One-Time Edit Warning:</strong> You can only edit your profile details once. After saving, Name, Phone Number, and Address fields will be permanently locked.
          </Alert>
        )}

        {profile.profile_edited && (
          <Alert variant="info" className="mb-4">
            🔒 <strong>Profile Locked:</strong> You have already edited your profile. Updates have been permanently locked for security auditing.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Full Name */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Full Name</Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2">
                  <RiUser3Line size={18} className="text-muted me-2" />
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleFieldChange}
                      className="border-0 bg-transparent text-light p-0"
                      style={{ outline: 'none', boxShadow: 'none' }}
                      required
                    />
                  ) : (
                    <span className="text-light">{profile.full_name}</span>
                  )}
                </div>
              </Form.Group>
            </Col>

            {/* Email (Always Locked) */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom d-flex justify-content-between align-items-center">
                  <span>Registered Email</span> <RiLock2Line size={12} className="text-muted" />
                </Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2 opacity-75">
                  <RiMailLine size={18} className="text-muted me-2" />
                  <span className="text-light">{profile.email}</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Phone Number */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Phone Number</Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2">
                  <RiSmartphoneLine size={18} className="text-muted me-2" />
                  {isEditing ? (
                    <Form.Control
                      type="tel"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleFieldChange}
                      className="border-0 bg-transparent text-light p-0"
                      style={{ outline: 'none', boxShadow: 'none' }}
                      required
                    />
                  ) : (
                    <span className="text-light">{profile.phone_number}</span>
                  )}
                </div>
              </Form.Group>
            </Col>

            {/* DOB (Always Locked) */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom d-flex justify-content-between align-items-center">
                  <span>Date of Birth</span> <RiLock2Line size={12} className="text-muted" />
                </Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2 opacity-75">
                  <RiCalendarLine size={18} className="text-muted me-2" />
                  <span className="text-light">{new Date(profile.dob).toLocaleDateString()}</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Residential Address</Form.Label>
            <div className="d-flex align-items-start bg-input border-glass rounded p-2">
              <RiRoadMapLine size={18} className="text-muted me-2 mt-1" />
              {isEditing ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={editForm.address}
                  onChange={handleFieldChange}
                  className="border-0 bg-transparent text-light p-0"
                  style={{ outline: 'none', boxShadow: 'none' }}
                  required
                />
              ) : (
                <span className="text-light">{profile.address}</span>
              )}
            </div>
          </Form.Group>

          <Row className="gy-3 mt-1">
            {/* Aadhaar (Always Locked) */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom d-flex justify-content-between align-items-center">
                  <span>Aadhaar Identification</span> <RiLock2Line size={12} className="text-muted" />
                </Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2 opacity-75">
                  <span className="text-light">{profile.aadhaar_number}</span>
                </div>
              </Form.Group>
            </Col>

            {/* PAN (Always Locked) */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom d-flex justify-content-between align-items-center">
                  <span>PAN Identification</span> <RiLock2Line size={12} className="text-muted" />
                </Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2 opacity-75">
                  <span className="text-light">{profile.pan_number || 'N/A (Minor)'}</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Audit stamps */}
          <div className="mt-4 pt-3 border-top border-secondary text-muted" style={{ fontSize: '0.8rem' }}>
            <Row>
              <Col sm={6} className="mb-2">
                Last Login Event: <strong>{profile.last_login ? new Date(profile.last_login).toLocaleString() : 'N/A'}</strong>
              </Col>
              <Col sm={6} className="text-sm-end">
                Registration Date: <strong>{new Date(profile.created_at).toLocaleDateString()}</strong>
              </Col>
            </Row>
          </div>

          {/* Buttons controls */}
          <div className="mt-4 d-flex justify-content-end gap-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-grad"
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : 'Save Profile (Locks Editing)'}
                </Button>
              </>
            ) : (
              !profile.profile_edited && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="btn-grad"
                >
                  Edit Profile Fields
                </Button>
              )
            )}
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Profile;
