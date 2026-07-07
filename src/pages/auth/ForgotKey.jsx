import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { RiKey2Line, RiArrowLeftLine, RiMailSendLine, RiClipboardLine } from 'react-icons/ri';

const ForgotKey = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  
  // Word arrays
  const [originalPool, setOriginalPool] = useState([]); // Master shuffled word pool
  const [wordPool, setWordPool] = useState([]); // Remaining words in pool
  const [slots, setSlots] = useState(Array(10).fill(null)); // 10 sequential slots
  
  // Text area paste mode
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.email) {
      navigate('/auth/forgot-password');
      return;
    }
    setEmail(location.state.email);
    fetchWordPool(location.state.email);
  }, [location, navigate]);

  const fetchWordPool = async (targetEmail) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/auth/forgot-key', { email: targetEmail });
      setOriginalPool(response.data.wordPool);
      setWordPool(response.data.wordPool);
      setRecoveryToken(response.data.recoveryToken);
      setSlots(Array(10).fill(null));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to retrieve recovery word pool.');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, word, source, sourceIdx) => {
    e.dataTransfer.setData('word', word);
    e.dataTransfer.setData('source', source); // 'pool' or 'slot'
    e.dataTransfer.setData('sourceIdx', sourceIdx);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDropSlot = (e, slotIdx) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('word');
    const source = e.dataTransfer.getData('source');
    const sourceIdx = parseInt(e.dataTransfer.getData('sourceIdx'));

    const newSlots = [...slots];
    const prevWordInSlot = newSlots[slotIdx];

    if (source === 'pool') {
      // Remove word from pool
      setWordPool(prev => prev.filter(w => w !== word));
      
      // If there was already a word in this slot, put it back to pool
      if (prevWordInSlot) {
        setWordPool(prev => [...prev, prevWordInSlot]);
      }

      newSlots[slotIdx] = word;
      setSlots(newSlots);
    } else if (source === 'slot') {
      // Reordering between slots
      if (sourceIdx !== slotIdx) {
        newSlots[sourceIdx] = prevWordInSlot; // swap
        newSlots[slotIdx] = word;
        setSlots(newSlots);
      }
    }
  };

  const handleDropPool = (e) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('word');
    const source = e.dataTransfer.getData('source');
    const sourceIdx = parseInt(e.dataTransfer.getData('sourceIdx'));

    if (source === 'slot') {
      const newSlots = [...slots];
      newSlots[sourceIdx] = null; // empty slot
      setSlots(newSlots);
      
      // Return to pool
      if (!wordPool.includes(word)) {
        setWordPool(prev => [...prev, word]);
      }
    }
  };

  // Quick click handler (instead of dragging, user can click to place in first empty slot)
  const handleWordClick = (word) => {
    const emptySlotIdx = slots.indexOf(null);
    if (emptySlotIdx !== -1) {
      const newSlots = [...slots];
      newSlots[emptySlotIdx] = word;
      setSlots(newSlots);
      setWordPool(prev => prev.filter(w => w !== word));
    }
  };

  const handleSlotClick = (slotIdx) => {
    const word = slots[slotIdx];
    if (word) {
      const newSlots = [...slots];
      newSlots[slotIdx] = null;
      setSlots(newSlots);
      setWordPool(prev => [...prev, word]);
    }
  };

  const handleReset = () => {
    setWordPool(originalPool);
    setSlots(Array(10).fill(null));
    setPastedText('');
  };

  const handlePasteChange = (e) => {
    const text = e.target.value;
    setPastedText(text);

    // Auto parse space-separated words
    const words = text.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const newSlots = Array(10).fill(null);
    const usedWords = [];

    for (let i = 0; i < Math.min(words.length, 10); i++) {
      newSlots[i] = words[i];
      usedWords.push(words[i]);
    }

    setSlots(newSlots);
    // Filter remaining words in pool
    setWordPool(originalPool.filter(w => !usedWords.includes(w)));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    // Gather words
    let wordsArray = [];
    if (pasteMode) {
      wordsArray = pastedText.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
    } else {
      wordsArray = slots;
    }

    // Validation
    if (wordsArray.includes(null) || wordsArray.length !== 10) {
      setError('Please populate all 10 slots or paste the complete 10-word key.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/forgot-key-verify', {
        wordsArray,
        recoveryToken
      });
      setLoading(false);
      
      // Redirect to Reset Password with verifiedToken
      navigate('/auth/reset-password', {
        state: { verifiedToken: response.data.verifiedToken }
      });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid sequence. Verify your recovery key.');
      handleReset();
    }
  };

  return (
    <Container className="py-5 animate-fade-in" style={{ minHeight: '85vh' }}>
      <div className="crs-card p-4 p-md-5 mx-auto" style={{ maxWidth: '750px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/auth/forgot-password" className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
            <RiArrowLeftLine /> Back
          </Link>
          <Link to="/auth/forgot-otp" state={{ email }} className="text-decoration-none d-flex align-items-center gap-1" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>
            <RiMailSendLine /> Reset via OTP
          </Link>
        </div>

        <div className="text-center mb-4">
          <RiKey2Line size={48} className="text-warning mb-2" />
          <h2 className="text-light fw-bold">Validate Recovery Key</h2>
          <p className="text-muted">
            Prove your identity by sequencing the 10 secret words for <strong className="text-light">{email}</strong>.
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="d-flex justify-content-end gap-3 mb-3">
          <Button 
            size="sm" 
            variant="outline-secondary"
            onClick={() => setPasteMode(!pasteMode)}
          >
            <RiClipboardLine className="me-1" />
            {pasteMode ? 'Switch to Drag & Drop' : 'Switch to Text Paste'}
          </Button>
          <Button size="sm" variant="outline-danger" onClick={handleReset}>
            Reset Slots
          </Button>
        </div>

        {pasteMode ? (
          <div className="animate-fade-in mb-4">
            <Form.Group className="form-group-custom">
              <Form.Label className="form-label-custom">Paste Recovery Key (10 words separated by spaces)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g. apple tiger moon glass..."
                value={pastedText}
                onChange={handlePasteChange}
                className="input-custom font-monospace"
                required
              />
            </Form.Group>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Word Pool Area */}
            <div className="mb-4">
              <Form.Label className="form-label-custom text-center d-block">Draggable Word Pool (Click or Drag words below)</Form.Label>
              <div 
                className="dnd-pool"
                onDragOver={handleDragOver}
                onDrop={handleDropPool}
              >
                {wordPool.length === 0 ? (
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>All words have been placed in slots</span>
                ) : (
                  wordPool.map((word, idx) => (
                    <div
                      key={word}
                      draggable
                      onDragStart={(e) => handleDragStart(e, word, 'pool', idx)}
                      onClick={() => handleWordClick(word)}
                      className="dnd-word-item"
                    >
                      {word}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sequence Slots Area */}
            <div className="mb-4">
              <Form.Label className="form-label-custom text-center d-block">Sequential Drop Slots (1 to 10)</Form.Label>
              <div className="dnd-slots-container">
                {slots.map((word, idx) => (
                  <div
                    key={idx}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropSlot(e, idx)}
                    onClick={() => handleSlotClick(idx)}
                    className={`dnd-slot ${!word ? 'empty' : 'occupied'}`}
                    style={{ cursor: word ? 'pointer' : 'default' }}
                  >
                    <span className="dnd-slot-num">{idx + 1}</span>
                    {word ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, word, 'slot', idx)}
                        className="dnd-word-item m-0"
                        style={{ fontSize: '0.95rem' }}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering slot removal
                      >
                        {word}
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>Drop Here</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleVerify} 
          className="btn-grad w-100 py-3 mt-3"
          disabled={loading}
        >
          {loading ? 'Verifying Key...' : 'Verify Recovery Key'}
        </Button>
      </div>
    </Container>
  );
};

export default ForgotKey;
