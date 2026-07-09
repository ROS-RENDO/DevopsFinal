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
    <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#111' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Platform Overview</h1>
            <p style={{ color: '#777', fontSize: '1.05rem', margin: 0 }}>Monitor system health, users, and disputes.</p>
          </div>
          <button style={{ background: '#fff', color: '#111', border: '1.5px solid rgba(0,0,0,0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart size={18} /> View Reports</button>
        </header>

        {/* System Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: <Users size={20} />, label: 'Total Users', val: '24,592', change: '+12%' },
            { icon: <Building size={20} />, label: 'Active Companies', val: '1,204', change: '+5%' },
            { icon: <Activity size={20} />, label: 'Bookings (30d)', val: '8,391', change: '+22%' },
            { icon: <ShieldCheck size={20} />, label: 'System Uptime', val: '99.99%', change: null }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111' }}>
                  {s.icon}
                </div>
                {s.change && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem', background: '#ecfdf5', padding: '4px 8px', borderRadius: '100px' }}>{s.change}</span>}
              </div>
              <p style={{ color: '#777', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Recent Registrations */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Recent Company Registrations</h2>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
              {[
                { name: 'Apex Electricals', email: 'contact@apexelectricals.com', date: '2 hours ago' },
                { name: 'Pure Water Plumbing', email: 'hello@purewater.com', date: '5 hours ago' },
                { name: 'Elite Cleaners', email: 'info@elitecleaners.com', date: 'Yesterday' }
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: i === 2 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 2px' }}>{c.name}</h4>
                    <p style={{ color: '#777', fontSize: '0.85rem', margin: 0 }}>{c.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 500 }}>{c.date}</span>
                    <button style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Review</button>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>View all registrations <ArrowRight size={14} /></button>
          </div>

          {/* Active Disputes */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>Active Disputes <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem' }}>3 Pending</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'DSP-2910', reason: 'No-show by worker', entity: 'Sparkle Co.', severity: 'High' },
                { id: 'DSP-2908', reason: 'Quality of service complaint', entity: 'Mike Plumbing', severity: 'Medium' },
                { id: 'DSP-2895', reason: 'Overcharged beyond quote', entity: 'Handy John', severity: 'High' }
              ].map((d, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '20px', borderLeft: d.severity === 'High' ? '4px solid #dc2626' : '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', letterSpacing: '0.04em' }}>{d.id}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '4px 0 0' }}>{d.reason}</h4>
                    </div>
                    <AlertTriangle size={18} color={d.severity === 'High' ? '#dc2626' : '#f59e0b'} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#777', fontSize: '0.9rem', margin: 0 }}>Against: <strong>{d.entity}</strong></p>
                    <button style={{ background: 'none', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#111' }}>Resolve</button>
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
