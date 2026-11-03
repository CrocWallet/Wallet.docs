# SDK 1.0.0 API Reference

These signatures describe the preview `@croc-wallet/dapp-sdk@1.0.0` package. The Extension remains the authority for available chains, origin permissions and operations.

## Exports

The runtime exports `MINIMAL_CAPABLE_VERSION` (`"1.0.0"`), `CROC_WALLET_INITIALIZED_EVENT` (`"crocWallet#initialized"`), `CrocWalletError`, `createCrocWalletSdk`, and the singleton `crocWallet` (also the default export). TypeScript declarations ship with the package.

## Availability and connection

| Method | Result and behavior |
| --- | --- |
| `checkExtensionAvailability({ timeoutMs }?)` | `AvailabilityResponse`: installed status, current/minimum version and `isExtensionCapableByVersion`. Absence resolves to `notInstalled`; forbidden secret-shaped options throw `-32602`. |
| `getWalletVersion({ timeoutMs }?)` | Provider version as a string; missing or malformed versions become `"0.0.0"`. |
| `connect(request?: ConnectRequest)` | `UniversalSession`; accepts `name`, `icon`, `requiredNamespaces` and `timeoutMs`. Delegates with `universal: true`. |
| `getSession({ timeoutMs }?)` | Current `UniversalSession`; missing provider support throws `4200`. |
| `disconnect({ timeoutMs }?)` | Provider result; a provider without this optional method gets `{ status: true }`. |
| `on(event, listener, { timeoutMs }?)` | `Promise<() => void>`; subscribes to provider events and returns an unsubscribe callback. |
| `getEthereumProvider({ timeoutMs }?)` | Croc Wallet's injected EIP-1193 view when `window.ethereum.isCrocWallet` is true; otherwise `4900`. |

`UniversalSession` contains `namespaces` and `croc.schemaVersion === 1`. It is not the old `ConnectResponse`. See [session fields](connect-wallet.md).

## Universal requests

`request({ chainId, method, params?, timeoutMs? }): Promise<unknown>` delegates to the injected provider. `chainId` is an explicit CAIP-2 ID such as `canton:production`, `eip155:1` or `solana:mainnet`; namespace aliases such as `evm` and `sol` are not used. Request parameters are validated and wallet-secret fields are rejected before delegation.

`timeoutMs` bounds SDK provider discovery; it is forwarded with universal requests, but does not guarantee an execution deadline or cancel an already submitted command. A caller-side timeout is not evidence that an operation failed.

## Typed signing helpers

| Method | Required input | Result |
| --- | --- | --- |
| `signEvmMessage` | `chainId: EvmChainId`, `address`, `message` | `Promise<string>` |
| `signEvmTypedData` | `chainId: EvmChainId`, `address`, object or JSON-string `typedData` | `Promise<string>` |
| `sendEvmTransaction` | `chainId: EvmChainId`, `transaction` | `Promise<string>` |
| `signSolanaMessage` | `chainId: SolanaChainId`, bytes/base64 `message` | `{ address, signature }` |
| `signSolanaTransaction` | `chainId: SolanaChainId`, bytes/base64 `transaction`, optional `options` | `{ signedTransaction: Uint8Array }` |
| `signAndSendSolanaTransaction` | Same Solana transaction input | `{ signature }` |

All accept optional `timeoutMs`. EVM helpers route `personal_sign`, `eth_signTypedData_v4` and `eth_sendTransaction`; Solana helpers route the corresponding `solana_*` methods. They do not sign with dApp-supplied keys.

## Canton helpers

| Method | Input | Result |
| --- | --- | --- |
| `getActiveContracts` | `chainId: CantonChainId`; `templateId` or `interfaceId`; optional `limit`, `pageToken`, `timeoutMs` | `{ contracts: CantonActiveContract[], nextPageToken: string \| null }` |
| `prepareExecute` | `chainId: CantonChainId`, nonempty `commands`; optional `disclosedContracts`, `commandId`, `synchronizerId`, `packageIdSelectionPreference`, `timeoutMs` | `{ commandId, updateId }` |
| `getCommandStatus` | `chainId: CantonChainId`, nonempty `commandId`; optional `timeoutMs` | `{ commandId, status, updateId: string \| null }` |

`CantonChainId` is a `canton:*` CAIP-2 string. Query `limit` is an integer from 1 to 100. Status values are `prepared`, `submitting`, `confirmed` and `unknown`. A contract includes concrete `payload`, `interfaceViews`, `createdEventBlob` and `synchronizerId`; disclosures retain the original four identity/blob fields. Execution remains subject to deployed template and choice allowlists.

## Errors

`CrocWalletError` carries a numeric `code` and optional provider `data`. Numeric provider codes and data are retained. SDK parameter/secret-field errors use `-32602`, unsupported provider methods use `4200`, and provider absence uses `4900`. Rejections commonly use `4001`; invalid universal sessions or signed-transaction responses use `-32603`. An unrecognized nonnumeric provider error defaults to `4900`; text-matching normalization and `causeCode` are not part of this API.

The SDK never automatically retries signing, execution or an uncertain result. Preserve command reconciliation data and follow [signing and execution](signing-and-transfers.md).

## API boundaries

Account/network aliases, catalog/balance methods, generic `signMessage`, `signLoginChallenge`, transfer/offer facade, `status`, `isConnected`, `utils`, and named window-event helpers are not part of SDK 1.0.0. Their presence on an Extension provider does not make them SDK methods. Use universal sessions, supported namespace requests and `on()` instead.
