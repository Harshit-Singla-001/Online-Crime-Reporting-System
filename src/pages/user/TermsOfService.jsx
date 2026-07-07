import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';

const TermsOfService = () => {
  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <Link to="/user/home" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)' }}>
          <RiArrowLeftLine /> Back to Home
        </Link>
      </div>

      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px', textAlign: 'left' }}>
        <h2 className="text-light fw-bold mb-4">Terms of Service</h2>

        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          Welcome to the Online Crime Reporting System. By registering and utilizing this dashboard, you agree to comply with the following academic usage guidelines.
        </p>

        <h5 className="text-light fw-bold mt-4">1. Acceptable Sandbox Behavior</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          Users are authorized to file mock FIR incidents, rate public safety guidelines, and explore dashboard analytics. Any submission of real personal data, actual addresses, or real-life threats is strictly prohibited.
        </p>

        <h5 className="text-light fw-bold mt-4">2. Liability Exclusions</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          This system is not connected to municipal police stations or state rescue operations. We exclude any liability arising from failure to report real emergencies to proper authorities. For real emergencies, contact local dial codes immediately.
        </p>

        <h5 className="text-light fw-bold mt-4">3. Prohibited Misuse</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          Any attempt to inject malicious code, run bulk automated scripts against authentication routes, or use offensive language in case incident summaries will result in account blocking and suspended node access.
        </p>

        <h5 className="text-light fw-bold mt-4">4. Revisions</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          We reserve the rights to alter sandbox parameters, delete case databases, modify word recovery pools, and reset site configurations without notice.
        </p>

        <div className="mt-5 pt-3 border-top border-secondary text-muted" style={{ fontSize: '0.8rem' }}>
          Developed by Harshit Singla | Roll No: 2417119 | Academic Prototype Validation only.
        </div>
      </div>
    </Container>
  );
};

export default TermsOfService;
