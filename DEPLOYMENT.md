# Deployment

Every wishlist site is its own Azure Static Web App, built from this branch.
The sites are listed in [`instances.json`](instances.json):

| Field | Meaning |
| --- | --- |
| `name` | Short name, used by the workflow and `scripts/configure-instance.mjs` |
| `domain` | Public domain, also used for the undo link in the claim mail |
| `title`, `theme`, `language` | Written to `public/config.js` (themes: `summer`, `unicorn`, `butterfly`, `flamingo`, `violin`) |
| `database`, `container` | Cosmos DB database and container with the items of this site |
| `tokenSecret` | Name of the GitHub secret with the deployment token of the Static Web App |

The workflow `.github/workflows/azure-static-web-apps.yml` deploys all sites on every
push to `azure`. A site whose `tokenSecret` is not set is skipped with a warning.
Pull requests get a preview environment on the `lijst` site only.
A single site can be redeployed with **Actions → Azure Static Web Apps CI/CD → Run workflow**
and its name.

To build one site locally: `node scripts/configure-instance.mjs <name> && npm run build`.

## Adding a site

1. **instances.json**: add an entry (or check the existing one).
2. **Cosmos DB**: create the container from `container` in database `database`, with partition
   key `/id` and **without** throughput of its own.
   The free tier gives 1000 RU/s per account, and a container with its own throughput needs at least
   400 RU/s (manual) or 1000 RU/s (autoscale). All sites therefore share the database
   `wishlists`, which has **shared** (database-level) throughput of 400 RU/s for up to 25 containers.
   The portal no longer offers shared throughput, so use the Azure CLI (for example in Cloud Shell)
   with your resource group and Cosmos account name:

   ```sh
   # Once: the database with 400 RU/s shared by all its containers
   az cosmosdb sql database create -g <resource-group> -a <cosmos-account> -n wishlists --throughput 400

   # Per site (items-yarontal, items-yaeltal, ...): a container without --throughput uses the shared throughput
   az cosmosdb sql container create -g <resource-group> -a <cosmos-account> -d wishlists \
     -n items-<site> --partition-key-path /id
   ```
3. **Static Web App**: create one (Free plan is fine). Choose **Other** as deployment source, so
   Azure does not add its own workflow to the repository.
4. **Deployment token**: in the new Static Web App, *Overview → Manage deployment token*. Add it as a
   repository secret (*Settings → Secrets and variables → Actions*) named after `tokenSecret`.
5. **Application settings** (*Settings → Environment variables*) of the new Static Web App:
   - `CosmosDbConnectionString`, `CosmosDbEndpoint`, `CosmosDbKey`: same values as the `lijst` site
   - `WISH_MAILGUN_DOMAIN`, `WISH_MAILGUN_KEY`, `WISH_MAILGUN_EU`, `WISH_MAIL_FROM`, and optionally
     `WISH_MAIL_SUBJECT` / `WISH_MAIL_BODY`
   - `WISH_SITE_URL` is not needed; the link is built from `domain`.
6. **Administrators**: *Settings → Role management → Invite*, with role `administrator`.
   Roles are per Static Web App, so an admin of one site is not an admin of the others.
7. **Custom domain**: add `domain` from `instances.json` (*Settings → Custom domains → Add*) and
   validate it with a CNAME record to the Static Web App's default hostname. Azure's CNAME validation
   does not work on a root domain behind Cloudflare (CNAME flattening), so root domains use `www.`
   in `instances.json` and the root redirects to it. In Cloudflare:
   - `www`: CNAME to `<app>.azurestaticapps.net`, *DNS only*.
   - root (`@`): CNAME to `www.<domain>` (Cloudflare flattens it), proxied, with a Redirect Rule to
     `https://www.<domain>` (301, **Preserve query string** on, so undo links keep their `?id=…&key=…`).
8. **Deploy**: run the workflow for this site, or push to `azure`.
