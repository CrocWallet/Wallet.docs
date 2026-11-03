# Security Boundaries

## Public DApp methods

The SDK 1.0.0 facade exposes these methods; this is not the Extension's internal content-script allow-list:

- `checkExtensionAvailability`
- `connect`
- `disconnect`
- `getSession`
- `request`
- `signEvmMessage`
- `signEvmTypedData`
- `sendEvmTransaction`
- `signSolanaMessage`
- `signSolanaTransaction`
- `signAndSendSolanaTransaction`
- `getActiveContracts`
- `prepareExecute`
- `getCommandStatus`
- `getWalletVersion`
- `getEthereumProvider`
- `on`

## Permission and signing boundaries

SDK requests delegate to the injected provider. Universal requests cross the Extension's public `providerRequest` bridge and are checked against the browser-verified origin, approved namespace, chain and account snapshot. Calling a method from page JavaScript does not grant a new permission.

Canton contract reads and Daml execution use the deployed Extension/backend template and choice rules. A contract query cannot create party visibility. SDK installation cannot upload or vet a DAR. Arbitrary `ledgerApi` operations are not enabled by these helpers.

The Extension also has a partial CIP-0103 adapter at `window.crocWallet.cip103`; it is separate from this SDK facade. Do not advertise full CIP-0103 conformance, generic Ledger API access or a complete transaction-event lifecycle from the partial adapter.

Receive preapproval remains an Extension-owned permission and signing flow. The SDK does not expose `croc_get_receive_preapproval` or `croc_set_receive_preapproval`.

## Responsibility boundaries

| Component | Responsibility |
| --- | --- |
| dApp | Use the real served origin, explicit chain IDs and approved accounts; explain the requested action; preserve command IDs and reconcile uncertain outcomes. |
| SDK | Resolve the provider, validate selected inputs, reject wallet-secret-shaped fields, preserve error data and delegate requests. |
| Injected provider and content script | Bridge public requests to the Extension; isolate internal runtime operations from page-origin calls. |
| Extension and local vault | Enforce origin/account permissions, own confirmation, keep keys local, sign approved actions and attach authenticated Backend access. |
| Wallet Backend | Enforce canonical asset/command rules, prepare and submit transactions, and return ledger status through the authorized Extension flow. |

The SDK's secret-field check is a developer guard, not the security boundary: page JavaScript can replace its own SDK. Enforceable separation comes from the Extension, its local vault and Backend checks. The dApp must never collect wallet passwords, private keys, recovery phrases, Backend session tokens or arbitrary signed wallet payloads.

## Rejection and uncertain outcomes

Signing and write requests require explicit wallet confirmation. Treat rejection as final for that user action. For an uncertain Canton submission, query the original command ID with `getCommandStatus`; do not automatically resend or replace the trade. The SDK does not retry these operations.
