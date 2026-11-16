// Prepares the checkout for one instance from instances.json, before it is built and deployed:
// - public/config.js with the title and language of the site
// - public/index.html (from src/index.html) with the title, language and theme stylesheet
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

// The theme, title and language go straight into the page, so the browser can start loading
// the theme without waiting for a script. The version makes every deployment use new URLs,
// which lets staticwebapp.config.json cache the stylesheets and the bundle for a long time.
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
if (!/^[a-z0-9-]+$/.test(instance.theme) || !existsSync(join(root, 'public/css', `${instance.theme}.css`))) {
    console.error(`Unknown theme "${instance.theme}": there is no public/css/${instance.theme}.css`);
    process.exit(1);
}
const themeCss = readFileSync(join(root, 'public/css', `${instance.theme}.css`), 'utf8');
const fonts = [...new Set([...themeCss.matchAll(/url\("\.\.\/fonts\/([\w.-]+\.woff2)"\)/g)].map((m) => m[1]))];
const version = (process.env.GITHUB_SHA || '').slice(0, 8) || Date.now().toString(36);
const page = readFileSync(join(root, 'src/index.html'), 'utf8')
    .replace(/<!-- Template.*-->\n/, '')
    .replaceAll('%LANGUAGE%', escapeHtml(instance.language))
    .replaceAll('%TITLE%', escapeHtml(instance.title))
    .replaceAll('%THEME%', instance.theme)
    .replaceAll('%VERSION%', version)
    .replace('%FONT_PRELOADS%', fonts.map((font) =>
        `\t<link rel='preload' href='/fonts/${font}' as='font' type='font/woff2' crossorigin>`).join('\n'));
writeFileSync(join(root, 'public/index.html'), page);

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
