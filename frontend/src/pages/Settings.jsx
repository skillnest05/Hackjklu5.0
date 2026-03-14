import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSave, HiOutlineRefresh } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Pages.css';

export default function Settings() {
  const [weights, setWeights] = useState({
    coherence: 20,
    argumentStrength: 25,
    factualCorrectness: 25,
    originality: 15,
    writingQuality: 15,
  });

  const [apiSettings, setApiSettings] = useState({
    endpoint: 'http://localhost:8000',
    timeout: 30,
    maxWords: 5000,
    language: 'en',
  });

  const [detectionSettings, setDetectionSettings] = useState({
    plagiarismEnabled: true,
    hallucinationEnabled: true,
    biasEnabled: true,
    plagiarismThreshold: 70,
    minEssayLength: 100,
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      toast.error('Scoring weights must sum to 100%');
      return;
    }
    toast.success('Settings saved successfully!');
  };

  const dimensionLabels = {
    coherence: 'Coherence & Flow',
    argumentStrength: 'Argument Strength',
    factualCorrectness: 'Factual Correctness',
    originality: 'Originality',
    writingQuality: 'Writing Quality',
  };

  const dimensionColors = {
    coherence: '#6c63ff',
    argumentStrength: '#00d4ff',
    factualCorrectness: '#00e5a0',
    originality: '#a855f7',
    writingQuality: '#ffb347',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure scoring weights, API connection, and detection features</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            <HiOutlineRefresh /> Reset
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <HiOutlineSave /> Save Changes
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Scoring Weights */}
        <motion.div
          className="settings-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="settings-card-title">⚖️ Scoring Weights</h3>
          <p className="settings-card-desc">Adjust how much each dimension contributes to the overall score.</p>

          <div className="weight-total" style={{ 
            color: totalWeight === 100 ? 'var(--accent-success)' : 'var(--accent-danger)' 
          }}>
            Total: {totalWeight}% {totalWeight === 100 ? '✓' : '(must equal 100%)'}
          </div>

          <div className="weights-list">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="weight-item">
                <div className="weight-item-header">
                  <div className="weight-color-dot" style={{ background: dimensionColors[key] }} />
                  <label>{dimensionLabels[key]}</label>
                  <span className="weight-value">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={value}
                  onChange={(e) => handleWeightChange(key, e.target.value)}
                  className="weight-slider"
                  style={{ 
                    '--slider-color': dimensionColors[key],
                    '--slider-progress': `${(value / 50) * 100}%`
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detection Settings */}
        <motion.div
          className="settings-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="settings-card-title">🔍 Detection Features</h3>
          <p className="settings-card-desc">Enable or disable essay integrity checks.</p>

          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Plagiarism Detection</span>
                <span className="toggle-desc">Detect paraphrased content from known sources</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={detectionSettings.plagiarismEnabled}
                  onChange={(e) => setDetectionSettings(prev => ({ 
                    ...prev, plagiarismEnabled: e.target.checked 
                  }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Hallucination Detection</span>
                <span className="toggle-desc">Identify fabricated facts and references</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={detectionSettings.hallucinationEnabled}
                  onChange={(e) => setDetectionSettings(prev => ({ 
                    ...prev, hallucinationEnabled: e.target.checked 
                  }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-label">Bias Detection</span>
                <span className="toggle-desc">Flag unbalanced or biased arguments</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={detectionSettings.biasEnabled}
                  onChange={(e) => setDetectionSettings(prev => ({ 
                    ...prev, biasEnabled: e.target.checked 
                  }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-field">
            <label className="settings-field-label">Plagiarism Threshold (%)</label>
            <input
              type="number"
              className="input"
              value={detectionSettings.plagiarismThreshold}
              onChange={(e) => setDetectionSettings(prev => ({ 
                ...prev, plagiarismThreshold: parseInt(e.target.value) || 0 
              }))}
              min="0"
              max="100"
            />
          </div>

          <div className="settings-field">
            <label className="settings-field-label">Minimum Essay Length (words)</label>
            <input
              type="number"
              className="input"
              value={detectionSettings.minEssayLength}
              onChange={(e) => setDetectionSettings(prev => ({ 
                ...prev, minEssayLength: parseInt(e.target.value) || 0 
              }))}
            />
          </div>
        </motion.div>

        {/* API Settings */}
        <motion.div
          className="settings-card glass gradient-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="settings-card-title">⚙️ API Configuration</h3>
          <p className="settings-card-desc">Configure the connection to the evaluation backend.</p>

          <div className="settings-field">
            <label className="settings-field-label">API Endpoint</label>
            <input
              type="text"
              className="input"
              value={apiSettings.endpoint}
              onChange={(e) => setApiSettings(prev => ({ ...prev, endpoint: e.target.value }))}
            />
          </div>

          <div className="settings-field">
            <label className="settings-field-label">Request Timeout (seconds)</label>
            <input
              type="number"
              className="input"
              value={apiSettings.timeout}
              onChange={(e) => setApiSettings(prev => ({ 
                ...prev, timeout: parseInt(e.target.value) || 30 
              }))}
            />
          </div>

          <div className="settings-field">
            <label className="settings-field-label">Maximum Word Count</label>
            <input
              type="number"
              className="input"
              value={apiSettings.maxWords}
              onChange={(e) => setApiSettings(prev => ({ 
                ...prev, maxWords: parseInt(e.target.value) || 5000 
              }))}
            />
          </div>

          <div className="settings-field">
            <label className="settings-field-label">Language</label>
            <select
              className="input"
              value={apiSettings.language}
              onChange={(e) => setApiSettings(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
