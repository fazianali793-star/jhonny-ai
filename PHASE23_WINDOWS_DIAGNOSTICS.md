# Phase 23 — Windows DNS and verification workflow

1. Extract the Phase 23 ZIP.
2. Open PowerShell in the project root, where `package.json` is located.
3. Run diagnosis first:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\scripts\phase23-windows-verify.ps1
   ```

4. Read `phase23-verification.log`:
   - DNS lookup fails: investigate Windows/network/VPN DNS with your network administrator.
   - DNS succeeds but TCP/443 fails: investigate firewall, VPN, captive portal, or network policy.
   - DNS and TCP work but npm ping fails: inspect the exact npm error and the registry/proxy settings.
5. Do not disable TLS/certificate verification, use untrusted registry mirrors, or change DNS servers without guidance from the network administrator.
6. When the diagnosis script reports DNS, TCP/443, and npm ping are working, run:

   ```powershell
   .\scripts\phase23-windows-verify.ps1 -InstallAndVerify
   ```

   This mode creates `package-lock.json` through `npm install`, verifies `npm ci`, and then runs frontend and backend checks. Read the transcript carefully; an exit code other than zero indicates a failed check.

The script does not repair DNS or modify system networking. It diagnoses and safely stops if the official registry is unreachable.
