# Croc Wallet DApp SDK

`@croc-wallet/dapp-sdk` 1.0.0 connects browser dApps to the Croc Wallet universal provider. It supports Canton, EVM and Solana through explicit CAIP-2 chain IDs.

1. [Install SDK 1.0.0](install-sdk.md) and check Extension availability.
2. [Connect](connect-wallet.md) and retain the approved universal session.
3. Read only approved accounts, [contracts and balances](assets-and-balances.md).
4. Request [signing or execution](signing-and-transfers.md) from a visible user action.
5. Reconcile uncertain Canton commands with the original command ID before continuing.

The SDK never imports wallet keys or supplies Wallet Backend credentials. Unlocking, signing, confirmations and authenticated Backend calls remain inside the Extension.

The initial 1.0.0 API uses universal sessions and explicit namespace requests. See the [API reference](api-reference.md) and [security boundaries](security-boundaries.md).
