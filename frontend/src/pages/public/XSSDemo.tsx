import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { ShieldCheck, ShieldAlert, AlertTriangle, Code } from 'lucide-react';

/**
 * XSS Output Encoding Demo (React)
 *
 * This page demonstrates how React's JSX escaping protects against XSS by default,
 * and how using dangerouslySetInnerHTML bypasses that protection — making it
 * equivalent to EJS's <%- %> (unescaped) tag.
 *
 * This is for educational / DevSec demonstration purposes only.
 */

// Simulated user data with a malicious XSS payload in the bio field
const MALICIOUS_BIO = '<img src="x" onerror="alert(\'XSS Attack!\')" /><script>alert("XSS via script tag!")</script><b>Hello!</b> I am a <i>normal</i> user.';

export default function XSSDemo() {
  const [customBio, setCustomBio] = useState(MALICIOUS_BIO);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <section className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
          <div className="animate-fade-in">

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                React XSS Protection Demo
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                How React's JSX escaping defends against Cross-Site Scripting
              </p>
            </div>

            {/* Warning Banner */}
            <div className="glass-panel" style={{
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(251, 191, 36, 0.08)',
              borderColor: 'rgba(251, 191, 36, 0.3)'
            }}>
              <AlertTriangle size={24} style={{ color: '#FBBF24', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                <strong style={{ color: '#FBBF24' }}>Educational Demo:</strong>{' '}
                This page intentionally renders potentially malicious input to demonstrate
                how React's default behavior prevents XSS attacks.
              </p>
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Code size={20} style={{ color: 'var(--accent)' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Test Payload</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Edit the bio field below to test different payloads. The default contains a
                malicious <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{'<img onerror>'}</code> and{' '}
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{'<script>'}</code> tag.
              </p>
              <textarea
                className="form-input"
                rows={4}
                value={customBio}
                onChange={(e) => setCustomBio(e.target.value)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Side-by-side comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

              {/* SAFE: Default JSX Escaping */}
              <div className="glass-panel" style={{
                borderColor: 'rgba(34, 197, 94, 0.4)',
                background: 'rgba(34, 197, 94, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={22} style={{ color: '#22C55E' }} />
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#22C55E' }}>
                    Safe: JSX Default {'{ }'}
                  </h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  React automatically escapes all values embedded in JSX.
                  The malicious HTML is rendered as harmless plain text.
                </p>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  color: '#22C55E'
                }}>
                  <code>{'<p>{userBio}</p>'}</code>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  wordBreak: 'break-all'
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    Rendered Output:
                  </p>
                  {/* ✅ SAFE — React escapes this by default */}
                  <p style={{ margin: 0 }}>{customBio}</p>
                </div>
              </div>

              {/* UNSAFE: dangerouslySetInnerHTML */}
              <div className="glass-panel" style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldAlert size={22} style={{ color: '#EF4444' }} />
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#EF4444' }}>
                    Unsafe: dangerouslySetInnerHTML
                  </h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Bypasses React's escaping and renders raw HTML.
                  The malicious payload <strong>will execute</strong>.
                </p>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  color: '#EF4444'
                }}>
                  <code>{'<p dangerouslySetInnerHTML={{ __html: userBio }} />'}</code>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  wordBreak: 'break-all'
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    Rendered Output:
                  </p>
                  {/* ❌ UNSAFE — This renders raw HTML, XSS will fire! */}
                  <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: customBio }} />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>How It Works</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ color: '#22C55E', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    ✅ React JSX (Default)
                  </h3>
                  <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Converts <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{'<'}</code> to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>&amp;lt;</code> automatically
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Malicious tags are displayed as plain text
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      No script execution possible
                    </li>
                    <li>
                      This is the <strong>same concept</strong> as EJS's <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{'<%= %>'}</code>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 style={{ color: '#EF4444', fontSize: '1rem', marginBottom: '0.5rem' }}>
                    ❌ dangerouslySetInnerHTML
                  </h3>
                  <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Injects raw HTML directly into the DOM
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{'<img onerror="...">'}</code> will fire JavaScript
                    </li>
                    <li style={{ marginBottom: '0.5rem' }}>
                      Equivalent to EJS's <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{'<%- %>'}</code>
                    </li>
                    <li>
                      Never use with untrusted user input
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
