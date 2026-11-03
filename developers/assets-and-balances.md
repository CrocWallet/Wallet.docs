# Assets, Contracts and Balances

SDK 1.0.0 exposes namespace requests and Canton contract queries. It does not expose a `getAssetCatalog()`, `getCoinsBalance()` or `getCoinsList()` SDK facade. Internal Wallet Backend routes are not a replacement public dApp API.

## Canton holdings

Connect a Canton account, then query a reviewed concrete template or interface visible to that account:

```ts
import { crocWallet } from "@croc-wallet/dapp-sdk";

async function readHoldings(pageToken?: string) {
  return crocWallet.getActiveContracts({
    chainId: "canton:production",
    interfaceId: "#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding",
    limit: 50,
    ...(pageToken === undefined ? {} : { pageToken }),
  });
}
```

The result contains `contracts` and `nextPageToken`. At least one of `templateId` or `interfaceId` is required. `limit` must be an integer from 1 to 100. Pass `nextPageToken` to the next query until it is null.

Each contract includes `contractId`, `templateId`, `payload`, `interfaceViews`, `createdEventBlob` and `synchronizerId`. Retain interface views and the original opaque disclosure blob. Interpret balances only according to the selected template/interface schema; there is no universal `payload.amount` or assumption that every visible holding is spendable.

Queries do not upload a DAR, expand party visibility or authorize an execution. Current Extension/backend template and choice rules still apply.

## EVM native balance

```ts
import { crocWallet } from "@croc-wallet/dapp-sdk";

async function readEthereumBalance() {
  const session = await crocWallet.getSession();
  const chainId = "eip155:1";
  if (!session.croc.accountsByChain[chainId]?.length) {
    throw new Error("Ethereum Mainnet was not approved");
  }
  const address = session.croc.primaryAddresses.eip155;
  if (!address) throw new Error("No EVM account was approved");
  return crocWallet.request({ chainId, method: "eth_getBalance", params: [address, "latest"] });
}
```

`eth_getBalance` returns the RPC result, not a formatted fiat value. Keep amounts in exact integer/decimal representations rather than JavaScript floating-point arithmetic. Other RPC methods remain subject to the Extension's chain and origin permissions.

## Identity and display

Match a Canton instrument by its exact registry identity, or an exact Backend-issued `asset_id` when an approved transfer flow uses that identifier. Display names, aliases and symbols are labels; multiple instruments may share them. Do not select or aggregate different assets by symbol alone.

Read the active account from the approved session and invalidate data when that session changes. A missing price is unknown, not zero, and asset labels do not prove verification or spendability.
