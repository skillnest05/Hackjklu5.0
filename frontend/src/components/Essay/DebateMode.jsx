import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROUND_LABELS = [
  "Round 1: Opening Challenge",
  "Round 2: Pressing Harder",
  "Round 3: Counter Attack",
  "Round 4: Final Assault",
  "Round 5: Last Stand",
  "Debate Complete",
];

function TypingIndicator() {
  return (
    <div className="debate-bubble debate-bubble-ai">
      <div className="typing-indicator">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ChatBubble({ msg, index }) {
  const isAI = msg.role === 'ai';
  return (
    <motion.div
      className={`debate-bubble ${isAI ? 'debate-bubble-ai' : 'debate-bubble-user'}`}
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      {isAI && (
        <div className="debate-ai-label">
          <span className="debate-ai-icon">⚔️</span> AI Opponent
        </div>
      )}
      <div
        className="debate-bubble-text"
        dangerouslySetInnerHTML={{
          __html: msg.message
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>')
        }}
      />
    </motion.div>
  );
}

export default function DebateMode({ essay }) {
  const [phase, setPhase] = useState('intro'); // intro | active | over
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roundNum, setRoundNum] = useState(0);
  const [debateMeta, setDebateMeta] = useState({ thesis: '', weak_claims: [] });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startDebate = async () => {
    setPhase('loading');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay_text: essay.essay_text,
          scores: essay.scores,
        }),
      });
      const data = await res.json();
      setDebateMeta({ thesis: data.thesis, weak_claims: data.weak_claims });
      setMessages([{ role: 'ai', message: data.message }]);
      setPhase('active');
    } catch (e) {
      console.error(e);
      setPhase('intro');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg = { role: 'user', message: inputValue.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/debate/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay_text: essay.essay_text,
          user_message: userMsg.message,
          conversation_history: newMessages,
          scores: essay.scores,
          weak_claims: debateMeta.weak_claims,
          thesis: debateMeta.thesis,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', message: data.message }]);
      setRoundNum(data.round + 1);
      if (data.debate_over) setPhase('over');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetDebate = () => {
    setPhase('intro');
    setMessages([]);
    setRoundNum(0);
    setInputValue('');
    setDebateMeta({ thesis: '', weak_claims: [] });
  };

  if (phase === 'intro') {
    return (
      <motion.div
        className="debate-intro"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="debate-intro-icon">⚔️</div>
        <h2 className="debate-intro-title">Debate Mode</h2>
        <p className="debate-intro-desc">
          Transform from passive student to active defender. The AI will read your essay,
          take the <strong>opposing side</strong>, and challenge your weakest arguments in
          real-time. Defend your thesis under pressure to truly master your topic.
        </p>
        <div className="debate-intro-rules">
          <div className="debate-rule"><span>🎯</span> 5 rounds of escalating challenges</div>
          <div className="debate-rule"><span>🧠</span> AI targets your actual weakest claims</div>
          <div className="debate-rule"><span>💬</span> Real-time argument evaluation</div>
          <div className="debate-rule"><span>🏆</span> Survive all rounds to win</div>
        </div>
        <button className="btn btn-primary debate-start-btn" onClick={startDebate}>
          ⚔️ Enter the Arena
        </button>
      </motion.div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="debate-loading">
        <div className="debate-loading-spinner" />
        <p>AI is studying your essay and preparing its attack…</p>
      </div>
    );
  }

  return (
    <motion.div
      className="debate-arena"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="debate-header">
        <div className="debate-round-badge">
          {phase === 'over' ? '🏆 Debate Complete' : (ROUND_LABELS[roundNum] || 'Debate')}
        </div>
        <div className="debate-progress">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`debate-progress-dot ${i < roundNum ? 'done' : i === roundNum ? 'active' : ''}`}
            />
          ))}
        </div>
        <button className="debate-reset-btn" onClick={resetDebate}>↺ Restart</button>
      </div>

      {/* Thesis display */}
      {debateMeta.thesis && (
        <div className="debate-thesis-bar">
          <span className="debate-thesis-label">Your Thesis:</span>
          <span className="debate-thesis-text">"{debateMeta.thesis}"</span>
        </div>
      )}

      {/* Chat Area */}
      <div className="debate-chat">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} index={i} />
          ))}
        </AnimatePresence>
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {phase === 'active' && (
        <div className="debate-input-area">
          <textarea
            className="debate-input"
            placeholder="Defend your position… (Press Enter to send, Shift+Enter for new line)"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={3}
          />
          <button
            className="debate-send-btn"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '…' : '⚔️ Defend'}
          </button>
        </div>
      )}

      {phase === 'over' && (
        <div className="debate-over-actions">
          <button className="btn btn-primary" onClick={resetDebate}>⚔️ Debate Again</button>
        </div>
      )}
    </motion.div>
  );
}
