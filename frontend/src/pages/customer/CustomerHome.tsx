import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Search, MapPin, Star, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'customer') {
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
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Welcome back, {user.name}</h1>
          <p style={{ color: '#777', fontSize: '1.05rem', margin: 0 }}>What do you need help with today?</p>
        </header>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', maxWidth: '640px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search for services (e.g., Cleaning, Plumbing)" 
              style={{ width: '100%', padding: '16px 20px 16px 48px', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#111'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
            />
          </div>
          <button style={{ background: '#111', color: '#fff', border: 'none', padding: '0 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Search</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }}>
          {/* Left Column */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Active Bookings</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              {[
                { name: 'Deep Clean', pro: 'Sparkle Co.', date: 'Today, 2:00 PM', status: 'Confirmed', price: 120 },
                { name: 'Pipe Repair', pro: 'Mike Plumbing', date: 'Tomorrow, 10:00 AM', status: 'Pending', price: 75 }
              ].map((b, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 4px' }}>{b.name}</h3>
                      <p style={{ color: '#777', fontSize: '0.9rem', margin: '0 0 8px' }}>with {b.pro}</p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#555', fontWeight: 500 }}><Clock size={14} /> {b.date}</span>
                        <span style={{ padding: '4px 10px', background: b.status === 'Confirmed' ? '#ecfdf5' : '#fef3c7', color: b.status === 'Confirmed' ? '#059669' : '#d97706', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>{b.status}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>${b.price}</span>
                    <button style={{ background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Manage</button>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Past Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px' }}>AC Tune-up</h4>
                    <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>Completed Oct {10 + i}, 2025</p>
                  </div>
                  <ChevronRight size={18} color="#ccc" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Account Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500 }}>Name</span>
                  <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{user.name}</p>
                </div>
                <div>
                  <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500 }}>Email</span>
                  <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{user.email}</p>
                </div>
                <div>
                  <span style={{ color: '#999', fontSize: '0.85rem', fontWeight: 500 }}>Saved Payment</span>
                  <p style={{ fontWeight: 600, margin: '2px 0 0' }}>•••• 4242</p>
                </div>
                <button style={{ marginTop: '10px', background: '#f5f5f5', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
