import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { RiFileAddLine, RiMapPinLine, RiImageAddLine, RiCheckLine, RiEdit2Line, RiErrorWarningLine } from 'react-icons/ri';

const FileFIR = () => {
  const navigate = useNavigate();

  // Mode: 'form' (editing fields) or 'review' (previewing details before submit)
  const [mode, setMode] = useState('form');

  // Geolocation Status
  const [geoStatus, setGeoStatus] = useState('loading'); // 'loading', 'success', 'error'
  
  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'Theft',
    description: '',
    incident_date: '',
    incident_time: '',
    city: '',
    full_address: '',
    current_address: 'Fetching location...',
    suspect_description: '',
    witness_description: '',
    declaration: false
  });

  // Images state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get Geolocation on mount
  useEffect(() => {
    fetchGeolocation();
  }, []);

  const fetchGeolocation = () => {
    setGeoStatus('loading');
    setFormData(prev => ({ ...prev, current_address: 'Requesting device coordinates...' }));

    if (!navigator.geolocation) {
      setGeoStatus('error');
      setFormData(prev => ({ ...prev, current_address: 'Geolocation is not supported by your browser' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'Online-Crime-Reporting-System/1.0' } }
          );
          const data = await response.json();
          const address = data.display_name || `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          
          setGeoStatus('success');
          setFormData(prev => ({ ...prev, current_address: address }));
        } catch (err) {
          setGeoStatus('success'); // Still have coordinates, so we treat it as partial success
          setFormData(prev => ({ ...prev, current_address: `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}` }));
        }
      },
      (err) => {
        setGeoStatus('error');
        let errorMsg = 'Location permission denied';
        if (err.code === err.POSITION_UNAVAILABLE) errorMsg = 'Position unavailable';
        if (err.code === err.TIMEOUT) errorMsg = 'Location request timed out';
        setFormData(prev => ({ ...prev, current_address: `Location not available (${errorMsg})` }));
      },
      { timeout: 10000 }
    );
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 3) {
      setError('You can upload a maximum of 3 images.');
      return;
    }

    // Filter file types
    const invalidFile = files.find(f => !['image/jpeg', 'image/jpg', 'image/png'].includes(f.type));
    if (invalidFile) {
      setError('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
    setError('');
  };

  const removeFile = (idx) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(idx, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...imagePreviews];
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[idx]);
    newPreviews.splice(idx, 1);
    setImagePreviews(newPreviews);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.incident_date || !formData.incident_time || !formData.city || !formData.full_address) {
      setError('Please fill in all required fields.');
      return;
    }

    // Geolocation verification
    if (navigator.geolocation && (geoStatus === 'error' || formData.current_address.includes('denied'))) {
      setError('Location permission is required to file an FIR.');
      return;
    }

    // Validate Incident Date calendar year
    const year = new Date(formData.incident_date).getFullYear();
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      const msg = 'Please enter a valid calendar year for the incident date.';
      setError(msg);
      alert(msg);
      return;
    }

    // Combine incident date & time to compare with current filing time
    const incidentDatetime = new Date(formData.incident_date);
    const [hours, minutes] = formData.incident_time.split(':');
    incidentDatetime.setHours(parseInt(hours) || 0);
    incidentDatetime.setMinutes(parseInt(minutes) || 0);

    const filingTime = new Date();
    if (incidentDatetime >= filingTime) {
      const msg = 'Crime incident date and time must be before the FIR filing time.';
      setError(msg);
      alert(msg);
      return;
    }

    if (!formData.declaration) {
      setError('You must confirm the declaration check to file the report.');
      return;
    }

    // Transition to preview review screen
    setMode('review');
  };

  const handleFinalConfirm = async () => {
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('incident_date', formData.incident_date);
      data.append('incident_time', formData.incident_time);
      data.append('city', formData.city);
      data.append('full_address', formData.full_address);
      data.append('current_address', formData.current_address);
      data.append('suspect_description', formData.suspect_description);
      data.append('witness_description', formData.witness_description);
      data.append('declaration', formData.declaration);
      
      // Append geolocation metadata for backend validation
      data.append('geolocation_supported', navigator.geolocation ? 'true' : 'false');
      data.append('geolocation_permission', geoStatus === 'error' && formData.current_address.includes('denied') ? 'denied' : 'granted');

      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      const response = await axios.post('/user/fir/file', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setLoading(false);
      navigate('/user/fir/my-firs', {
        state: {
          successMessage: `Your fir ${formData.title} is filed and currently in pending to review`
        }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit FIR. Please check your inputs.');
    }
  };

  if (mode === 'review') {
    return (
      <Container className="py-5 animate-fade-in">
        <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
          <div className="text-center mb-4">
            <RiFileAddLine size={48} className="text-info mb-2" />
            <h2 className="text-light fw-bold">Review Case Report</h2>
            <p className="text-muted">Double-check details before publishing to official registry</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="gy-3 mb-4">
            <Col xs={12} className="border-bottom pb-2">
              <span className="text-muted" style={{ fontSize: '0.85rem' }}>FIR TITLE</span>
              <h5 className="text-light fw-bold">{formData.title}</h5>
            </Col>
            
            <Col md={6}>
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>CRIME CATEGORY</span>
              <strong className="text-light">{formData.category}</strong>
            </Col>
            
            <Col md={6}>
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>INCIDENT SCHEDULE</span>
              <strong className="text-light">{formData.incident_date} at {formData.incident_time}</strong>
            </Col>
            
            <Col xs={12}>
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>CITY</span>
              <strong className="text-light">{formData.city}</strong>
            </Col>
            
            <Col xs={12}>
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>REPORTED LOCATION ADDRESS</span>
              <p className="text-light mb-0" style={{ fontSize: '0.95rem' }}>{formData.full_address}</p>
            </Col>

            <Col xs={12}>
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>GEOLOCATION COORDINATE ADDRESS</span>
              <p className="text-light mb-0" style={{ fontSize: '0.95rem' }}>
                <RiMapPinLine className="text-info me-1" /> {formData.current_address}
              </p>
            </Col>
            
            <Col xs={12} className="border-top pt-3">
              <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>DESCRIPTION OF INCIDENT</span>
              <p className="text-light" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{formData.description}</p>
            </Col>

            {(formData.suspect_description || formData.witness_description) && (
              <Col xs={12} className="border-top pt-3">
                {formData.suspect_description && (
                  <div className="mb-2">
                    <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>SUSPECT DESCRIPTION</span>
                    <p className="text-light" style={{ fontSize: '0.95rem' }}>{formData.suspect_description}</p>
                  </div>
                )}
                {formData.witness_description && (
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>WITNESS DESCRIPTION</span>
                    <p className="text-light" style={{ fontSize: '0.95rem' }}>{formData.witness_description}</p>
                  </div>
                )}
              </Col>
            )}

            {imagePreviews.length > 0 && (
              <Col xs={12} className="border-top pt-3">
                <span className="text-muted d-block mb-2" style={{ fontSize: '0.85rem' }}>ATTACHED EVIDENCE (IMAGES)</span>
                <div className="d-flex gap-3">
                  {imagePreviews.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="rounded border border-secondary"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </Col>
            )}
          </Row>

          <Alert variant="warning" className="d-flex align-items-center gap-2">
            <RiErrorWarningLine size={24} className="flex-shrink-0" />
            <span>
              By confirming, you certify that this information is complete and accurate to the best of your knowledge.
            </span>
          </Alert>

          <div className="d-flex gap-3 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => setMode('form')} 
              className="flex-grow-1 py-3"
              disabled={loading}
            >
              <RiEdit2Line className="me-1" /> Edit Report
            </Button>
            <Button 
              onClick={handleFinalConfirm} 
              className="btn-grad flex-grow-1 py-3"
              disabled={loading}
            >
              <RiCheckLine size={18} className="me-1" /> {loading ? 'Submitting FIR...' : 'Confirm & Submit'}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5 animate-fade-in">
      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="text-center mb-4">
          <RiFileAddLine size={48} className="text-info mb-2" />
          <h2 className="text-light fw-bold">File Citizen FIR</h2>
          <p className="text-muted">Submit official report details regarding crime incident</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleFormSubmit}>
          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Incident Title / Brief Heading</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="e.g. Phone snatching near central park, Break-in at store"
              value={formData.title}
              onChange={handleFieldChange}
              className="input-custom"
              required
            />
          </Form.Group>

          <Row>
            <Col md={12}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Crime Category</Form.Label>
                <div className="d-flex flex-wrap gap-4 py-2 px-3 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>
                  {['Theft', 'Assault', 'Missing Person', 'Cyber Crime', 'Other'].map((cat) => (
                    <Form.Check
                      key={cat}
                      type="radio"
                      id={`cat-${cat}`}
                      name="category"
                      label={cat}
                      value={cat}
                      checked={formData.category === cat}
                      onChange={handleFieldChange}
                      className="text-light"
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Incident Date</Form.Label>
                <Form.Control
                  type="date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleFieldChange}
                  className="input-custom"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Incident Time</Form.Label>
                <Form.Control
                  type="time"
                  name="incident_time"
                  value={formData.incident_time}
                  onChange={handleFieldChange}
                  className="input-custom"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  placeholder="Enter city (e.g. New Delhi, Ludhiana)"
                  value={formData.city}
                  onChange={handleFieldChange}
                  className="input-custom"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Full Incident Location Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="full_address"
              placeholder="Provide landmarks, street details, block etc."
              value={formData.full_address}
              onChange={handleFieldChange}
              className="input-custom"
              required
            />
          </Form.Group>

          <Form.Group className="form-group-custom">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="form-label-custom mb-0">
                {navigator.geolocation ? 'Current Device Coordinates (Auto-Fetched)' : 'Current Coordinates / Location'}
              </Form.Label>
              {navigator.geolocation && (
                <Button 
                  variant="link" 
                  onClick={fetchGeolocation}
                  className="p-0 text-decoration-none"
                  style={{ color: 'var(--color-secondary)', fontSize: '0.85rem' }}
                >
                  Re-fetch
                </Button>
              )}
            </div>
            
            {!navigator.geolocation ? (
              <Form.Control
                type="text"
                name="current_address"
                placeholder="Enter current address / coordinates manually"
                value={formData.current_address === 'Geolocation is not supported by your browser' ? '' : formData.current_address}
                onChange={handleFieldChange}
                className="input-custom"
                required
              />
            ) : (
              <div className="geo-container">
                <span className={`geo-dot ${geoStatus === 'loading' ? 'loading' : geoStatus === 'error' ? 'error' : ''}`} />
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                  {formData.current_address}
                </span>
              </div>
            )}
          </Form.Group>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Detailed Description of Incident</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              placeholder="What happened? Describe the event chronologically..."
              value={formData.description}
              onChange={handleFieldChange}
              className="input-custom"
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Suspect Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="suspect_description"
                  placeholder="Height, clothes, accent, distinctive marks..."
                  value={formData.suspect_description}
                  onChange={handleFieldChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="form-group-custom">
                <Form.Label className="form-label-custom">Witness Info (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="witness_description"
                  placeholder="Names, contact details of bystanders or witnesses..."
                  value={formData.witness_description}
                  onChange={handleFieldChange}
                  className="input-custom"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="form-group-custom">
            <Form.Label className="form-label-custom">Attach Evidence / Images (Max 3, JPG/PNG)</Form.Label>
            <div 
              className="p-4 rounded text-center border-dashed d-flex flex-column align-items-center justify-content-center"
              style={{ background: 'rgba(13, 19, 33, 0.4)', border: '1.5px dashed var(--border-glass)', cursor: 'pointer', position: 'relative' }}
            >
              <RiImageAddLine size={32} className="text-muted mb-2" />
              <span className="text-light" style={{ fontSize: '0.9rem' }}>Select images from local storage</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>JPG, JPEG, PNG only. Max 5MB per file.</span>
              <Form.Control
                type="file"
                multiple
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="d-flex flex-wrap gap-3 mt-3">
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="position-relative">
                    <img
                      src={url}
                      alt={`Upload ${idx+1}`}
                      className="rounded border border-secondary"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeFile(idx)}
                      className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
                      style={{ top: '-8px', right: '-8px', width: '20px', height: '20px', padding: '0', fontSize: '0.75rem' }}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <Form.Group className="form-group-custom mt-4">
            <Form.Check
              type="checkbox"
              id="declaration-chk"
              name="declaration"
              label="I confirm that all details provided in this FIR report are true and factual."
              checked={formData.declaration}
              onChange={handleFieldChange}
              className="text-light"
              style={{ cursor: 'pointer' }}
              required
            />
          </Form.Group>

          <Button 
            type="submit" 
            className="btn-grad w-100 py-3 mt-3"
          >
            Review Report & Proceed
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default FileFIR;
