import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Calendar, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';

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
    <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#111' }}>
      <Navbar />
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 32px' }}>
        
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Worker Dashboard</h1>
          <p style={{ color: '#777', fontSize: '1.05rem', margin: 0 }}>View your schedule and track earnings.</p>
        </header>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: <Calendar size={20} />, label: "Today's Jobs", val: '3' },
            { icon: <CheckCircle size={20} />, label: 'Completed (Week)', val: '14' },
            { icon: <DollarSign size={20} />, label: 'Earnings (Week)', val: '$850' }
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
          {/* Today's Schedule */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Today's Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { time: '09:00 AM', job: 'Deep Cleaning', customer: 'Alice Cooper', address: '123 Main St, Apt 4B', status: 'In Progress' },
                { time: '01:00 PM', job: 'Standard Cleaning', customer: 'Bob Marley', address: '456 Oak Rd', status: 'Pending' },
                { time: '04:30 PM', job: 'Move-out Clean', customer: 'Charlie Brown', address: '789 Pine Ln', status: 'Pending' }
              ].map((j, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.1 }}>{j.time.split(' ')[0]}</span>
                      <span style={{ fontSize: '0.75rem', color: '#777', fontWeight: 600 }}>{j.time.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 4px' }}>{j.job}</h3>
                      <p style={{ color: '#777', fontSize: '0.9rem', margin: '0 0 8px' }}>for {j.customer}</p>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#555', fontWeight: 500 }}><MapPin size={14} /> {j.address}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '4px 10px', background: j.status === 'In Progress' ? '#eff6ff' : '#f5f5f5', color: j.status === 'In Progress' ? '#2563eb' : '#777', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-block', marginBottom: '12px' }}>{j.status}</span>
                    <br />
                    <button style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>{j.status === 'In Progress' ? 'Complete Job' : 'Start Route'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Your Availability</h2>
              <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                Toggle your active status to let your company know you are ready to receive immediate dispatch requests.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600, color: '#065f46' }}>Online & Available</span>
                </div>
                <button style={{ background: '#fff', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Go Offline</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
