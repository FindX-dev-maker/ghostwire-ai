# Ghostwire AI — deployment and backend setup

Ghostwire AI is the software division of Ghostwire Syndicate. The product areas are Ghostwire Trade, Ghostwire Assistant and Ghostwire Realtor.

## What is in this branch

- Vite + React static frontend served through Cloudflare Workers Static Assets.
- Worker API routes for account registration, sign-in, sign-out, current session and property listings.
- D1 migration for users, hashed-password credentials, sessions and property records.
- Property listings are saved as drafts; publishing and public marketplace moderation are intentionally not enabled yet.

## Required Cloudflare setup

The API requires a Cloudflare D1 database. The Worker returns an explicit 503 until the database binding exists; it does not fake successful registration or listing creation. The D1 binding is intentionally not included in `wrangler.jsonc` yet, so the frontend/Worker can deploy without an invented database ID.

1. In Cloudflare, open **Storage & databases → D1 SQL Database** and create a database named `ghostwire-ai-db`.
2. Copy its database ID.
3. Add this D1 binding under the top-level `d1_databases` key in `wrangler.jsonc`, replacing `YOUR_REAL_DATABASE_ID` with the ID Cloudflare gives you:

```jsonc
"d1_databases": [{
  "binding": "DB",
  "database_name": "ghostwire-ai-db",
  "database_id": "YOUR_REAL_DATABASE_ID",
  "migrations_dir": "migrations"
}]
```

4. Run `npx wrangler d1 migrations apply ghostwire-ai-db --remote` from the repository.
5. Deploy using the existing production build settings: `npm run build`, then `npx wrangler deploy`.

For local development, use `npx wrangler d1 migrations apply ghostwire-ai-db --local`.

## API endpoints

- `GET /api/health`
- `POST /api/auth/signup` — name, email, password (minimum 12 characters)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/properties`
- `POST /api/properties` — authenticated; creates a draft
- `DELETE /api/properties/:id` — authenticated owner only

Passwords are PBKDF2-SHA-256 hashed with per-user salts. Session tokens are random, stored only as SHA-256 hashes and sent in Secure, HttpOnly, SameSite=Lax cookies.

## Not yet connected

Trading execution, live AI model providers, email verification, password-reset delivery, billing/subscriptions, file uploads, property publication and admin moderation still require provider configuration and further implementation. No API keys or credentials are embedded in this repository.
