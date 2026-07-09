import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Users, Building, Activity, AlertTriangle, ShieldCheck, ArrowRight, BarChart } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(parsedUser);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', fontFamily: "'Outfit', 'Inter', sans-serif", color: '#0f172a' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 32px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.04em', color: '#0f172a' }}>Welcome back, {user.name || 'Admin'}</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0, fontWeight: 400 }}>Monitor system health, users, and disputes.</p>
          </div>
          <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><BarChart size={18} /> View Reports</button>
        </header>

        {/* System Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { icon: <Users size={22} />, label: 'Total Users', val: '24,592', change: '+12%', color: '#3b82f6', bg: '#eff6ff' },
            { icon: <Building size={22} />, label: 'Active Companies', val: '1,204', change: '+5%', color: '#8b5cf6', bg: '#f5f3ff' },
            { icon: <Activity size={22} />, label: 'Bookings (30d)', val: '8,391', change: '+22%', color: '#10b981', bg: '#ecfdf5' },
            { icon: <ShieldCheck size={22} />, label: 'System Uptime', val: '99.99%', change: null, color: '#f59e0b', bg: '#fffbeb' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
                {s.change && <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem', background: '#d1fae5', padding: '4px 10px', borderRadius: '100px' }}>{s.change}</span>}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: '#0f172a' }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          {/* Recent Registrations */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Recent Registrations</h2>
            <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              {[
                { name: 'Apex Electricals', email: 'contact@apexelectricals.com', date: '2 hours ago' },
                { name: 'Pure Water Plumbing', email: 'hello@purewater.com', date: '5 hours ago' },
                { name: 'Elite Cleaners', email: 'info@elitecleaners.com', date: 'Yesterday' },
                { name: 'FixIt Pro', email: 'support@fixitpro.com', date: 'Yesterday' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: i === 3 ? 'none' : '1px solid rgba(0,0,0,0.03)' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{c.name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>{c.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{c.date}</span>
                    <button style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>Review</button>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>View all registrations <ArrowRight size={16} /></button>
          </div>

          {/* Active Disputes */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a' }}>Active Disputes <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>3 Pending</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'DSP-2910', reason: 'No-show by worker', entity: 'Sparkle Co.', severity: 'High' },
                { id: 'DSP-2908', reason: 'Quality of service complaint', entity: 'Mike Plumbing', severity: 'Medium' },
                { id: 'DSP-2895', reason: 'Overcharged beyond quote', entity: 'Handy John', severity: 'High' }
              ].map((d, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', borderLeft: d.severity === 'High' ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>{d.id}</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '6px 0 0', color: '#0f172a' }}>{d.reason}</h4>
                    </div>
                    <AlertTriangle size={20} color={d.severity === 'High' ? '#ef4444' : '#f59e0b'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>Against: <strong style={{ color: '#0f172a' }}>{d.entity}</strong></p>
                    <button style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#334155', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
