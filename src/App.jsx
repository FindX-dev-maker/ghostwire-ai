import React, { useEffect, useState } from 'react';

const products = [
  { id: 'trade', name: 'Ghostwire Trade', category: 'TRADING TECHNOLOGY', mark: '↗', description: 'A trading workspace for market analysis, strategy research and risk-aware automation.', features: ['Market and watchlist analysis', 'Strategy testing and signal review', 'Risk controls and activity monitoring'], note: 'Trading involves risk. No returns are guaranteed and automated execution must be explicitly configured.' },
  { id: 'assistant', name: 'Ghostwire Assistant', category: 'AI ASSISTANTS', mark: '✳', description: 'AI assistants designed to answer questions, support customers and handle repeatable business workflows.', features: ['Business and customer-support assistants', 'Knowledge-base powered answers', 'Workflow and prompt configuration'], note: 'Connect a model provider and your approved knowledge sources before enabling live assistant responses.' },
  { id: 'realtor', name: 'Ghostwire Realtor', category: 'REAL ESTATE TECHNOLOGY', mark: '⌂', description: 'A workspace concept for property professionals to organize listings, buyer enquiries and seller leads.', features: ['Property listing records and media', 'Buyer and seller enquiry tracking', 'Lead follow-up and listing status management'], note: 'Property publication, messaging and lead storage require a configured backend and appropriate permissions.' }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [propertyMessage, setPropertyMessage] = useState('');
  const [propertyBusy, setPropertyBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (response.status === 401) return null;
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not verify your session.');
        return result.user || null;
      })
      .then((user) => { if (active) setCurrentUser(user); })
      .catch(() => { if (active) setCurrentUser(null); })
      .finally(() => { if (active) setSessionLoading(false); });
    return () => { active = false; };
  }, []);

  const submitAuth = async (event) => {
    event.preventDefault(); setAuthBusy(true); setAuthMessage('');
    try {
      const response = await fetch(`/api/auth/${authMode}`, { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ name: authName, email: authEmail, password: authPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Request failed.');
      setAuthMessage(result.message || (authMode === 'login' ? `Signed in as ${result.user?.email || authEmail}.` : 'Account created. Please sign in.'));
      if (authMode === 'signup') { setAuthMode('login'); setAuthPassword(''); }
      else { setCurrentUser(result.user || null); setAuthPassword(''); }
    } catch (error) { setAuthMessage(error.message || 'Could not connect to the account service.'); }
    finally { setAuthBusy(false); }
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Sign out failed. Please try again.');
      setCurrentUser(null);
      setAuthMessage('You have been signed out.');
      setAuthMode('login');
      navigate('account');
    } catch (error) { setAuthMessage(error.message || 'Could not sign out.'); }
  };

  const loadProperties = async () => {
    setPropertyBusy(true); setPropertyMessage('');
    try { const response = await fetch('/api/properties'); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not load listings.'); setProperties(result.properties || []); }
    catch (error) { setPropertyMessage(error.message || 'Could not load listings.'); }
    finally { setPropertyBusy(false); }
  };

  const createProperty = async (event) => {
    event.preventDefault(); setPropertyBusy(true); setPropertyMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try { const response = await fetch('/api/properties', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Could not save listing.'); setPropertyMessage(result.message); formElement.reset(); await loadProperties(); }
    catch (error) { setPropertyMessage(error.message || 'Could not save listing.'); }
    finally { setPropertyBusy(false); }
  };

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
        {currentUser ? <button className="login-button" onClick={() => navigate('account')}>{currentUser.name || currentUser.email}</button> : <button className="login-button" onClick={() => { setAuthMode('login'); navigate('account'); }}>Log in</button>}
        {currentUser ? <button className="primary-button small" onClick={signOut}>Sign out</button> : <button className="primary-button small" onClick={() => { setAuthMode('signup'); navigate('account'); }}>Create account ↗</button>}
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
        {selected.id === 'realtor' && <div className="detail-panel realtor-workspace"><h2>Property workspace</h2><p className="muted">Create property records and review published listings. New submissions are saved as drafts until publishing and verification are enabled.</p>{currentUser ? <form className="listing-form" onSubmit={createProperty}><label>Property title<input name="title" required maxLength="120" placeholder="e.g. 3-bedroom family home" /></label><label>Description<textarea name="description" required maxLength="3000" placeholder="Describe the property" /></label><label>Location<input name="location" required placeholder="City, region, country" /></label><div className="listing-fields"><label>Price<input name="price" type="number" min="1" step="0.01" required placeholder="Price" /></label><label>Currency<select name="currency"><option value="USD">USD</option><option value="NGN">NGN</option><option value="GBP">GBP</option><option value="EUR">EUR</option></select></label></div><div className="listing-fields"><label>Property type<select name="property_type"><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label><label>Bedrooms<input name="bedrooms" type="number" min="0" defaultValue="0" /></label><label>Bathrooms<input name="bathrooms" type="number" min="0" defaultValue="0" /></label></div><label>Image URL (optional)<input name="image_url" type="url" placeholder="https://…" /></label><button className="primary-button" disabled={propertyBusy}>{propertyBusy ? 'Saving…' : 'Save property draft'}</button></form> : <p className="notice">{sessionLoading ? 'Checking your account…' : <>You must <button className="text-button" type="button" onClick={() => { setAuthMode('login'); navigate('account'); }}>sign in</button> before you can submit a property draft.</>}</p>}<div className="listing-results"><div className="listing-results-head"><h3>Published listings</h3><button className="outline-button" type="button" onClick={loadProperties} disabled={propertyBusy}>{propertyBusy ? 'Loading…' : 'Refresh'}</button></div>{propertyMessage && <p className="notice" role="status">{propertyMessage}</p>}{properties.length ? properties.map((item) => <article className="listing-item" key={item.id}><b>{item.title}</b><span>{item.location} · {item.currency} {Number(item.price).toLocaleString()}</span></article>) : <p className="muted">No published properties are available yet.</p>}</div></div>}
        <p className="muted detail-footnote">Product information is available now. Live integrations, data storage, payments and account access must be configured before those services can be used.</p>
      </section>}

      {page === 'about' && <section className="content-page about-page"><div className="eyebrow">ABOUT THE COMPANY</div><h1>Technology with <span>purpose.</span></h1><p>Ghostwire AI is the AI and software division of Ghostwire Syndicate.</p><p>Its product direction brings together three areas: trading technology, AI assistants and real-estate tools. Each product has a distinct purpose while remaining part of the same software business.</p><button className="primary-button" onClick={() => navigate('products')}>View the products ↗</button></section>}

      {page === 'account' && <section className="auth-layout">
        <div className="auth-info"><div className="eyebrow">GHOSTWIRE AI ACCOUNT</div><h1>ACCOUNT<br /><span>ACCESS.</span></h1><p>Sign in to manage your Ghostwire account and submit property drafts. Your account session is securely maintained by the Ghostwire service.</p><div className="auth-decoration">GW<span>.</span></div></div>
        <div className="auth-card"><div className="eyebrow">GHOSTWIRE ACCOUNT</div><h2>{currentUser ? 'You’re signed in.' : authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p className="muted">Secure account access is provided by the Ghostwire Worker API. Passwords must be at least 12 characters.</p><form className="listing-form" onSubmit={submitAuth}>{authMode === 'signup' && <label>Full name<input value={authName} onChange={(e) => setAuthName(e.target.value)} autoComplete="name" required minLength="2" maxLength="80" /></label>}<label>Email address<input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength="12" maxLength="128" required /></label><button className="primary-button full-width" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button></form>{currentUser && <p className="notice" role="status">Signed in as {currentUser.name} ({currentUser.email}).</p>}{authMessage && <p className="notice" role="status">{authMessage}</p>}{currentUser && <button className="outline-button" type="button" onClick={signOut}>Sign out</button>}<div className="auth-switch">{authMode === 'login' ? 'Need an account? ' : 'Already have an account? '}<button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthMessage(''); }}>{authMode === 'login' ? 'Create account' : 'Sign in'}</button></div></div>
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
