import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch, initials, toneForScore, avatarColors } from '../utils/api';
import './FighterProfilePage.css';

export default function FighterProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fighterId = searchParams.get('id');
  
  const [fighters, setFighters] = useState([]);
  const [activeFighter, setActiveFighter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fighters.length) {
      const selected = fighters.find(f => String(f.id) === fighterId) || fighters[0];
      setActiveFighter(selected);
      if (!fighterId) setSearchParams({ id: selected.id });
    }
  }, [fighterId, fighters]);

  const fetchData = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/fighters/${activeFighter.id}`, {
        method: 'PUT',
        body: JSON.stringify(activeFighter),
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveFighter({ ...activeFighter, [name]: value });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container">
      <Navbar />
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <span className="page-tag">Roster</span>
          <h2 className="bebas">Select Fighter</h2>
          <div className="sidebar-list">
            {fighters.map(f => {
              const [bg, fg] = avatarColors(f.name);
              return (
                <div 
                  key={f.id} 
                  className={`sb-item ${activeFighter?.id === f.id ? 'active' : ''}`}
                  onClick={() => setSearchParams({ id: f.id })}
                >
                  <div className="sb-avatar" style={{ background: bg, color: fg }}>{initials(f.name)}</div>
                  <div>
                    <div className="sb-name">{f.name}</div>
                    <div className="sb-meta">{f.weight_class}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="profile-main">
          {activeFighter && (
            <>
              <header style={{ marginBottom: '40px' }}>
                <span className="page-tag">Profile Details</span>
                <h1 className="page-title">{activeFighter.name.split(' ')[0]} <span>{activeFighter.name.split(' ').slice(1).join(' ')}</span></h1>
              </header>

              <div className="profile-grid">
                <section className="p-card">
                  <h3 className="p-card-title">Skill Assessment</h3>
                  <div className="skill-row">
                    <div className="skill-info">
                      <span className="skill-label">Cardio Base</span>
                      <span className="skill-val">{activeFighter.cardio}/10</span>
                    </div>
                    <div className="skill-bar-wrap">
                      <div className="skill-bar-fill" style={{ width: `${activeFighter.cardio * 10}%`, background: 'var(--green)' }}></div>
                    </div>
                  </div>
                  <div className="skill-row">
                    <div className="skill-info">
                      <span className="skill-label">Striking Technique</span>
                      <span className="skill-val">{activeFighter.striking}/10</span>
                    </div>
                    <div className="skill-bar-wrap">
                      <div className="skill-bar-fill" style={{ width: `${activeFighter.striking * 10}%`, background: 'var(--red)' }}></div>
                    </div>
                  </div>
                  <div className="skill-row">
                    <div className="skill-info">
                      <span className="skill-label">Grappling Capacity</span>
                      <span className="skill-val">{activeFighter.grappling}/10</span>
                    </div>
                    <div className="skill-bar-wrap">
                      <div className="skill-bar-fill" style={{ width: `${activeFighter.grappling * 10}%`, background: 'var(--gold)' }}></div>
                    </div>
                  </div>
                </section>

                <section className="p-card">
                  <h3 className="p-card-title">Update Information</h3>
                  <form onSubmit={handleUpdate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Weight (lbs)</label>
                        <input className="form-input" name="weight_lbs" type="number" value={activeFighter.weight_lbs || ''} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Training Freq (/wk)</label>
                        <input className="form-input" name="training_frequency" type="number" value={activeFighter.training_frequency || ''} onChange={handleChange} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                      <div className="form-group">
                        <label className="form-label">Cardio</label>
                        <select className="form-input" name="cardio" value={activeFighter.cardio} onChange={handleChange}>
                          {[...Array(11).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Striking</label>
                        <select className="form-input" name="striking" value={activeFighter.striking} onChange={handleChange}>
                          {[...Array(11).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Grappling</label>
                        <select className="form-input" name="grappling" value={activeFighter.grappling} onChange={handleChange}>
                          {[...Array(11).keys()].map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-red" style={{ width: '100%' }} disabled={saving}>
                      {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                  </form>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
