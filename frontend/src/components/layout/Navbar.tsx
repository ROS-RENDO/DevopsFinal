import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-0.04em', textDecoration: 'none' }}>
          <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={17} /></div>
          <span style={{ fontSize: '1.35rem' }}>Servd</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/customer" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>Find Services</Link>
          <Link to="/company" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>For Business</Link>
          <Link to="/worker" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 12px' }}>For Workers</Link>
          <Link to="/login" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)', marginLeft: '8px' }}>Log in</Link>
          <Link to="/register" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: '#111' }}>Sign up</Link>
        </div>
      </div>
    </nav>
  );
}
