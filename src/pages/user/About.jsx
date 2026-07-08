import React from 'react';
import { Container, Row, Col, Alert, ListGroup, Card } from 'react-bootstrap';
import { RiShieldLine, RiListCheck3, RiAwardLine, RiLockPasswordLine, RiUserSearchLine, RiRoadMapLine } from 'react-icons/ri';

const About = () => {
  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="text-center mb-5">
        <h2 className="text-light fw-bold mb-1">About Online Crime Reporting System</h2>
        <p className="text-muted">A secure and user-friendly platform for reporting and tracking crime cases digitally</p>
      </div>

      <Row className="gy-4">
        {/* Permanent Educational Disclaimer */}
        <Col xs={12}>
          <Alert variant="warning" className="d-flex align-items-center gap-3 p-4 border-0" style={{ background: 'var(--grad-alert)' }}>
            <RiShieldLine size={48} className="text-warning flex-shrink-0" />
            <div>
              <h5 className="alert-heading fw-bold text-light mb-1">Important Notice</h5>
              <p className="mb-0 text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                This portal is an educational prototype built for academic validation. All database records, filings, user credentials, and location coordinates are fictional. No information submitted here is transmitted to police departments or municipal safety authorities.
              </p>
            </div>
          </Alert>
        </Col>

        {/* Project Description */}
        <Col lg={7}>
          <Card className="crs-card h-100 p-4">
            <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
              <RiListCheck3 className="text-info" /> Project Overview
            </h4>
            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              The Online Crime Reporting System (OCRS) represents a modern approach to municipal reporting. Designed to replace legacy paperwork and minimize public station visits, this portal allows citizens to file digital FIRs, track real-time moderation reviews, and check safety bulletins.
            </p>
            <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              Built upon the MERN Stack, this single-page application implements state-of-the-art security features including SVG CAPTCHA checks, password strength analytics, recovery word arrays, and geolocation tracking.
            </p>

            <h5 className="text-light fw-bold mt-4 mb-3">Key Portal Features</h5>
            <Row className="gy-3">
              <Col sm={6}>
                <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  <RiAwardLine className="text-info mt-1 flex-shrink-0" />
                  <span><strong>One-Time Profiles:</strong> Verified identity details with edit limits.</span>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  <RiRoadMapLine className="text-info mt-1 flex-shrink-0" />
                  <span><strong>Reverse Geocoding:</strong> Auto-coordinates mapping.</span>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  <RiLockPasswordLine className="text-info mt-1 flex-shrink-0" />
                  <span><strong>Drag-and-Drop:</strong> Gamified sequence login recovery.</span>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                  <RiUserSearchLine className="text-info mt-1 flex-shrink-0" />
                  <span><strong>Public Scrubbing:</strong> Anonymized case logs.</span>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Academic Details & Works */}
        <Col lg={5}>
          <Card className="crs-card h-100 p-4 justify-content-between">
            <div>
              <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
                <RiAwardLine className="text-warning" /> Developer Credentials
              </h4>
              <ListGroup variant="flush" className="bg-transparent mb-4">
                <ListGroup.Item className="bg-transparent border-secondary text-muted px-0 py-2 d-flex justify-content-between">
                  <span>Developer Name</span>
                  <strong className="text-light">Harshit Singla</strong>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent border-secondary text-muted px-0 py-2 d-flex justify-content-between">
                  <span>Degree Course</span>
                  <strong className="text-light">BTech AI & DS</strong>
                </ListGroup.Item>
                <ListGroup.Item className="bg-transparent border-secondary text-muted px-0 py-2 d-flex justify-content-between">
                  <span>Passing Year</span>
                  <strong className="text-light">2024–2028</strong>
                </ListGroup.Item>
              </ListGroup>
            </div>

            <div>
              <h5 className="text-light fw-bold mb-2">How It Works</h5>
              <ol className="text-muted ps-3 mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                <li>Register profile & verify your email via 6-digit OTP.</li>
                <li>Secure your recovery key words list.</li>
                <li>Log in to access your citizen dashboard.</li>
                <li>File incident details with automatic device geolocations.</li>
                <li>Monitor admin status changes and get instant email alerts.</li>
              </ol>
            </div>
          </Card>
        </Col>

        {/* Future Scope */}
        <Col xs={12}>
          <Card className="crs-card p-4 text-start">
            <h4 className="text-light fw-bold mb-3">Future Portal Enhancements</h4>
            <Row className="gy-2">
              <Col md={6}>
                <ul className="text-muted mb-0 ps-3" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <li>Verify mobile numbers</li>
                  <li>Add multiple levels of access</li>
                  <li>Graphical representation of public FIR records by region</li>
                  <li>Activity logs for administrators and citizens</li>
                  <li>Ability to save reports (accessible from the profile dropdown)</li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="text-muted mb-0 ps-3" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
                  <li>Custom profile picture uploads</li>
                  <li>Multi-language accessibility support</li>
                  <li>System maintenance toggle button</li>
                  <li>Dedicated portal to view citizen-reported FIR history</li>
                </ul>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
