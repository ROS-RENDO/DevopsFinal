import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { MapPin, Clock, CheckCircle } from 'lucide-react';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(true);

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
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        <section className="container" style={{ padding: '3rem 1.5rem' }}>
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome, {user.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Here are your jobs for today.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(15,23,42,0.8)', padding: '0.75rem 1.5rem', borderRadius: '9999px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status:</span>
                <button 
                  onClick={() => setIsAvailable(!isAvailable)}
                  style={{ 
                    background: isAvailable ? '#22C55E' : 'var(--surface-hover)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.25rem 1rem', 
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  {isAvailable ? 'Available' : 'Offline'}
                </button>
              </div>
            </div>

            {/* Today's Jobs */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Today's Schedule</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '800px' }}>
              {[1, 2].map(i => (
                <div key={i} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Standard Cleaning - 2 Hours</h3>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <MapPin size={16} /> 123 Main St, Apartment 4B
                    </p>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} /> {i === 1 ? '10:00 AM - 12:00 PM' : '2:00 PM - 4:00 PM'}
                    </p>
                  </div>
                  <div>
                    <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <CheckCircle size={18} /> Start Job
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
