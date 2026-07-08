import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col } from 'react-bootstrap';
import { RiShieldUserLine, RiGithubLine, RiLinkedinBoxLine } from 'react-icons/ri';

const Footer = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <footer className="footer-glass py-5 mt-auto" style={{ borderTop: '1px solid var(--border-glass)', background: 'var(--bg-secondary)' }}>
      <Container>
        {!isAdmin ? (
          // USER / PUBLIC FOOTER
          <Row className="gy-4 align-items-start">
            <Col lg={4} md={6}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <RiShieldUserLine size={28} className="text-info" />
                <span className="text-light fw-bold fs-5">OCRS</span>
              </div>
              <p className="text-muted text-start" style={{ fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '300px' }}>
                Online Crime Reporting System is a secure, citizen-centric portal designed to report non-emergency incidents and track real-time moderation responses.
              </p>
            </Col>
            
            <Col lg={4} md={6} className="d-flex justify-content-lg-center">
              <div className="text-start">
                <h5 className="text-light mb-3" style={{ fontWeight: '700' }}>Quick Navigation</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 mb-0" style={{ fontSize: '0.85rem' }}>
                  <li>
                    <Link to="/user/pages/about" className="text-muted text-decoration-none hover-link">
                      About Project
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/pages/terms-of-service" className="text-muted text-decoration-none hover-link">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/pages/privacy-policy" className="text-muted text-decoration-none hover-link">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
            
            <Col lg={4} md={12} className="d-flex flex-column align-items-lg-end">
              <div className="text-start text-lg-end">
                <h5 className="text-light mb-3" style={{ fontWeight: '700' }}>Developer Profiles</h5>
                <div className="d-flex gap-3 mb-3 justify-content-start justify-content-lg-end">
                  <a href="https://github.com/Harshit-Singla-001/" target="_blank" rel="noreferrer" className="text-muted fs-4 hover-icon" title="GitHub">
                    <RiGithubLine />
                  </a>
                  <a href="https://www.linkedin.com/in/harshit-singla001/" target="_blank" rel="noreferrer" className="text-muted fs-4 hover-icon" title="LinkedIn">
                    <RiLinkedinBoxLine />
                  </a>
                </div>
                
                {/* Developer details arranged vertically */}
                <div className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div className="fw-bold text-light">
                    <a 
                      href="https://www.linkedin.com/in/harshit-singla001" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-light text-decoration-none hover-underline"
                    >
                      Harshit Singla
                    </a>
                  </div>
                  <div>BTech AI & DS (Branch)</div>
                  <div>Passing Year: 2024–2028</div>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          // ADMIN FOOTER
          <Row className="align-items-center justify-content-between gy-3">
            <Col md={6}>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Online Crime Reporting System - <span className="text-info">Admin Panel</span>
              </p>
            </Col>
            
            <Col md={6} className="d-flex justify-content-md-end align-items-center gap-3">
              <Link to="/admin/help" className="text-muted text-decoration-none" style={{ fontSize: '0.9rem' }}>
                Help Guide
              </Link>
              <span className="text-muted">|</span>
              <Link to="/admin/settings" className="text-success text-decoration-none d-flex align-items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <span className="geo-dot" style={{ width: '8px', height: '8px' }}></span> Settings
              </Link>
              <span className="text-muted">|</span>
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                Admin: <strong>{user?.full_name}</strong>
              </span>
            </Col>
          </Row>
        )}
        
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
              &copy; {new Date().getFullYear()} OCRS. Educational Project developed for academic purposes.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
