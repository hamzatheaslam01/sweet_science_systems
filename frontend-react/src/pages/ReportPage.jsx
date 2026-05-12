import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiFetch, getCoach, initials, toneForScore, avatarColors } from '../utils/api';
import './ReportPage.css';

export default function ReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fighterId = searchParams.get('id');
  const coach = getCoach();

  const [fighters, setFighters] = useState([]);
  const [activeFighter, setActiveFighter] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
      fetchReports();
    }
  }, [activeFighter]);

  const fetchFighters = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchReports = async () => {
    try {
      const data = await apiFetch(`/reports/${activeFighter.id}`);
      setReports(data);
      if (data.length) setActiveReport(data[0]);
      else setActiveReport(null);
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiFetch('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ fighter_id: activeFighter.id }),
      });
      setReports([res, ...reports]);
      setActiveReport(res);
    } catch (err) { alert(err.message); }
    finally { setGenerating(false); }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="report-layout">
        <aside className="report-sidebar">
          <div>
            <span className="page-tag">Generation</span>
            <h2 className="bebas" style={{ fontSize: '20px', marginBottom: '16px' }}>Select Fighter</h2>
            <div className="fighter-selector">
              {fighters.map(f => (
                <div 
                  key={f.id} 
                  className={`fs-btn ${activeFighter?.id === f.id ? 'active' : ''}`}
                  onClick={() => setSearchParams({ id: f.id })}
                >
                  <div className="sb-avatar" style={{ background: avatarColors(f.name)[0], color: avatarColors(f.name)[1] }}>{initials(f.name)}</div>
                  <div>
                    <div className="sb-name">{f.name}</div>
                    <div className="sb-meta">{f.weight_class}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-red" style={{ width: '100%', marginTop: '20px' }} onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate New Report'}
            </button>
          </div>

          <div>
            <span className="page-tag">History</span>
            <div className="report-list" style={{ marginTop: '16px' }}>
              {reports.map(r => (
                <div 
                  key={r._id || r.id} 
                  className={`report-item ${(activeReport?._id || activeReport?.id) === (r._id || r.id) ? 'active' : ''}`}
                  onClick={() => setActiveReport(r)}
                >
                  <div className="report-date">{new Date(r.created_at).toLocaleDateString()}</div>
                  <div className="report-fname">{activeFighter?.name}</div>
                  <div className="report-meta">Readiness: {activeFighter?.readiness_score}</div>
                </div>
              ))}
              {reports.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '12px' }}>No reports found.</p>}
            </div>
          </div>
        </aside>

        <main className="report-main">
          {activeReport ? (
            <div className="report-doc">
              <div className="report-doc-header">
                <div className="report-id">Report #{ (activeReport._id || activeReport.id || '').toString().slice(-4).toUpperCase() } · {new Date(activeReport.created_at).toLocaleDateString()}</div>
                <h1 className="report-doc-title">{activeFighter?.name}</h1>
                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--muted)' }}>
                  <span>Weight: <strong>{activeFighter?.weight_lbs} lbs</strong></span>
                  <span>Coach: <strong>{coach.name}</strong></span>
                  <span>Gym: <strong>{coach.gym_name || coach.gym}</strong></span>
                </div>
              </div>

              <div className="report-doc-body">
                <div className="score-trio">
                  <div className="score-box">
                    <div className="score-num" style={{ color: toneForScore(activeFighter?.readiness_score) }}>{activeFighter?.readiness_score}</div>
                    <div className="score-lbl">Readiness</div>
                  </div>
                  <div className="score-box">
                    <div className="score-num" style={{ color: toneForScore(activeFighter?.discipline_score) }}>{activeFighter?.discipline_score}</div>
                    <div className="score-lbl">Discipline</div>
                  </div>
                  <div className="score-box">
                    <div className="score-num" style={{ color: '#fff' }}>{((activeFighter?.cardio + activeFighter?.striking + activeFighter?.grappling) / 3).toFixed(1)}</div>
                    <div className="score-lbl">Avg Skill</div>
                  </div>
                </div>

                <div className="r-section">
                  <h3 className="r-section-title">AI-Generated Summary</h3>
                  <div className="ai-summary-box">
                    <p className="ai-summary-text">{activeReport.ai_summary || activeReport.report_text}</p>
                  </div>
                </div>

                <div className="r-section">
                  <h3 className="r-section-title">Skill Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {['cardio', 'striking', 'grappling'].map(skill => (
                      <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ width: '100px', fontSize: '13px', textTransform: 'capitalize' }}>{skill}</span>
                        <div className="skill-bar-wrap" style={{ flex: 1 }}>
                          <div className="skill-bar-fill" style={{ width: `${activeFighter?.[skill] * 10}%`, background: skill === 'striking' ? 'var(--red)' : 'var(--green)' }}></div>
                        </div>
                        <span style={{ fontSize: '13px' }}>{activeFighter?.[skill]}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h2 className="bebas" style={{ color: 'var(--muted)' }}>Select or Generate a Report</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
