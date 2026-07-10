import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Wrench, Zap, Droplet, Paintbrush, Home, Fan, CheckCircle, Shield, Clock, Award, TrendingUp, Sparkles, Search as SearchIcon, X, ShoppingCart, Trash2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';

/* ── Reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { ref, v };
}
function R({ children, d = 0 }: { children: React.ReactNode; d?: number }) {
  const { ref, v } = useReveal();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(24px)', transition: `all 0.55s cubic-bezier(0.22,1,0.36,1) ${d}s` }}>{children}</div>;
}

/* ── Data ── */
const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80', tag: 'Most Popular', title: 'Expert Home Services', sub: 'On Demand', desc: 'Book vetted professionals for cleaning, repairs, electrical & more.' },
  { img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80', tag: 'Trusted', title: '10,000+ Happy', sub: 'Homeowners', desc: 'Rated 4.9★ across all services. Your satisfaction, guaranteed.' },
  { img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80', tag: 'Instant', title: 'Book in Seconds', sub: 'Zero Hassle', desc: 'Search, select, and confirm — no phone calls needed.' },
];

const CATS = [
  { id: 'all', name: 'All', icon: <Home size={16} /> },
  { id: 'cleaning', name: 'Cleaning', icon: <Paintbrush size={16} /> },
  { id: 'plumbing', name: 'Plumbing', icon: <Droplet size={16} /> },
  { id: 'electrical', name: 'Electrical', icon: <Zap size={16} /> },
  { id: 'hvac', name: 'HVAC', icon: <Fan size={16} /> },
  { id: 'repair', name: 'Repair', icon: <Wrench size={16} /> },
];

const S = [
  { id: '1', n: 'Deep Clean', p: 'Sparkle Co.', r: 4.9, rv: 128, $: 120, img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=75', c: 'cleaning', pop: true, tp: true },
  { id: '2', n: 'Pipe Repair', p: 'Mike Plumbing', r: 4.8, rv: 89, $: 75, img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=75', c: 'plumbing', pop: true, tp: false },
  { id: '3', n: 'Panel Upgrade', p: 'Volt Services', r: 5.0, rv: 42, $: 250, img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=75', c: 'electrical', pop: false, tp: true },
  { id: '4', n: 'AC Tune-up', p: 'CoolBreeze', r: 4.7, rv: 215, $: 89, img: 'https://images.unsplash.com/photo-1581092926214-7d52210a47eb?w=400&q=75', c: 'hvac', pop: true, tp: false },
  { id: '5', n: 'Furniture Fix', p: 'Handy John', r: 4.6, rv: 56, $: 45, img: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=400&q=75', c: 'repair', pop: false, tp: false },
  { id: '6', n: 'Move-out Clean', p: 'Pristine Team', r: 4.9, rv: 312, $: 180, img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&q=75', c: 'cleaning', pop: true, tp: true },
  { id: '7', n: 'Light Install', p: 'Bright Sparks', r: 4.8, rv: 73, $: 60, img: 'https://images.unsplash.com/photo-1563605581977-6a75fbaec6a4?w=400&q=75', c: 'electrical', pop: false, tp: false },
  { id: '8', n: 'Drain Unclog', p: 'Flow Masters', r: 4.5, rv: 198, $: 95, img: 'https://images.unsplash.com/photo-1607472586893-edb57cb64003?w=400&q=75', c: 'plumbing', pop: false, tp: true },
  { id: '9', n: 'Window Clean', p: 'ClearView', r: 4.7, rv: 64, $: 55, img: 'https://images.unsplash.com/photo-1596394723269-e2127f6e3d84?w=400&q=75', c: 'cleaning', pop: false, tp: false },
  { id: '10', n: 'Heater Repair', p: 'WarmUp Co.', r: 4.8, rv: 91, $: 110, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=75', c: 'hvac', pop: true, tp: true },
  { id: '11', n: 'Outlet Install', p: 'PowerPro', r: 4.6, rv: 38, $: 40, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=75', c: 'electrical', pop: false, tp: false },
  { id: '12', n: 'Faucet Replace', p: 'AquaFix', r: 4.9, rv: 147, $: 85, img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=75', c: 'plumbing', pop: true, tp: true },
  { id: '13', n: 'Carpet Clean', p: 'FreshFloor', r: 4.4, rv: 203, $: 99, img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=75', c: 'cleaning', pop: false, tp: false },
  { id: '14', n: 'Door Repair', p: 'FixIt Fast', r: 4.5, rv: 31, $: 50, img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=75', c: 'repair', pop: false, tp: false },
  { id: '15', n: 'Duct Cleaning', p: 'AirPure', r: 4.7, rv: 112, $: 135, img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=75', c: 'hvac', pop: false, tp: true },
  { id: '16', n: 'Ceiling Fan', p: 'SpinTech', r: 4.8, rv: 67, $: 70, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=75', c: 'electrical', pop: false, tp: false },
  { id: '17', n: 'Tile Repair', p: 'TilePro', r: 4.6, rv: 44, $: 65, img: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=75', c: 'repair', pop: false, tp: false },
  { id: '18', n: 'Office Clean', p: 'CorpClean', r: 4.9, rv: 256, $: 200, img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=75', c: 'cleaning', pop: true, tp: true },
  { id: '19', n: 'Water Heater', p: 'HotFlow', r: 4.7, rv: 88, $: 150, img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75', c: 'plumbing', pop: false, tp: false },
  { id: '20', n: 'Paint Touch-up', p: 'ColorPro', r: 4.5, rv: 52, $: 80, img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=75', c: 'repair', pop: false, tp: false },
];

type CI = { id: string; n: string; $: number; p: string };

export default function LandingPage() {
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');
  const [favs, setFavs] = useState<string[]>([]);
  const [cart, setCart] = useState<CI[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bk, setBk] = useState<string | null>(null);
  const [cartNote, setCartNote] = useState('');
  const [hi, setHi] = useState(0);
  const [user, setUser] = useState<any>(null);
  const ht = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Restore cart if it was saved prior to login redirect
    const savedCart = localStorage.getItem('pendingCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      setCartOpen(true);
      localStorage.removeItem('pendingCart');
    }

    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem('user');
      }
    }

    ht.current = window.setInterval(() => setHi(p => (p + 1) % SLIDES.length), 6000); 
    return () => {
      if (ht.current) {
        clearInterval(ht.current);
      }
    };
  }, []);
  const go = (i: number) => {
    if (ht.current) {
      clearInterval(ht.current);
    }
    setHi(i);
  };

  const addC = (s: typeof S[0]) => { if (!cart.some(c => c.id === s.id)) { setCart(p => [...p, { id: s.id, n: s.n, $: s.$, p: s.p }]); setCartOpen(true); } };
  const rmC = (id: string) => setCart(p => p.filter(c => c.id !== id));
  const total = cart.reduce((a, c) => a + c.$, 0);

  const checkout = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      localStorage.setItem('pendingCart', JSON.stringify(cart));
      navigate('/login?redirect=booking');
      return;
    }

    setBk('loading');
    try {
      for (const it of cart) {
        const { response } = await apiRequest('/bookings', {
          method: 'POST',
          body: JSON.stringify({ serviceDetails: `${it.n} — ${it.p}` }),
        });
        if (!response.ok) throw new Error();
      }
      setBk('success'); setTimeout(() => { setCart([]); setBk(null); setCartOpen(false); }, 2500);
    } catch (error) {
      console.error(error);
      setBk('error');
      setTimeout(() => setBk(null), 3000);
    }
  };

  const filtered = cat === 'all' ? S : S.filter(s => s.c === cat);
  const sl = SLIDES[hi];

  /* ── Card ── */
  const Card = ({ s }: { s: typeof S[0] }) => {
    const fav = favs.includes(s.id);
    const inC = cart.some(c => c.id === s.id);
    return (
      <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.06)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ paddingTop: '65%', position: 'relative' }}>
            <img src={s.img} alt={s.n} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
          </div>
          <button onClick={e => { e.stopPropagation(); setFavs(p => p.includes(s.id) ? p.filter(f => f !== s.id) : [...p, s.id]); }}
            style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'transform 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <svg viewBox="0 0 32 32" style={{ fill: fav ? '#111' : 'none', height: '15px', width: '15px', stroke: '#111', strokeWidth: '2.5' }}>
              <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" />
            </svg>
          </button>
          {s.tp && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#111', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Top Pro</span>}
        </div>
        {/* Body */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', margin: 0 }}>{s.n}</h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', color: '#111', fontWeight: 500, flexShrink: 0 }}><Star size={12} fill="#111" />{s.r}</span>
          </div>
          <p style={{ color: '#999', fontSize: '0.85rem', margin: '0 0 10px' }}>{s.p} · {s.rv} reviews</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111' }}>${s.$}</span>
            <button onClick={e => { e.stopPropagation(); addC(s); }}
              style={{ background: inC ? '#111' : '#fff', color: inC ? '#fff' : '#111', border: inC ? 'none' : '1.5px solid #111', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
              {inC ? '✓ Added' : '+ Book'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Grid = ({ items }: { items: typeof S }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
      {items.map(s => <Card key={s.id} s={s} />)}
    </div>
  );

  const Heading = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>{icon}<h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2></div>
        <p style={{ color: '#aaa', fontSize: '0.88rem', margin: 0 }}>{sub}</p>
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>See all <ArrowRight size={14} /></span>
    </div>
  );

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh', fontFamily: "'Inter',-apple-system,sans-serif", color: '#111' }}>
      <style>{`
        @keyframes heroFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes progress{from{width:0}to{width:100%}}
        *::-webkit-scrollbar{display:none}
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111', textDecoration: 'none' }}>
            <div style={{ background: '#111', color: '#fff', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={17} /></div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.04em' }}>Servd</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setCartOpen(true)} style={{ position: 'relative', background: 'none', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ShoppingCart size={18} />
              {cart.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#111', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px' }}>
                <Link to={`/${user.role}`} style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111', textDecoration: 'none' }}>Dashboard</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', padding: '4px 12px 4px 4px', borderRadius: '100px' }}>
                  <div style={{ background: '#111', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                </div>
                <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Log out</button>
              </div>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#555', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)' }}>Log in</Link>
                <Link to="/register" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: '#111' }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section style={{ position: 'relative', height: '440px', overflow: 'hidden' }}>
        {SLIDES.map((s, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === hi ? 1 : 0, transition: 'opacity 1.2s ease' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.1) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div key={hi} style={{ maxWidth: '520px', animation: 'heroFade 0.55s ease forwards' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px', borderRadius: '100px', marginBottom: '16px', letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.15)' }}>{sl.tag}</span>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1.06, margin: '0 0 8px', letterSpacing: '-0.035em' }}>
              {sl.title}<br /><span style={{ color: 'rgba(255,255,255,0.35)' }}>{sl.sub}</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 28px', lineHeight: 1.5 }}>{sl.desc}</p>
            <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', maxWidth: '440px' }}>
              <input type="text" placeholder="What do you need?" style={{ flex: 1, border: 'none', outline: 'none', padding: '0 18px', fontSize: '0.95rem', color: '#111', background: 'transparent', height: '50px' }} />
              <button style={{ background: '#111', border: 'none', color: '#fff', padding: '0 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap' }}><SearchIcon size={16} />Search</button>
            </div>
          </div>
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 3 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)} style={{ position: 'relative', width: i === hi ? '28px' : '8px', height: '8px', borderRadius: '100px', background: i === hi ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.35s', overflow: 'hidden' }}>
              {i === hi && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', borderRadius: '100px', animation: 'progress 6s linear' }} />}
            </button>
          ))}
        </div>
        <button onClick={() => go((hi - 1 + SLIDES.length) % SLIDES.length)} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 3 }}><ChevronLeft size={18} /></button>
        <button onClick={() => go((hi + 1) % SLIDES.length)} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', zIndex: 3 }}><ChevronRight size={18} /></button>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <R>
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto', padding: '14px 32px' }}>
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '100px', border: cat === c.id ? 'none' : '1.5px solid rgba(0,0,0,0.1)', background: cat === c.id ? '#111' : '#fff', color: cat === c.id ? '#fff' : '#555', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {c.icon}{c.name}
              </button>
            ))}
          </div>
        </div>
      </R>

      {/* ═══ MAIN ═══ */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 72px' }}>
        {cat !== 'all' ? (
          <R><Grid items={filtered} /></R>
        ) : (<>
          <R>
            <div style={{ marginBottom: '3rem' }}>
              <Heading icon={<TrendingUp size={18} />} title="Popular right now" sub="Highest booked this month" />
              <Grid items={S.filter(s => s.pop)} />
            </div>
          </R>

          {/* Trust */}
          <R d={0.04}>
            <div style={{ margin: '0 0 3rem', padding: '32px 40px', background: '#111', borderRadius: '16px', color: '#fff', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '28px' }}>
              {[
                { icon: <Shield size={22} />, t: 'Verified Pros', d: 'Background-checked & reviewed.' },
                { icon: <Clock size={22} />, t: 'Instant Booking', d: 'Confirmed within minutes.' },
                { icon: <Award size={22} />, t: 'Guaranteed', d: 'Full refund if not satisfied.' },
              ].map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ opacity: 0.4, flexShrink: 0, marginTop: '2px' }}>{v.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 3px' }}>{v.t}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>{v.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </R>

          <R>
            <div style={{ marginBottom: '3rem' }}>
              <Heading icon={<Star size={18} fill="#111" />} title="Top rated" sub="Loved by customers — 4.5+ stars" />
              <Grid items={[...S].sort((a, b) => b.r - a.r).slice(0, 8)} />
            </div>
          </R>

          <R>
            <div style={{ marginBottom: '3rem' }}>
              <Heading icon={<Sparkles size={18} />} title="New on Servd" sub="Recently added — be the first to book" />
              <Grid items={[...S].reverse().slice(0, 6)} />
            </div>
          </R>

          <R>
            <div>
              <Heading icon={<Home size={18} />} title="Browse all" sub={`${S.length} services available`} />
              <Grid items={S} />
            </div>
          </R>
        </>)}
      </main>

      {/* ═══ CART ═══ */}
      {cartOpen && <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200, backdropFilter: 'blur(2px)' }} />}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '380px', background: '#fff', zIndex: 210,
        transform: cartOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Bookings</h3>
            {cart.length > 0 && <span style={{ background: '#f0f0f0', borderRadius: '100px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 600, color: '#666' }}>{cart.length}</span>}
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: '#ccc' }}>
              <ShoppingCart size={36} style={{ marginBottom: '12px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#aaa', margin: '0 0 4px' }}>No bookings yet</p>
              <p style={{ fontSize: '0.85rem', color: '#ccc' }}>Click "+ Book" on any card</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fafafa', borderRadius: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#111' }}>{it.n}</p>
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: '2px 0 0' }}>{it.p}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>${it.$}</span>
                    <button onClick={() => rmC(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', padding: '4px' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '18px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Special Instructions</label>
              <input 
                type="text" 
                value={cartNote} 
                onChange={e => setCartNote(e.target.value)} 
                placeholder="E.g., Please ring the doorbell..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem' }}
              />
              {cartNote && (
                 <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666', background: '#f5f5f5', padding: '8px', borderRadius: '6px' }}>
                   <strong>Note Preview: </strong>
                   <span>{cartNote}</span>
                 </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#999' }}>Total ({cart.length})</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>${total}</span>
            </div>
            <button onClick={checkout} disabled={bk === 'loading'}
              style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', background: bk === 'success' ? '#16a34a' : '#111', color: '#fff', transition: 'all 0.2s' }}>
              {bk === 'loading' ? 'Processing…' : bk === 'success' ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckCircle size={16} />Booked!</span> : `Confirm · $${total}`}
            </button>
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <R>
        <footer style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 32px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <div style={{ background: '#111', color: '#fff', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={14} /></div>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em' }}>Servd</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#aaa', lineHeight: 1.5 }}>Expert home services,<br />booked in seconds.</p>
            </div>
            {[
              { t: 'Company', i: ['About', 'Careers', 'Press'] },
              { t: 'Support', i: ['Help Center', 'Safety', 'Cancellation'] },
              { t: 'Community', i: ['Blog', 'Refer a Friend', 'Forum'] },
            ].map(c => (
              <div key={c.t}>
                <h4 style={{ fontWeight: 600, fontSize: '0.78rem', color: '#bbb', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.t}</h4>
                {c.i.map(x => <p key={x} style={{ color: '#666', fontSize: '0.9rem', margin: '6px 0', cursor: 'pointer' }}>{x}</p>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)', maxWidth: '1280px', margin: '0 auto', padding: '14px 32px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ccc', fontSize: '0.78rem' }}>© 2026 Servd, Inc.</span>
            <div style={{ display: 'flex', gap: '16px' }}>{['Privacy', 'Terms', 'Sitemap'].map(t => <span key={t} style={{ color: '#bbb', fontSize: '0.78rem', cursor: 'pointer' }}>{t}</span>)}</div>
          </div>
        </footer>
      </R>
    </div>
  );
}
