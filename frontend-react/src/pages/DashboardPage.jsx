import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch, getCoach, initials, toneForScore, avatarColors } from '../utils/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const coach = getCoach();
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFighter, setNewFighter] = useState({ name: '', weight_class: 'Welterweight', weight_lbs: '' });

  useEffect(() => {
    fetchFighters();
  }, []);

  const fetchFighters = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFighter = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/fighters', {
        method: 'POST',
        body: JSON.stringify(newFighter),
      });
      setShowModal(false);
      setNewFighter({ name: '', weight_class: 'Welterweight', weight_lbs: '' });
      fetchFighters();
    } catch (err) {
      alert(err.message);
    }
  };

  const stats = {
    total: fighters.length,
    active: fighters.filter(f => f.readiness_score >= 70).length,
    avgReadiness: fighters.length ? Math.round(fighters.reduce((acc, f) => acc + (f.readiness_score || 0), 0) / fighters.length) : 0,
    attendance: fighters.length ? Math.round(fighters.reduce((acc, f) => acc + (f.attendance_pct || 0), 0) / fighters.length) : 0,
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <div className="dashboard-wrap">
        <header style={{ marginBottom: '32px' }}>
          <span className="page-tag">Roster Overview — {coach.gym || 'Elite Gym'}</span>
          <h1 className="page-title">Performance <span>Dashboard</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Welcome back, Coach {coach.name || 'User'}</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Roster</div>
            <div className="stat-value">{stats.total}<span>Fighters</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fight Ready</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.active}<span>Active</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Readiness</div>
            <div className="stat-value" style={{ color: toneForScore(stats.avgReadiness) }}>{stats.avgReadiness}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Gym Attendance</div>
            <div className="stat-value">{stats.attendance}%</div>
          </div>
        </section>

        <div className="section-header">
          <h2 className="bebas" style={{ fontSize: '24px' }}>Active Roster</h2>
          <button className="btn btn-red" onClick={() => setShowModal(true)}>+ Add Fighter</button>
        </div>

        {loading ? (
          <p>Loading roster...</p>
        ) : (
          <div className="roster-grid">
            {fighters.map(fighter => {
              const [bg, fg] = avatarColors(fighter.name);
              return (
                <div key={fighter.id} className="fighter-card" onClick={() => navigate(`/fighter-profile?id=${fighter.id}`)}>
                  <div className="f-top">
                    <div className="f-avatar" style={{ background: bg, color: fg }}>{initials(fighter.name)}</div>
                    <div className="f-info">
                      <h3>{fighter.name}</h3>
                      <p>{fighter.weight_class} · {fighter.weight_lbs} lbs</p>
                    </div>
                  </div>
                  <div className="f-stats">
                    <div className="f-stat-item">
                      <span className="f-stat-val" style={{ color: toneForScore(fighter.readiness_score) }}>{fighter.readiness_score || 0}</span>
                      <span className="f-stat-lbl">Readiness</span>
                    </div>
                    <div className="f-stat-item">
                      <span className="f-stat-val">{fighter.discipline_score || 0}</span>
                      <span className="f-stat-lbl">Discipline</span>
                    </div>
                    <div className="f-stat-item">
                      <span className="f-stat-val">{fighter.attendance_pct || 0}%</span>
                      <span className="f-stat-lbl">Attendance</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="bebas">Add New Fighter</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleAddFighter}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={newFighter.name} onChange={e => setNewFighter({...newFighter, name: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Weight Class</label>
                    <select className="form-input" value={newFighter.weight_class} onChange={e => setNewFighter({...newFighter, weight_class: e.target.value})}>
                      <option>Flyweight</option>
                      <option>Bantamweight</option>
                      <option>Featherweight</option>
                      <option>Lightweight</option>
                      <option>Welterweight</option>
                      <option>Middleweight</option>
                      <option>Light Heavyweight</option>
                      <option>Heavyweight</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (lbs)</label>
                    <input className="form-input" type="number" value={newFighter.weight_lbs} onChange={e => setNewFighter({...newFighter, weight_lbs: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-red">Save Fighter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
