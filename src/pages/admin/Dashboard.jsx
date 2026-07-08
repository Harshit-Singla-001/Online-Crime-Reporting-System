import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { RiFileList3Line, RiUserSearchLine, RiCheckDoubleLine, RiAlertLine, RiSettings4Line, RiQuestionLine, RiShieldUserLine } from 'react-icons/ri';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="text-start mb-4">
        <h2 className="text-light fw-bold mb-1">Administrative Center</h2>
        <p className="text-muted">Overview of system operations, user registrations, and incident moderation</p>
      </div>

      {/* Summary Cards */}
      <Row className="g-4 mb-5">
        {/* Total FIRs */}
        <Col lg={3} md={6}>
          <Card className="crs-card h-100 p-3">
            <Card.Body className="d-flex justify-content-between align-items-center p-0">
              <div>
                <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>TOTAL FIRS FILED</span>
                <h3 className="text-light fw-bold mb-0">{stats.totalFIRs}</h3>
              </div>
              <div className="p-3 rounded bg-info-subtle text-info">
                <RiFileList3Line size={28} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Pending FIRs */}
        <Col lg={3} md={6}>
          <Card className="crs-card h-100 p-3" style={{ borderLeft: '4px solid var(--color-pending)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center p-0">
              <div>
                <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>PENDING REVIEW</span>
                <h3 className="text-warning fw-bold mb-0">{stats.pendingFIRs}</h3>
              </div>
              <div className="p-3 rounded bg-warning-subtle text-warning">
                <RiAlertLine size={28} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Solved Cases */}
        <Col lg={3} md={6}>
          <Card className="crs-card h-100 p-3" style={{ borderLeft: '4px solid var(--color-solved)' }}>
            <Card.Body className="d-flex justify-content-between align-items-center p-0">
              <div>
                <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>CASES SOLVED</span>
                <h3 className="text-success fw-bold mb-0">{stats.solvedFIRs}</h3>
              </div>
              <div className="p-3 rounded bg-success-subtle text-success">
                <RiCheckDoubleLine size={28} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Total Users */}
        <Col lg={3} md={6}>
          <Card className="crs-card h-100 p-3">
            <Card.Body className="d-flex justify-content-between align-items-center p-0">
              <div>
                <span className="text-muted d-block uppercase-text mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>CITIZEN PROFILES</span>
                <h3 className="text-light fw-bold mb-0">{stats.totalUsers}</h3>
              </div>
              <div className="p-3 rounded bg-secondary-subtle text-muted">
                <RiUserSearchLine size={28} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Panel */}
      <h4 className="text-light fw-bold mb-4">Quick Management Actions</h4>
      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card className="crs-card p-4 text-center h-100 justify-content-between">
            <div>
              <RiFileList3Line size={42} className="text-info mb-3" />
              <h5 className="text-light fw-bold mb-2">Moderate Case Filings</h5>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                Approve, reject, or mark cases as solved. Add official municipal review comments.
              </p>
            </div>
            <Button 
              as={Link} 
              to="/admin/fir/manage" 
              className="btn-grad mt-3 w-100 position-relative py-2"
            >
              Manage FIRs
              {stats.pendingFIRs > 0 && (
                <Badge 
                  bg="warning" 
                  text="dark"
                  className="position-absolute rounded-circle p-2"
                  style={{ top: '-10px', right: '-10px', fontSize: '0.75rem', minWidth: '24px' }}
                >
                  {stats.pendingFIRs}
                </Badge>
              )}
            </Button>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="crs-card p-4 text-center h-100 justify-content-between">
            <div>
              <RiUserSearchLine size={42} className="text-info mb-3" />
              <h5 className="text-light fw-bold mb-2">Citizen Accounts</h5>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                Inspect user demographic identities. Apply account suspension or block settings.
              </p>
            </div>
            <Button as={Link} to="/admin/users/manage" className="btn-grad mt-3 w-100 py-2">
              Manage Users
            </Button>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="crs-card p-4 text-center h-100 justify-content-between">
            <div>
              <RiShieldUserLine size={42} className="text-info mb-3" />
              <h5 className="text-light fw-bold mb-2">Awareness Library</h5>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                Add new guides, update content, or delete outdated traffic and cyber security tip sheets.
              </p>
            </div>
            <Button as={Link} to="/admin/tips/manage" className="btn-grad mt-3 w-100 py-2">
              Manage Safety Tips
            </Button>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4 g-4">
        <Col md={6}>
          <Card className="crs-card p-4 text-start d-flex flex-row align-items-center justify-content-between">
            <div>
              <h5 className="text-light fw-bold mb-1">Configuration Settings</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                Toggle captcha checks, registrations, and submissions
              </p>
            </div>
            <Button as={Link} to="/admin/settings" variant="outline-info" className="py-2 px-3">
              <RiSettings4Line size={20} />
            </Button>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="crs-card p-4 text-start d-flex flex-row align-items-center justify-content-between">
            <div>
              <h5 className="text-light fw-bold mb-1">System Help Guide</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                FAQ directory, usage tips, and developer directory
              </p>
            </div>
            <Button as={Link} to="/admin/help" variant="outline-info" className="py-2 px-3">
              <RiQuestionLine size={20} />
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
