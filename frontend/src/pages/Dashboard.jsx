import { motion } from 'framer-motion';
import { 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineCheckCircle, 
  HiOutlineLightningBolt 
} from 'react-icons/hi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import StatCard from '../components/Cards/StatCard';
import Badge from '../components/Common/Badge';
import { useState, useEffect } from 'react';
// no mock data
import './Pages.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip glass">
        <p className="custom-tooltip-label">{label}</p>
        <p className="custom-tooltip-value">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    today: 0,
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/history')
      .then(res => res.json())
      .then(data => {
        const evals = data.evaluations || [];
        setEvaluations(evals);
        
        // Compute basic stats
        const total = evals.length;
        const avg = total > 0 ? evals.reduce((sum, e) => sum + e.overallScore, 0) / total : 0;
        
        // Simulated "today" count for hackathon demo (just taking the last 24h if real, else 10% of total)
        const todayCount = evals.filter(e => {
          const diff = new Date() - new Date(e.submittedAt);
          return diff < 24 * 60 * 60 * 1000;
        }).length;

        setStats({
          total,
          avgScore: avg.toFixed(1),
          today: todayCount || (total > 0 ? 1 : 0)
        });
      })
      .catch(err => console.error("Failed to fetch history for dashboard:", err));
  }, []);

  // Compute chart data dynamically
  const getScoreDistribution = () => {
    const dist = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];
    evaluations.forEach(e => {
      if (e.overallScore <= 20) dist[0].count++;
      else if (e.overallScore <= 40) dist[1].count++;
      else if (e.overallScore <= 60) dist[2].count++;
      else if (e.overallScore <= 80) dist[3].count++;
      else dist[4].count++;
    });
    return dist;
  };

  const getDimensionAverages = () => {
    if (evaluations.length === 0) return [];
    
    let sums = { coherence: 0, argumentStrength: 0, factualCorrectness: 0, originality: 0, writingQuality: 0 };
    evaluations.forEach(e => {
      sums.coherence += e.scores.coherence;
      sums.argumentStrength += e.scores.argumentStrength;
      sums.factualCorrectness += e.scores.factualCorrectness;
      sums.originality += e.scores.originality;
      sums.writingQuality += e.scores.writingQuality;
    });

    return [
      { dimension: 'Coherence', score: Math.round(sums.coherence / evaluations.length), fullMark: 100 },
      { dimension: 'Argument', score: Math.round(sums.argumentStrength / evaluations.length), fullMark: 100 },
      { dimension: 'Factual', score: Math.round(sums.factualCorrectness / evaluations.length), fullMark: 100 },
      { dimension: 'Originality', score: Math.round(sums.originality / evaluations.length), fullMark: 100 },
      { dimension: 'Quality', score: Math.round(sums.writingQuality / evaluations.length), fullMark: 100 }
    ];
  };

  const getWeeklySubmissions = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    evaluations.forEach(e => {
      const dt = new Date(e.submittedAt);
      if (dt >= oneWeekAgo) {
        const dayStr = days[dt.getDay()];
        weeklyCount[dayStr]++;
      }
    });

    // Determine the order of the last 7 days ending with today
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = days[d.getDay()];
      result.push({ day: dayStr, submissions: weeklyCount[dayStr] });
    }
    return result;
  };

  const scoreDistributionData = getScoreDistribution();
  const dimensionAverages = getDimensionAverages();
  const recentDashbarodEvals = evaluations.slice(0, 5);
  const weeklySubmissions = getWeeklySubmissions();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of essay evaluations and analytics</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<HiOutlineDocumentText />}
          label="Total Essays"
          value={stats.total.toLocaleString()}
          trend="0%"
          trendUp={true}
          color="linear-gradient(135deg, #6c63ff, #3b82f6)"
          delay={0}
        />
        <StatCard
          icon={<HiOutlineChartBar />}
          label="Average Score"
          value={stats.avgScore}
          trend="0%"
          trendUp={true}
          color="linear-gradient(135deg, #00e5a0, #00b4d8)"
          delay={0.1}
        />
        <StatCard
          icon={<HiOutlineCheckCircle />}
          label="Evaluated Today"
          value={stats.today.toLocaleString()}
          trend="0%"
          trendUp={true}
          color="linear-gradient(135deg, #a855f7, #6c63ff)"
          delay={0.2}
        />
        <StatCard
          icon={<HiOutlineLightningBolt />}
          label="Avg. Processing"
          value="2.3s"
          trend="15%"
          trendUp={true}
          color="linear-gradient(135deg, #ffb347, #ff6b6b)"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <motion.div
          className="chart-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="chart-title">Score Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#606080" fontSize={12} />
                <YAxis stroke="#606080" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="chart-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="chart-title">Weekly Submissions</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklySubmissions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#606080" fontSize={12} />
                <YAxis stroke="#606080" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#00e5a0" 
                  strokeWidth={2}
                  fill="url(#areaGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="chart-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="chart-title">Dimension Averages</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dimensionAverages}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="dimension" stroke="#a0a0c0" fontSize={12} />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" fontSize={10} />
                <Radar
                  name="Average"
                  dataKey="score"
                  stroke="#6c63ff"
                  fill="#6c63ff"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions */}
      <motion.div
        className="recent-section glass gradient-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="section-header">
          <h3 className="section-title">Recent Evaluations</h3>
          <a href="/history" className="section-link">View All →</a>
        </div>
        <div className="recent-table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Essay Title</th>
                <th>Overall Score</th>
                <th>Issues</th>
                <th>Words</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentDashbarodEvals.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                    No recent evaluations
                  </td>
                </tr>
              )}
              {recentDashbarodEvals.map((essay) => (
                <tr key={essay.id}>
                  <td>
                    <div className="table-essay-title">{essay.title}</div>
                  </td>
                  <td>
                    <Badge score={essay.overallScore}>{essay.overallScore}/100</Badge>
                  </td>
                  <td>
                    {essay.issues.length === 0 ? (
                      <span className="no-issues">✓ None</span>
                    ) : (
                      <span className="has-issues">{essay.issues.length} found</span>
                    )}
                  </td>
                  <td className="text-muted">{essay.wordCount.toLocaleString()}</td>
                  <td className="text-muted">
                    {new Date(essay.submittedAt).toLocaleDateString('en-IN', { 
                      month: 'short', day: 'numeric' 
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
