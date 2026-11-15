// Settings of the instance this API is deployed for, written by scripts/configure-instance.mjs
// during deployment. The defaults are the original lijst.ytal.nl instance, for local development.
const defaults = {
    name: 'lijst',
    siteUrl: '',
    database: 'wishlists',
    container: 'items-lijst',
};

let instance = {};
try {
    instance = require('./instance.json');
} catch (e) {
    // Not configured: use the defaults.
}

module.exports = { ...defaults, ...instance };
