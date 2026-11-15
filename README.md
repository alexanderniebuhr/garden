```zsh
# refreshes caniuse-lite along with browserslist
aube update --latest browserslist
```

## Deploy

Every push to `main` deploys production through GitHub Actions (`.github/workflows/deploy.yml`): it runs `aube run check` and `biome ci .`, builds with `cf build` and uploads that build with `cf deploy --prebuilt`. It can also be started by hand from the Actions tab (`workflow_dispatch`, `main` only). The build needs the token as well as the upload, because it prerenders through the remote `IMAGES` binding, so pull requests (`.github/workflows/ci.yml`) run only the checks, without a build or secrets.

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

## Previews

Production is served only on `alexanderniebuhr.garden`; the Worker has no `workers.dev` URL, for production or for Previews (`workersDev` and `previewUrls` are off). Previews use the custom domain `preview.alexanderniebuhr.garden` (`production: false, previews: true` in `domains`):

```zsh
# creates or updates the Preview named after the current git branch
aube exec cf previews deploy
```

- `https://<preview-name>.preview.alexanderniebuhr.garden` always serves the latest deployment of a Preview.
- `https://<deployment-id>-<preview-name>.preview.alexanderniebuhr.garden` pins one deployment.

Domain settings are applied by a production deploy (`cf deploy`), not by `cf previews deploy`, so the preview hostname exists only after the config has reached `main`. On the first Preview, Cloudflare creates a wildcard DNS record and certificate for `*.preview.alexanderniebuhr.garden`. That wildcard is two levels below the zone, which Universal SSL on the Free plan does not cover, so it may need Advanced Certificate Manager (Total TLS): check that the first Preview URL loads over HTTPS. Provisioning can also take a few minutes after the deploy. The CI token above may need extra zone permissions (DNS, SSL and Certificates) for that DNS and certificate work; if the deploy fails on the domain step, add them.

Previews are public, and unlike `workers.dev` Previews they get no automatic `X-Robots-Tag: noindex`; put Cloudflare Access in front of `preview.alexanderniebuhr.garden` to make them private.

`cf` has no `tail` or `secret put` yet; use `npx wrangler tail alexanderniebuhr-garden` and `npx wrangler secret put <NAME> --name alexanderniebuhr-garden`.
