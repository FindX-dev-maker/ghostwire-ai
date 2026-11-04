# Ghostwire AI — deployment and backend setup

Ghostwire AI is the software division of Ghostwire Syndicate. The product areas are Ghostwire Trade, Ghostwire Assistant and Ghostwire Realtor.

## What is in this branch

- Vite + React frontend served through Cloudflare Workers Static Assets.
- Worker API routes for account registration, sign-in, sign-out, current session and property listings.
- Cloudflare D1 schema for users, hashed-password credentials, sessions and property records.
- Property submissions are saved as drafts. Public publishing and marketplace moderation are not implemented yet.

## Cloudflare configuration

The Worker uses the D1 binding named `DB`. The repository's `wrangler.jsonc` already contains the `ghostwire-ai-db` binding and the database ID supplied for this project. Do not create another database or replace that ID unless the database itself is changed.

The initial schema is in `migrations/0001_initial.sql`. It creates tables and indexes with `IF NOT EXISTS`, so applying it after the same SQL was already run manually in the Cloudflare D1 console will not recreate or erase those tables.

To register the migration in Wrangler's migration history and ensure the remote database has the schema, run this from the repository:

```sh
npx wrangler d1 migrations apply ghostwire-ai-db --remote
```

Then deploy with the existing Cloudflare build settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Assets directory: `./dist`

## Grok API secret

Ghostwire Assistant uses the Groq Chat Completions endpoint with model `openai/gpt-oss-120b`. The API key is read only from the Worker secret `GROQ_API_KEY`; never place it in frontend code, `.env` files committed to Git, or `wrangler.jsonc`.

In the Cloudflare dashboard, open the `ghostwire-ai` Worker, go to Settings → Variables and Secrets, add a secret named `GROQ_API_KEY`, paste your newly generated Groq API key as its value, and save. Redeploy the Worker after adding the secret. The optional Worker variable `GROQ_MODEL` can override the default model, but is not required.

The assistant endpoint is `POST /api/assistant/chat`. It requires a signed-in account and accepts recent user/assistant messages. Groq API usage may incur charges according to your Groq account, model and usage limits. Official API reference: https://console.groq.com/docs/api-reference#chat-create

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

## Not yet implemented

Trading execution, live AI model-provider connections, email verification, password-reset delivery, billing/subscriptions, property image uploads, public property publishing, buyer/seller enquiry workflows and admin moderation still require further implementation and provider configuration. The current Realtor workflow stores authenticated property submissions as drafts; it is not yet a public property marketplace. No API keys or credentials are embedded in this repository.
