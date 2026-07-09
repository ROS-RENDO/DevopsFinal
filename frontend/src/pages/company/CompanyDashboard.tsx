import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Briefcase, Users, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'company') {
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.04em', color: '#0f172a' }}>Welcome, {user.name || 'Partner'}</h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0, fontWeight: 400 }}>Manage your services, bookings, and team.</p>
          </div>
          <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>+ Add New Service</button>
        </div>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { icon: <Calendar size={22} />, label: 'Active Bookings', val: '24', color: '#3b82f6', bg: '#eff6ff' },
            { icon: <Briefcase size={22} />, label: 'Total Services', val: '8', color: '#8b5cf6', bg: '#f5f3ff' },
            { icon: <Users size={22} />, label: 'Team Members', val: '12', color: '#10b981', bg: '#ecfdf5' },
            { icon: <TrendingUp size={22} />, label: 'Revenue (MTD)', val: '$4,250', color: '#f59e0b', bg: '#fffbeb' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: s.color }}>
                {s.icon}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', color: '#0f172a' }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Pending Jobs */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Recent Booking Requests</h2>
            <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', background: '#f8fafc' }}>
                    <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</th>
                    <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Service</th>
                    <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                    <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                    <th style={{ padding: '20px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(0,0,0,0.03)' }}>
                      <td style={{ padding: '20px 24px', fontWeight: 600, color: '#0f172a' }}>Jane Doe {i}</td>
                      <td style={{ padding: '20px 24px', color: '#475569', fontWeight: 500 }}>Deep Cleaning</td>
                      <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Oct 2{i}, 2026</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ padding: '6px 12px', background: '#fffbeb', color: '#d97706', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>Pending</span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <button style={{ background: '#f1f5f9', border: 'none', color: '#334155', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worker Roster */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Available Workers</h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6', cursor: 'pointer' }}>See all</span>
            </div>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
              {[
                { n: 'Mike Smith', role: 'Plumber', st: 'Available' },
                { n: 'Sarah Lee', role: 'Electrician', st: 'On Job' },
                { n: 'Tom Clark', role: 'Cleaner', st: 'Available' }
              ].map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: '#334155' }}>{w.n.charAt(0)}</div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{w.n}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>{w.role}</p>
                    </div>
                  </div>
                  {w.st === 'Available' ? <CheckCircle size={18} color="#10b981" /> : <Clock size={18} color="#f59e0b" />}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
