```zsh
# refreshes caniuse-lite along with browserslist
aube update --latest browserslist
```

## Deploy

Every push to `main` deploys production through GitHub Actions (`.github/workflows/deploy.yml`): it runs `aube run check` and `biome ci .`, builds with `cf build` and uploads that build with `cf deploy --prebuilt`. It can also be started by hand from the Actions tab (`workflow_dispatch`, `main` only). The build needs the token as well as the upload, because it prerenders through the remote `IMAGES` binding.

One-time setup:

1. In the Cloudflare dashboard, create an API token (Manage Account → Account API Tokens → Create Token → Custom token) for this account with:
   - Account · Workers Scripts · Edit
   - Zone · Workers Routes · Edit, for the zone `alexanderniebuhr.garden` (the custom domain is synced on every deploy)
2. Store it as a repository secret (`gh` prompts for the value, so it stays out of the shell history):

   ```zsh
   gh secret set CLOUDFLARE_API_TOKEN --repo alexanderniebuhr/garden
   ```

`CLOUDFLARE_ACCOUNT_ID` is not needed; `cf` reads `accountId` from `cloudflare.config.ts`.

Manual deploys still work after `cf auth login`:

```zsh
aube run deploy
```

`cf` has no `tail` or `secret put` yet; use `npx wrangler tail alexanderniebuhr-garden` and `npx wrangler secret put <NAME> --name alexanderniebuhr-garden`.
