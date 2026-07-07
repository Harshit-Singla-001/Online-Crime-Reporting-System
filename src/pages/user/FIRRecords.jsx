import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { RiSearchLine, RiMapPinLine, RiCalendarEventLine, RiAlertLine, RiFlagLine, RiCheckLine } from 'react-icons/ri';

const FIRRecords = () => {
  const navigate = useNavigate();

  // Records data state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState({ fir_id: null, user_id: null });
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchPublicRecords();
  }, [page, category, status]);

  const fetchPublicRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/public/fir-records', {
        params: {
          page,
          category,
          city,
          status,
          search,
          limit: 6
        }
      });
      setRecords(response.data.records || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve public records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPublicRecords();
  };

  const handleOpenReportModal = (e, firId) => {
    e.stopPropagation(); // Stop navigation click
    setReportTarget({ fir_id: firId, user_id: null });
    setReportReason('');
    setReportError('');
    setReportSuccess('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');

    if (!reportReason || reportReason.trim().length < 5) {
      setReportError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }

    setReportLoading(true);

    try {
      await axios.post('/user/fir/report', {
        fir_id: reportTarget.fir_id,
        reason: reportReason
      });
      setReportLoading(false);
      setReportSuccess('Report submitted successfully. Thank you for keeping our platform secure.');
      
      // Close modal after delay
      setTimeout(() => {
        setShowReportModal(false);
      }, 2500);
    } catch (err) {
      setReportLoading(false);
      setReportError(err.response?.data?.message || 'Failed to submit report. You may have exceeded your hourly limit (max 3/hour).');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4">
        <h2 className="text-light fw-bold mb-1">Public Incident Archive</h2>
        <p className="text-muted">Browse approved and solved reports filed across municipal jurisdictions</p>
      </div>

      {/* Filter and Search Form */}
      <div className="crs-card p-4 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <Form.Group>
                <div className="d-flex align-items-center bg-input border-glass rounded">
                  <Form.Control
                    type="text"
                    placeholder="Search category, city, or summary..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-custom border-0"
                    style={{ background: 'transparent' }}
                  />
                  <Button type="submit" variant="transparent" className="text-muted px-3">
                    <RiSearchLine size={20} />
                  </Button>
                </div>
              </Form.Group>
            </Col>

            <Col lg={3} md={6}>
              <Form.Select 
                value={category} 
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-custom select-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Categories</option>
                {['Theft', 'Assault', 'Missing Person', 'Cyber Crime', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={3} md={6}>
              <Form.Select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="input-custom select-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Solved">Solved</option>
              </Form.Select>
            </Col>

            <Col lg={2} md={6} className="d-grid">
              <Button type="submit" className="btn-grad w-100" style={{ height: '48px' }}>
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Records listing */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : records.length === 0 ? (
        <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <RiSearchLine size={48} className="text-muted mx-auto mb-3" />
          <h4 className="text-light fw-bold">No Public Records Match Filters</h4>
          <p className="text-muted">Adjust categories or search keywords and try again.</p>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {records.map((record) => (
            <Card 
              key={record._id}
              onClick={() => navigate(`/user/fir/fir-details/${record._id}`)}
              className="crs-card w-100 text-start hover-zoom"
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="p-4 d-flex flex-column md-flex-row justify-content-between align-items-md-center gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <span className="badge-status badge-approved text-uppercase" style={{ fontSize: '0.7rem' }}>
                      {record.category}
                    </span>
                    <span className={`badge-status badge-${record.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                      {record.status}
                    </span>
                  </div>
                  
                  <h4 className="text-light fw-bold mb-2">Incident in {record.city}</h4>
                  
                  <p className="text-muted mb-0 font-sans" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {record.description}
                  </p>
                </div>

                <div className="flex-shrink-0 d-flex flex-column align-items-md-end gap-2" style={{ minWidth: '160px' }}>
                  <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                    <RiCalendarEventLine className="text-info" />
                    <span>{new Date(record.incident_datetime).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    <RiMapPinLine className="text-info" />
                    <span>{record.city}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline-danger"
                    onClick={(e) => handleOpenReportModal(e, record.fir_id)}
                    className="d-flex align-items-center gap-1 mt-auto"
                    style={{ fontSize: '0.75rem', alignSelf: 'start' }}
                  >
                    <RiFlagLine /> Report Record
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <Button 
            variant="outline-secondary" 
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            Page <strong>{page}</strong> of {totalPages}
          </span>
          <Button 
            variant="outline-secondary" 
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header className="modal-header-glass text-light">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <RiFlagLine className="text-danger" /> Flag Public Report
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReport}>
          <Modal.Body className="modal-body-glass text-light">
            {reportError && <Alert variant="danger">{reportError}</Alert>}
            {reportSuccess && <Alert variant="success">{reportSuccess}</Alert>}
            
            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Reason for reporting this record</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Briefly explain why this record is inappropriate, contains PII, or is misleading..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="input-custom"
                required
                disabled={reportLoading || reportSuccess}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer-glass">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowReportModal(false)}
              disabled={reportLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="danger"
              disabled={reportLoading || reportSuccess}
            >
              {reportLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default FIRRecords;
