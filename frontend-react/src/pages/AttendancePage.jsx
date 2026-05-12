import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch, initials, avatarColors } from '../utils/api';
import './AttendancePage.css';

export default function AttendancePage() {
  const [fighters, setFighters] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchFighters();
  }, []);

  const fetchFighters = async () => {
    try {
      const data = await apiFetch('/fighters');
      setFighters(data);
      // Initialize all as present by default (matching original app behavior)
      const initial = {};
      data.forEach(f => initial[f.id] = true);
      setAttendance(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id, status) => {
    setAttendance({ ...attendance, [id]: status });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([fighter_id, status]) => ({
        fighter_id,
        status: status ? 'present' : 'absent',
        date: today
      }));

      await apiFetch('/attendance/batch', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="attendance-wrap">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span className="page-tag">Daily Roll Call</span>
            <h1 className="page-title">Attendance <span>Tracker</span></h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Session Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
          </div>
          <button className="btn btn-red" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </header>

        {loading ? (
          <p style={{ marginTop: '40px' }}>Loading roster...</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Fighter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fighters.map(f => {
                const [bg, fg] = avatarColors(f.name);
                const isPresent = attendance[f.id];
                return (
                  <tr key={f.id}>
                    <td>
                      <div className="att-fighter">
                        <div className="sb-avatar" style={{ background: bg, color: fg }}>{initials(f.name)}</div>
                        <span className="sb-name">{f.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-toggle">
                        <button 
                          className={`status-btn present ${isPresent ? 'active' : ''}`}
                          onClick={() => toggleStatus(f.id, true)}
                        >
                          Present
                        </button>
                        <button 
                          className={`status-btn absent ${!isPresent ? 'active' : ''}`}
                          onClick={() => toggleStatus(f.id, false)}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
