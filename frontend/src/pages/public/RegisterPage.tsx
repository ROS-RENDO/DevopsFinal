import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ArrowRight, Zap, Star, Users, BarChart3 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiRequest } from '../../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { response, data } = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) throw new Error(data?.message || data?.error || 'Registration failed');
      navigate('/login');
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
      setError('Google registration is not enabled in the current backend configuration.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px 14px 46px', border: '1.5px solid #e5e5e5',
    borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
    background: '#fafafa', color: '#111', fontFamily: 'inherit',
  };

  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fff'; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* ── Left: Form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', marginBottom: '3rem', textDecoration: 'none' }}>
            <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} /></div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em' }}>Servd</span>
          </Link>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: '8px', letterSpacing: '-0.03em' }}>Create an account</h1>
          <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>Get started with Servd today — it's free.</p>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fee2e2', fontSize: '0.9rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Registration Failed')}
              useOneTap
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
            <span style={{ fontSize: '0.85rem', color: '#bbb', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          </div>

          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                    style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Role</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusIn as any} onBlur={focusOut as any}>
                    <option value="customer">Customer</option>
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#333', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#bbb' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8}
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#bbb', marginBottom: '1.5rem' }}>Must be at least 8 characters.</p>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating…' : 'Create account'} <ArrowRight size={18} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#999', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600, color: '#111', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Visual ── */}
      <div style={{ flex: 1, display: 'none', background: '#111', position: 'relative', overflow: 'hidden', color: '#fff', padding: '4rem' }}
           className="auth-visual-responsive">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,17,17,0.8) 0%, #111 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: '440px' }}>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.08, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Start booking <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>in minutes.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Create your free account and instantly access hundreds of trusted service providers.
          </p>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '2.5rem' }}>
            {[
              { icon: <Users size={20} />, val: '10K+', label: 'Customers' },
              { icon: <Star size={20} />, val: '4.9', label: 'Average rating' },
              { icon: <BarChart3 size={20} />, val: '50K+', label: 'Bookings made' },
              { icon: <Zap size={20} />, val: '<60s', label: 'Avg. book time' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem' }}>
                <div style={{ opacity: 0.4, marginBottom: '10px' }}>{s.icon}</div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{s.val}</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
              "Servd made it incredibly easy to find a reliable cleaner. Booked in 30 seconds and the service was flawless."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>S</div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Sarah M.</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Verified customer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`.auth-visual-responsive { display: none !important; } @media (min-width: 768px) { .auth-visual-responsive { display: flex !important; } }`}</style>
    </div>
  );
}
