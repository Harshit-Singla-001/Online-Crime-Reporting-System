import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Table } from 'react-bootstrap';
import { RiMailLine, RiMailOpenLine, RiDeleteBin7Line, RiCalendarEventLine, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/messages');
      setMessages(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contact messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkViewed = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`/admin/messages/${id}/status`, { status: 'read' });
      setSuccess('Message marked as viewed.');
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update message status.');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this message?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await axios.delete(`/admin/messages/${id}`);
      setSuccess(response.data.message || 'Message deleted successfully.');
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message.');
    }
  };

  const handleReportUser = async (id) => {
    if (!window.confirm('Are you sure you want to report this user for abusive language? Upon 3 reports, their account will be suspended for 7 days.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const response = await axios.post(`/admin/messages/${id}/report`);
      setSuccess(response.data.message || 'User reported successfully.');
      // Refetch to get updated status/reports for user objects
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report user.');
    }
  };

  // Split messages
  const newMessages = messages.filter(m => m.status === 'unread');
  const viewedMessages = messages.filter(m => m.status !== 'unread');

  const renderMessageCard = (m) => {
    const isRegistered = m.user_id !== null;
    const userStatus = isRegistered ? m.user_id.status : null;
    const userReports = isRegistered ? m.user_id.reports_count : 0;

    return (
      <Card key={m._id} className="crs-card mb-3 text-start" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <span className="badge-status badge-approved text-uppercase mb-2 d-inline-block">
                {m.subject}
              </span>
              <h5 className="text-light fw-bold mb-1">From: {m.name}</h5>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                <span>Email: <strong>{m.email}</strong></span>
                {isRegistered ? (
                  <span className="ms-2 text-info">
                    (Registered Citizen • Status: <strong className="text-uppercase text-warning">{userStatus}</strong> • Reports: <strong>{userReports}/3</strong>)
                  </span>
                ) : (
                  <span className="ms-2 text-secondary">(Guest User)</span>
                )}
              </div>
            </div>
            <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
              <RiCalendarEventLine />
              <span>{new Date(m.created_at).toLocaleString()}</span>
            </div>
          </div>

          <p className="text-light bg-input p-3 rounded mb-3" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {m.message}
          </p>

          <div className="d-flex justify-content-end gap-2 flex-wrap">
            {m.status === 'unread' && (
              <Button 
                size="sm" 
                variant="outline-success" 
                className="d-flex align-items-center gap-1"
                onClick={() => handleMarkViewed(m._id)}
              >
                <RiCheckLine /> Mark as Viewed
              </Button>
            )}
            {isRegistered && userStatus !== 'suspended' && userStatus !== 'blocked' && (
              <Button 
                size="sm" 
                variant="outline-warning" 
                className="d-flex align-items-center gap-1"
                onClick={() => handleReportUser(m._id)}
              >
                <RiErrorWarningLine /> Report User
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline-danger" 
              className="d-flex align-items-center gap-1"
              onClick={() => handleDeleteMessage(m._id)}
            >
              <RiDeleteBin7Line /> Delete
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Contact Messages & Queries</h2>
        <p className="text-muted">Review query submissions from the contact form, report violations, and manage communication threads.</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="gy-4">
          {/* New Messages Section */}
          <Col lg={6}>
            <div className="d-flex align-items-center gap-2 mb-3 border-bottom border-secondary pb-2">
              <RiMailLine size={24} className="text-info" />
              <h4 className="text-light fw-bold mb-0">New Messages</h4>
              <Badge bg="info" className="ms-2">{newMessages.length}</Badge>
            </div>

            {newMessages.length === 0 ? (
              <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <RiMailOpenLine size={48} className="text-muted mx-auto mb-3" />
                <h5 className="text-muted">No New Messages</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>All submissions have been viewed and marked read.</p>
              </Card>
            ) : (
              newMessages.map(renderMessageCard)
            )}
          </Col>

          {/* Viewed Messages Section */}
          <Col lg={6}>
            <div className="d-flex align-items-center gap-2 mb-3 border-bottom border-secondary pb-2">
              <RiMailOpenLine size={24} className="text-success" />
              <h4 className="text-light fw-bold mb-0">Viewed Messages</h4>
              <Badge bg="success" className="ms-2">{viewedMessages.length}</Badge>
            </div>

            {viewedMessages.length === 0 ? (
              <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <RiMailLine size={48} className="text-muted mx-auto mb-3" />
                <h5 className="text-muted">No Viewed Messages</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Viewed history is currently empty.</p>
              </Card>
            ) : (
              viewedMessages.map(renderMessageCard)
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ContactMessages;
