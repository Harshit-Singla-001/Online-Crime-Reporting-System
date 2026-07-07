import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, InputGroup } from 'react-bootstrap';
import { RiSearchLine, RiUserLine, RiLockLine, RiLockUnlockLine } from 'react-icons/ri';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [status]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/admin/users', {
        params: { status, search }
      });
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve registered users.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleBlock = async (id, currentStatus) => {
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(`/admin/user/${id}/block`);
      const updatedUser = response.data.user;
      
      setSuccess(response.data.message || `User status updated successfully.`);
      setUsers(prev => prev.map(u => {
        if (u._id === id) {
          return { 
            ...u, 
            status: updatedUser.status, 
            blocked_until: updatedUser.blocked_until 
          };
        }
        return u;
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to alter block settings.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Manage Citizen Accounts</h2>
        <p className="text-muted">Inspect registered demographics, track case filings count, and manage security locks</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Filter and Search */}
      <div className="crs-card p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Group>
                <Form.Label className="form-label-custom">Search Citizen</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-custom"
                    style={{ height: '48px' }}
                  />
                  <Button type="submit" className="btn-grad px-4">
                    <RiSearchLine />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

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
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Button type="submit" className="btn-grad w-100" style={{ height: '48px' }}>
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <RiUserLine size={48} className="text-muted mx-auto mb-3" />
          <h4 className="text-light fw-bold">No Users Found</h4>
          <p className="text-muted">No citizen profiles matched the search parameters.</p>
        </Card>
      ) : (
        <div className="crs-card p-0 overflow-hidden">
          <div className="table-responsive">
            <Table hover variant="dark" className="mb-0 text-start align-middle" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th className="py-3 ps-4">Citizen Name</th>
                  <th className="py-3">Email Address</th>
                  <th className="py-3">Phone Number</th>
                  <th className="py-3">FIR Count</th>
                  <th className="py-3">Joined Date</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pe-4 text-center">Safety Lock Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td className="ps-4 py-3 fw-bold text-light">{u.full_name}</td>
                    <td className="text-muted py-3">{u.email}</td>
                    <td className="text-muted py-3">{u.phone_number}</td>
                    <td className="text-light py-3 fw-bold">{u.firCount || 0}</td>
                    <td className="text-muted py-3">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`badge-status badge-${u.status === 'blocked' ? 'rejected' : u.status === 'active' ? 'solved' : 'pending'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-center">
                      {u.status === 'blocked' ? (
                        <Button 
                          size="sm" 
                          variant="outline-success" 
                          className="d-flex align-items-center gap-1 mx-auto"
                          onClick={() => handleToggleBlock(u._id, u.status)}
                        >
                          <RiLockUnlockLine /> Unblock Account
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          className="d-flex align-items-center gap-1 mx-auto"
                          onClick={() => handleToggleBlock(u._id, u.status)}
                        >
                          <RiLockLine /> Block Account
                        </Button>
                      )}
                      {u.status === 'blocked' && u.blocked_until && (
                        <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                          Auto-unblocks: {new Date(u.blocked_until).toLocaleDateString()}
                        </div>
                      )}
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

export default ManageUsers;
