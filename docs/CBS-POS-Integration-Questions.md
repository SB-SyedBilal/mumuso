# CBS Pakistan POS Integration Questionnaire

Use this checklist when speaking with Mumuso's CBS Pakistan contact so we get every detail needed to wire our loyalty backend into their POS environment.

## 1. Deployment Footprint & Versioning
- CBS POS product name, version/build per store.
- Operating system on cashier terminals (Windows, Android, custom appliance?).
- How often do they roll out CBS updates, and who approves third-party integrations?
- Are there staging/sandbox environments mirroring production stores?

## 2. Hardware & Peripherals
- Scanner models bundled with CBS (USB/Bluetooth, 1D vs 2D/QR capable).
- Do scanners operate in keyboard-wedge mode (plain text input) or require a driver/sdk?
- Any cameras/tablets used for scanning instead of dedicated scanners?
- Cash drawer/printer requirements if our workflow needs receipts mentioning discounts.

## 3. POS Workflow Hooks
- Can we add custom buttons/modules inside the CBS cashier UI? If yes, how (plugin, script, embedded web view)?
- Does CBS expose events or webhooks we can intercept when a sale starts/ends?
- Can CBS call external HTTPS APIs during checkout (e.g., our `/cashier/validate`)?
- Offline mode behavior: how does CBS queue calls or data when internet drops?

## 4. API & Data Exchange
- Existing API documentation or SDK for CBS partners.
- Supported auth methods (API keys, OAuth, mutual TLS, VPN whitelisting).
- Request/response schemas for sending member ID, store ID, transaction totals, line items.
- Maximum payload size, rate limits, timeout expectations.
- Ability to receive our responses back into the POS UI (display discount pct, error messages).

## 5. Inventory & Transaction Data
- What transaction data can CBS provide in real time (item list, quantities, gross amount, tax, discounts)?
- Can CBS push finalized transaction summaries to our backend automatically?
- If only batch exports are possible, what formats/schedules are supported (CSV/SFTP/API) and can records include Member ID or QR token?

## 6. Security & Networking
- Network topology for store terminals (public internet, VPN, MPLS?).
- IP ranges/domains we must whitelist on both sides.
- Encryption requirements (TLS versions, certificates, device management policies).
- Audit/compliance expectations when third parties integrate.

## 7. User Management & Access Controlcls

- How are cashier accounts managed in CBS (central directory vs per-terminal)?
- Can we map our cashier IDs to theirs, or do we need a lookup table?
- Process for provisioning/revoking cashier access to any custom module we deploy.

## 8. Support & Escalation
- Primary technical contact at CBS Pakistan for integrations.
- SLA/response times for incidents and deployment requests.
- Required documentation or forms before they enable external API access.

## 9. Timeline & Dependencies
- Earliest date CBS can provide sandbox credentials or hardware for testing.
- Change-control steps Mumuso must follow to roll out the integration chain-wide (pilot store, phased rollout?).
- Any licensing or additional fees for enabling third-party integrations.

Collecting the above from Mumuso's CBS contact ensures we understand the hardware, software, and process constraints before committing to build the POS-to-loyalty flow.
