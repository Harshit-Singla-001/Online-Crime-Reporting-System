import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';

const PrivacyPolicy = () => {
  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="mb-4 text-start">
        <Link to="/user/home" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)' }}>
          <RiArrowLeftLine /> Back to Home
        </Link>
      </div>

      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px', textAlign: 'left' }}>
        <h2 className="text-light fw-bold mb-4">Privacy Policy</h2>
        
        <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          This Privacy Policy describes how the Online Crime Reporting System (OCRS) handles demographic, identity, and coordinate information.
        </p>

        <h5 className="text-light fw-bold mt-4">1. Information We Collect</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          We collect account details (Full Name, Date of Birth, Email, Phone Number, Aadhaar Number, and PAN if applicable) and coordinate geolocations via browser geolocation APIs when filing a First Information Report (FIR). This is stored strictly in memory or safe cloud schemas for academic assessment.
        </p>

        <h5 className="text-light fw-bold mt-4">2. Security Redaction & Public Anonymization</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          To guarantee citizen safety, public crime listings have all Personally Identifiable Information (PII) removed. Public case reports exclude names, phone details, evidence files, and specific incident location addresses.
        </p>

        <h5 className="text-light fw-bold mt-4">3. Data Retentions</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          As OCRS is an educational project, all database profiles and reports are subject to routine deletion cycles and sandbox wipes. No real-world authorities monitor this data.
        </p>

        <h5 className="text-light fw-bold mt-4">4. Third-Party Services</h5>
        <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          Our SMTP services are configured using standard developer mail configurations. Geolocation reverse lookups are routed through OpenStreetMap Nominatim APIs which log no personal requests.
        </p>

        <div className="mt-5 pt-3 border-top border-secondary text-muted" style={{ fontSize: '0.8rem' }}>
          Developed by Harshit Singla | Roll No: 2417119 | Academic Prototype Validation only.
        </div>
      </div>
    </Container>
  );
};

export default PrivacyPolicy;
