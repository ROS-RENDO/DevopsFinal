import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { API_BASE_URL } from '../../config/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // After successful registration, redirect to login
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">I want to register as a:</label>
              <select 
                className="form-input" 
                value={role} 
                onChange={e => setRole(e.target.value)}
              >
                <option value="customer">Customer (Book Services)</option>
                <option value="company">Company (Manage Business)</option>
                <option value="worker">Worker (Provide Services)</option>
                <option value="admin">Admin (System Management)</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
