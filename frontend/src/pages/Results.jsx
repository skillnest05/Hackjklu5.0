import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer 
} from 'recharts';
import ArgumentMap from '../components/Essay/ArgumentMap';
import DebateMode from '../components/Essay/DebateMode';
import VoiceAnalysis from '../components/Essay/VoiceAnalysis';
import { HiOutlineDownload, HiOutlineShare, HiOutlineClock, HiOutlineBookOpen, HiOutlineSparkles } from 'react-icons/hi';
import { RiLightbulbFlashLine } from 'react-icons/ri';
import ScoreBreakdown from '../components/Essay/ScoreBreakdown';
import IssueCard from '../components/Essay/IssueCard';
import Badge from '../components/Common/Badge';
import './Pages.css';
import './Results.css';
import '../components/Essay/DebateMode.css';
import '../components/Essay/VoiceAnalysis.css';

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleExportPDF = () => {
    const scoreRows = dimensions.map(dim => {
      const score = essay.scores[dim.key];
      const feedback = essay.feedback[feedbackKeys[dim.key]];
      const color = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';
      return `
        <div class="score-card">
          <div class="score-header">
            <span class="score-label">${dim.label}</span>
            <span class="score-value" style="color:${color}">${score}/100</span>
          </div>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width:${score}%;background:${color}"></div>
          </div>
          ${feedback ? `<p class="score-feedback">${typeof feedback === 'object' ? JSON.stringify(feedback) : feedback}</p>` : ''}
        </div>`;
    }).join('');

    const tipsHtml = (essay.feedback.improvementTips || []).map((tip, i) =>
      `<li class="plan-item"><span class="plan-num">${i + 1}.</span> <span>${tip}</span></li>`
    ).join('');

    const questionsHtml = (essay.feedback.practiceQuestions || []).map((q, i) =>
      `<li class="plan-item"><span class="plan-num">Q${i + 1}.</span> <span>${q}</span></li>`
    ).join('');

    const issuesHtml = essay.issues.length === 0
      ? `<div class="no-issues">✅ The essay passed all integrity checks. No issues detected.</div>`
      : essay.issues.map(issue => `
          <div class="issue-card">
            <strong>${issue.type || 'Issue'}</strong>
            <p>${issue.description || issue.text || ''}</p>
          </div>`).join('');

    const overallColor = essay.overallScore >= 80 ? '#16a34a' : essay.overallScore >= 60 ? '#ca8a04' : '#dc2626';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Evaluation Report – ${essay.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; font-size: 14px; line-height: 1.6; }
    h1 { font-size: 24px; color: #1a1a2e; margin-bottom: 4px; }
    h2 { font-size: 18px; color: #1a1a2e; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 28px 0 16px; }
    h3 { font-size: 15px; color: #1a1a2e; margin: 16px 0 8px; }
    p { color: #334155; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 15px; margin-bottom: 24px; }
    .meta { display: flex; gap: 24px; margin-bottom: 32px; }
    .meta-item { background: #f1f5f9; padding: 8px 16px; border-radius: 8px; font-weight: 600; color: #1e293b; }
    .overall { font-size: 48px; font-weight: 900; color: ${overallColor}; }
    .score-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; background: #f8fafc; page-break-inside: avoid; }
    .score-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .score-label { font-weight: 600; color: #1e293b; }
    .score-value { font-weight: 700; font-size: 15px; }
    .score-bar-track { height: 8px; background: #e2e8f0; border-radius: 4px; margin-bottom: 10px; }
    .score-bar-fill { height: 8px; border-radius: 4px; }
    .score-feedback { color: #475569; font-size: 13px; }
    .section { page-break-inside: avoid; }
    .plan-list { list-style: none; }
    .plan-item { display: flex; gap: 10px; padding: 10px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; color: #1e293b; page-break-inside: avoid; }
    .plan-num { font-weight: 700; color: #6c63ff; min-width: 28px; }
    .no-issues { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; color: #166534; font-weight: 600; }
    .issue-card { border: 1px solid #fecaca; background: #fff5f5; border-radius: 8px; padding: 14px; margin-bottom: 10px; color: #991b1b; page-break-inside: avoid; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Evaluation Report</h1>
  <p class="subtitle">${essay.title}</p>
  <div class="meta">
    <div class="meta-item">Overall Score: <span style="color:${overallColor}">${essay.overallScore}/100</span></div>
    <div class="meta-item">📖 ${essay.wordCount} words</div>
    <div class="meta-item">⏱ ${essay.readingTime} read</div>
  </div>

  <div class="section">
    <h2>Score Breakdown</h2>
    ${scoreRows}
  </div>

  <div class="section">
    <h2>Action Plan</h2>
    <h3>Actionable Steps to Improve</h3>
    <ul class="plan-list">${tipsHtml || '<li class="plan-item"><span>No suggestions available.</span></li>'}</ul>
    <h3 style="margin-top:20px">Targeted Practice Questions</h3>
    <ul class="plan-list">${questionsHtml || '<li class="plan-item"><span>No questions generated.</span></li>'}</ul>
  </div>

  <div class="section">
    <h2>Integrity Checks</h2>
    ${issuesHtml}
  </div>

  <div class="footer">Generated by Essay AI &bull; ${new Date().toLocaleDateString()}</div>
  <script>window.onload = function() { window.print(); window.onafterprint = function(){ window.close(); }; }</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      toast.error('Pop-up blocked! Please allow pop-ups for this site and try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evaluation Results</h1>
          <p className="page-subtitle">{essay.title}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleShare}>
            <HiOutlineShare /> Share
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
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
          className={`tab-btn ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          Score Breakdown
        </button>
        <button 
          className={`tab-btn ${activeTab === 'improvements' ? 'active' : ''}`}
          onClick={() => setActiveTab('improvements')}
        >
          <RiLightbulbFlashLine className="tab-icon" />
          Action Plan
        </button>
        <button 
          className={`tab-btn ${activeTab === 'argument-map' ? 'active' : ''}`}
          onClick={() => setActiveTab('argument-map')}
        >
          <svg className="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Argument Map
        </button>
        <button
          className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues Detected
          {essay.issues.length > 0 && (
            <span className="tab-badge">{essay.issues.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'debate' ? 'active' : ''}`}
          onClick={() => setActiveTab('debate')}
          style={{ color: activeTab === 'debate' ? '#ff6b6b' : undefined }}
        >
          ⚔️ Debate Mode
          <span style={{ 
            fontSize: '0.65rem', 
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            color: 'white',
            padding: '1px 5px',
            borderRadius: '4px',
            marginLeft: '6px',
            fontWeight: 700,
            letterSpacing: '0.3px'
          }}>NEW</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => setActiveTab('voice')}
          style={{ color: activeTab === 'voice' ? '#06b6d4' : undefined }}
        >
          🎙️ Voice Analysis
          <span style={{ 
            fontSize: '0.65rem', 
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            color: 'white',
            padding: '1px 5px',
            borderRadius: '4px',
            marginLeft: '6px',
            fontWeight: 700,
            letterSpacing: '0.3px'
          }}>NEW</span>
        </button>
      </div>

      {/* Tab Content - UI View (only active tab) */}
      <div className="results-tab-content no-print">
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

        {activeTab === 'argument-map' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px', color: 'var(--accent-primary)'}}>
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Logical Argument Structure
              </h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Explore how your claims branch from your main thesis and connect to supporting evidence.
              </p>
            </div>
            
            <ArgumentMap argumentMapData={essay.argument_map} />
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

        {activeTab === 'debate' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DebateMode essay={essay} />
          </motion.div>
        )}

        {activeTab === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VoiceAnalysis essay={essay} />
          </motion.div>
        )}
      </div>

      {/* Complete Report View - Print Only */}
      <div className="print-only">
        <div className="print-section">
          <h2 className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Score Breakdown</h2>
          {dimensions.map((dim, i) => (
            <ScoreBreakdown
              key={dim.key}
              dimension={dim.label}
              score={essay.scores[dim.key]}
              feedback={essay.feedback[feedbackKeys[dim.key]]}
              delay={0}
            />
          ))}
        </div>

        <div className="print-section" style={{ marginTop: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Action Plan</h2>
          <div className="improvement-plan-card glass">
            <h3 className="improvement-title">
              <HiOutlineSparkles style={{ color: 'var(--accent-primary)' }} />
              Actionable Steps to Improve
            </h3>
            {essay.feedback.improvementTips && essay.feedback.improvementTips.length > 0 ? (
              <ul className="improvement-list">
                {essay.feedback.improvementTips.map((tip, i) => (
                  <li key={i} className="improvement-item" style={{ marginBottom: '1rem' }}>
                    <span className="improvement-icon">🎯</span>
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No specific improvement tips available yet.</p>
            )}

            <h3 className="improvement-title" style={{ marginTop: '2rem' }}>
              <HiOutlineBookOpen style={{ color: 'var(--accent-primary)' }} />
              Targeted Practice Questions
            </h3>
            {essay.feedback.practiceQuestions && essay.feedback.practiceQuestions.length > 0 ? (
              <ul className="improvement-list">
                {essay.feedback.practiceQuestions.map((q, i) => (
                  <li key={i} className="improvement-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                      <span className="improvement-icon">📝</span>
                      <p style={{ flex: 1, fontWeight: 500 }}>{q}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No practice questions generated.</p>
            )}
          </div>
        </div>

        <div className="print-section" style={{ marginTop: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Argument Structure</h2>
          <ArgumentMap argumentMapData={essay.argument_map} />
        </div>

        <div className="print-section" style={{ marginTop: '2rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Integrity Checks</h2>
          {essay.issues.length === 0 ? (
            <div className="no-issues-card glass" style={{ marginBottom: '2rem' }}>
              <div className="no-issues-icon">✅</div>
              <h3>No Issues Detected</h3>
              <p>The essay passed all integrity checks. No hallucinations, bias, or plagiarism were detected.</p>
            </div>
          ) : (
            essay.issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} delay={0} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
