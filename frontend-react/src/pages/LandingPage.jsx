import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-wrap">
      <nav className="landing-nav">
        <div className="nav-logo">Sweet <span>Science</span></div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-red">Enter Platform</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <span className="hero-tag">Professional MMA Performance Tracking</span>
          <h1 className="hero-title">Forge <span>Elite</span> Champions</h1>
          <p className="hero-desc">
            The data-driven operating system for modern MMA coaches. 
            Track progress, analyze readiness, and manage your entire roster with scientific precision.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-red">Get Started</Link>
            <a href="#features" className="btn btn-outline">Explore Features</a>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="feat-card">
          <div className="feat-icon">📊</div>
          <h3 className="feat-title">Performance Analytics</h3>
          <p className="feat-text">Visualize skill progression and readiness scores across your entire roster with automated charting.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon">🤖</div>
          <h3 className="feat-title">AI Coaching Intelligence</h3>
          <p className="feat-text">Get personalized training recommendations and risk assessments powered by advanced AI models.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon">📋</div>
          <h3 className="feat-title">Roster Management</h3>
          <p className="feat-text">Manage fighter profiles, track attendance, and set performance goals in one centralized dashboard.</p>
        </div>
      </section>

      <footer style={{ padding: '60px 48px', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--dark2)' }}>
        <div className="nav-logo" style={{ marginBottom: '20px' }}>Sweet <span>Science</span> Systems</div>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>© 2026 Sweet Science Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
