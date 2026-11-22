```zsh
# refreshes caniuse-lite along with browserslist
aube update --latest browserslist
```

## GitHub Actions

CI lints the complete workflow set with jactionlint's `pedantic` profile and treats warnings as failures. To review workflow edits locally:

```zsh
mise exec -- jactionlint --no-online --strict-exit --min-severity warn
mise exec -- jactionlint --no-online --diff
mise exec -- jactionlint update --diff
mise exec -- jactionlint run --container --dry-run --event pull_request --job check ci
```

Apply only reviewed fixes and dependency updates. Keep each action pinned to a full SHA with a version comment. Run `gh actions-lock --no-narrow` after changing workflow dependencies and `gh actions-lock --verify-local` to check coverage. `jactionlint --suggest-timeouts` needs access to successful GitHub Actions runs and enough samples for each job.

The workflow lint job annotates pull requests. To enable its separate SARIF upload on production runs, set the repository variable `ENABLE_CODE_SCANNING` to `true` once GitHub code scanning is available.

## Deploy

Every push to `main` deploys production through GitHub Actions (`.github/workflows/deploy.yml`): it runs `aube run check` and `biome ci .`, builds with `cf build` and uploads that build with `cf deploy --prebuilt --force`, so the upload overrides any configuration changed outside the repository (for example in the dashboard). It can also be started by hand from the Actions tab (`workflow_dispatch`, `main` only). Only the upload needs the token: the build needs no Cloudflare credentials, so pull requests (`.github/workflows/ci.yml`) run the checks and the build as well, without secrets.

Run `aube exec cf build` before previewing or deploying prebuilt artifacts from an earlier Cloudflare CLI version. The current toolchain uses Build Output v1 in `.cloudflare/output/v1/`.

Images on prerendered pages are compiled at build time with sharp and served as static files; on-demand pages get theirs from the `IMAGES` binding at request time (`imageService: { build: "compile", runtime: "cloudflare-binding" }`). Local dev and preview use miniflare's simulation of that binding, which ignores the requested quality, so on-demand image output there differs from production.

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

Previews are public, and unlike `workers.dev` Previews they get no automatic `X-Robots-Tag: noindex`, so the site sets it itself: `src/worker.ts` adds it to every response the Worker renders on a host other than `alexanderniebuhr.garden`, and a host rule in `public/_headers` adds it to static assets on `*.preview.alexanderniebuhr.garden`. Put Cloudflare Access in front of `preview.alexanderniebuhr.garden` to make them private.

## Worker logs and secrets

Stream production Worker logs with `aube exec cf observability tail --worker alexanderniebuhr-garden`.

To set a secret, replace `SECRET_NAME` with the binding name. The CLI reads the Worker name from `cloudflare.config.ts` and accepts the secret value on standard input.

```zsh
(
  IFS= read -rs 'worker_secret?Secret value: ' && printf '%s' "$worker_secret"
  printf '\n' >&2
) | aube exec cf workers secrets update SECRET_NAME --type secret_text
```
