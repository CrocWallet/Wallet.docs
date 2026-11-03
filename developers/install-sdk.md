# Install the SDK

## Requirements

- Croc Wallet Extension 1.0.0 or newer. These integration examples were checked against the 1.0.0 provider source.
- Node.js 20 or newer for package installation and tests.
- A browser dApp served from an identifiable HTTP or HTTPS origin. The Extension obtains the requesting origin from the browser, not dApp metadata.

The SDK is a preview and has not been published to npm. Obtain the reviewed preview tarball, then install it locally:

```sh
npm install ./croc-wallet-dapp-sdk-1.0.0.tgz
```

```ts
import { MINIMAL_CAPABLE_VERSION, CrocWalletError, crocWallet } from "@croc-wallet/dapp-sdk";

const availability = await crocWallet.checkExtensionAvailability({ timeoutMs: 1500 });
if (availability.status !== "installed" || !availability.isExtensionCapableByVersion) {
  throw new Error(`Croc Wallet ${MINIMAL_CAPABLE_VERSION} or newer is required`);
}
console.log("Installed Extension:", availability.currentVersion);
```

`MINIMAL_CAPABLE_VERSION` is `"1.0.0"`. Croc Wallet Extension, SDK and documentation use the aligned version `1.0.0`.

## Singleton or factory

Use `crocWallet` for browser integration. It resolves `window.crocWallet` when called and waits briefly for `crocWallet#initialized` if injection is still in progress. This event signals injection readiness, not account authorization.

For an existing provider or a test harness, use the factory:

```ts
import { createCrocWalletSdk } from "@croc-wallet/dapp-sdk";

const sdk = createCrocWalletSdk({ provider: window.crocWallet });
```

Supplying a provider selects the delegation target; it does not import credentials. The SDK requires no Backend token or private key.

## Integration contract

- `connect()` and `getSession()` return `UniversalSession`, with `namespaces` and `croc.schemaVersion === 1`; read the approved namespace accounts from this session.
- Read addresses from `session.croc.primaryAddresses` and per-chain accounts from `session.croc.accountsByChain`.
- Use `request({ chainId, method, params })` for supported namespace operations. `chainId` is always explicit.
- Use the typed EVM, Solana and Canton helpers in the [API reference](api-reference.md).
- The SDK does not export account/balance aliases, transfer facade, `signMessage`, `signLoginChallenge`, `status`, `isConnected`, `utils`, or named window-event helpers.

Next: [connect to Croc Wallet](connect-wallet.md).
