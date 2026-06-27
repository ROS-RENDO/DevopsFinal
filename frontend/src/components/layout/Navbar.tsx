import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">ServiceFinder</Link>
        <div className="nav-links">
          <Link to="/customer">Find Services</Link>
          <Link to="/company">For Business</Link>
          <Link to="/worker">For Workers</Link>
          <Link to="/login" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}
