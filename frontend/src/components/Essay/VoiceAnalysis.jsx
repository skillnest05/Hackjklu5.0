import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function MetricCard({ label, score, icon, children }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  return (
    <motion.div
      className="voice-metric-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="voice-metric-header">
        <span className="voice-metric-icon">{icon}</span>
        <span className="voice-metric-label">{label}</span>
        <span className="voice-metric-score" style={{ color }}>{score}</span>
      </div>
      <div className="voice-metric-bar-track">
        <motion.div
          className="voice-metric-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {children && <div className="voice-metric-detail">{children}</div>}
    </motion.div>
  );
}

function WaveformVisualizer({ isRecording }) {
  return (
    <div className={`waveform ${isRecording ? 'active' : ''}`}>
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  );
}

export default function VoiceAnalysis({ essay }) {
  const [phase, setPhase] = useState('intro'); // intro | recording | analyzing | results
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const startRecording = () => {
    if (!SpeechRecognition) {
      setError('Your browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }

    setTranscript('');
    setInterimText('');
    setError('');
    setDuration(0);
    setResults(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalText = '';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          final += r[0].transcript + ' ';
        } else {
          interim += r[0].transcript;
        }
      }
      finalText = final;
      setTranscript(final);
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If still recording, restart (browser stops after silence)
      if (recognitionRef.current === recognition && isRecording) {
        try { recognition.start(); } catch (e) { /* ignore */ }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setPhase('recording');

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const handleStop = async () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    stopRecording();
    setDuration(Math.floor(elapsed));

    const fullText = transcript.trim();
    if (!fullText || fullText.split(' ').length < 5) {
      setError('Not enough speech detected. Please try again and speak for at least 10 seconds.');
      setPhase('intro');
      return;
    }

    setPhase('analyzing');

    try {
      const res = await fetch('http://localhost:8000/api/rhetoric/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          duration_seconds: elapsed,
        }),
      });
      const data = await res.json();
      setResults(data);
      setPhase('results');
    } catch (e) {
      setError('Failed to analyze rhetoric. Please try again.');
      setPhase('intro');
    }
  };

  const resetAll = () => {
    stopRecording();
    setPhase('intro');
    setTranscript('');
    setInterimText('');
    setDuration(0);
    setResults(null);
    setError('');
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Intro Screen ──
  if (phase === 'intro') {
    return (
      <motion.div className="voice-intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="voice-intro-icon">🎙️</div>
        <h2 className="voice-intro-title">Voice Rhetoric Analysis</h2>
        <p className="voice-intro-desc">
          Speak your essay or argument into the microphone. Our AI will transcribe your speech in real-time
          and evaluate your <strong>spoken rhetoric</strong> — detecting filler words, analyzing pacing,
          measuring confidence, and scoring your <strong>persuasiveness</strong>.
        </p>
        <div className="voice-intro-rules">
          <div className="voice-rule"><span>🗣️</span> Real-time speech transcription</div>
          <div className="voice-rule"><span>⏱️</span> Pacing & fluency analysis</div>
          <div className="voice-rule"><span>🧠</span> Confidence level detection</div>
          <div className="voice-rule"><span>🎯</span> Persuasiveness composite score</div>
        </div>
        {error && <div className="voice-error">{error}</div>}
        <button className="btn btn-primary voice-start-btn" onClick={startRecording}>
          🎙️ Start Speaking
        </button>
      </motion.div>
    );
  }

  // ── Recording Screen ──
  if (phase === 'recording') {
    return (
      <motion.div className="voice-recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="voice-recording-header">
          <div className="voice-timer">
            <div className="voice-rec-dot" />
            <span>{formatTime(duration)}</span>
          </div>
          <button className="voice-stop-btn" onClick={handleStop}>⏹ Stop & Analyze</button>
        </div>

        <WaveformVisualizer isRecording={isRecording} />

        <div className="voice-transcript-live">
          <h3>Live Transcription</h3>
          <div className="voice-transcript-text">
            {transcript && <span>{transcript}</span>}
            {interimText && <span className="voice-interim">{interimText}</span>}
            {!transcript && !interimText && (
              <span className="voice-placeholder">Start speaking… your words will appear here in real-time</span>
            )}
          </div>
        </div>

        <div className="voice-word-counter">
          Words: {transcript.split(/\s+/).filter(Boolean).length}
        </div>
      </motion.div>
    );
  }

  // ── Analyzing Screen ──
  if (phase === 'analyzing') {
    return (
      <div className="voice-analyzing">
        <div className="voice-analyzing-spinner" />
        <p>Analyzing your spoken rhetoric…</p>
      </div>
    );
  }

  // ── Results Screen ──
  if (phase === 'results' && results) {
    const persColor = results.persuasiveness_score >= 80 ? '#22c55e'
      : results.persuasiveness_score >= 60 ? '#eab308' : '#ef4444';

    return (
      <motion.div className="voice-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Persuasiveness Hero */}
        <div className="voice-hero">
          <div className="voice-hero-score" style={{ borderColor: persColor }}>
            <span className="voice-hero-number" style={{ color: persColor }}>
              {results.persuasiveness_score}
            </span>
            <span className="voice-hero-max">/100</span>
          </div>
          <h2 className="voice-hero-label">Persuasiveness Score</h2>
          <div className="voice-hero-meta">
            <span>⏱️ {formatTime(duration)}</span>
            <span>📝 {results.fillers?.total_words || 0} words</span>
            <span>🗣️ {results.pacing?.wpm || 0} WPM</span>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="voice-metrics-grid">
          <MetricCard label="Filler Words" score={results.fillers?.score || 0} icon="🔇">
            <p>{results.fillers?.filler_count || 0} fillers detected ({results.fillers?.filler_rate || 0}% rate)</p>
            {results.fillers?.top_fillers?.length > 0 && (
              <div className="voice-tags">
                {results.fillers.top_fillers.map(([word, count], i) => (
                  <span key={i} className="voice-tag">"{word}" ×{count}</span>
                ))}
              </div>
            )}
          </MetricCard>

          <MetricCard label="Pacing & Fluency" score={results.pacing?.score || 0} icon="⏱️">
            <p>{results.pacing?.wpm} WPM — {results.pacing?.pace_label}</p>
            <p>Avg sentence: {results.pacing?.avg_sentence_length} words</p>
          </MetricCard>

          <MetricCard label="Confidence" score={results.confidence?.score || 0} icon="💪">
            <p>{results.confidence?.level}</p>
            <p>{results.confidence?.confidence_markers} assertive vs {results.confidence?.hedging_markers} hedging markers</p>
          </MetricCard>

          <MetricCard label="Persuasion Techniques" score={results.persuasion?.score || 0} icon="🎯">
            <p>{results.persuasion?.total_count} techniques detected</p>
            {Object.keys(results.persuasion?.techniques || {}).length > 0 && (
              <div className="voice-tags">
                {Object.entries(results.persuasion.techniques).map(([tech, count], i) => (
                  <span key={i} className="voice-tag">{tech.replace(/_/g, ' ')} ×{count}</span>
                ))}
              </div>
            )}
          </MetricCard>
        </div>

        {/* Feedback */}
        {results.feedback?.length > 0 && (
          <div className="voice-feedback">
            <h3>💡 Feedback</h3>
            <ul>
              {results.feedback.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transcript */}
        <div className="voice-transcript-final">
          <h3>📝 Your Transcription</h3>
          <p>{transcript}</p>
        </div>

        <div className="voice-results-actions">
          <button className="btn btn-primary" onClick={resetAll}>🎙️ Record Again</button>
        </div>
      </motion.div>
    );
  }

  return null;
}
