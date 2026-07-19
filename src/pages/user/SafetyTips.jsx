import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { RiSearchLine, RiThumbUpLine, RiBookOpenLine, RiFolderInfoLine } from 'react-icons/ri';

const SafetyTips = () => {
  const { user } = useAuth();

  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Selected Tip details for highlight & related tips
  const [selectedTip, setSelectedTip] = useState(null);
  const [relatedTips, setRelatedTips] = useState([]);
  const [userVote, setUserVote] = useState(null); // 'like', 'dislike', or null

  // Expanded cards tracker (for basic card list)
  const [expandedTipIds, setExpandedTipIds] = useState([]);

  useEffect(() => {
    fetchTips();
  }, [category]);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/public/tips', {
        params: { category, search }
      });
      setTips(response.data || []);
    } catch (err) {
      setError('Failed to load safety tips.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTips();
  };

  const toggleExpand = async (e, tip) => {
    e.stopPropagation();
    
    // Toggle standard expansion list
    if (expandedTipIds.includes(tip._id)) {
      setExpandedTipIds(prev => prev.filter(id => id !== tip._id));
      if (selectedTip?._id === tip._id) {
        setSelectedTip(null);
        setRelatedTips([]);
      }
    } else {
      setExpandedTipIds(prev => [...prev, tip._id]);
      
      // Highlight tip and load related
      setSelectedTip(tip);
      try {
        const detailRes = await axios.get(`/public/tip-details/${tip._id}`);
        setRelatedTips(detailRes.data.related || []);
        
        // Fetch user vote status if logged in
        if (user) {
          const voteRes = await axios.get(`/user/tips/${tip._id}/vote-status`);
          setUserVote(voteRes.data.vote_type);
        }
      } catch (err) {
        console.error('Failed to load related tips:', err);
      }
    }
  };

  const handleSelectTipDirectly = async (tip) => {
    setSelectedTip(tip);
    if (!expandedTipIds.includes(tip._id)) {
      setExpandedTipIds(prev => [...prev, tip._id]);
    }
    
    try {
      const detailRes = await axios.get(`/public/tip-details/${tip._id}`);
      setRelatedTips(detailRes.data.related || []);
      
      if (user) {
        const voteRes = await axios.get(`/user/tips/${tip._id}/vote-status`);
        setUserVote(voteRes.data.vote_type);
      }
    } catch (err) {
      console.error('Failed to load related tips:', err);
    }
  };

  const handleVote = async (tipId, type) => {
    if (!user) {
      setError('Please log in to vote on safety tips.');
      return;
    }
    setError('');

    try {
      const response = await axios.post(`/user/tips/${tipId}/vote`, { vote_type: type });
      
      // Update locally
      setUserVote(response.data.vote_type);
      
      // Update in main tips list and selected tip
      setTips(prev => prev.map(t => {
        if (t._id === tipId) {
          return { ...t, likes_count: response.data.likes_count };
        }
        return t;
      }));

      if (selectedTip?._id === tipId) {
        setSelectedTip(prev => ({ ...prev, likes_count: response.data.likes_count }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Voting failed.');
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Safety & Awareness Library</h2>
        <p className="text-muted">Stay informed with digital defense, cyber safety, and emergency response guidelines</p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Filter and Search Bar */}
      <div className="crs-card p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search articles, safety rules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-custom border-end-0"
                />
                <Button type="submit" className="btn-grad px-4">
                  <RiSearchLine />
                </Button>
              </InputGroup>
            </Col>

            <Col md={6}>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-custom"
                style={{ height: '48px' }}
              >
                <option value="">All Safety Sectors</option>
                <option value="cyber safety">Cyber Safety</option>
                <option value="women safety">Women Safety</option>
                <option value="traffic safety">Traffic Safety</option>
                <option value="general awareness">General Awareness</option>
              </Form.Select>
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
          <h4 className="text-light fw-bold">No Safety Tips Found</h4>
          <p className="text-muted">Adjust keywords or filter criteria and try again.</p>
        </Card>
      ) : (
        <Row className="gy-4">
          {/* Main tips list */}
          <Col lg={selectedTip ? 7 : 12} className="transition-all duration-300">
            <Row className="g-4">
              {tips.map((tip) => {
                const isExpanded = expandedTipIds.includes(tip._id);
                const isHighlighted = selectedTip?._id === tip._id;

                return (
                  <Col md={selectedTip ? 12 : 6} xl={selectedTip ? 12 : 4} key={tip._id}>
                    <Card 
                      onClick={() => handleSelectTipDirectly(tip)}
                      className={`crs-card h-100 text-start ${isHighlighted ? 'border-primary shadow-glow' : ''}`}
                    >
                      <Card.Body className="d-flex flex-column justify-content-between p-4">
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge-status badge-approved text-uppercase" style={{ fontSize: '0.65rem' }}>
                              {tip.category}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                              <RiThumbUpLine className="text-info me-1" /> {tip.likes_count} Likes
                            </span>
                          </div>
                          
                          <h5 className="text-light fw-bold mb-2">{tip.title}</h5>
                          
                          <p className="text-muted mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                            {tip.short_description}
                          </p>

                          {isExpanded && (
                            <div className="animate-fade-in p-3 rounded mb-3" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
                              {tip.content}
                            </div>
                          )}
                        </div>

                        <div className="d-flex gap-2 justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                          <Button 
                            size="sm" 
                            variant="outline-secondary" 
                            onClick={(e) => toggleExpand(e, tip)}
                          >
                            {isExpanded ? 'See Less' : 'See More'}
                          </Button>
                          {isExpanded && user && (
                            <div className="d-flex gap-2">
                              <Button 
                                size="sm" 
                                variant={userVote === 'like' && isHighlighted ? 'info' : 'outline-secondary'}
                                onClick={(e) => { e.stopPropagation(); handleVote(tip._id, 'like'); }}
                                className="d-flex align-items-center gap-1"
                              >
                                <RiThumbUpLine /> Like
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>

          {/* Highlight Panel (Shows related tips) */}
          {selectedTip && (
            <Col lg={5} className="animate-fade-in">
              <div className="crs-card p-4" style={{ position: 'sticky', top: '90px' }}>
                <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
                  <RiFolderInfoLine className="text-info" /> Featured Related Guides
                </h4>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Tips related to the category: <strong className="text-light text-uppercase">{selectedTip.category}</strong>
                </p>

                {relatedTips.length === 0 ? (
                  <p className="text-muted py-4">No additional related articles found in this category.</p>
                ) : (
                  <div className="d-flex flex-column gap-3 mt-3">
                    {relatedTips.map((tip) => (
                      <Card 
                        key={tip._id}
                        onClick={() => handleSelectTipDirectly(tip)}
                        className="crs-card p-3 text-start hover-glow border-glass"
                        style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                      >
                        <h6 className="text-light fw-bold mb-1">{tip.title}</h6>
                        <p className="text-muted mb-2 text-truncate-2" style={{ fontSize: '0.8rem' }}>
                          {tip.short_description}
                        </p>
                        <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '0.75rem' }}>
                          <span className="text-info">Popularity</span>
                          <span className="text-muted">
                            <RiThumbUpLine className="text-info" /> {tip.likes_count} Upvotes
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mt-4" 
                  onClick={() => setSelectedTip(null)}
                >
                  Close Focus Panel
                </Button>
              </div>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default SafetyTips;
