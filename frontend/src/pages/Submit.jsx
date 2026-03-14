import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUpload, HiOutlinePencilAlt, HiOutlineSparkles } from 'react-icons/hi';
import LoadingSpinner from '../components/Common/LoadingSpinner';
// no mock data
import './Pages.css';

export default function Submit() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [essayText, setEssayText] = useState('');
  const [title, setTitle] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStage, setEvaluationStage] = useState('');

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const charCount = essayText.length;
  const sentenceCount = essayText.split(/[.!?]+/).filter(s => s.trim()).length;

  const stages = [
    'Analyzing text structure...',
    'Evaluating coherence & flow...',
    'Assessing argument strength...',
    'Checking factual accuracy...',
    'Detecting potential plagiarism...',
    'Measuring originality...',
    'Analyzing writing quality...',
    'Generating detailed feedback...',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!essayText.trim()) return;

    setIsEvaluating(true);
    setEvaluationStage(stages[0]);

    // Animate stages
    let stageInterval = setInterval(() => {
      setEvaluationStage(prev => {
        const currentIndex = stages.indexOf(prev);
        if (currentIndex < stages.length - 1) {
          return stages[currentIndex + 1];
        }
        return prev;
      });
    }, 1000);

    try {
      const response = await fetch('http://localhost:8000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          prompt: prompt,
          essay_text: essayText
        })
      });

      if (!response.ok) {
        throw new Error('Evaluation failed');
      }

      const data = await response.json();
      
      // Convert backend snake_case to frontend camelCase
      const formattedResult = {
        ...data,
        scores: Object.fromEntries(
          Object.entries(data.scores).map(([k, v]) => [
            k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v
          ])
        ),
        feedback: Object.fromEntries(
          Object.entries(data.feedback).map(([k, v]) => [
            k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), v
          ])
        ),
        overallScore: data.overall_score,
        wordCount: data.word_count,
        readingTime: data.reading_time,
        submittedAt: data.submitted_at
      };

      clearInterval(stageInterval);
      setEvaluationStage(stages[stages.length - 1]);

      setTimeout(() => {
        navigate('/results', { state: { essay: formattedResult } });
      }, 500);
    } catch (error) {
      clearInterval(stageInterval);
      console.error("Evaluation error:", error);
      setIsEvaluating(false);
      alert("Failed to evaluate. Ensure backend is running.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Essay</h1>
          <p className="page-subtitle">Submit an essay for AI-powered multi-aspect semantic analysis</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEvaluating ? (
          <motion.div
            key="evaluating"
            className="evaluation-overlay glass gradient-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="evaluation-content">
              <div className="evaluation-brain">
                <div className="brain-pulse" />
                <HiOutlineSparkles className="brain-icon" />
              </div>
              <h2 className="evaluation-title gradient-text">AI Analysis in Progress</h2>
              <LoadingSpinner size={50} text="" />
              <motion.p
                key={evaluationStage}
                className="evaluation-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {evaluationStage}
              </motion.p>
              <div className="evaluation-progress-track">
                <motion.div
                  className="evaluation-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: stages.length * 0.8, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="essay-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="submit-grid">
              <div className="submit-main">
                <div className="essay-form-group">
                  <label className="essay-form-label">Essay Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Enter a descriptive title for your essay..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="essay-form-group">
                  <label className="essay-form-label">Essay Prompt / Question</label>
                  <textarea
                    className="input"
                    placeholder="Enter the essay prompt or question the student was asked to respond to..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="essay-form-group">
                  <label className="essay-form-label">
                    <HiOutlinePencilAlt style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Essay Content
                  </label>
                  <span className="essay-form-sublabel">
                    Paste or type the full essay text below for analysis
                  </span>
                  <textarea
                    className="input essay-textarea"
                    placeholder="Paste the essay text here...

The AI will analyze the essay across five dimensions:
• Coherence & Logical Flow
• Argument Strength & Evidence
• Factual Correctness
• Originality & Creative Expression
• Writing Quality & Grammar"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                  />
                </div>
              </div>

              <div className="submit-sidebar">
                <div className="submit-info-card glass">
                  <h4 className="submit-info-title">📊 Essay Statistics</h4>
                  <div className="submit-stats-list">
                    <div className="submit-stat-row">
                      <span>Words</span>
                      <span className="submit-stat-value">{wordCount.toLocaleString()}</span>
                    </div>
                    <div className="submit-stat-row">
                      <span>Characters</span>
                      <span className="submit-stat-value">{charCount.toLocaleString()}</span>
                    </div>
                    <div className="submit-stat-row">
                      <span>Sentences</span>
                      <span className="submit-stat-value">{sentenceCount}</span>
                    </div>
                    <div className="submit-stat-row">
                      <span>Reading Time</span>
                      <span className="submit-stat-value">{Math.max(1, Math.round(wordCount / 200))} min</span>
                    </div>
                  </div>
                </div>

                <div className="submit-info-card glass">
                  <h4 className="submit-info-title">🔍 Analysis Includes</h4>
                  <ul className="submit-features-list">
                    <li>Coherence & Logical Flow</li>
                    <li>Argument Strength</li>
                    <li>Factual Accuracy Check</li>
                    <li>Originality Assessment</li>
                    <li>Writing Quality Analysis</li>
                    <li>Hallucination Detection</li>
                    <li>Bias Detection</li>
                    <li>Plagiarism Scanning</li>
                  </ul>
                </div>

                <div className="submit-info-card glass">
                  <h4 className="submit-info-title">⚡ Quick Upload</h4>
                  <div className="file-upload-zone">
                    <HiOutlineUpload className="upload-icon" />
                    <p>Drag & drop a file</p>
                    <span>or click to browse</span>
                    <span className="upload-formats">.txt, .doc, .pdf</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="essay-form-footer">
              <div className="essay-form-stats">
                <span className="essay-form-stat">
                  Min. recommended: <span>500 words</span>
                </span>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={wordCount < 10}
              >
                <HiOutlineSparkles />
                Evaluate Essay
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
