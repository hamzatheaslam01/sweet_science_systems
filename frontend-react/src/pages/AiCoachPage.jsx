import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch, initials, toneForScore, avatarColors } from '../utils/api';
import './AiCoachPage.css';

export default function AiCoachPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fighterId = searchParams.get('id');

  const [fighters, setFighters] = useState([]);
  const [activeFighter, setActiveFighter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [goals, setGoals] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: 'skill', current_value: 0, target_value: 5, deadline: '', description: '' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchFighters();
  }, []);

  useEffect(() => {
    if (fighters.length) {
      const selected = fighters.find(f => String(f.id) === fighterId) || fighters[0];
      setActiveFighter(selected);
      if (!fighterId) setSearchParams({ id: selected.id });
    }
  }, [fighterId, fighters]);

  useEffect(() => {
    if (activeFighter) {
      fetchGoals();
      setMessages([{ role: 'ai', text: `Analysis complete for ${activeFighter.name}. I'm ready for your coaching questions.` }]);
    }
  }, [activeFighter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchFighters = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchGoals = async () => {
    try {
      const data = await apiFetch(`/goals/${activeFighter.id}`);
      setGoals(data);
    } catch (err) { console.error(err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || aiLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await apiFetch('/ai/coach-feedback', {
        method: 'POST',
        body: JSON.stringify({ fighter_id: activeFighter.id, question: userMsg }),
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.summary || 'I analyzed the data but couldn\'t generate a summary.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({ ...newGoal, fighter_id: activeFighter.id }),
      });
      fetchGoals();
      setNewGoal({ type: 'skill', current_value: 0, target_value: 5, deadline: '', description: '' });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="ai-coach-layout">
        <div className="ai-left-col">
          <span className="page-tag">Feature — AI Coach + Goal Intelligence</span>
          <h1 className="page-title">Coach <span>Assistant</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>
            AI-powered analysis meets structured goal tracking — {activeFighter?.name}
          </p>

          <div className="ai-panel">
            <div className="ai-panel-header">
              <div className="ai-dot-pulse"></div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>AI Coach Assistant</div>
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--muted)' }}>Powered by Advanced AI</div>
            </div>
            <div className="ai-messages">
              {messages.map((m, i) => (
                <div key={i} className={`ai-msg ${m.role === 'user' ? 'user' : ''}`}>
                  <div className={`msg-avatar ${m.role === 'user' ? 'coach' : 'ai'}`}>
                    {m.role === 'user' ? 'CO' : 'AI'}
                  </div>
                  <div className={`msg-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && <div className="ai-msg"><div className="msg-avatar ai">AI</div><div className="msg-bubble ai">Thinking...</div></div>}
              <div ref={messagesEndRef} />
            </div>
            <form className="ai-input-row" onSubmit={handleSendMessage}>
              <input 
                className="form-input" 
                placeholder={`Ask the AI coach anything about ${activeFighter?.name}...`} 
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-red" disabled={aiLoading}>Send</button>
            </form>
          </div>

          <div className="goals-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="bebas" style={{ fontSize: '20px' }}>Active Goals</h3>
            </div>

            {goals.map(goal => (
              <div key={goal.id} className="goal-card">
                <div className="goal-progress-bar" style={{ width: `${goal.progress_pct}%`, background: goal.status === 'achieved' ? 'var(--green)' : 'var(--gold)' }}></div>
                <div className="goal-top">
                  <div>
                    <div className="goal-name">{goal.description || `${goal.type} goal`}</div>
                    <div className="goal-fighter-tag">{goal.type} goal {goal.deadline ? `· Due ${goal.deadline}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="bebas" style={{ fontSize: '32px', color: goal.status === 'achieved' ? 'var(--green)' : 'var(--gold)' }}>{goal.progress_pct}%</span>
                    <span className={`goal-status ${goal.status === 'achieved' ? 'status-achieved' : 'status-on'}`}>{goal.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {goals.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '13px' }}>No active goals for this fighter.</p>}
          </div>
        </div>

        <div className="ai-right-col">
          <div>
            <div className="page-tag" style={{ fontSize: '10px', marginBottom: '12px' }}>Fighter Select</div>
            <div className="fighter-selector">
              {fighters.map(f => (
                <div 
                  key={f.id} 
                  className={`fs-btn ${activeFighter?.id === f.id ? 'active' : ''}`}
                  onClick={() => setSearchParams({ id: f.id })}
                >
                  <div className="sb-avatar" style={{ background: avatarColors(f.name)[0], color: avatarColors(f.name)[1] }}>{initials(f.name)}</div>
                  <div>
                    <div className="sb-name" style={{ fontSize: '13px' }}>{f.name}</div>
                    <div className="sb-meta" style={{ fontSize: '11px' }}>{f.weight_class}</div>
                  </div>
                  <div className="bebas" style={{ marginLeft: 'auto', fontSize: '18px', color: toneForScore(f.readiness_score) }}>{f.readiness_score}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--dark3)', padding: '20px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <div className="page-tag" style={{ fontSize: '10px', marginBottom: '12px' }}>Add New Goal</div>
            <form onSubmit={handleAddGoal}>
              <div className="form-group">
                <label className="form-label">Goal Type</label>
                <select className="form-input" value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value})}>
                  <option value="skill">Skill improvement</option>
                  <option value="weight">Weight goal</option>
                  <option value="consistency">Consistency goal</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Current</label>
                  <input className="form-input" type="number" value={newGoal.current_value} onChange={e => setNewGoal({...newGoal, current_value: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target</label>
                  <input className="form-input" type="number" value={newGoal.target_value} onChange={e => setNewGoal({...newGoal, target_value: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-red" style={{ width: '100%' }}>Create Goal</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
