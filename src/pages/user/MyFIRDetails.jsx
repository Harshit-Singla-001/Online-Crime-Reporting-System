import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Badge, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { RiArrowLeftLine, RiMapPinLine, RiCalendarEventLine, RiTimeLine, RiEditBoxLine, RiSave3Line, RiShieldUserLine } from 'react-icons/ri';

const MyFIRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    description: '',
    suspect_description: '',
    witness_description: ''
  });
  
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchFIRDetails();
  }, [id]);

  const fetchFIRDetails = async () => {
    try {
      const response = await axios.get(`/user/fir/my-fir-details/${id}`);
      setFir(response.data);
      setEditFields({
        description: response.data.description,
        suspect_description: response.data.suspect_description || '',
        witness_description: response.data.witness_description || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied or record not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditFields({
      ...editFields,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaveLoading(true);

    try {
      const response = await axios.put(`/user/fir/edit/${id}`, editFields);
      setFir(response.data.fir);
      setIsEditing(false);
      setSaveLoading(false);
    } catch (err) {
      setSaveLoading(false);
      setError(err.response?.data?.message || 'Failed to update FIR record.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Solved': return 'solved';
      case 'Rejected': return 'rejected';
      default: return 'pending';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !fir) {
    return (
      <Container className="py-5" style={{ minHeight: '80vh' }}>
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>{error || 'You are not authorized to view this FIR record or it does not exist.'}</p>
          <hr />
          <Link to="/user/fir/my-firs" className="btn btn-outline-danger">
            Return to Registry
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in">
      <div className="mb-4 text-start">
        <Link to="/user/fir/my-firs" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)' }}>
          <RiArrowLeftLine /> Back to Registry
        </Link>
      </div>

      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '900px' }}>
        {/* Detail Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-3 border-bottom pb-4">
          <div>
            <span className={`badge-status badge-${getStatusClass(fir.status)} mb-2`}>
              Case {fir.status}
            </span>
            <h2 className="text-light fw-bold mb-1">{fir.title}</h2>
            <p className="text-muted mb-0">Category: <strong>{fir.category}</strong></p>
          </div>
          
          {fir.status === 'Pending' && !isEditing && (
            <Button 
              variant="outline-info" 
              onClick={() => setIsEditing(true)}
              className="d-flex align-items-center gap-2"
            >
              <RiEditBoxLine /> Edit Case Details
            </Button>
          )}
        </div>

        {/* Admin Review Alert Box */}
        {fir.admin_review && (
          <Alert variant="info" className="mb-4 d-flex gap-3 align-items-start" style={{ background: 'var(--grad-alert)', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            <RiShieldUserLine size={28} className="text-info flex-shrink-0 mt-1" />
            <div>
              <h5 className="alert-heading fw-bold text-light mb-1">Official Administration Review</h5>
              <p className="mb-0 text-muted" style={{ fontSize: '0.95rem' }}>{fir.admin_review}</p>
            </div>
          </Alert>
        )}

        {isEditing ? (
          <Form onSubmit={handleSave}>
            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Incident Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={editFields.description}
                onChange={handleEditChange}
                className="input-custom"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">Suspect Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="suspect_description"
                    value={editFields.suspect_description}
                    onChange={handleEditChange}
                    className="input-custom"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">Witness Info</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="witness_description"
                    value={editFields.witness_description}
                    onChange={handleEditChange}
                    className="input-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-3 mt-4 pt-3 border-top border-secondary">
              <Button 
                variant="outline-secondary" 
                onClick={() => setIsEditing(false)} 
                className="flex-grow-1 py-2"
                disabled={saveLoading}
              >
                Cancel Changes
              </Button>
              <Button 
                type="submit" 
                className="btn-grad flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={saveLoading}
              >
                <RiSave3Line /> {saveLoading ? 'Saving...' : 'Save Updates'}
              </Button>
            </div>
          </Form>
        ) : (
          <div className="animate-fade-in">
            {/* Read-Only Details */}
            <Row className="gy-3 mb-4">
              <Col md={4} sm={6}>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <RiCalendarEventLine className="text-info" />
                  <span>Date: <strong>{new Date(fir.incident_date).toLocaleDateString()}</strong></span>
                </div>
              </Col>
              
              <Col md={4} sm={6}>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <RiTimeLine className="text-info" />
                  <span>Time: <strong>{fir.incident_time}</strong></span>
                </div>
              </Col>
              
              <Col md={4} sm={12}>
                <div className="d-flex align-items-center gap-2 text-muted">
                  <RiMapPinLine className="text-info" />
                  <span>City: <strong>{fir.city}</strong></span>
                </div>
              </Col>
            </Row>

            <Row className="gy-4 mb-4">
              <Col xs={12}>
                <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>INCIDENT SCENE ADDRESS</span>
                <p className="text-light mb-0">{fir.full_address}</p>
              </Col>

              <Col xs={12}>
                <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>COORDINATES GEOLOCATION ADDRESS</span>
                <p className="text-light mb-0">{fir.current_address}</p>
              </Col>

              <Col xs={12} className="border-top border-secondary pt-3">
                <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>INCIDENT DETAILS</span>
                <p className="text-light" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {fir.description}
                </p>
              </Col>

              {(fir.suspect_description || fir.witness_description) && (
                <Col xs={12} className="border-top border-secondary pt-3">
                  <Row>
                    {fir.suspect_description && (
                      <Col md={6} className="mb-3">
                        <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>SUSPECT DESCRIPTION</span>
                        <p className="text-light mb-0">{fir.suspect_description}</p>
                      </Col>
                    )}
                    
                    {fir.witness_description && (
                      <Col md={6}>
                        <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>WITNESS DESCRIPTION</span>
                        <p className="text-light mb-0">{fir.witness_description}</p>
                      </Col>
                    )}
                  </Row>
                </Col>
              )}

              {fir.images && fir.images.length > 0 && (
                <Col xs={12} className="border-top border-secondary pt-3">
                  <span className="text-muted d-block mb-3" style={{ fontSize: '0.85rem' }}>ATTACHED MEDIA EVIDENCE</span>
                  <div className="d-flex flex-wrap gap-3">
                    {fir.images.map((imgUrl, idx) => (
                      <a 
                        key={idx} 
                        href={`http://localhost:5000${imgUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover-zoom"
                      >
                        <img
                          src={`http://localhost:5000${imgUrl}`}
                          alt={`Evidence ${idx + 1}`}
                          className="rounded border border-secondary"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      </a>
                    ))}
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </div>
    </Container>
  );
};

export default MyFIRDetails;
