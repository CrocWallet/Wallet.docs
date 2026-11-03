# Signing and Execution

Every signing or write operation must follow a visible user action. The Extension owns confirmation and key use; the dApp receives only the permitted result.

## Canton messages

```ts
import { crocWallet } from "@croc-wallet/dapp-sdk";

async function signCantonLogin(message: string) {
  return crocWallet.request({
    chainId: "canton:production",
    method: "canton_signMessage",
    params: [{ message }],
  });
}
```

Bind a login challenge to your actual origin, account and intended action. The SDK delegates the result without converting a generic Canton response into a typed EVM signature.

## EVM and Solana

SDK 1.0.0 provides typed helpers:

- `signEvmMessage`: `personal_sign` on an `eip155:*` chain.
- `signEvmTypedData`: `eth_signTypedData_v4` on an `eip155:*` chain.
- `sendEvmTransaction`: `eth_sendTransaction` on an `eip155:*` chain.
- `signSolanaMessage`, `signSolanaTransaction`, `signAndSendSolanaTransaction`: their corresponding `solana_*` methods on a `solana:*` chain.

```ts
import { crocWallet } from "@croc-wallet/dapp-sdk";

async function signEthereumMessage(address: string, message: string) {
  return crocWallet.signEvmMessage({ chainId: "eip155:1", address, message });
}
```

Solana helpers accept serialized wire bytes as `Uint8Array` or valid base64. `signSolanaTransaction` returns `signedTransaction` as `Uint8Array` without broadcasting. `signAndSendSolanaTransaction` broadcasts the approved transaction. Both remain Extension-controlled operations.

## Canton commands

Use `prepareExecute()` for reviewed Daml commands. It prepares commands, opens wallet confirmation, signs locally inside the Extension and submits there. Generate and persist a stable command ID before initiating the action:

```ts
import { crocWallet, type PrepareExecuteParams } from "@croc-wallet/dapp-sdk";

async function executeReviewedCommands(
  commandId: string,
  commands: PrepareExecuteParams["commands"],
  disclosedContracts: PrepareExecuteParams["disclosedContracts"],
) {
  return crocWallet.prepareExecute({
    chainId: "canton:production",
    commandId,
    commands,
    disclosedContracts,
  });
}

async function reconcileCommand(commandId: string) {
  return crocWallet.getCommandStatus({ chainId: "canton:production", commandId });
}
```

`commands` must be a nonempty array. Use only reviewed package-qualified templates and choices accepted by the deployed Extension/backend. Pass the original contract ID, template ID, synchronizer ID and created-event blob when explicit disclosure is required. `packageIdSelectionPreference` accepts explicit pinned package IDs, not arbitrary aliases.

A successful `prepareExecute` returns `{ commandId, updateId }`. If an error occurs after submission, query the original `commandId`, including one retained in provider error data, using `getCommandStatus`. The status is `prepared`, `submitting`, `confirmed` or `unknown`; `updateId` may be null. `unknown` is not proof of failure. Do not repeat execution or create a replacement command ID until the original outcome is reconciled. Rejection is also final for that action.

The SDK methods `submitCommands`, `buildTransfer`, `sendTransfer` and positional `transfer` facade are not exported in 1.0.0. Use the approved namespace methods advertised by the installed Extension. Do not send unsigned or signed payloads directly to private Backend routes.
