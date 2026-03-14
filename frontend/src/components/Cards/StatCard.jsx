import { motion } from 'framer-motion';
import './Cards.css';

export default function StatCard({ icon, label, value, trend, trendUp, color, delay = 0 }) {
  return (
    <motion.div
      className="stat-card glass glass-hover gradient-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: color || 'var(--gradient-primary)' }}>
          {icon}
        </div>
        {trend && (
          <span className={`stat-card-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-glow" style={{ 
        background: color || 'var(--accent-primary)',
        opacity: 0.06 
      }} />
    </motion.div>
  );
}
