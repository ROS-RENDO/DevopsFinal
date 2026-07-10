import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'worker') {
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
        
        <header style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.04em', color: '#0f172a' }}>Hi, {user.name ? user.name.split(' ')[0] : 'Worker'} 👋</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0, fontWeight: 400 }}>View your schedule and track earnings.</p>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { icon: <Calendar size={22} />, label: "Today's Jobs", val: '3', color: '#3b82f6', bg: '#eff6ff' },
            { icon: <CheckCircle size={22} />, label: 'Completed (Week)', val: '14', color: '#10b981', bg: '#ecfdf5' },
            { icon: <DollarSign size={22} />, label: 'Earnings (Week)', val: '$850', color: '#f59e0b', bg: '#fffbeb' }
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
          {/* Today's Schedule */}
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>Today's Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { time: '09:00 AM', job: 'Deep Cleaning', customer: 'Alice Cooper', address: '123 Main St, Apt 4B', status: 'In Progress' },
                { time: '01:00 PM', job: 'Standard Cleaning', customer: 'Bob Marley', address: '456 Oak Rd', status: 'Pending' },
                { time: '04:30 PM', job: 'Move-out Clean', customer: 'Charlie Brown', address: '789 Pine Ln', status: 'Pending' }
              ].map((j, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ width: '68px', height: '68px', background: '#f8fafc', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1, color: '#0f172a' }}>{j.time.split(' ')[0]}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>{j.time.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>{j.job}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 10px', fontWeight: 500 }}>for {j.customer}</p>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}><MapPin size={16} /> {j.address}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '6px 12px', background: j.status === 'In Progress' ? '#eff6ff' : '#f8fafc', color: j.status === 'In Progress' ? '#2563eb' : '#64748b', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginBottom: '16px' }}>{j.status}</span>
                    <br />
                    <button style={{ background: j.status === 'In Progress' ? '#0f172a' : '#f1f5f9', color: j.status === 'In Progress' ? '#fff' : '#334155', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: j.status === 'In Progress' ? '0 4px 12px rgba(15,23,42,0.15)' : 'none' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>{j.status === 'In Progress' ? 'Complete Job' : 'Start Route'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>Your Availability</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6, fontWeight: 500 }}>
                Toggle your active status to let your company know you are ready to receive immediate dispatch requests.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px rgba(16,185,129,0.4)' }} />
                  <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>Online & Available</span>
                </div>
                <button style={{ background: '#fff', border: '1px solid #10b981', color: '#065f46', borderRadius: '10px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Go Offline</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
