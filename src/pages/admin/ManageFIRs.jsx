import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { RiFolderInfoLine, RiCheckDoubleLine, RiCloseCircleLine, RiCheckLine } from 'react-icons/ri';

const ManageFIRs = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter States
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchFIRs();
  }, [status, category, city]);

  const fetchFIRs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/firs', {
        params: { status, category, city }
      });
      setFirs(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve FIR logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`/admin/fir/status/${id}`, { status: newStatus });
      setSuccess(response.data.message || `FIR status successfully updated to ${newStatus}.`);
      
      // Update local state
      setFirs(prev => prev.map(f => {
        if (f._id === id) {
          return { ...f, status: newStatus };
        }
        return f;
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update FIR status.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Manage Case Log Files</h2>
        <p className="text-muted">Review filed First Information Reports (FIRs), write reviews, and update status</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filters Form */}
      <div className="crs-card p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="form-label-custom">Filter by Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Solved">Solved</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="form-label-custom">Filter by Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Categories</option>
                <option value="Theft">Theft</option>
                <option value="Assault">Assault</option>
                <option value="Missing Person">Missing Person</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label className="form-label-custom">Search by City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : firs.length === 0 ? (
        <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <RiFolderInfoLine size={48} className="text-muted mx-auto mb-3" />
          <h4 className="text-light fw-bold">No FIR Records Match</h4>
          <p className="text-muted">Modify filter settings or check back later.</p>
        </Card>
      ) : (
        <div className="crs-card p-0 overflow-hidden">
          <div className="table-responsive">
            <Table hover variant="dark" className="mb-0 text-start align-middle" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th className="py-3 ps-4">Category</th>
                  <th className="py-3">Title</th>
                  <th className="py-3">Reporter Name</th>
                  <th className="py-3">City</th>
                  <th className="py-3">Priority</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pe-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {firs.map((fir) => (
                  <tr key={fir._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td className="ps-4 py-3">
                      <span className="badge-status badge-approved text-uppercase" style={{ fontSize: '0.7rem' }}>
                        {fir.category}
                      </span>
                    </td>
                    <td className="fw-bold py-3 text-light">
                      <Link to={`/admin/fir/details/${fir._id}`} className="text-decoration-none text-light hover-link-glow">
                        {fir.title}
                      </Link>
                    </td>
                    <td className="text-muted py-3">
                      {fir.user_id?.full_name || 'Anonymous User'}
                    </td>
                    <td className="text-muted py-3">{fir.city}</td>
                    <td className="py-3">
                      <span className={`badge-priority priority-${fir.priority?.toLowerCase()}`}>
                        {fir.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`badge-status badge-${fir.status?.toLowerCase()}`}>
                        {fir.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        {fir.status === 'Pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline-info" 
                              onClick={() => handleStatusChange(fir._id, 'Approved')}
                              title="Approve FIR"
                            >
                              <RiCheckLine />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              onClick={() => handleStatusChange(fir._id, 'Rejected')}
                              title="Reject FIR"
                            >
                              <RiCloseCircleLine />
                            </Button>
                          </>
                        )}
                        {fir.status === 'Approved' && (
                          <Button 
                            size="sm" 
                            variant="outline-success" 
                            onClick={() => handleStatusChange(fir._id, 'Solved')}
                            className="d-flex align-items-center gap-1"
                          >
                            <RiCheckDoubleLine /> Mark Solved
                          </Button>
                        )}
                        <Button 
                          as={Link} 
                          to={`/admin/fir/details/${fir._id}`} 
                          size="sm" 
                          variant="outline-secondary"
                        >
                          Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ManageFIRs;
