import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Briefcase, Users, Calendar, TrendingUp } from 'lucide-react';

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
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        <section className="container" style={{ padding: '3rem 1.5rem' }}>
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Company Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your services, bookings, and team.</p>
              </div>
              <button className="btn btn-primary">+ Add New Service</button>
            </div>
            
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--accent)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Bookings</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>24</p>
                </div>
              </div>
              
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Services</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>8</p>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(167, 139, 250, 0.2)', padding: '1rem', borderRadius: '12px', color: '#A78BFA' }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Team Members</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</p>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '12px', color: '#22C55E' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Revenue (MTD)</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>$4,250</p>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Booking Requests</h2>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Customer</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Service</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>Jane Doe {i}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>Deep Cleaning</td>
                      <td style={{ padding: '1rem 1.5rem' }}>Oct 2{i}, 2026</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(234, 179, 8, 0.2)', color: '#FDE047', borderRadius: '9999px', fontSize: '0.875rem' }}>Pending</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Review</button>
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
