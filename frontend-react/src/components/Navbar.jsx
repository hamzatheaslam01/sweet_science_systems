import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fighterId = searchParams.get('id');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPathWithId = (path) => {
    return fighterId ? `${path}?id=${fighterId}` : path;
  };

  return (
    <nav>
      <Link to="/dashboard" className="nav-back">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </Link>
      
      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to={getPathWithId('/fighter-profile')} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>Fighter Profile</NavLink>
        <NavLink to={getPathWithId('/attendance')} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>Attendance</NavLink>
        <NavLink to={getPathWithId('/ai-coach')} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>AI Coach + Goals</NavLink>
        <NavLink to={getPathWithId('/performance')} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>Performance</NavLink>
        <NavLink to={getPathWithId('/report')} className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>Reports</NavLink>
        <button onClick={handleLogout} className="nav-pill" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>

      <Link to="/dashboard" className="nav-logo">
        Sweet <span>Science</span>
      </Link>
    </nav>
  );
}
