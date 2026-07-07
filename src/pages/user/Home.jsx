import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Button, Modal, Alert } from 'react-bootstrap';
import { RiFileList3Line, RiShieldLine, RiFileAddLine, RiCheckDoubleLine, RiAlertLine, RiArrowRightSLine, RiArrowLeftSLine } from 'react-icons/ri';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Disclaimer Modal state
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({ totalCases: 0, solvedCases: 0 });
  const [hasFirs, setHasFirs] = useState(false);

  // Carousels data
  const [tips, setTips] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  
  // Custom Slider Indices
  const [activeTipIdx, setActiveTipIdx] = useState(0);
  const [activeUpdateIdx, setActiveUpdateIdx] = useState(0);

  // Initialize
  useEffect(() => {
    // 1. Check Disclaimer
    const disclaimerSeen = localStorage.getItem('disclaimerSeen');
    if (!disclaimerSeen) {
      setShowDisclaimer(true);
    }

    // 2. Fetch stats & status
    fetchStatsAndStatus();

    // 3. Fetch tips & latest updates
    fetchPublicData();
  }, []);

  const fetchStatsAndStatus = async () => {
    try {
      // Get public records for total counts
      const resPublic = await axios.get('/public/fir-records?limit=100');
      const records = resPublic.data.records || [];
      const solved = records.filter(r => r.status === 'Solved').length;

      setStats({
        totalCases: records.length,
        solvedCases: solved
      });

      // Check if user has any FIRs for action button check
      if (user) {
        const resUserFirs = await axios.get('/user/fir/my-firs');
        setHasFirs(resUserFirs.data && resUserFirs.data.length > 0);
      }
    } catch (err) {
      console.error('Failed to fetch home stats:', err);
    }
  };

  const fetchPublicData = async () => {
    try {
      const resTips = await axios.get('/public/tips');
      setTips(resTips.data || []);

      const resFirs = await axios.get('/public/fir-records?limit=5');
      setRecentUpdates(resFirs.data.records || []);
    } catch (err) {
      console.error('Failed to fetch public sliders data:', err);
    }
  };

  // 4. Auto-slider intervals
  useEffect(() => {
    if (tips.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTipIdx(prev => (prev + 1) % tips.length);
    }, 15000); // 15 seconds auto slide
    return () => clearInterval(interval);
  }, [tips]);

  useEffect(() => {
    if (recentUpdates.length <= 1) return;
    const interval = setInterval(() => {
      setActiveUpdateIdx(prev => (prev + 1) % recentUpdates.length);
    }, 10000); // 10 seconds auto slide
    return () => clearInterval(interval);
  }, [recentUpdates]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerSeen', 'true');
    setShowDisclaimer(false);
  };

  return (
    <Container className="py-4 animate-fade-in">
      {/* Disclaimer Modal */}
      <Modal show={showDisclaimer} onHide={() => {}} backdrop="static" keyboard={false} centered contentClassName="modal-content-glass">
        <Modal.Header className="modal-header-glass text-light justify-content-center">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <RiAlertLine className="text-warning" size={28} /> Educational Disclaimer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-glass text-light">
          <p className="mb-3 text-muted" style={{ lineHeight: '1.6' }}>
            This platform is an academic project built strictly for educational purposes. All crime cases, incident locations, user records, and filings are entirely fictional.
          </p>
          <Alert variant="warning" className="mb-0">
            <strong>Notice:</strong> Please do not submit real personal data or attempt to report actual crimes on this application.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="modal-footer-glass justify-content-center">
          <Button className="btn-grad px-4" onClick={handleAcceptDisclaimer}>
            I Understand & Agree
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Announcement Section */}
      <div className="mb-4">
        <Alert variant="info" className="d-flex align-items-center gap-2 py-3 border-0 shadow-sm" style={{ background: 'var(--grad-alert)' }}>
          <span className="geo-dot"></span>
          <span className="text-light" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
            <strong>System Update:</strong> OCRS citizen portal is fully active. Live location tracking and OTP email verifications are online.
          </span>
        </Alert>
      </div>

      {/* Title Hub */}
      <div className="text-center my-5">
        <h1 className="fw-extrabold text-light display-4 mb-2" style={{ fontWeight: '800' }}>
          Online Crime Reporting System
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
          File First Information Reports (FIRs), track investigations, and check public crime archives in a secured workspace.
        </p>
      </div>

      {/* Stats Counter Section */}
      <Row className="justify-content-center mb-5 gy-4">
        <Col md={4} sm={6}>
          <div className="crs-card text-center p-4">
            <RiFileList3Line size={38} className="text-info mb-2" />
            <h3 className="text-light fw-bold display-6 mb-1">{stats.totalCases}</h3>
            <p className="text-muted mb-0 uppercase-text" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              PUBLIC INCIDENTS
            </p>
          </div>
        </Col>
        
        <Col md={4} sm={6}>
          <div className="crs-card text-center p-4">
            <RiCheckDoubleLine size={38} className="text-success mb-2" />
            <h3 className="text-light fw-bold display-6 mb-1">{stats.solvedCases}</h3>
            <p className="text-muted mb-0 uppercase-text" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              RESOLVED CASES
            </p>
          </div>
        </Col>
      </Row>

      {/* Action Buttons Section */}
      <div className="text-center mb-5">
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Button as={Link} to="/user/fir/file-fir" className="btn-grad py-3 px-4 d-flex align-items-center gap-2">
            <RiFileAddLine size={20} /> File Online FIR
          </Button>
          
          {hasFirs ? (
            <Button as={Link} to="/user/fir/my-firs" className="btn-outline-custom py-3 px-4 d-flex align-items-center gap-2">
              <RiFileList3Line size={20} /> View FIR Status
            </Button>
          ) : (
            <div className="d-inline-block" title="You have not filed any FIR yet.">
              <Button disabled className="btn-outline-custom py-3 px-4 d-flex align-items-center gap-2" style={{ opacity: '0.4' }}>
                <RiFileList3Line size={20} /> No FIR Filed Yet
              </Button>
            </div>
          )}
        </div>
      </div>

      <Row className="gy-4">
        {/* Safety Tips Slider */}
        <Col lg={6}>
          <div className="crs-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-light fw-bold mb-0">Safety Awareness Tips</h4>
              <Link to="/user/pages/safety-tips" className="text-decoration-none" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
                View All
              </Link>
            </div>
            
            {tips.length > 0 ? (
              <div className="position-relative d-flex flex-column justify-content-between" style={{ minHeight: '220px' }}>
                <div className="animate-fade-in" key={activeTipIdx}>
                  <span className="badge-status badge-approved mb-2 text-uppercase" style={{ fontSize: '0.7rem' }}>
                    {tips[activeTipIdx].category}
                  </span>
                  <h5 className="text-light fw-bold mb-2">{tips[activeTipIdx].title}</h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {tips[activeTipIdx].short_description}
                  </p>
                </div>
                
                <div className="d-flex align-items-center justify-content-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Tip {activeTipIdx + 1} of {tips.length}
                  </span>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setActiveTipIdx(prev => (prev - 1 + tips.length) % tips.length)}
                    >
                      <RiArrowLeftSLine />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setActiveTipIdx(prev => (prev + 1) % tips.length)}
                    >
                      <RiArrowRightSLine />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">Loading safety guides...</p>
            )}
          </div>
        </Col>

        {/* Latest Public Records Slider */}
        <Col lg={6}>
          <div className="crs-card h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-light fw-bold mb-0">Latest Crime Updates</h4>
              <Link to="/user/fir/fir-records" className="text-decoration-none" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
                Search Archives
              </Link>
            </div>
            
            {recentUpdates.length > 0 ? (
              <div className="position-relative d-flex flex-column justify-content-between" style={{ minHeight: '220px' }}>
                <div className="animate-fade-in" key={activeUpdateIdx}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge-status badge-approved" style={{ fontSize: '0.7rem' }}>
                      {recentUpdates[activeUpdateIdx].category}
                    </span>
                    <span className={`badge-status badge-${recentUpdates[activeUpdateIdx].status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                      {recentUpdates[activeUpdateIdx].status}
                    </span>
                  </div>
                  <h5 className="text-light fw-bold mb-2">
                    Incident in {recentUpdates[activeUpdateIdx].city}
                  </h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {recentUpdates[activeUpdateIdx].description}
                  </p>
                  <span className="text-muted d-block mt-1" style={{ fontSize: '0.8rem' }}>
                    Date: {new Date(recentUpdates[activeUpdateIdx].incident_datetime).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="d-flex align-items-center justify-content-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Update {activeUpdateIdx + 1} of {recentUpdates.length}
                  </span>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setActiveUpdateIdx(prev => (prev - 1 + recentUpdates.length) % recentUpdates.length)}
                    >
                      <RiArrowLeftSLine />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-secondary" 
                      onClick={() => setActiveUpdateIdx(prev => (prev + 1) % recentUpdates.length)}
                    >
                      <RiArrowRightSLine />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">No public case reports recorded yet.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
