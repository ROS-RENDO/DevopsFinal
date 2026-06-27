import { Link } from 'react-router-dom';
import { ArrowRight, Search, Shield, Clock } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content">
        {/* Hero Section */}
        <section className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center' }}>
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #F8FAFC, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Find Trusted Services <br/> in Seconds
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              Connect with top-rated professionals for any job. From home cleaning to specialized repairs, we've got you covered.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/customer" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Book a Service <ArrowRight style={{ marginLeft: '0.5rem' }} size={20} />
              </Link>
              <Link to="/company" className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Become a Partner
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container" style={{ paddingBottom: '5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(79, 70, 229, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                <Search size={32} />
              </div>
              <h3>Easy Discovery</h3>
              <p style={{ color: 'var(--text-muted)' }}>Find exactly what you need with our powerful search and smart categorization.</p>
            </div>

            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--accent)' }}>
                <Shield size={32} />
              </div>
              <h3>Verified Partners</h3>
              <p style={{ color: 'var(--text-muted)' }}>Every company and worker is vetted to ensure quality and safety for your peace of mind.</p>
            </div>

            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <div style={{ background: 'rgba(167, 139, 250, 0.2)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#A78BFA' }}>
                <Clock size={32} />
              </div>
              <h3>Instant Booking</h3>
              <p style={{ color: 'var(--text-muted)' }}>Book appointments in real-time and track your service status effortlessly.</p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
