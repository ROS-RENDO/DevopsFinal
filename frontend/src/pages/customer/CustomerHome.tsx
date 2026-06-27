import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { Search, MapPin, Star } from 'lucide-react';

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
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        <section className="container" style={{ padding: '3rem 1.5rem' }}>
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>What do you need help with today?</p>
            
            {/* Search Bar */}
            <div className="glass-panel" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '3rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search for services (e.g., Cleaning, Plumbing)" 
                  style={{ paddingLeft: '3rem', border: 'none', background: 'rgba(15,23,42,0.8)' }}
                />
              </div>
              <button className="btn btn-primary" style={{ padding: '0 2rem' }}>Search</button>
            </div>

            {/* Mock Categories */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Categories</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {['Home Cleaning', 'Plumbing', 'Electrical', 'Landscaping', 'Moving', 'Painting'].map(category => (
                <div key={category} className="glass-panel" style={{ padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={(e) => e.currentTarget.style.transform = 'scale(0.98)'}>
                  <p style={{ fontWeight: 600 }}>{category}</p>
                </div>
              ))}
            </div>

            {/* Mock Nearby Services */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Nearby Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ height: '150px', background: 'linear-gradient(135deg, #4F46E5, #38BDF8)' }}></div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Pro Cleaners Co. {i}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#FBBF24' }}>
                        <Star size={16} fill="currentColor" />
                        <span style={{ marginLeft: '0.25rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>4.8</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <MapPin size={14} style={{ marginRight: '0.25rem' }} /> 2.5 miles away
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>View Profile</button>
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
