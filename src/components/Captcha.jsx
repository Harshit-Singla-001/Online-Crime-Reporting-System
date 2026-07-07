import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { RiRefreshLine } from 'react-icons/ri';

const Captcha = ({ onCaptchaChange, value, error }) => {
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/auth/captcha');
      setCaptchaSvg(response.data.captchaSvg);
      onCaptchaChange({
        token: response.data.captchaToken,
        answer: ''
      });
    } catch (error) {
      console.error('Failed to fetch CAPTCHA:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleTextChange = (e) => {
    onCaptchaChange({
      token: undefined, // Let parent keep previous token
      answer: e.target.value
    });
  };

  return (
    <div className="crs-card p-3 mb-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <Form.Label className="form-label-custom">Security CAPTCHA</Form.Label>
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="captcha-container flex-grow-1 d-flex justify-content-center align-items-center">
          {loading ? (
            <Spinner animation="border" variant="secondary" size="sm" />
          ) : (
            <div 
              className="captcha-image bg-white px-2 py-1 rounded" 
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
            />
          )}
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={fetchCaptcha} 
          disabled={loading}
          style={{ height: '42px', display: 'flex', alignItems: 'center' }}
        >
          <RiRefreshLine size={20} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>
      
      <Form.Group>
        <Form.Control
          type="text"
          placeholder="Enter CAPTCHA code (case-insensitive)"
          value={value}
          onChange={handleTextChange}
          className={`input-custom ${error ? 'is-invalid' : ''}`}
          required
        />
        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      </Form.Group>
    </div>
  );
};

export default Captcha;
