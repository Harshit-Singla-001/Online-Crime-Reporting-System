import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Row, Col, Button, Form, Alert, Spinner, Image } from 'react-bootstrap';
import { RiArrowLeftLine, RiUserLine, RiFolderShield2Line, RiCalendarEventLine, RiMapPin2Line, RiCheckboxCircleLine, RiCloseCircleLine, RiFolderInfoLine } from 'react-icons/ri';

const AdminFIRDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [adminReview, setAdminReview] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFIRDetails();
  }, [id]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchFIRDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/admin/fir/details/${id}`);
      setFir(response.data);
      setAdminReview(response.data.admin_review || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve FIR details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const response = await axios.put(`/admin/fir/status/${id}`, {
        status: newStatus,
        admin_review: adminReview
      });
      setSuccess(response.data.message || `FIR status updated to ${newStatus}.`);
      setFir(prev => ({
        ...prev,
        status: newStatus,
        admin_review: adminReview
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update FIR status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveReviewOnly = async (e) => {
    e.preventDefault();
    if (!fir) return;
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const response = await axios.put(`/admin/fir/status/${id}`, {
        status: fir.status,
        admin_review: adminReview
      });
      setSuccess('Admin review saved successfully.');
      setFir(prev => ({
        ...prev,
        admin_review: adminReview
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save admin review.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error && !fir) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/admin/fir/manage" variant="outline-light">
          <RiArrowLeftLine /> Back to Manage FIRs
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button onClick={() => navigate('/admin/fir/manage')} variant="outline-light" className="d-flex align-items-center gap-2">
          <RiArrowLeftLine /> Back to Case Logs
        </Button>
        <span className="text-muted">Case ID: {fir._id}</span>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row className="gy-4">
        {/* Case & Submitter Details */}
        <Col lg={8}>
          {/* Submitter details */}
          <Card className="crs-card p-4 mb-4 text-start">
            <h4 className="text-light fw-bold mb-4 d-flex align-items-center gap-2">
              <RiUserLine className="text-info" /> Citizen Identity Dossier
            </h4>
            {fir.user_id ? (
              <Row className="g-3">
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>FULL LEGAL NAME</p>
                  <p className="text-light fw-bold mb-0">{fir.user_id.full_name}</p>
                </Col>
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>EMAIL ADDRESS</p>
                  <p className="text-light fw-bold mb-0">{fir.user_id.email}</p>
                </Col>
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>PHONE NUMBER</p>
                  <p className="text-light fw-bold mb-0">{fir.user_id.phone_number}</p>
                </Col>
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>DATE OF BIRTH</p>
                  <p className="text-light fw-bold mb-0">{new Date(fir.user_id.dob).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>AADHAAR NUMBER</p>
                  <p className="text-light fw-bold mb-0">{fir.user_id.aadhaar_number}</p>
                </Col>
                <Col md={6}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>PAN CARD NUMBER</p>
                  <p className="text-light fw-bold mb-0">{fir.user_id.pan_number || 'N/A (< 18)'}</p>
                </Col>
                <Col md={12}>
                  <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>PERMANENT ADDRESS</p>
                  <p className="text-light mb-0" style={{ fontSize: '0.9rem' }}>{fir.user_id.address}</p>
                </Col>
              </Row>
            ) : (
              <p className="text-warning mb-0">Identity information unavailable or Anonymous filing.</p>
            )}
          </Card>

          {/* FIR Details */}
          <Card className="crs-card p-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="text-light fw-bold mb-0 d-flex align-items-center gap-2">
                <RiFolderShield2Line className="text-info" /> Primary Case Incident Details
              </h4>
              <span className={`badge-status badge-${fir.status.toLowerCase()}`}>
                Status: {fir.status}
              </span>
            </div>

            <Row className="g-3 mb-4">
              <Col md={12}>
                <h5 className="text-light fw-bold mb-1">{fir.title}</h5>
                <span className="badge-status badge-approved text-uppercase me-2" style={{ fontSize: '0.65rem' }}>
                  {fir.category}
                </span>
                <span className={`badge-priority priority-${fir.priority.toLowerCase()}`}>
                  Priority: {fir.priority}
                </span>
              </Col>

              <Col md={12} className="mt-3">
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>DETAILED INCIDENT DESCRIPTION</p>
                <p className="text-light p-3 rounded" style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-glass)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {fir.description}
                </p>
              </Col>

              <Col md={6}>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  <RiCalendarEventLine className="me-1 text-info" /> INCIDENT DATE & TIME
                </p>
                <p className="text-light mb-0">
                  {new Date(fir.incident_date).toLocaleDateString()} at {fir.incident_time}
                </p>
              </Col>

              <Col md={6}>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>CITY LOGGED</p>
                <p className="text-light mb-0">{fir.city}</p>
              </Col>

              <Col md={12}>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                  <RiMapPin2Line className="me-1 text-info" /> INCIDENT ADDRESS
                </p>
                <p className="text-light mb-1" style={{ fontSize: '0.9rem' }}>{fir.full_address}</p>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                  <strong>Geolocation Coords:</strong> {fir.current_address}
                </p>
              </Col>

              <Col md={6}>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>SUSPECT DESCRIPTION</p>
                <p className="text-light mb-0" style={{ fontSize: '0.9rem' }}>
                  {fir.suspect_description || 'No suspect details provided.'}
                </p>
              </Col>

              <Col md={6}>
                <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>WITNESS DESCRIPTION</p>
                <p className="text-light mb-0" style={{ fontSize: '0.9rem' }}>
                  {fir.witness_description || 'No witness details provided.'}
                </p>
              </Col>
            </Row>

            {/* Evidence Images */}
            <h5 className="text-light fw-bold mb-3">Submitted Evidence Images</h5>
            {fir.images && fir.images.length > 0 ? (
              <Row className="g-3">
                {fir.images.map((img, idx) => (
                  <Col md={4} key={idx}>
                    <div className="p-1 rounded bg-black" style={{ border: '1px solid var(--border-glass)' }}>
                      <a href={`http://localhost:5000${img}`} target="_blank" rel="noreferrer" title="Click to view full image in new tab">
                        <Image 
                          src={`http://localhost:5000${img}`}
                          alt={`Evidence ${idx + 1}`}
                          fluid 
                          rounded 
                          style={{ height: '180px', width: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        />
                      </a>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted mb-0">No evidence images attached to this filing.</p>
            )}
          </Card>
        </Col>

        {/* Administrative Review Panel */}
        <Col lg={4}>
          <Card className="crs-card p-4 text-start position-sticky" style={{ top: '90px' }}>
            <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
              <RiFolderInfoLine className="text-info" /> Case Management
            </h4>
            <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>
              Moderate this case report, update status, and write official statements sent directly to the citizen.
            </p>

            <Form onSubmit={handleSaveReviewOnly}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Official Administrative Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder="Enter comments, case investigation findings, or contact notes..."
                  value={adminReview}
                  onChange={(e) => setAdminReview(e.target.value)}
                  className="input-custom"
                />
              </Form.Group>

              <Button 
                type="submit" 
                variant="outline-info" 
                className="w-100 py-2 mb-3"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Comments Only'}
              </Button>
            </Form>

            <hr className="my-4" style={{ borderColor: 'var(--border-glass)' }} />

            <h5 className="text-light fw-bold mb-3" style={{ fontSize: '0.95rem' }}>Update Case Status</h5>
            <div className="d-flex flex-column gap-2">
              {fir.status === 'Pending' && (
                <>
                  <Button 
                    onClick={() => handleUpdateStatus('Approved')}
                    variant="info"
                    className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={updating}
                  >
                    <RiCheckboxCircleLine /> Approve Case
                  </Button>
                  
                  <Button 
                    onClick={() => handleUpdateStatus('Rejected')}
                    variant="danger"
                    className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={updating}
                  >
                    <RiCloseCircleLine /> Reject Case
                  </Button>
                </>
              )}

              {fir.status === 'Approved' && (
                <Button 
                  onClick={() => handleUpdateStatus('Solved')}
                  variant="success"
                  className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={updating}
                >
                  <RiCheckboxCircleLine /> Mark Resolved / Solved
                </Button>
              )}

              {fir.status === 'Solved' && (
                <Alert variant="success" className="mb-0 text-center py-2" style={{ fontSize: '0.85rem' }}>
                  Case resolved. No further modifications needed.
                </Alert>
              )}

              {fir.status === 'Rejected' && (
                <Alert variant="danger" className="mb-0 text-center py-2" style={{ fontSize: '0.85rem' }}>
                  Case rejected. User notified of dismissal.
                </Alert>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminFIRDetails;
