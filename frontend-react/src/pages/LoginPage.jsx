import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, saveAuth } from '../utils/api';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('sss_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', gym: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.token) {
        saveAuth(res.token, res.coach);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Sweet <span>Science</span></div>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>MMA Performance Systems</p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</div>
          <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</div>
        </div>

        <div className="auth-body">
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="name" type="text" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gym Name</label>
                  <input className="form-input" name="gym" type="text" value={formData.gym} onChange={handleChange} required />
                </div>
              </>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-red" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
