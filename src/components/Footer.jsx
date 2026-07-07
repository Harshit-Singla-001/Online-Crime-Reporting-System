import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { RiGithubLine, RiLinkedinLine, RiCodeSSlashLine } from 'react-icons/ri';

const AppFooter = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <footer className="py-5 mt-auto" style={{ background: 'rgba(10, 13, 22, 0.95)', borderTop: '1px solid var(--border-glass)' }}>
      <Container>
        {!isAdmin ? (
          // USER / PUBLIC FOOTER
          <Row className="gy-4">
            <Col lg={4} md={6}>
              <h5 className="text-light mb-3" style={{ fontWeight: '700' }}>Online Crime Reporting System</h5>
              <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                A secure MERN Stack portal facilitating digital crime logging, status tracking, and community safety guidelines.
              </p>
            </Col>
            
            <Col lg={4} md={6} className="d-flex flex-column align-items-lg-center">
              <div>
                <h5 className="text-light mb-3" style={{ fontWeight: '700' }}>Quick Links</h5>
                <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.9rem' }}>
                  <li>
                    <Link to="/user/pages/privacy-policy" className="text-muted text-decoration-none hover-link">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/pages/terms-of-service" className="text-muted text-decoration-none hover-link">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/user/pages/about" className="text-muted text-decoration-none hover-link">
                      About Project
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>
            
            <Col lg={4} md={12} className="d-flex flex-column align-items-lg-end">
              <div>
                <h5 className="text-light mb-3" style={{ fontWeight: '700' }}>Developer Profiles</h5>
                <div className="d-flex gap-3 mb-3">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted fs-4 hover-icon" title="GitHub">
                    <RiGithubLine />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted fs-4 hover-icon" title="LinkedIn">
                    <RiLinkedinLine />
                  </a>
                  <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-muted fs-4 hover-icon" title="LeetCode">
                    <RiCodeSSlashLine />
                  </a>
                </div>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                  Harshit Singla | Roll No: 2417119
                </p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                  BTech AI & DS
                </p>
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
              <span className="text-success d-flex align-items-center gap-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <span className="geo-dot" style={{ width: '8px', height: '8px' }}></span> System Active
              </span>
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

export default AppFooter;
