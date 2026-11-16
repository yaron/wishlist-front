# wishlist-front

Wishlist sites where visitors can claim ("afstrepen") a gift, so nobody buys the same thing twice.
One code base serves several sites, each with its own theme and its own list.

- `src/`: the Svelte front end. `src/index.html` is the template for the page.
- `public/`: static files (themes in `css/`, fonts, illustrations) and the build output.
- `api/`: Azure Functions behind `/api`, storing the items in Cosmos DB.
- `instances.json`: the sites. `scripts/configure-instance.mjs <name>` prepares the checkout for one of them.
- `staticwebapp.config.json`: who may call which route, security headers and caching.

See [DEPLOYMENT.md](DEPLOYMENT.md) for how the sites are deployed and how to add one.

## Development

```sh
npm ci && npm --prefix api ci
node scripts/configure-instance.mjs lijst   # writes public/index.html and public/config.js
npm run dev                                 # needs the Static Web Apps CLI (swa) and Azure Functions Core Tools
npm test                                    # API tests
```

The API needs `CosmosDbConnectionString` (and the `WISH_MAIL*` settings for mail) in
`api/local.settings.json`.

## How it works

- Anyone can view the list and claim an item. Claiming returns a secret key; the browser remembers it
  and it is part of the undo link (`?id=…&key=…`). Only a hash of the key is stored.
- A visitor may leave a mail address to receive the undo link. The address is not stored, and at most
  one mail per item per hour is sent.
- Adding, editing and deleting items is for users with the `administrator` role of the Static Web App.
  This is checked by the route rules and again inside the functions.
- Prices are stored in cents and entered in euros.
