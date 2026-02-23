# Security & Production Hardening Checklist

Use this checklist before deploying beyond local development.

## 1) Required environment variables (backend)

Set these values in your server environment (not in source code):

- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (minimum 32 characters, random)
- `JWT_EXPIRATION_MS` (example: `3600000` for 1 hour)
- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`

Example (PowerShell, current session):

```powershell
$env:DB_USERNAME="cms_user"
$env:DB_PASSWORD="<strong-password>"
$env:JWT_SECRET="<long-random-secret-min-32-chars>"
$env:JWT_EXPIRATION_MS="3600000"
$env:DEFAULT_ADMIN_USERNAME="admin"
$env:DEFAULT_ADMIN_PASSWORD="<strong-admin-password>"
```

## 2) Backend runtime settings

- Disable SQL logging in production:
  - `spring.jpa.show-sql=false`
- Prefer schema migration tooling (Flyway/Liquibase) over `ddl-auto=update` in production.
- Restrict CORS origin(s) to your frontend domain only.
- Serve via HTTPS behind a reverse proxy (Nginx/Apache/Cloud LB).

## 3) Frontend dependency risk

Current `npm audit` reports moderate vulnerabilities inherited via Vite/esbuild in dev tooling.

Recommended path:

1. Create upgrade branch.
2. Upgrade Vite to latest compatible major.
3. Run full smoke tests for login, enrollments, uploads, assessments.
4. Re-run:
   - `npm audit`
   - `npm run build`

## 4) Build verification commands

Backend:

```bash
cd backend
mvn clean package -DskipTests
```

Frontend:

```bash
cd frontend
npm.cmd run build
```

## 5) Operational safety checks

- Rotate any credentials that were ever committed or shared.
- Ensure MySQL user has least privileges (no global admin access).
- Enable DB backups and recovery testing.
- Enable application logs + alerting for auth failures and 5xx errors.

## 6) Release gate (minimum)

Before release, confirm all are true:

- [ ] No default secrets or passwords in config
- [ ] Strong `JWT_SECRET` configured in environment
- [ ] Admin default password overridden
- [ ] Frontend build succeeds
- [ ] Backend package succeeds
- [ ] Login + critical flows pass smoke test
