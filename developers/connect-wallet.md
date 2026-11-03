# Connect to Croc Wallet

```ts
import { MINIMAL_CAPABLE_VERSION, crocWallet } from "@croc-wallet/dapp-sdk";

async function connectCrocWallet() {
  const availability = await crocWallet.checkExtensionAvailability({ timeoutMs: 1500 });
  if (availability.status !== "installed" || !availability.isExtensionCapableByVersion) {
    throw new Error(`Croc Wallet ${MINIMAL_CAPABLE_VERSION} or newer is required`);
  }
  const session = await crocWallet.connect({
    name: "Croc Docs Example",
    requiredNamespaces: ["canton"],
  });
  if (!session.namespaces.canton) throw new Error("No Canton account was approved");
  console.log("Canton Party ID:", session.croc.primaryAddresses.canton);
  console.log("Accounts by chain:", session.croc.accountsByChain);
  return session;
}
```

`connect()` asks the Extension to connect using the universal session contract. The Extension owns unlock and connection approval. Its permission snapshot is scoped to the browser-verified origin and active profile. The requesting `name` is display metadata, not an origin override.

The session includes the currently approved namespaces. Unsupported or unavailable namespaces are omitted; dApps must check the namespace and the methods they need. Newly enabled chains or accounts are not automatically granted to an already connected site.

## Session fields

| Field | Meaning |
| --- | --- |
| `namespaces.canton`, `namespaces.eip155`, `namespaces.solana` | Approved accounts, advertised methods and events by namespace. |
| `croc.schemaVersion` | `1` for the universal session contract. |
| `croc.primaryAddresses` | Primary public address or Canton Party ID by namespace. |
| `croc.accountsByChain` | Approved CAIP-10 accounts keyed by CAIP-2 chain ID. |
| `croc.activeChains` | Optional active chain IDs by namespace. |

Use `session.croc.primaryAddresses.canton` when a raw Canton Party ID is needed. CAIP-10 account strings encode the Party ID; splitting every colon would corrupt a Party ID containing `::`.

`getSession()` reads the Extension's session snapshot; it does not approve additional access. `disconnect()` ends the site's connection without exporting keys or providing a Backend credential to the dApp. Explicitly reconnect when new access is needed.

## Provider events

```ts
import { crocWallet } from "@croc-wallet/dapp-sdk";

const unsubscribe = await crocWallet.on("accountsChanged", () => {
  // Invalidate displayed account data; refresh the approved session separately.
});
// Call when the view is disposed:
unsubscribe();
```

Events come from the injected provider. The SDK returns an unsubscribe function but does not synthesize transaction lifecycle events. Inspect the session's namespace event declarations before depending on a particular event. If account access changes or the site disconnects, invalidate cached balances and pending UI actions.

A rejection such as code `4001` is final for that user action. An unavailable or disconnected provider commonly reports `4900`, and unsupported methods report `4200`. Preserve the provider's numeric code and data when handling errors; see the [API reference](api-reference.md).
