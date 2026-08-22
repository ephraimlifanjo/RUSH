# Security Architecture

RUSH is a desktop document application. Security goals are: keep document data local by default, expose the smallest practical OS privilege surface, validate external input and make production binaries/resources tamper-evident.

## Electron boundary

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- local Content Security Policy
- renderer receives explicit IPC functions only
- IPC handlers reject untrusted non-`file://` senders
- local file bridges validate existence, extension and size

The renderer never receives an unrestricted `fs`, shell or child-process object.

## Local worker isolation

PDF/document operations run in a separate Python engine process. Expensive OCR/indexing operations have process timeouts and output-size limits in the Electron main process. A C++17 helper is limited to high-performance local discovery/index operations and falls back when unavailable.

## Public HTTPS imports

The importer:

- accepts HTTPS only;
- rejects username/password URLs;
- resolves DNS and blocks loopback/private/link-local destinations;
- restricts MIME/content types;
- enforces a 100 MB download limit;
- stores the result locally in Downloads.

This is intended to reduce SSRF-style access to local network resources and unexpected executable downloads. It is not a malware scanner; users should still trust the source they download from.

## Secure packages

The local secure-package feature uses AES-256-GCM, random salt/IV and a password-derived key using `scrypt`. Expiration can be written into package metadata. Because there is no RUSH backend, expiration is not a remotely revocable server policy. A true expiring share link requires a trusted online storage/access-control service.

## Licensing

Direct Pro licenses are designed as signed entitlement documents. The app verifies them with a public key. The matching private key must stay outside GitHub, outside the installer and outside the user's device.

Store builds may use Store purchase/entitlement APIs instead of direct license files.

## Code signing and tamper detection

Production installers should be code-signed. macOS releases should be signed/notarized where required. RUSH supports a SHA-256 integrity manifest for packaged resources. Release automation must generate a real manifest after final local engines are built.

Anti-debugger tricks and destructive anti-tamper behavior are intentionally avoided: they create false positives and make support/debugging harder. RUSH should stop or warn safely when integrity verification fails, not damage files or the computer.

## Secrets

Never commit:

- direct-license private signing key;
- code-signing certificate/private key;
- certificate passwords;
- Apple notarization credentials;
- store secrets/tokens.

Use GitHub/Vercel/CI secret stores or an isolated release machine.

## Responsible limitations

No downloadable desktop application is impossible to reverse engineer. Obfuscation/native compilation can raise cost but cannot provide mathematical secrecy for code that must execute on an attacker's machine. RUSH's real protection is signed releases, least privilege, public-key licensing, server/store entitlements when used, and no embedded private activation secret.
