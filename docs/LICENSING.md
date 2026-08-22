# RUSH Licensing and Monetization

## Product principle

RUSH should be useful without a subscription. The planned model is:

- **RUSH Free — $0**: core PDF/document work.
- **RUSH Pro — $14.99 one-time planned direct price**: advanced professional tools.

Regional store prices may differ. Educational/institutional volume licensing can be introduced separately without changing local document privacy.

## Free features

Free is intended to include PDF viewing/basic annotations, common page organization, merge/split/rotate, basic compression/conversion, standard DOCX/ODT/RTF/TXT editing, local library/search and basic templates.

## Pro features

Pro is intended for advanced OCR/scanned-document search, advanced PDF redaction/editing, digital certificate signing, premium themes/templates, local version history, batch operations, secure packages and optional local translation.

## Direct-sale licenses

A direct license is a signed JSON entitlement. The user's app stores the signed document locally and verifies it with an Ed25519 public key embedded in the release. The private key used to issue licenses must stay on a controlled Nova Studio Plateformes release/licensing machine and must never be shipped with RUSH.

Example conceptual payload:

```json
{
  "payload": {
    "licenseId": "RUSH-XXXX",
    "plan": "pro",
    "owner": "Customer or organization",
    "source": "direct",
    "issuedAt": "2026-08-22T00:00:00Z",
    "expiresAt": null
  },
  "signature": "BASE64_ED25519_SIGNATURE"
}
```

A one-time perpetual license normally leaves `expiresAt` null. Do not use short recurring online checks merely to make a perpetual offline product stop working.

## Store editions

Microsoft Store and other stores can use their own paid listing/entitlement model. RUSH should only advertise a store after its real listing is public. A paid store build may start as Pro without requiring a separate RUSH account.

## No private activation secret in the app

A symmetric secret inside an Electron/desktop binary will eventually be extractable. RUSH therefore verifies asymmetric signatures using a public key; possession of the public key does not allow an attacker to issue new valid licenses.

## Development

The public repository currently contains a placeholder public-key file. Before a production direct-sale release, generate a real Ed25519 key pair outside GitHub, place only the public key in `desktop/resources/license-public-key.pem`, and protect the private key offline/inside a secret manager.
