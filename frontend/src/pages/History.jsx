import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import Badge from '../components/Common/Badge';
// no mock data
import './Pages.css';

export default function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filterScore, setFilterScore] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [essays, setEssays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state back to URL if user types in the History page search bar
  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  // Sync state if URL search param changes (e.g. from navbar)
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (currentSearch !== searchTerm) {
      setSearchTerm(currentSearch);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('http://localhost:8000/api/history')
      .then(res => res.json())
      .then(data => {
        setEssays(data.evaluations || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredEssays = essays
    .filter((essay) => {
      const title = essay.title || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterScore === 'all' ||
        (filterScore === 'high' && essay.overallScore >= 80) ||
        (filterScore === 'medium' && essay.overallScore >= 60 && essay.overallScore < 80) ||
        (filterScore === 'low' && essay.overallScore < 60);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Essay History</h1>
          <p className="page-subtitle">Browse and manage all past essay evaluations</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="history-filters glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="history-search">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by essay title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <div className="history-filter-group">
          <div className="filter-item">
            <HiOutlineFilter />
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Scores</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (60-79)</option>
              <option value="low">Low (&lt;60)</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Essay Cards */}
      <div className="history-list">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Loading history...</span>
          </div>
        ) : (
          <>
            {filteredEssays.map((essay, index) => (
          <motion.div
            key={essay.id}
            className="history-card glass glass-hover gradient-border"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <div className="history-card-main">
              <div className="history-card-info">
                <h3 className="history-card-title">{essay.title}</h3>
                <p className="history-card-prompt">{essay.prompt}</p>
                <div className="history-card-meta">
                  <span>{new Date(essay.submittedAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                  <span>•</span>
                  <span>{essay.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{essay.readingTime}</span>
                  {essay.issues.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="issues-count">{essay.issues.length} issues</span>
                    </>
                  )}
                </div>
              </div>

              <div className="history-card-scores">
                <div className="history-card-overall">
                  <div className="history-score-circle" style={{
                    borderColor: essay.overallScore >= 80 ? 'var(--accent-success)' :
                      essay.overallScore >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                  }}>
                    <span>{essay.overallScore}</span>
                  </div>
                  <Badge score={essay.overallScore}>Overall</Badge>
                </div>

                <div className="history-card-dimensions">
                  {Object.entries(essay.scores).map(([key, value]) => (
                    <div key={key} className="dimension-mini">
                      <span className="dimension-mini-label">
                        {key.replace(/([A-Z])/g, ' $1').trim().slice(0, 3).toUpperCase()}
                      </span>
                      <div className="dimension-mini-bar">
                        <div
                          className="dimension-mini-fill"
                          style={{
                            width: `${value}%`,
                            background: value >= 80 ? 'var(--accent-success)' :
                              value >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)'
                          }}
                        />
                      </div>
                      <span className="dimension-mini-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="history-card-actions">
              <button
                className="btn btn-ghost"
                onClick={() => navigate('/results', { state: { essay } })}
              >
                <HiOutlineEye /> View Details
              </button>
              <button className="btn btn-ghost btn-ghost-danger">
                <HiOutlineTrash /> Delete
              </button>
            </div>
          </motion.div>
        ))}

            {filteredEssays.length === 0 && (
              <div className="empty-state glass">
                <div className="empty-state-icon">📝</div>
                <h3>No essays found</h3>
                <p>Try adjusting your search or filter criteria, or submit a new essay.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
