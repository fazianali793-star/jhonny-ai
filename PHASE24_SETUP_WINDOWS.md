# JHONNY AI — Phase 24 Windows Setup and Verification

## 1. Capture the actual Windows network diagnosis

Extract the Phase 24 ZIP into a project folder you control. Open PowerShell in the folder containing `package.json`. First confirm the files and toolchain:

```powershell
Get-Location
Test-Path .\package.json
node --version
npm --version
```

Run the diagnosis-only workflow:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\phase23-windows-verify.ps1
```

By default, the transcript is `phase24-verification.log`. If that file already exists, the script chooses a timestamped filename instead of overwriting it. The transcript is ignored by `.gitignore` and is not included in the ZIP.

## 2. Interpret the evidence

- **`Resolve-DnsName`/`nslookup` fails:** Windows cannot currently resolve the registry host. Check the active network, VPN, DNS policy, and any captive portal with your network administrator. Do not blindly change DNS servers.
- **DNS succeeds but `TcpTestSucceeded` is false:** investigate firewall, VPN, proxy/network routing, captive portal, or outbound TCP/443 policy.
- **DNS and TCP succeed but `curl.exe` reports a certificate or TLS error:** inspect Windows certificate trust, approved HTTPS inspection proxy configuration, system clock, and network security software. Do not disable TLS verification.
- **HTTPS works but `npm ping` fails:** read the exact npm error. Check npm registry and proxy configuration, and whether the configured proxy is reachable. The script logs only whether proxy settings are configured; it intentionally does not print proxy values that may contain credentials.
- **`npm strict-ssl` is not `true`:** the installation mode stops. Restore secure TLS verification and resolve the certificate configuration with the administrator; do not bypass certificate checks.
- **DNS, TCP/443, HTTPS, and `npm ping` succeed:** proceed to the install workflow below.

The script diagnoses only; it does not remotely repair the Windows machine or change DNS, firewall, proxy, or certificate settings.

## 3. Generate the real lockfile and run checks

Only after the diagnosis shows registry connectivity working, run:

```powershell
.\scripts\phase23-windows-verify.ps1 -InstallAndVerify
```

The script checks that npm is configured for `https://registry.npmjs.org/` and that `strict-ssl` is `true`, runs `npm install --no-audit --no-fund` to generate `package-lock.json` through npm, checks that the file exists, then runs `npm ci --no-audit --no-fund`. If the clean install succeeds, it runs:

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

It also attempts backend Python compilation and pytest if Python and pytest are available. Read the transcript for each result and exit code; a completed workflow is not proof that every individual check passed. Review the generated lockfile before committing it. Keep the lockfile as a project change once generated; do not hand-author or fabricate it.

## 4. What to share if it still fails

Share the relevant sections from `phase24-verification.log`:

- `Project and toolchain`
- `DNS and HTTPS diagnosis`
- `Diagnosis-only result`

If the install workflow was run, also share `Generate genuine lockfile and clean-install dependencies` and `Summary`. Redact usernames, internal hostnames, tokens, and any organization-sensitive details. The script redacts npm proxy values by design.

Do not include `.env` files, credentials, private keys, databases, `node_modules`, or npm debug logs that may contain sensitive configuration.
