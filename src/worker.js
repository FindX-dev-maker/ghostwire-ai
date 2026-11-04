const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

const cookie = (value, maxAge) =>
  `gw_session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

async function passwordHash(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" }, material, 256);
  return { salt: bytesToBase64(salt), hash: bytesToBase64(bits) };
}

async function passwordMatches(password, salt, expected) {
  const actual = await passwordHash(password, base64ToBytes(salt));
  const a = base64ToBytes(actual.hash), b = base64ToBytes(expected);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function sessionToken() {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(32))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function sha256(value) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function readCookie(request, name) {
  const entry = (request.headers.get("cookie") || "").split(";").map((v) => v.trim()).find((v) => v.startsWith(name + "="));
  return entry ? entry.slice(name.length + 1) : null;
}
async function body(request) {
  try { return await request.json(); } catch { return null; }
}
function validEmail(value) { return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254; }

async function currentUser(request, db) {
  const token = readCookie(request, "gw_session");
  if (!token) return null;
  return db.prepare("SELECT users.id, users.email, users.name, users.role FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')").bind(await sha256(token)).first();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": url.origin, "access-control-allow-methods": "GET,POST,DELETE,OPTIONS", "access-control-allow-headers": "content-type" } });
    if (url.pathname === "/api/health" && request.method === "GET") return json({ status: "ok", database: Boolean(env.DB), assistantConfigured: Boolean(env.GROQ_API_KEY) });
    if (url.pathname.startsWith("/api/") && !env.DB && !url.pathname.startsWith("/api/assistant/")) return json({ error: "Backend database is not configured. Check the Ghostwire D1 binding." }, 503);

    if (url.pathname === "/api/auth/signup" && request.method === "POST") {
      const data = await body(request);
      if (!data || !validEmail(data.email) || typeof data.password !== "string" || data.password.length < 12 || data.password.length > 128 || typeof data.name !== "string" || data.name.trim().length < 2 || data.name.length > 80) return json({ error: "Enter a valid name and email. Passwords must be 12–128 characters." }, 400);
      const email = data.email.trim().toLowerCase();
      const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      if (existing) return json({ error: "An account with this email already exists." }, 409);
      const { salt, hash } = await passwordHash(data.password);
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO users (id,email,name,password_hash,password_salt,role,created_at) VALUES (?,?,?,?,?,'customer',datetime('now'))").bind(id,email,data.name.trim(),hash,salt).run();
      return json({ message: "Account created. Sign in to continue." }, 201);
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const data = await body(request);
      if (!data || !validEmail(data.email) || typeof data.password !== "string") return json({ error: "Enter your email and password." }, 400);
      const user = await env.DB.prepare("SELECT id,email,name,role,password_hash,password_salt FROM users WHERE email = ?").bind(data.email.trim().toLowerCase()).first();
      if (!user || !(await passwordMatches(data.password,user.password_salt,user.password_hash))) return json({ error: "Email or password is incorrect." }, 401);
      const token = sessionToken(), tokenHash = await sha256(token);
      await env.DB.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at,created_at) VALUES (?,?,?,datetime('now','+7 days'),datetime('now'))").bind(crypto.randomUUID(),user.id,tokenHash).run();
      return json({ user: { id:user.id,email:user.email,name:user.name,role:user.role } }, 200, { "set-cookie": cookie(token, 604800) });
    }

    if (url.pathname === "/api/auth/logout" && request.method === "POST") {
      const token = readCookie(request,"gw_session");
      if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
      return json({ message:"Signed out." },200,{"set-cookie":cookie("",0)});
    }

    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const user = await currentUser(request,env.DB);
      return user ? json({ user }) : json({ user:null },401);
    }

    if (url.pathname === "/api/assistant/chat" && request.method === "POST") {
      if (!env.GROQ_API_KEY) return json({ error: "Ghostwire Assistant is not connected yet. The GROQ_API_KEY secret is missing." }, 503);
      const user = env.DB ? await currentUser(request, env.DB) : null;
      if (!user) return json({ error: "Sign in to use Ghostwire Assistant." }, 401);
      const data = await body(request);
      if (!data || !Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > 12) return json({ error: "Send between 1 and 12 recent messages." }, 400);
      const messages = [];
      for (const item of data.messages) {
        if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string" || !item.content.trim() || item.content.length > 4000) return json({ error: "Each message must contain valid text of up to 4,000 characters." }, 400);
        messages.push({ role: item.role, content: item.content.trim() });
      }
      if (messages[messages.length - 1].role !== "user") return json({ error: "The last message must be from you." }, 400);
      try {
        const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "authorization": `Bearer ${env.GROQ_API_KEY}`, "content-type": "application/json" },
          body: JSON.stringify({
            model: env.GROQ_MODEL || "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are Ghostwire Assistant, the official AI assistant inside Ghostwire AI, a software division of Ghostwire Syndicate. Be helpful, accurate, practical and clear. Do not claim to execute trades, move money, access accounts, publish properties or perform external actions unless an enabled tool actually does so. For financial topics, explain risks and never promise returns." },
              ...messages
            ],
            temperature: 0.7,
            max_tokens: 1200
          }),
          signal: AbortSignal.timeout(45000)
        });
        const result = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const message = upstream.status === 401 || upstream.status === 403
            ? "The Groq API rejected the configured key. Check the GROQ_API_KEY secret."
            : upstream.status === 429
              ? "The Grok API rate limit or account quota was reached. Check your Groq API credits and limits."
              : "Groq could not complete the request. Please try again shortly.";
          return json({ error: message }, upstream.status === 429 ? 429 : 502);
        }
        const answer = result.choices?.[0]?.message?.content;
        if (typeof answer !== "string" || !answer.trim()) return json({ error: "Groq returned an empty response. Please try again." }, 502);
        return json({ answer: answer.trim(), model: result.model || env.GROQ_MODEL || "llama-3.3-70b-versatile" });
      } catch (error) {
        return json({ error: error?.name === "TimeoutError" ? "Grok took too long to respond. Please try again." : "Could not reach the Groq API. Check the Worker network request and try again." }, 502);
      }
    }

    if (url.pathname === "/api/properties" && request.method === "GET") {
      const status = url.searchParams.get("status") === "all" ? null : "published";
      const query = status
        ? env.DB.prepare("SELECT id,title,description,price,currency,location,bedrooms,bathrooms,property_type,image_url,status,created_at FROM properties WHERE status = ? ORDER BY created_at DESC LIMIT 100").bind(status)
        : env.DB.prepare("SELECT id,title,description,price,currency,location,bedrooms,bathrooms,property_type,image_url,status,created_at FROM properties ORDER BY created_at DESC LIMIT 100");
      const { results } = await query.all();
      return json({ properties: results });
    }

    if (url.pathname === "/api/properties" && request.method === "POST") {
      const user = await currentUser(request,env.DB);
      if (!user) return json({ error:"Sign in before creating a property listing." },401);
      const data = await body(request);
      const required = ["title","description","location","property_type","currency"];
      if (!data || required.some((key) => typeof data[key] !== "string" || !data[key].trim()) || !Number.isFinite(Number(data.price)) || Number(data.price) <= 0) return json({ error:"Complete the title, description, location, property type, currency and a valid price." },400);
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO properties (id,owner_id,title,description,price,currency,location,bedrooms,bathrooms,property_type,image_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?, 'draft',datetime('now'))")
        .bind(id,user.id,data.title.trim(),data.description.trim(),Number(data.price),data.currency,data.location.trim(),Number(data.bedrooms)||0,Number(data.bathrooms)||0,data.property_type,data.image_url || null).run();
      return json({ message:"Listing saved as a draft. Review it before publishing.", id },201);
    }

    if (url.pathname.startsWith("/api/properties/") && request.method === "DELETE") {
      const user = await currentUser(request,env.DB);
      if (!user) return json({ error:"Sign in first." },401);
      const id = url.pathname.split("/").pop();
      const result = await env.DB.prepare("DELETE FROM properties WHERE id = ? AND owner_id = ?").bind(id,user.id).run();
      return result.meta.changes ? json({ message:"Listing deleted." }) : json({ error:"Listing not found or you do not own it." },404);
    }

    if (url.pathname.startsWith("/api/")) return json({ error:"API route not found." },404);
    return env.ASSETS.fetch(request);
  },
};
