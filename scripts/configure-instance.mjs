// Prepares the checkout for one instance from instances.json, before it is built and deployed:
// - public/config.js with the title, theme and language of the site
// - the Cosmos database and container of the site in every api/*/function.json
// - api/shared/instance.json, read by the API for the database (itemDelete) and the site URL (mail)
//
// Usage: node scripts/configure-instance.mjs <name>
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2];
const instances = JSON.parse(readFileSync(join(root, 'instances.json'), 'utf8'));
const instance = instances.find((i) => i.name === name);
if (!instance) {
    console.error(`Unknown instance "${name}". Known: ${instances.map((i) => i.name).join(', ')}`);
    process.exit(1);
}

const config = {
    language: instance.language,
    api: '/api',
    theme: instance.theme,
    title: instance.title,
};
writeFileSync(join(root, 'public/config.js'), `var config = ${JSON.stringify(config, null, 4)};\n`);

const apiDir = join(root, 'api');
let bindings = 0;
for (const fn of readdirSync(apiDir, { withFileTypes: true })) {
    const file = join(apiDir, fn.name, 'function.json');
    if (!fn.isDirectory() || !existsSync(file)) continue;
    const definition = JSON.parse(readFileSync(file, 'utf8'));
    for (const binding of definition.bindings) {
        if (binding.type !== 'cosmosDB') continue;
        binding.databaseName = instance.database;
        binding.collectionName = instance.container;
        bindings++;
    }
    writeFileSync(file, JSON.stringify(definition, null, 2) + '\n');
}

writeFileSync(join(apiDir, 'shared/instance.json'), JSON.stringify({
    name: instance.name,
    siteUrl: `https://${instance.domain}/`,
    database: instance.database,
    container: instance.container,
}, null, 4) + '\n');

console.log(`Configured "${instance.name}" (${instance.domain}): theme ${instance.theme}, ` +
    `${instance.database}/${instance.container} in ${bindings} bindings.`);
