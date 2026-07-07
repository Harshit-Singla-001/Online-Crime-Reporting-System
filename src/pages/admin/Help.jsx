import React from 'react';
import { Container, Card, Accordion, Row, Col } from 'react-bootstrap';
import { RiQuestionLine, RiShieldUserLine, RiFolderShield2Line, RiUserLine, RiCodeBoxLine } from 'react-icons/ri';

const Help = () => {
  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <h2 className="text-light fw-bold mb-1">Administrative Help Center</h2>
        <p className="text-muted">Operations manual, system configuration tutorials, and developer contacts</p>
      </div>

      <Row className="gy-4">
        {/* Quick Operations Guide */}
        <Col lg={4}>
          <Card className="crs-card p-4 text-start h-100">
            <h4 className="text-light fw-bold mb-4 d-flex align-items-center gap-2">
              <RiShieldUserLine className="text-info" /> Operations Quicklist
            </h4>
            
            <div className="mb-4">
              <h6 className="text-light fw-bold mb-2">1. FIR Moderation</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                Visit the <strong>Manage FIRs</strong> workspace. Click details to check full details including reporter profile and attachments. Write case reviews and update case status.
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-light fw-bold mb-2">2. User Controls</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                Visit the <strong>Manage Users</strong> tab to search active citizens. Use the Block toggle to deactivate accounts flagged for spam or malicious reports.
              </p>
            </div>

            <div className="mb-4">
              <h6 className="text-light fw-bold mb-2">3. Awareness Library</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                Add, update, or remove safety tip articles in <strong>Manage Tips</strong> to keep the public homepage slider updated with cyber and road precautions.
              </p>
            </div>

            <div>
              <h6 className="text-light fw-bold mb-2">4. System Parameters</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                Manage captcha validation state, visitor register switches, and toggle maintenance mode under <strong>Site Settings</strong>.
              </p>
            </div>
          </Card>
        </Col>

        {/* FAQ Accordion */}
        <Col lg={8}>
          <Card className="crs-card p-4 text-start">
            <h4 className="text-light fw-bold mb-4 d-flex align-items-center gap-2">
              <RiQuestionLine className="text-info" /> Administrative FAQ
            </h4>

            <Accordion defaultActiveKey="0" className="crs-accordion-custom">
              <Accordion.Item eventKey="0" style={{ background: 'transparent', borderBottom: '1px solid var(--border-glass)' }}>
                <Accordion.Header className="text-light py-2">
                  <span className="text-light fw-bold">How does the auto-unblock system work?</span>
                </Accordion.Header>
                <Accordion.Body className="text-muted" style={{ lineHeight: '1.6' }}>
                  If a user gets blocked automatically due to 5 consecutive failed login attempts, or is manually blocked by an admin, the system stamps a <code>blocked_until</code> date (exactly 1 week in the future). During login, the server evaluates if that date has lapsed and automatically unblocks the account on success.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1" style={{ background: 'transparent', borderBottom: '1px solid var(--border-glass)' }}>
                <Accordion.Header className="text-light py-2">
                  <span className="text-light fw-bold">Are email updates automatically sent to citizens?</span>
                </Accordion.Header>
                <Accordion.Body className="text-muted" style={{ lineHeight: '1.6' }}>
                  Yes. Whenever you transition a case status (e.g. from <em>Pending</em> to <em>Approved</em> or <em>Solved</em>) and submit your admin review, the server fires a background Nodemailer transport containing the updated status and your exact review remarks to the user's email address.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2" style={{ background: 'transparent', borderBottom: '1px solid var(--border-glass)' }}>
                <Accordion.Header className="text-light py-2">
                  <span className="text-light fw-bold">Where are submitted case evidence attachments saved?</span>
                </Accordion.Header>
                <Accordion.Body className="text-muted" style={{ lineHeight: '1.6' }}>
                  Attachments are saved locally inside the backend server's <code>uploads/</code> directory using Multer file storage. The administrative page renders these secure links pointing directly to the server files.
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3" style={{ background: 'transparent', border: '0' }}>
                <Accordion.Header className="text-light py-2">
                  <span className="text-light fw-bold">How are case priorities calculated?</span>
                </Accordion.Header>
                <Accordion.Body className="text-muted" style={{ lineHeight: '1.6' }}>
                  Priority is calculated dynamically by the server during creation based on category selection:
                  <ul>
                    <li><strong>High Priority:</strong> Missing Person, Assault</li>
                    <li><strong>Medium Priority:</strong> Theft</li>
                    <li><strong>Low Priority:</strong> Cyber Crime, Other</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card>

          <Card className="crs-card p-4 text-start mt-4">
            <h4 className="text-light fw-bold mb-3 d-flex align-items-center gap-2">
              <RiCodeBoxLine className="text-info" /> Developer Dossier
            </h4>
            <Row className="g-3">
              <Col md={6}>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>PRIMARY DEVELOPER</p>
                <p className="text-light fw-bold mb-0">Harshit Singla</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>ACADEMIC DIVISION</p>
                <p className="text-light fw-bold mb-0">BTech AI & DS</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>ROLL NUMBER ID</p>
                <p className="text-light fw-bold mb-0">2417119</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>PROJECT TYPE</p>
                <p className="text-light fw-bold mb-0">MERN Stack SPA Educational Build</p>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Help;
