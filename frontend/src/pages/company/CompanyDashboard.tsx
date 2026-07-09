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
    <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#111' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Company Dashboard</h1>
            <p style={{ color: '#777', fontSize: '1.05rem', margin: 0 }}>Manage your services, bookings, and team.</p>
          </div>
          <button style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>+ Add New Service</button>
        </div>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: <Calendar size={20} />, label: 'Active Bookings', val: '24' },
            { icon: <Briefcase size={20} />, label: 'Total Services', val: '8' },
            { icon: <Users size={20} />, label: 'Team Members', val: '12' },
            { icon: <TrendingUp size={20} />, label: 'Revenue (MTD)', val: '$4,250' }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#111' }}>
                {s.icon}
              </div>
              <p style={{ color: '#777', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{s.val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Pending Jobs */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Recent Booking Requests</h2>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
                    <th style={{ padding: '16px 20px', color: '#777', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer</th>
                    <th style={{ padding: '16px 20px', color: '#777', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Service</th>
                    <th style={{ padding: '16px 20px', color: '#777', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                    <th style={{ padding: '16px 20px', color: '#777', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                    <th style={{ padding: '16px 20px', color: '#777', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 500 }}>Jane Doe {i}</td>
                      <td style={{ padding: '16px 20px', color: '#555' }}>Deep Cleaning</td>
                      <td style={{ padding: '16px 20px', color: '#555', fontSize: '0.9rem' }}>Oct 2{i}, 2026</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#d97706', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>Pending</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button style={{ background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worker Roster */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Available Workers</h2>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', cursor: 'pointer' }}>See all</span>
            </div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '8px' }}>
              {[
                { n: 'Mike Smith', role: 'Plumber', st: 'Available' },
                { n: 'Sarah Lee', role: 'Electrician', st: 'On Job' },
                { n: 'Tom Clark', role: 'Cleaner', st: 'Available' }
              ].map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{w.n.charAt(0)}</div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2px' }}>{w.n}</h4>
                      <p style={{ color: '#999', fontSize: '0.8rem', margin: 0 }}>{w.role}</p>
                    </div>
                  </div>
                  {w.st === 'Available' ? <CheckCircle size={16} color="#059669" /> : <Clock size={16} color="#d97706" />}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
