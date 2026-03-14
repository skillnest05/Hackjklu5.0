import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer 
} from 'recharts';
import { HiOutlineDownload, HiOutlineShare, HiOutlineClock, HiOutlineBookOpen, HiOutlineSparkles } from 'react-icons/hi';
import ScoreBreakdown from '../components/Essay/ScoreBreakdown';
import IssueCard from '../components/Essay/IssueCard';
import Badge from '../components/Common/Badge';
// no mock data
import './Pages.css';

function PracticeInteraction({ question, index, delay }) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/evaluate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.li 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="improvement-item"
      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
    >
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <span className="improvement-icon">📝</span>
        <p style={{ flex: 1, fontWeight: 500 }}>{question}</p>
      </div>
      
      <div className="practice-interaction">
        <textarea 
          className="practice-textarea" 
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={feedback !== null}
        />
        {!feedback && (
          <button 
            className="practice-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
          </button>
        )}
        
        {feedback && (
          <div className="practice-feedback">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge score={feedback.score}>
                {feedback.score >= 80 ? 'Excellent' : feedback.score >= 60 ? 'Good' : 'Needs Work'} ({feedback.score}/100)
              </Badge>
            </div>
            <p>{feedback.feedback}</p>
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default function Results() {
  const location = useLocation();
  const [essay, setEssay] = useState(location.state?.essay || null);
  const [activeTab, setActiveTab] = useState('breakdown');
  const [isLoading, setIsLoading] = useState(!location.state?.essay);

  useEffect(() => {
    if (!essay) {
      // If accessed directly without state, fetch the most recent evaluation
      fetch('http://localhost:8000/api/history')
        .then(res => res.json())
        .then(data => {
          if (data.evaluations && data.evaluations.length > 0) {
            setEssay(data.evaluations[0]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch latest essay:", err);
          setIsLoading(false);
        });
    }
  }, [essay]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading results...</p>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="page-container">
        <div className="empty-state glass">
          <div className="empty-state-icon">📄</div>
          <h3>No Results Found</h3>
          <p>Please submit an essay first to view its evaluation.</p>
        </div>
      </div>
    );
  }

  const radarData = [
    { dimension: 'Coherence', score: essay.scores.coherence, fullMark: 100 },
    { dimension: 'Argument', score: essay.scores.argumentStrength, fullMark: 100 },
    { dimension: 'Factual', score: essay.scores.factualCorrectness, fullMark: 100 },
    { dimension: 'Originality', score: essay.scores.originality, fullMark: 100 },
    { dimension: 'Quality', score: essay.scores.writingQuality, fullMark: 100 },
  ];

  const getOverallColor = (score) => {
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const dimensions = [
    { key: 'coherence', label: 'Coherence & Flow' },
    { key: 'argumentStrength', label: 'Argument Strength' },
    { key: 'factualCorrectness', label: 'Factual Correctness' },
    { key: 'originality', label: 'Originality' },
    { key: 'writingQuality', label: 'Writing Quality' },
  ];

  const feedbackKeys = {
    coherence: 'coherence',
    argumentStrength: 'argumentStrength',
    factualCorrectness: 'factualCorrectness',
    originality: 'originality',
    writingQuality: 'writingQuality',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evaluation Results</h1>
          <p className="page-subtitle">{essay.title}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <HiOutlineShare /> Share
          </button>
          <button className="btn btn-primary">
            <HiOutlineDownload /> Export PDF
          </button>
        </div>
      </div>

      {/* Overall Score + Radar */}
      <div className="results-top-grid">
        <motion.div
          className="overall-score-card glass gradient-border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overall-score-ring">
            <svg viewBox="0 0 120 120" className="score-ring-svg">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke={getOverallColor(essay.overallScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 52 * (1 - essay.overallScore / 100)
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="overall-score-value">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ color: getOverallColor(essay.overallScore) }}
              >
                {essay.overallScore}
              </motion.span>
              <span className="overall-score-max">/100</span>
            </div>
          </div>
          <h3 className="overall-score-label">Overall Score</h3>
          <Badge score={essay.overallScore}>
            {essay.overallScore >= 80 ? 'Excellent' : essay.overallScore >= 60 ? 'Good' : 'Needs Work'}
          </Badge>
          
          <div className="overall-meta">
            <div className="overall-meta-item">
              <HiOutlineClock />
              <span>{essay.readingTime} read</span>
            </div>
            <div className="overall-meta-item">
              <HiOutlineBookOpen />
              <span>{essay.wordCount.toLocaleString()} words</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="radar-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="chart-title">Multi-Dimensional Analysis</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dimension" stroke="#a0a0c0" fontSize={13} />
              <PolarRadiusAxis 
                stroke="rgba(255,255,255,0.05)" 
                fontSize={10} 
                domain={[0, 100]}
                tickCount={5}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6c63ff"
                fill="#6c63ff"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="results-tabs">
        <button
          className={`results-tab ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Score Breakdown
        </button>
        <button
          className={`results-tab ${activeTab === 'improvements' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvements')}
        >
          Action Plan
        </button>
        <button
          className={`results-tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues Detected
          {essay.issues.length > 0 && (
            <span className="tab-badge">{essay.issues.length}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="results-tab-content">
        {activeTab === 'breakdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {dimensions.map((dim, i) => (
              <ScoreBreakdown
                key={dim.key}
                dimension={dim.label}
                score={essay.scores[dim.key]}
                feedback={essay.feedback[feedbackKeys[dim.key]]}
                delay={i * 0.1}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'improvements' && (
          <motion.div
            className="improvement-plan-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="improvement-plan-card glass">
              <h3 className="improvement-title">
                <HiOutlineSparkles style={{ color: 'var(--accent-primary)' }} />
                Actionable Steps to Improve
              </h3>
              {essay.feedback.improvementTips && essay.feedback.improvementTips.length > 0 ? (
                <ul className="improvement-list">
                  {essay.feedback.improvementTips.map((tip, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="improvement-item"
                    >
                      <span className="improvement-icon">🎯</span>
                      <p>{tip}</p>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No specific improvement tips available yet.</p>
              )}

              <h3 className="improvement-title" style={{ marginTop: '32px' }}>
                <HiOutlineBookOpen style={{ color: 'var(--accent-primary)' }} />
                Targeted Practice Questions
              </h3>
              {essay.feedback.practiceQuestions && essay.feedback.practiceQuestions.length > 0 ? (
                <ul className="improvement-list">
                  {essay.feedback.practiceQuestions.map((q, i) => (
                    <PracticeInteraction 
                      key={i} 
                      index={i} 
                      question={q} 
                      delay={(i + essay.feedback.improvementTips?.length || 0) * 0.1} 
                    />
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No practice questions generated.</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'issues' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {essay.issues.length === 0 ? (
              <div className="no-issues-card glass">
                <div className="no-issues-icon">✅</div>
                <h3>No Issues Detected</h3>
                <p>The essay passed all integrity checks. No hallucinations, bias, or plagiarism were detected.</p>
              </div>
            ) : (
              essay.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} delay={i * 0.1} />
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
