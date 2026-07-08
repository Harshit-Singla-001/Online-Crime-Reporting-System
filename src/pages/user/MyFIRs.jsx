import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { RiFileList3Line, RiMapPinLine, RiCalendarEventLine, RiAddCircleLine } from 'react-icons/ri';

const MyFIRs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFirs();
  }, []);

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccess(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchFirs = async () => {
    try {
      const response = await axios.get('/user/fir/my-firs');
      setFirs(response.data || []);
    } catch (error) {
      console.error('Failed to load my FIRs:', error);
    } finally {
      setLoading(false);
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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="text-light fw-bold mb-1">My Filed Case Reports (FIRs)</h2>
          <p className="text-muted mb-0">Monitor live status changes and moderation responses</p>
        </div>
        <Button as={Link} to="/user/fir/file-fir" className="btn-grad d-flex align-items-center gap-2">
          <RiAddCircleLine size={18} /> File Another FIR
        </Button>
      </div>

      {firs.length === 0 ? (
        <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <RiFileList3Line size={64} className="text-muted mx-auto mb-3" />
          <h4 className="text-light fw-bold">No Case Records Found</h4>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '400px' }}>
            You have not registered any First Information Reports (FIRs) on this portal yet.
          </p>
          <Button as={Link} to="/user/fir/file-fir" className="btn-grad mx-auto px-4 py-2">
            File Your First FIR
          </Button>
        </Card>
      ) : (
        <Row className="g-4">
          {firs.map((fir) => (
            <Col lg={4} md={6} key={fir._id}>
              <Card 
                onClick={() => navigate(`/user/fir/my-fir-details/${fir._id}`)}
                className="crs-card h-100 cursor-pointer text-start"
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className={`badge-status badge-${getStatusClass(fir.status)}`}>
                        {fir.status}
                      </span>
                    </div>
                    
                    <h5 className="text-light fw-bold mb-2 text-truncate-2" style={{ fontSize: '1.1rem', minHeight: '2.6rem' }}>
                      {fir.title}
                    </h5>
                    
                    <p className="text-muted text-truncate-3" style={{ fontSize: '0.85rem', minHeight: '3.6rem' }}>
                      {fir.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-top border-secondary d-flex flex-wrap justify-content-between gap-2 text-muted" style={{ fontSize: '0.8rem' }}>
                    <div className="d-flex align-items-center gap-1">
                      <RiMapPinLine size={14} className="text-info" />
                      <span>{fir.city}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <RiCalendarEventLine size={14} className="text-info" />
                      <span>{new Date(fir.incident_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyFIRs;
