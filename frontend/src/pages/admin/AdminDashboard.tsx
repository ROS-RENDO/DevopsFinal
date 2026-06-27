import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Users, Building, ShieldCheck, Activity } from 'lucide-react';

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
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        <section className="container" style={{ padding: '3rem 1.5rem' }}>
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Control Panel</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Platform overview and system metrics.</p>
            
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--accent)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,204</p>
                </div>
              </div>
              
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Building size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Companies</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>86</p>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: '#22C55E' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verified Workers</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>342</p>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: '#EF4444' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>System Status</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>99.9%</p>
                </div>
              </div>
            </div>

            {/* Platform Management */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Platform Activity</h2>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Event</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>User / Entity</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Time</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: 'New Company Registration', user: 'Pro Cleaners LLC', time: '10 mins ago', status: 'Pending Verification' },
                    { event: 'Report Submitted', user: 'Jane Doe (Customer)', time: '1 hour ago', status: 'Needs Review' },
                    { event: 'System Backup', user: 'System', time: '3 hours ago', status: 'Completed' },
                  ].map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{item.event}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>{item.user}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{item.time}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          background: item.status.includes('Completed') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)', 
                          color: item.status.includes('Completed') ? '#4ADE80' : '#FDE047', 
                          borderRadius: '9999px', 
                          fontSize: '0.875rem' 
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
