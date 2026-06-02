# Admin Panel

MAFL+ includes a built-in admin panel at `/admin` that lets you edit `config.yml` through a visual config builder — directly on your running instance.

## Setup

The admin panel requires two environment variables in your `docker-compose.yml`:

| Variable | Purpose |
|---|---|
| `NUXT_ADMIN_PASSWORD_HASH` | Scrypt hash of your admin password |
| `NUXT_SESSION_PASSWORD` | Random key (min 32 chars) to encrypt session cookies |

### 1. Generate the password hash

The admin password is stored as a scrypt hash in the format `salt:derivedKey` (hex-encoded). Choose any method below to generate it.

**Using Docker (recommended — no local Node.js required):**

```bash
docker run --rm node:22-alpine node -e \
  "c=require('crypto'),s=c.randomBytes(16),c.scrypt(process.argv[1],s,64,(_,k)=>console.log(s.toString('hex')+':'+k.toString('hex')))" \
  your-password
```

Output hash:

```
a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4:e7f8...long-hex-string...
```

### 2. Generate the session key

`NUXT_SESSION_PASSWORD` encrypts the session cookie. It must be a random string of at least 32 characters.

**Using Docker:**

```bash
docker run --rm node:22-alpine node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**

```bash
openssl rand -hex 32
```

### 3. Configure environment variables

Add both values to `docker-compose.yml`:

```yaml
environment:
  - NUXT_ADMIN_PASSWORD_HASH=<output from step 1>
  - NUXT_SESSION_PASSWORD=<output from step 2>
```

### 4. Start / restart the container

```bash
docker compose up -d
```

## Usage

1. Navigate to `http://your-mafl-instance/admin`
2. Enter your admin password
3. The config builder loads your current `config.yml` automatically
4. Edit settings, tabs, groups, and services using the form
5. Click **Save & Apply** — changes are validated and written to `config.yml`
6. The dashboard reloads automatically via WebSocket hot-reload

## Security

- Password is verified server-side using scrypt with constant-time comparison
- Session uses an encrypted httpOnly cookie (secure in production behind HTTPS)
- Login is rate-limited: max 5 failed attempts per 15 minutes per IP
- The `/api/admin/config` endpoint (which serves raw YAML including secrets) is only accessible with a valid session
- If `NUXT_ADMIN_PASSWORD_HASH` is not set, the admin panel shows a "not configured" message and login is disabled
