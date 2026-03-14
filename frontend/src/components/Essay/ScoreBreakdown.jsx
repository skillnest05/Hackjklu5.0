import { motion } from 'framer-motion';
import './Essay.css';

export default function ScoreBreakdown({ dimension, score, feedback, delay = 0 }) {
  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--accent-success)';
    if (s >= 60) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const getScoreLabel = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 80) return 'Good';
    if (s >= 70) return 'Above Average';
    if (s >= 60) return 'Average';
    if (s >= 50) return 'Below Average';
    return 'Needs Improvement';
  };

  return (
    <motion.div
      className="score-breakdown glass"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="score-breakdown-header">
        <div className="score-breakdown-title">
          <h4>{dimension}</h4>
          <span className="score-breakdown-label" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </span>
        </div>
        <div className="score-breakdown-value" style={{ color: getScoreColor(score) }}>
          {score}<span className="score-breakdown-max">/100</span>
        </div>
      </div>
      <div className="score-breakdown-bar-track">
        <motion.div
          className="score-breakdown-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${getScoreColor(score)}, ${getScoreColor(score)}88)` }}
        />
      </div>
      {feedback && (
        <p className="score-breakdown-feedback">{feedback}</p>
      )}
    </motion.div>
  );
}
