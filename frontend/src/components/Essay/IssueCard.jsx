import { motion } from 'framer-motion';
import { HiOutlineExclamation, HiOutlineShieldExclamation, HiOutlineEye } from 'react-icons/hi';
import './Essay.css';

const issueConfig = {
  hallucination: {
    icon: <HiOutlineExclamation />,
    label: 'Hallucinated Fact',
    color: 'var(--accent-danger)',
    bg: 'rgba(255, 107, 107, 0.08)',
    border: 'rgba(255, 107, 107, 0.2)',
  },
  bias: {
    icon: <HiOutlineShieldExclamation />,
    label: 'Bias Detected',
    color: 'var(--accent-warning)',
    bg: 'rgba(255, 179, 71, 0.08)',
    border: 'rgba(255, 179, 71, 0.2)',
  },
  plagiarism: {
    icon: <HiOutlineEye />,
    label: 'Potential Plagiarism',
    color: 'var(--accent-info)',
    bg: 'rgba(116, 185, 255, 0.08)',
    border: 'rgba(116, 185, 255, 0.2)',
  },
  factual: {
    icon: <HiOutlineExclamation />,
    label: 'Factual Issue',
    color: 'var(--accent-danger)',
    bg: 'rgba(255, 107, 107, 0.08)',
    border: 'rgba(255, 107, 107, 0.2)',
  },
};

const severityBadge = {
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-info',
};

export default function IssueCard({ issue, delay = 0 }) {
  const config = issueConfig[issue.type] || issueConfig.factual;

  return (
    <motion.div
      className="issue-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{ background: config.bg, borderColor: config.border }}
    >
      <div className="issue-card-header">
        <div className="issue-card-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div className="issue-card-meta">
          <span className="issue-card-type" style={{ color: config.color }}>{config.label}</span>
          <span className={`badge ${severityBadge[issue.severity]}`}>
            {issue.severity.toUpperCase()}
          </span>
        </div>
      </div>
      <p className="issue-card-description">{issue.description}</p>
      <span className="issue-card-location">📍 {issue.location}</span>
    </motion.div>
  );
}
