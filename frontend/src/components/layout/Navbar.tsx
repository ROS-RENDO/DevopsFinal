import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Important: In a real app, you would also want to call your backend logout endpoint
    // to clear the httpOnly cookies. But clearing localStorage is enough for the frontend UI update.
    navigate('/login');
    // Refresh the page to clear any residual state/cookies if needed
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.04em', textDecoration: 'none' }}>
          <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={17} /></div>
          <span style={{ fontSize: '1.35rem' }}>Servd</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              {user.role === 'admin' && <Link to="/admin" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>Dashboard</Link>}
              {user.role === 'worker' && <Link to="/worker" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>Worker Portal</Link>}
              {user.role === 'customer' && <Link to="/customer" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>Find Services</Link>}
              
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#ef4444', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', border: '1.5px solid rgba(239, 68, 68, 0.2)', background: '#fff', marginLeft: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>Find Services</Link>
              <Link to="/worker" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>For Workers</Link>
              <Link to="/login" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)', marginLeft: '8px' }}>Log in</Link>
              <Link to="/register" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: '#111' }}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
