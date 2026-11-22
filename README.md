## Dependencies

Use `aubr <script>` for package scripts and `aubx <package>@<exact-version>` for one-off tools. CI installs with `aube ci` and checks for high and critical advisories and redundant resolutions. Production builds attach a CycloneDX SBOM. The monthly Dependency report workflow publishes license and deprecation inventories.

```zsh
aube update --latest --interactive
aube update --latest browserslist # also refreshes caniuse-lite
aube audit --audit-level high
aube audit --audit-level high --fix --interactive
aube dedupe --check
```

Review any generated overrides and lockfile changes. For a temporary upstream fix, use `aube patch <package>@<version>` and `aube patch-commit <directory>` and commit the patch with the lockfile. Aube's `paranoid` bundle enforces the build allowlist, jailed scripts, integrity checks, and a 24-hour release cooldown. The TypeScript 7.1 development series has a narrowly scoped age exemption for its nightlies.

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

## Writing posts

Put `.md` and `.mdx` posts under `src/content/blog/<locale>/`. Use the Astro VS Code extension for collection frontmatter hints and `mise exec -- aube exec --no-install astro sync` to refresh generated types. Use `draft: true` to keep a post out of the site and feed. Add `related: [en/pigsty]` to declare a relationship by collection ID. Published posts can reference only existing published posts.

## Local development

```zsh
mise install --locked
mise run setup
mise run dev
mise run check
mise run build
mise run preview
```

Mise installs JavaScript dependencies when the manifests change or the local binaries are missing. Use `mise deps --list` to inspect the provider and `.env.local` for per-machine settings. Use `mise run build:timings` to profile Astro or `mise run build:cached` to reuse a local production build when its inputs are unchanged. CI always builds fresh.

An alternative to foreground `mise run dev` is `mise daemons start astro`. Use `mise daemons urls` for the worktree's URL and `mise daemons stop astro` to stop it. Astro also supports `mise exec -- aube exec --no-install astro dev --background` and `mise exec -- aube exec --no-install astro preview --background` after an Astro build. Use the corresponding `stop` subcommand to shut those servers down.

Use `mise run build:csp` to build the opt-in Astro content security policy trial, then run `mise exec -- aube exec --no-install astro preview` to inspect that build. The normal build leaves the trial disabled.

### Repository checks

`mise run setup` installs check-only commit hooks and a type-checking pre-push hook. Use `mise run lint` for repository-wide checks, or `mise exec -- hk check --pr` for branch changes. Add `--plan` or `--why` to see which files and steps hk chooses. Use `mise exec -- hk check --all --slow` to include a Cloudflare build. CI attaches hk's SARIF and JUnit reports.

## Deploy

Every push to `main` deploys production through GitHub Actions (`.github/workflows/deploy.yml`). `mise run ci` runs the checks in parallel and builds with `cf build` after they pass. Deployment uploads that build with `cf deploy --prebuilt --force`, so repository configuration overrides changes made in the dashboard. You can also start the production workflow from the Actions tab on `main`. Only the upload uses the Cloudflare token. The pull request workflow runs the shared verification and build without it.

Run `mise run build` before previewing or deploying prebuilt artifacts from an earlier Cloudflare CLI version. The current toolchain uses Build Output v1 in `.cloudflare/output/v1/`.

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
mise -E production run deploy
```

For the optional fnox path, configure `CLOUDFLARE_API_TOKEN` through a provider in your gitignored `fnox.toml`, then run `mise -E production run deploy:token`. Mise provides the token to that task only.

## Previews

Production is served only on `alexanderniebuhr.garden`; the Worker has no `workers.dev` URL, for production or for Previews (`workersDev` and `previewUrls` are off). Previews use the custom domain `preview.alexanderniebuhr.garden` (`production: false, previews: true` in `domains`):

```zsh
mise -E preview run preview:deploy my-branch
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
