import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Zap, Shield, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { response, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(data?.message || data?.error || 'Login failed');

      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));

      if (redirect === 'booking') {
        navigate('/');
      } else {
        switch (data.data.role) {
          case 'customer': navigate('/'); break;
          case 'worker': navigate('/worker'); break;
          case 'admin': navigate('/admin'); break;
          default: navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      void credentialResponse;
      setError('Google login is not enabled in the current backend configuration.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px 14px 46px', border: '1.5px solid #e5e5e5',
    borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
    background: '#fafafa', color: '#111', fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ── Left: Form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', marginBottom: '3rem', textDecoration: 'none' }}>
            <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} /></div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em' }}>Servd</span>
          </Link>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: '8px', letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>Sign in to your account to continue.</p>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fee2e2', fontSize: '0.9rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Social */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
            <span style={{ fontSize: '0.85rem', color: '#bbb', fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#333' }}>Password</label>
                <a href="#" style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500, textDecoration: 'none' }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={18} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#999', fontSize: '0.95rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: '#111', textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Visual ── */}
      <div style={{ flex: 1, display: 'none', background: '#111', position: 'relative', overflow: 'hidden', color: '#fff', padding: '4rem' }}
           className="auth-visual-responsive">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(17,17,17,0.3) 0%, #111 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: '440px' }}>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.08, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Your home services, <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>simplified.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Join thousands of homeowners using Servd to book vetted professionals with confidence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: <Shield size={20} />, t: 'Verified Professionals', d: 'Every provider is background-checked.' },
              { icon: <CheckCircle size={20} />, t: 'Satisfaction Guaranteed', d: 'Full refund if not satisfied.' },
              { icon: <Zap size={20} />, t: 'Instant Booking', d: 'Confirmed within minutes, not days.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>{f.icon}</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '3px' }}>{f.t}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width: '38px', height: '38px', borderRadius: '50%', background: `hsl(${i*70}, 15%, ${30 + i*8}%)`, border: '2px solid #111', marginLeft: i > 1 ? '-10px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {String.fromCharCode(64+i)}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>10,000+</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>happy customers</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`.auth-visual-responsive { display: none !important; } @media (min-width: 768px) { .auth-visual-responsive { display: flex !important; } }`}</style>
    </div>
  );
}
