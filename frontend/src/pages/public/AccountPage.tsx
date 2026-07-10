import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ShieldCheck, ShieldOff, ArrowLeft, LogOut } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function AccountPage() {
  const navigate = useNavigate();
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const { response, data } = await apiRequest('/mfa/status');
      if (!response.ok) throw new Error('Failed to fetch MFA status');
      setMfaEnabled(data.data.mfaEnabled);
    } catch {
      setMessage({ text: 'Could not load MFA status.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMfa = async () => {
    setToggling(true);
    setMessage(null);
    try {
      const endpoint = mfaEnabled ? '/mfa/disable' : '/mfa/enable';
      const { response, data } = await apiRequest(endpoint, { method: 'POST' });
      if (!response.ok) throw new Error(data?.message || 'Failed to update MFA');
      setMfaEnabled(!mfaEnabled);
      setMessage({ text: data.message, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#111' }}>
          <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} />
          </div>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.04em' }}>Servd</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: '#888' }}>{user.email}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'none', border: '1.5px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', color: '#666', fontWeight: 500 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '0.9rem', textDecoration: 'none', marginBottom: '2rem' }}>
          <ArrowLeft size={15} /> Back to home
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', marginBottom: '4px', letterSpacing: '-0.03em' }}>Account Settings</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Manage your security preferences.</p>

        {/* MFA Card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f0f0f0' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Security</h2>
          </div>

          <div style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: mfaEnabled ? '#ecfdf5' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${mfaEnabled ? '#6ee7b7' : '#e5e5e5'}`,
                  transition: 'all 0.3s',
                }}>
                  {mfaEnabled
                    ? <ShieldCheck size={20} color="#059669" />
                    : <ShieldOff size={20} color="#999" />}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 4px' }}>
                    Two-Factor Authentication (MFA)
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, lineHeight: 1.5 }}>
                    {mfaEnabled
                      ? 'Active — a verification code will be emailed to you on every login.'
                      : 'Off — enable to require an email code on every login.'}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              {loading ? (
                <div style={{ width: '48px', height: '26px', borderRadius: '13px', background: '#eee', flexShrink: 0 }} />
              ) : (
                <button
                  onClick={toggleMfa}
                  disabled={toggling}
                  title={mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                  style={{
                    width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                    background: mfaEnabled ? '#111' : '#e0e0e0',
                    position: 'relative', cursor: toggling ? 'not-allowed' : 'pointer',
                    transition: 'background 0.25s', flexShrink: 0,
                    opacity: toggling ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: mfaEnabled ? '23px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s',
                    display: 'block',
                  }} />
                </button>
              )}
            </div>

            {/* Status badge */}
            {!loading && (
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: mfaEnabled ? '#ecfdf5' : '#fef3c7', color: mfaEnabled ? '#065f46' : '#92400e' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {mfaEnabled ? 'MFA Active' : 'MFA Disabled'}
              </div>
            )}

            {/* Feedback message */}
            {message && (
              <div style={{
                marginTop: '1rem', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 500,
                background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: message.type === 'success' ? '#065f46' : '#dc2626',
                border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fee2e2'}`,
              }}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Info box */}
        <div style={{ marginTop: '1.5rem', background: '#f0f4ff', border: '1px solid #c7d8fd', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#3730a3', lineHeight: 1.6 }}>
          <strong>How MFA works:</strong> When enabled, after entering your password Servd will email a 6-digit code to <strong>{user.email}</strong>. You must enter this code to complete login.
        </div>
      </div>
    </div>
  );
}
