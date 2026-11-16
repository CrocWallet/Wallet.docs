# Install the Extension

Croc Wallet is a self-custodial browser Extension for accessing your wallet on Canton Mainnet.

## Before you install

The Chrome Web Store listing is **not yet available**. The website's Install Extension button remains disabled. Obtain the approved Croc Wallet 1.0.0 package from the deployment owner; do not install another wallet's listing.

Croc Wallet Extension 1.0.0 uses browser permissions for these purposes:

- **Local encrypted data storage:** stores the encrypted wallet vault and Extension settings in browser storage.
- **Clipboard writing:** copies content when you explicitly choose a copy action. This includes addresses and, in backup or export flows, recovery phrases or private keys. Treat clipboard contents from those flows as sensitive.
- **DApp bridge injection:** injects a content script and bridge on all HTTP and HTTPS pages so supported DApps can discover Croc Wallet. The bridge forwards only allow-listed public wallet methods; sensitive approvals remain Extension-owned.
- **Background alarm cleanup:** removes unused background alarm registrations.

## Open Croc Wallet

1. Install and enable Croc Wallet in a Chromium-compatible browser using an approved distribution channel.
2. Open the browser's Extensions menu and pin Croc Wallet for easier access.
3. Select the Croc Wallet icon to open the Extension.
4. Select **Create Wallet** for a new wallet or **Import Wallet** to restore an existing wallet.

## Verify the installed version

In Croc Wallet, open **Settings** and find **Version**. These docs describe the initial version **1.0.0**; a public store release is pending.

## If the Extension does not open

1. Open the browser's extension manager and reload Croc Wallet.
2. Close and reopen the Croc Wallet popup.
3. If Croc Wallet was recently updated, refresh any DApp page that was already open so it can load the current DApp bridge.

Next: [Create a Wallet](create-wallet.md)
