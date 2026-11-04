
import React, { useState } from 'react';

const products = [
  {
    name: 'Ghostwire Trade',
    category: 'TRADING INTELLIGENCE',
    description: 'Analyze markets, test strategies and monitor trading opportunities with intelligent automation.',
    icon: '↗',
    status: 'COMING SOON'
  },
  {
    name: 'Ghostwire Assistant',
    category: 'AI COMMUNICATION',
    description: 'Build intelligent AI assistants that help businesses communicate, support customers and automate tasks.',
    icon: '✳',
    status: 'COMING SOON'
  }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function navigate(destination) {
    setPage(destination);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  function handleDemoSubmit(event) {
    event.preventDefault();
    alert('The interface is ready. Secure account authentication will be connected in a later development stage.');
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <button className="brand" onClick={() => navigate('home')}>
          <span className="brand-symbol">
            <span>G</span><i>W</i>
          </span>
          <span>GHOSTWIRE<span className="blue"> AI</span></span>
        </button>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <button onClick={() => navigate('home')}>Home</button>
          <button onClick={() => navigate('products')}>Products</button>
          <button onClick={() => navigate('about')}>About</button>
          <button className="mobile-auth" onClick={() => navigate('login')}>Login</button>
          <button className="mobile-auth signup-link" onClick={() => navigate('signup')}>Get Started</button>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={() => navigate('login')}>Log in</button>
          <button className="primary-button small" onClick={() => navigate('signup')}>Get Started ↗</button>
        </div>
      </header>

      <main>
        {page === 'home' && (
          <>
            <section className="hero">
              <div className="hero-glow"></div>
              <div className="eyebrow"><span></span> AN AI SOFTWARE DIVISION OF GHOSTWIRE SYNDICATE</div>
              <h1>BUILD <span>INTELLIGENCE.</span><br />AUTOMATE THE FUTURE.</h1>
              <p>
                Intelligent software, trading technology and AI-powered
                business automation. One ecosystem. Endless possibilities.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => navigate('products')}>Explore our products ↗</button>
                <button className="outline-button" onClick={() => navigate('about')}>Discover Ghostwire AI</button>
              </div>
              <div className="hero-footnote">ENGINEERED FOR WHAT'S NEXT.</div>
            </section>

            <section className="products-section" id="products">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">OUR TECHNOLOGY</div>
                  <h2>Intelligence in <span>action.</span></h2>
                </div>
                <p>Purpose-built software designed to make complex technology more accessible.</p>
              </div>

              <div className="product-grid">
                {products.map(product => (
                  <article className="product-card" key={product.name}>
                    <div className="product-top">
                      <span className="product-icon">{product.icon}</span>
                      <span className="status">{product.status}</span>
                    </div>
                    <div className="eyebrow">{product.category}</div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <button className="text-button" onClick={() => navigate('signup')}>
                      Get early access <span>↗</span>
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="statement-section">
              <div className="eyebrow">THE GHOSTWIRE VISION</div>
              <h2>Technology should work <span>smarter.</span></h2>
              <p>
                Ghostwire AI develops software that brings artificial
                intelligence, automation and intelligent tools together.
              </p>
              <button className="outline-button" onClick={() => navigate('about')}>Learn about us ↗</button>
            </section>
          </>
        )}

        {page === 'products' && (
          <section className="content-page">
            <div className="eyebrow">THE GHOSTWIRE ECOSYSTEM</div>
            <h1>Our <span>products.</span></h1>
            <p className="page-intro">Explore the intelligent software we're developing.</p>
            <div className="product-grid">
              {products.map(product => (
                <article className="product-card" key={product.name}>
                  <div className="product-top">
                    <span className="product-icon">{product.icon}</span>
                    <span className="status">{product.status}</span>
                  </div>
                  <div className="eyebrow">{product.category}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <button className="text-button" onClick={() => navigate('signup')}>Join the waitlist ↗</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === 'about' && (
          <section className="content-page about-page">
            <div className="eyebrow">WHO WE ARE</div>
            <h1>Part of something <span>bigger.</span></h1>
            <p>
              Ghostwire AI is the artificial intelligence and software
              division of Ghostwire Syndicate.
            </p>
            <p>
              Our mission is to develop intelligent chatbots, trading
              technology and automation software that help people and
              businesses do more with technology.
            </p>
            <button className="primary-button" onClick={() => navigate('products')}>Explore our products ↗</button>
          </section>
        )}

        {(page === 'login' || page === 'signup') && (
          <section className="auth-layout">
            <div className="auth-info">
              <div className="eyebrow">GHOSTWIRE AI ACCOUNT</div>
              <h1>{page === 'login' ? 'WELCOME BACK.' : 'JOIN THE FUTURE.'}</h1>
              <p>
                {page === 'login'
                  ? 'Sign in to access your Ghostwire AI workspace.'
                  : 'Create your account and get ready to explore intelligent software.'}
              </p>
              <div className="auth-decoration">GW<span>.</span></div>
            </div>

            <div className="auth-card">
              <div className="eyebrow">{page === 'login' ? 'ACCOUNT ACCESS' : 'CREATE AN ACCOUNT'}</div>
              <h2>{page === 'login' ? 'Sign in' : 'Create your account'}</h2>
              <p className="muted">
                {page === 'login' ? 'Enter your account details below.' : 'Start your Ghostwire AI journey.'}
              </p>

              <form onSubmit={handleDemoSubmit}>
                {page === 'signup' && (
                  <label>
                    Full name
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                  </label>
                )}
                <label>
                  Email address
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" minLength="8" required />
                </label>

                {page === 'login' && (
                  <button type="button" className="forgot-button" onClick={() => alert('Password recovery will be connected with the authentication backend.')}>
                    Forgot password?
                  </button>
                )}

                <button type="submit" className="primary-button full-width">
                  {page === 'login' ? 'Sign in →' : 'Create account →'}
                </button>
              </form>

              <div className="auth-switch">
                {page === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button onClick={() => navigate(page === 'login' ? 'signup' : 'login')}>
                  {page === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
              <button className="back-home" onClick={() => navigate('home')}>← Back to homepage</button>
            </div>
          </section>
        )}
      </main>

      {page !== 'login' && page !== 'signup' && (
        <footer className="footer">
          <div className="footer-brand">GHOSTWIRE<span className="blue"> AI</span></div>
          <p>An AI software division of Ghostwire Syndicate.</p>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Ghostwire Syndicate.</span>
            <span>BUILD INTELLIGENCE. AUTOMATE THE FUTURE.</span>
          </div>
        </footer>
      )}
    </div>
  );
}
