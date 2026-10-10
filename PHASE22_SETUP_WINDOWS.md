# JHONNY AI — Phase 22 Windows Setup and npm DNS Recovery

This guide continues the supplied Phase 21 project. It does not replace the application or alter its security model.

## 1. Confirm the project and tool versions

Open PowerShell in the extracted project root (the folder containing `package.json`) and run:

```powershell
node --version
npm --version
npm config get registry
npm cache verify
```

The project declares Node.js `>=22.12.0` and npm `>=10.0.0`. The expected registry is `https://registry.npmjs.org/`.

## 2. Diagnose DNS safely

Run these read-only checks:

```powershell
Resolve-DnsName registry.npmjs.org
nslookup registry.npmjs.org
Test-NetConnection registry.npmjs.org -Port 443
npm ping --fetch-retries=0 --fetch-timeout=15000
npm config get proxy
npm config get https-proxy
```

Interpretation:

- If both `Resolve-DnsName` and `nslookup` fail, Windows/the active network cannot resolve the registry hostname. Check whether other trusted domains resolve and whether the current network/VPN has a DNS incident.
- If DNS resolves but port 443 fails, investigate firewall, VPN, captive portal, or corporate network policy with the network administrator.
- If DNS and HTTPS work but `npm ping` fails, review npm proxy/registry settings and the npm error log before changing configuration.
- `npm config get proxy` and `npm config get https-proxy` should be checked against your actual network requirements. Do not add a proxy unless your organization provides the correct value.

Optional local cache refresh (does not change DNS server configuration):

```powershell
ipconfig /flushdns
```

Then retry `Resolve-DnsName` and `npm ping`. If resolution still fails, use a trusted alternate network or contact the network administrator. Do not disable TLS/certificate checks, turn off security software, or switch to an untrusted package mirror. Do not blindly replace your DNS servers; follow the network administrator's instructions.

## 3. Generate a genuine lockfile after connectivity is restored

The Phase 21 archive has no `package-lock.json`, and Phase 22 could not reach the registry. No lockfile has been fabricated.

Once DNS and HTTPS work, run from the project root:

```powershell
npm install --no-audit --no-fund
```

Confirm that npm created `package-lock.json` and `node_modules`. Inspect the lockfile diff and keep the lockfile with the project. Then verify a clean install:

```powershell
npm ci --no-audit --no-fund
```

Do not run `npm ci` before a real lockfile exists. If npm reports peer-dependency, engine, or audit issues, record the exact output and resolve those issues without silently changing dependency versions or disabling security checks.

## 4. Run frontend validation

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

A command only passes if it completes with exit code 0. A syntax-only transpile is not a substitute for the full TypeScript typecheck. If any command fails, preserve its output, fix the verified cause, and rerun all relevant frontend and backend regression tests.

## 5. Run backend checks

Use the Python environment configured for this project. For example:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
$env:JHONNY_DATA_DIR = (Join-Path (Get-Location) 'backend\data')
$env:JHONNY_DB_PATH = (Join-Path (Get-Location) 'backend\data\jhonny.sqlite3')
python -m compileall -q backend\app backend\tests
$env:PYTHONPATH = 'backend'
python -m pytest backend\tests -q -ra
```

The Phase 22 execution environment freshly verified **37 backend tests passed** and Python compilation passed. Run the checks again on the target machine; these results do not certify the Windows environment or production deployment.

## 6. Current limitations

- No lockfile exists yet because registry DNS failed; dependency installation is not verified.
- Frontend unit tests did not execute because `tsx` is absent.
- Full TypeScript typecheck, ESLint, production build, browser E2E, and npm audit remain blocked or unrun.
- The application is not certified production-ready until the above checks pass and protected workflows are exercised against the actual backend.
