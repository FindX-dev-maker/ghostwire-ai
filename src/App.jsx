import React, { useState } from 'react';

const products = [
  { id: 'trade', name: 'Ghostwire Trade', category: 'TRADING TECHNOLOGY', mark: '↗', description: 'A trading workspace for market analysis, strategy research and risk-aware automation.', features: ['Market and watchlist analysis', 'Strategy testing and signal review', 'Risk controls and activity monitoring'], note: 'Trading involves risk. No returns are guaranteed and automated execution must be explicitly configured.' },
  { id: 'assistant', name: 'Ghostwire Assistant', category: 'AI ASSISTANTS', mark: '✳', description: 'AI assistants designed to answer questions, support customers and handle repeatable business workflows.', features: ['Business and customer-support assistants', 'Knowledge-base powered answers', 'Workflow and prompt configuration'], note: 'Connect a model provider and your approved knowledge sources before enabling live assistant responses.' },
  { id: 'realtor', name: 'Ghostwire Realtor', category: 'REAL ESTATE TECHNOLOGY', mark: '⌂', description: 'A workspace concept for property professionals to organize listings, buyer enquiries and seller leads.', features: ['Property listing records and media', 'Buyer and seller enquiry tracking', 'Lead follow-up and listing status management'], note: 'Property publication, messaging and lead storage require a configured backend and appropriate permissions.' }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  const navigate = (next) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const selected = products.find((item) => item.id === page);

  return <div className="app-shell">
    <header className="navbar">
      <button className="brand" onClick={() => navigate('home')} aria-label="Ghostwire AI home">
        <span className="brand-symbol"><b>G</b><i>W</i></span>
        <span>GHOSTWIRE<span className="blue"> AI</span></span>
      </button>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">☰</button>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
        <button onClick={() => navigate('home')}>Home</button>
        <button onClick={() => navigate('products')}>Products</button>
        <button onClick={() => navigate('about')}>About</button>
        <button className="mobile-auth" onClick={() => { setAuthMode('login'); navigate('account'); }}>Log in</button>
        <button className="mobile-auth signup-link" onClick={() => { setAuthMode('signup'); navigate('account'); }}>Create account</button>
      </nav>
      <div className="nav-actions">
        <button className="login-button" onClick={() => { setAuthMode('login'); navigate('account'); }}>Log in</button>
        <button className="primary-button small" onClick={() => { setAuthMode('signup'); navigate('account'); }}>Create account ↗</button>
      </div>
    </header>

    <main>
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-glow"></div>
          <div className="eyebrow"><span></span> THE SOFTWARE DIVISION OF GHOSTWIRE SYNDICATE</div>
          <h1>INTELLIGENCE FOR<br /><span>REAL-WORLD WORK.</span></h1>
          <p>Trading technology, practical AI assistants and real-estate software — built as one connected software ecosystem.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('products')}>Explore all products ↗</button>
            <button className="outline-button" onClick={() => navigate('about')}>About Ghostwire</button>
          </div>
          <div className="hero-footnote">THREE PRODUCT LINES. ONE SOFTWARE COMPANY.</div>
        </section>
        <section className="products-section">
          <div className="section-heading"><div><div className="eyebrow">THE GHOSTWIRE ECOSYSTEM</div><h2>Tools for <span>what's next.</span></h2></div><p>Choose a product area to explore its purpose and planned capabilities.</p></div>
          <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} onOpen={() => navigate(p.id)} />)}</div>
        </section>
        <section className="statement-section"><div className="eyebrow">BUILT UNDER GHOSTWIRE SYNDICATE</div><h2>One parent company. <span>Focused products.</span></h2><p>Ghostwire AI is the AI and software division of Ghostwire Syndicate — not a replacement for the parent brand.</p><button className="outline-button" onClick={() => navigate('about')}>Our company ↗</button></section>
      </>}

      {page === 'products' && <section className="content-page"><div className="eyebrow">PRODUCT DIRECTORY</div><h1>Explore the <span>ecosystem.</span></h1><p className="page-intro">All three product areas are listed here. Select one to see its purpose and capabilities.</p><div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} onOpen={() => navigate(p.id)} />)}</div></section>}

      {selected && <section className="content-page product-detail">
        <button className="back-link" onClick={() => navigate('products')}>← All products</button>
        <div className="eyebrow">{selected.category}</div><h1>{selected.name.split(' ').slice(0, -1).join(' ')} <span>{selected.name.split(' ').slice(-1)}</span></h1>
        <p className="page-intro detail-intro">{selected.description}</p>
        <div className="detail-panel"><h2>Product capabilities</h2><ul>{selected.features.map((f) => <li key={f}>{f}</li>)}</ul><p className="notice">{selected.note}</p></div>
        <p className="muted detail-footnote">Product information is available now. Live integrations, data storage, payments and account access must be configured before those services can be used.</p>
      </section>}

      {page === 'about' && <section className="content-page about-page"><div className="eyebrow">ABOUT THE COMPANY</div><h1>Technology with <span>purpose.</span></h1><p>Ghostwire AI is the AI and software division of Ghostwire Syndicate.</p><p>Its product direction brings together three areas: trading technology, AI assistants and real-estate tools. Each product has a distinct purpose while remaining part of the same software business.</p><button className="primary-button" onClick={() => navigate('products')}>View the products ↗</button></section>}

      {page === 'account' && <section className="auth-layout">
        <div className="auth-info"><div className="eyebrow">GHOSTWIRE AI ACCOUNT</div><h1>ACCOUNT<br /><span>ACCESS.</span></h1><p>Account registration and sign-in are not enabled yet. We will not pretend to create an account or tell you that a login succeeded when no authentication service is connected.</p><div className="auth-decoration">GW<span>.</span></div></div>
        <div className="auth-card"><div className="eyebrow">AUTHENTICATION SETUP</div><h2>{authMode === 'login' ? 'Sign-in is not connected' : 'Registration is not connected'}</h2><p className="muted">The current repository has no authentication provider, user database or session service configured.</p><div className="setup-list"><p><b>Required before launch</b></p><ul><li>Cloudflare-backed user database</li><li>Secure password hashing and session handling</li><li>Password recovery and account protection</li></ul></div><button className="primary-button full-width" onClick={() => navigate('products')}>Explore products instead</button><div className="auth-switch">{authMode === 'login' ? 'Need an account? ' : 'Already registered? '}<button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'Registration status' : 'Login status'}</button></div></div>
      </section>}
    </main>

    <footer className="footer"><div className="footer-brand">GHOSTWIRE<span className="blue"> AI</span></div><p>An AI and software division of Ghostwire Syndicate.</p><div className="footer-bottom"><span>© {new Date().getFullYear()} Ghostwire Syndicate.</span><span>BUILD INTELLIGENCE. AUTOMATE THE FUTURE.</span></div></footer>
  </div>;
}

function ProductCard({ product, onOpen }) {
  return <article className="product-card">
    <div className="product-top"><span className="product-icon">{product.mark}</span><span className="status available">PRODUCT AREA</span></div>
    <div className="eyebrow">{product.category}</div><h3>{product.name}</h3><p>{product.description}</p>
    <button className="text-button" onClick={onOpen}>Explore product <span>↗</span></button>
  </article>;
}
