# Environment Reference

This page lists the environment variables used by StellarWork and how they differ between local development, Testnet, and Mainnet.

## Frontend Variables

Create `frontend/.env.local` from `frontend/.env.example` for local development.

| Variable | Required | Default | Used by | Description |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_CONTRACT_ID` | Yes | None | `frontend/lib/contract.ts` | Deployed escrow contract ID for the selected network. This is printed by `soroban contract deploy` and usually starts with `C`. |
| `NEXT_PUBLIC_NETWORK` | No | `testnet` | `frontend/lib/stellar.ts` | Selects the Stellar network passphrase and explorer links. Set to `mainnet` for public network; any other value uses Testnet. |
| `NEXT_PUBLIC_SOROBAN_RPC` | No | `https://soroban-testnet.stellar.org` | `frontend/lib/stellar.ts` | Soroban RPC endpoint used for simulations, reads, and transaction submission. Set this explicitly for Mainnet. |
| `NEXT_PUBLIC_NATIVE_TOKEN` | No | Empty string | `frontend/app/post-job/page.tsx` | Optional token contract address used to prefill the Post Job form. Users can still type a token address manually. |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | No | Empty string | `frontend/app/navigation.tsx`, `frontend/app/admin/page.tsx` | Admin Stellar address. When set, the Admin link is shown only to that connected wallet. |

## Local Development

```bash
cd frontend
cp .env.example .env.local
```

For a local Testnet-backed frontend, set at least:

```bash
NEXT_PUBLIC_CONTRACT_ID=<TESTNET_CONTRACT_ID>
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

`NEXT_PUBLIC_NATIVE_TOKEN` and `NEXT_PUBLIC_ADMIN_ADDRESS` are optional, but setting them makes the Post Job and Admin flows easier to test.

## Testnet Notes

- Use a contract deployed with `--network testnet`.
- Keep `NEXT_PUBLIC_NETWORK=testnet`.
- The default Soroban RPC is `https://soroban-testnet.stellar.org`.
- Testnet wallets must be funded separately from Mainnet wallets.
- If the contract is redeployed, update `NEXT_PUBLIC_CONTRACT_ID` and restart the frontend dev server.

## Mainnet Notes

- Use a contract deployed to the Stellar public network.
- Set `NEXT_PUBLIC_NETWORK=mainnet`.
- Set `NEXT_PUBLIC_SOROBAN_RPC` to a Mainnet Soroban RPC endpoint from the deployment provider.
- Use Mainnet token contract addresses for `NEXT_PUBLIC_NATIVE_TOKEN`.
- Verify `NEXT_PUBLIC_ADMIN_ADDRESS` before deployment because it controls access to the Admin UI.
- Never reuse Testnet contract IDs or token addresses on Mainnet.

## Docker Development Variables

`docker-compose.yml` sets these container-only development values:

| Variable | Value | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runs the frontend in development mode. |
| `WATCHPACK_POLLING` | `true` | Improves hot reload reliability with mounted volumes. |
| `CHOKIDAR_USEPOLLING` | `true` | Improves file watching inside Docker. |

The frontend Dockerfile also sets production runtime values such as `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`, and `PORT=3000`. These do not replace the `NEXT_PUBLIC_*` deployment values above.
