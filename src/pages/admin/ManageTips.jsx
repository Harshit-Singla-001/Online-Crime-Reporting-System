import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import { RiAddLine, RiEdit2Line, RiDeleteBin6Line, RiBookOpenLine, RiThumbUpLine } from 'react-icons/ri';

const ManageTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null); // Null for adding new
  const [modalForm, setModalForm] = useState({
    title: '',
    category: 'cyber safety',
    short_description: '',
    content: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTips();
  }, [category]);

  const fetchTips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/public/tips', {
        params: { category, search }
      });
      setTips(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch safety tips.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTips();
  };

  const handleOpenAddModal = () => {
    setEditingTip(null);
    setModalForm({
      title: '',
      category: 'cyber safety',
      short_description: '',
      content: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (tip) => {
    setEditingTip(tip);
    setModalForm({
      title: tip.title,
      category: tip.category,
      short_description: tip.short_description,
      content: tip.content
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setModalForm({
      ...modalForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (editingTip) {
        // Edit existing
        const response = await axios.put(`/admin/tips/${editingTip._id}`, modalForm);
        setSuccess('Safety tip updated successfully.');
        setTips(prev => prev.map(t => t._id === editingTip._id ? response.data.tip : t));
      } else {
        // Add new
        const response = await axios.post('/admin/tips', modalForm);
        setSuccess('Safety tip created successfully.');
        setTips(prev => [response.data.tip, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save safety tip.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this safety tip? This action is permanent.')) return;
    setError('');
    setSuccess('');
    try {
      const response = await axios.delete(`/admin/tips/${id}`);
      setSuccess(response.data.message || 'Safety tip deleted.');
      setTips(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete safety tip.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="text-start">
          <h2 className="text-light fw-bold mb-1">Safety Awareness Library</h2>
          <p className="text-muted">Write defensive protocols, cyber rules, and emergency guidelines</p>
        </div>
        <Button onClick={handleOpenAddModal} className="btn-grad py-2 px-3 d-flex align-items-center gap-2">
          <RiAddLine size={20} /> Publish New Tip
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search and Filters */}
      <div className="crs-card p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3">
            <Col md={5}>
              <Form.Control
                type="text"
                placeholder="Search by keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              />
            </Col>

            <Col md={4}>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Safety Categories</option>
                <option value="cyber safety">Cyber Safety</option>
                <option value="women safety">Women Safety</option>
                <option value="traffic safety">Traffic Safety</option>
                <option value="general awareness">General Awareness</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Button type="submit" className="btn-grad w-100" style={{ height: '48px' }}>
                Apply Filter
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : tips.length === 0 ? (
        <Card className="text-center p-5 crs-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <RiBookOpenLine size={48} className="text-muted mx-auto mb-3" />
          <h4 className="text-light fw-bold">No Safety Tips Recorded</h4>
          <p className="text-muted">Create a new safety tip or adjust search variables.</p>
        </Card>
      ) : (
        <div className="crs-card p-0 overflow-hidden">
          <div className="table-responsive">
            <Table hover variant="dark" className="mb-0 text-start align-middle" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th className="py-3 ps-4">Category</th>
                  <th className="py-3">Article Title</th>
                  <th className="py-3">Short Description</th>
                  <th className="py-3 text-center">Likes</th>
                  <th className="py-3 pe-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tips.map((tip) => (
                  <tr key={tip._id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td className="ps-4 py-3">
                      <span className="badge-status badge-approved text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {tip.category}
                      </span>
                    </td>
                    <td className="fw-bold py-3 text-light">{tip.title}</td>
                    <td className="text-muted py-3" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                      <span className="text-truncate d-block">{tip.short_description}</span>
                    </td>
                    <td className="py-3 text-center text-muted">
                      <span className="d-flex align-items-center justify-content-center gap-1">
                        <RiThumbUpLine className="text-info" /> {tip.likes_count}
                      </span>
                    </td>
                    <td className="pe-4 py-3 text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline-info" 
                          onClick={() => handleOpenEditModal(tip)}
                        >
                          <RiEdit2Line /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          onClick={() => handleDeleteTip(tip._id)}
                        >
                          <RiDeleteBin6Line /> Delete
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" contentClassName="modal-content-glass">
        <Modal.Header closeButton closeVariant="white" className="modal-header-glass text-light justify-content-between">
          <Modal.Title className="fw-bold">
            {editingTip ? 'Update Safety Awareness Tip' : 'Publish New Safety Awareness Tip'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body className="modal-body-glass text-light text-start">
            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Article Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="e.g. Strong Password Strategies"
                value={modalForm.title}
                onChange={handleInputChange}
                className="input-custom"
                required
              />
            </Form.Group>

            <Row>
              <Col md={12}>
                <Form.Group className="form-group-custom">
                  <Form.Label className="form-label-custom">Awareness Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={modalForm.category}
                    onChange={handleInputChange}
                    className="input-custom"
                    style={{ height: '48px' }}
                    required
                  >
                    <option value="cyber safety">Cyber Safety</option>
                    <option value="women safety">Women Safety</option>
                    <option value="traffic safety">Traffic Safety</option>
                    <option value="general awareness">General Awareness</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Short Summary (displayed on grid cards)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="short_description"
                placeholder="2-3 sentences summarizing the protocol..."
                value={modalForm.short_description}
                onChange={handleInputChange}
                className="input-custom"
                required
              />
            </Form.Group>

            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Full Article Content (detailed markdown steps)</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                name="content"
                placeholder="Write full descriptive items and safety recommendations..."
                value={modalForm.content}
                onChange={handleInputChange}
                className="input-custom"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer-glass">
            <Button variant="outline-light" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-grad px-4" disabled={saving}>
              {saving ? 'Publishing...' : 'Save Safety Tip'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ManageTips;
