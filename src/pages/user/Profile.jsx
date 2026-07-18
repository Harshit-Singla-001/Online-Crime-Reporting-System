import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { RiUser3Line, RiLock2Line, RiCalendarLine, RiSmartphoneLine, RiMailLine, RiRoadMapLine, RiShieldUserLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    dob: '',
    aadhaar_number: '',
    pan_number: ''
  });
  
  const [saveLoading, setSaveLoading] = useState(false);

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
    try {
      const response = await axios.get('/user/profile');
      setProfile(response.data);
      setEditForm({
        full_name: response.data.full_name,
        phone_number: response.data.phone_number,
        address: response.data.address,
        dob: response.data.dob ? response.data.dob.split('T')[0] : '',
        aadhaar_number: response.data.aadhaar_number,
        pan_number: response.data.pan_number || ''
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

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(editForm.full_name)) {
      setError('Name must contain only alphabetic characters and spaces.');
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(editForm.phone_number)) {
      setError('Phone number must be exactly 10 numeric digits.');
      return;
    }

    // Age validation
    const dobDate = new Date(editForm.dob);
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
    if (!aadhaarRegex.test(editForm.aadhaar_number)) {
      setError('Aadhaar number must be exactly 12 numeric digits.');
      return;
    }

    // PAN validation
    if (editForm.pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(editForm.pan_number.toUpperCase())) {
        setError('PAN Card number must be in a valid format (e.g. ABCDE1234F).');
        return;
      }
    }

    // Compare with current data to check if changed
    const originalDob = profile.dob ? profile.dob.split('T')[0] : '';
    const formDob = editForm.dob;
    const isChanged =
      editForm.full_name !== profile.full_name ||
      editForm.phone_number !== profile.phone_number ||
      editForm.address !== profile.address ||
      formDob !== originalDob ||
      editForm.aadhaar_number !== profile.aadhaar_number ||
      (editForm.pan_number || '') !== (profile.pan_number || '');

    if (!isChanged) {
      setIsEditing(false);
      setSuccess('No changes were made. Profile remains editable.');
      return;
    }

    setSaveLoading(true);

    try {
      const response = await axios.put('/user/profile', editForm);
      setProfile(prev => ({
        ...prev,
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number,
        address: response.data.user.address,
        dob: response.data.user.dob,
        aadhaar_number: response.data.user.aadhaar_number,
        pan_number: response.data.user.pan_number,
        profile_edited: response.data.user.profile_edited,
        updated_at: response.data.user.updated_at
      }));
      setUser(prev => ({
        ...prev,
        full_name: response.data.user.full_name,
        phone_number: response.data.user.phone_number,
        address: response.data.user.address,
        dob: response.data.user.dob,
        aadhaar_number: response.data.user.aadhaar_number
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

            {/* DOB */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Date of Birth</Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2">
                  <RiCalendarLine size={18} className="text-muted me-2" />
                  {isEditing ? (
                    <Form.Control
                      type="date"
                      name="dob"
                      value={editForm.dob}
                      onChange={handleFieldChange}
                      className="border-0 bg-transparent text-light p-0"
                      style={{ outline: 'none', boxShadow: 'none' }}
                      required
                    />
                  ) : (
                    <span className="text-light">{new Date(profile.dob).toLocaleDateString()}</span>
                  )}
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
            {/* Aadhaar */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Aadhaar Identification</Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2">
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="aadhaar_number"
                      value={editForm.aadhaar_number}
                      onChange={handleFieldChange}
                      className="border-0 bg-transparent text-light p-0"
                      style={{ outline: 'none', boxShadow: 'none' }}
                      required
                    />
                  ) : (
                    <span className="text-light">{profile.aadhaar_number}</span>
                  )}
                </div>
              </Form.Group>
            </Col>

            {/* PAN */}
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">PAN Identification</Form.Label>
                <div className="d-flex align-items-center bg-input border-glass rounded p-2">
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="pan_number"
                      value={editForm.pan_number}
                      onChange={handleFieldChange}
                      className="border-0 bg-transparent text-light p-0"
                      style={{ outline: 'none', boxShadow: 'none' }}
                    />
                  ) : (
                    <span className="text-light">{profile.pan_number || 'N/A'}</span>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Audit stamps */}
          <div className="mt-4 pt-3 border-top border-secondary text-muted" style={{ fontSize: '0.8rem' }}>
            <Row>
              <Col sm={6} className="mb-2">
                Last Login Event: <strong>{profile.last_login ? new Date(profile.last_login).toLocaleString() : 'N/A'}</strong>
                <div className="mt-1">
                  Last Updated: <strong>{profile.profile_edited && profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}</strong>
                </div>
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
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      full_name: profile.full_name || '',
                      phone_number: profile.phone_number || '',
                      address: profile.address || '',
                      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                      aadhaar_number: profile.aadhaar_number || '',
                      pan_number: profile.pan_number || ''
                    });
                  }}
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
