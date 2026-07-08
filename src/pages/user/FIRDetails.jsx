import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { RiArrowLeftLine, RiMapPinLine, RiCalendarEventLine, RiShieldLine, RiEyeOffLine } from 'react-icons/ri';

const FIRDetails = () => {
  const { id } = useParams();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicDetails();
  }, [id]);

  const fetchPublicDetails = async () => {
    try {
      const response = await axios.get(`/public/fir-details/${id}`);
      setRecord(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Public record not found.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'approved';
      case 'Solved': return 'solved';
      default: return 'approved';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !record) {
    return (
      <Container className="py-5" style={{ minHeight: '80vh' }}>
        <Alert variant="danger">
          <Alert.Heading>Record Not Found</Alert.Heading>
          <p>{error || 'The public FIR record you are requesting could not be resolved.'}</p>
          <hr />
          <Link to="/user/fir/fir-records" className="btn btn-outline-danger">
            Back to Public Archive
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in">
      <div className="mb-4 text-start">
        <Link to="/user/fir/fir-records" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)' }}>
          <RiArrowLeftLine /> Back to Public Archive
        </Link>
      </div>

      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
        {/* Security Redaction Banner */}
        <Alert variant="secondary" className="mb-4 d-flex align-items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-glass)', color: '#ced4da' }}>
          <RiEyeOffLine size={32} className="text-warning flex-shrink-0" />
          <div style={{ fontSize: '0.85rem', color: '#ced4da' }}>
            <strong>Confidentiality Notice:</strong> To protect citizen privacy, this public record has been scrubbed. Full address locations, reporter identity names, contact details, and evidence files have been redacted.
          </div>
        </Alert>

        <div className="border-bottom pb-3 mb-4">
          <span className={`badge-status badge-${getStatusClass(record.status)} mb-2`}>
            Case {record.status}
          </span>
          <h2 className="text-light fw-bold mb-1">Incident in {record.city}</h2>
          <p className="text-muted mb-0">Category: <strong>{record.category}</strong></p>
        </div>

        <div className="d-flex flex-wrap gap-4 text-muted mb-4 pb-3 border-bottom border-secondary" style={{ fontSize: '0.9rem' }}>
          <div className="d-flex align-items-center gap-1">
            <RiCalendarEventLine className="text-info" />
            <span>Incident Schedule: <strong>{new Date(record.incident_datetime).toLocaleDateString()} at {new Date(record.incident_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <RiMapPinLine className="text-info" />
            <span>Location: <strong>{record.city}</strong></span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>PUBLIC CASE SUMMARY</span>
          <p className="text-light font-monospace" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'rgba(0,0,0,0.1)', padding: '15px', borderRadius: '6px' }}>
            {record.description}
          </p>
        </div>

        {record.admin_review && (
          <div className="mt-4 pt-4 border-top border-secondary">
            <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem' }}>OFFICIAL PUBLIC RESOLUTION COMMENTS</span>
            <Alert variant="info" className="mb-0 d-flex gap-2 align-items-center" style={{ background: 'var(--grad-alert)', border: '1px solid rgba(0, 210, 255, 0.1)' }}>
              <RiShieldLine className="text-info flex-shrink-0" />
              <p className="mb-0 text-light" style={{ fontSize: '0.9rem' }}>{record.admin_review}</p>
            </Alert>
          </div>
        )}
      </div>
    </Container>
  );
};

export default FIRDetails;
