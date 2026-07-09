import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function MFAPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (i: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return; // numbers only
    
    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);

    // Auto-advance
    if (val && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const location = useLocation();
  const state = location.state as { tempToken?: string; email?: string } || {};

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/mfa/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: state.tempToken, token: fullCode }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      // Store final token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to correct dashboard based on role
      switch (data.user.role) {
        case 'customer': navigate('/customer'); break;
        case 'company': navigate('/company'); break;
        case 'worker': navigate('/worker'); break;
        case 'admin': navigate('/admin'); break;
        default: navigate('/customer');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/mfa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: state.tempToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      
      // Update state if tempToken changed
      if (data.tempToken) {
        navigate(location.pathname, { replace: true, state: { ...state, tempToken: data.tempToken } });
      }
      setError('');
      alert('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif" }}>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', marginBottom: '3rem', textDecoration: 'none' }}>
            <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} /></div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em' }}>Servd</span>
          </Link>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', marginBottom: '8px', letterSpacing: '-0.03em' }}>Verify your account</h1>
          <p style={{ color: '#888', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.5 }}>
            We've sent a 6-digit code to {state.email ? <strong>{state.email}</strong> : 'your email'}. Enter it below to secure your account.
          </p>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #fee2e2', fontSize: '0.9rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={verify}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2.5rem', justifyContent: 'space-between' }}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  style={{
                    width: '54px', height: '64px', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center',
                    border: '1.5px solid #e5e5e5', borderRadius: '12px', background: '#fafafa', outline: 'none',
                    transition: 'all 0.2s', color: '#111'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fafafa'; }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading || code.join('').length !== 6}
              style={{ width: '100%', padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: (loading || code.join('').length !== 6) ? 0.6 : 1 }}>
              {loading ? 'Verifying…' : 'Verify & Continue'} <ArrowRight size={18} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#999', fontSize: '0.95rem' }}>
            Didn't receive the code? <button type="button" onClick={resendCode} style={{ background: 'none', border: 'none', fontWeight: 600, color: '#111', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>Resend code</button>
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'none', background: '#111', position: 'relative', overflow: 'hidden', color: '#fff', padding: '4rem' }} className="auth-visual-responsive">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1614064641913-a53b34df4f54?w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(17,17,17,0.8) 0%, #111 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', maxWidth: '440px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ShieldCheck size={28} />
          </div>
          
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.08, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Enterprise-grade <br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>security.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            We take your privacy seriously. Two-factor authentication keeps your Servd account strictly in your hands.
          </p>
        </div>
      </div>

      <style>{`.auth-visual-responsive { display: none !important; } @media (min-width: 768px) { .auth-visual-responsive { display: flex !important; } }`}</style>
    </div>
  );
}
