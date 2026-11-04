# Ghostwire AI

Ghostwire AI is the AI and software division of Ghostwire Syndicate.

## Product areas
- **Ghostwire Trade** — trading research, analysis and risk-aware automation.
- **Ghostwire Assistant** — AI assistants for business communication and workflows.
- **Ghostwire Realtor** — real-estate listing and enquiry management.

## Development
```bash
npm install
npm run dev
npm run build
```

## Deployment and production readiness
The current Vite application is a product-information frontend. It does **not** yet provide production authentication, a user database, subscriptions, live AI inference, brokerage connections, property publishing, or persistent lead storage. The account screen intentionally states this instead of presenting a fake successful signup.

Before enabling accounts, configure a Cloudflare-backed authentication/API service, database bindings and secrets; then add password recovery, session security, rate limiting and tests. Payments require a payment provider account and verified webhook handling. Trading integrations require provider credentials, explicit user consent, risk controls and testing. Do not put secrets in frontend code.

Deploy the repair branch to a preview first. Merge into `main` only after the preview and production configuration are verified.
