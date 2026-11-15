// Copies every item from one Cosmos DB container to another, keeping the ids, and checks the result.
// Running it again is safe: items are upserted, so nothing is duplicated.
//
// Usage (needs `npm install` in api/ for @azure/cosmos):
//   COSMOS_ENDPOINT=https://<account>.documents.azure.com:443/ COSMOS_KEY=<key> \
//     node scripts/copy-container.mjs <source-db>/<source-container> <target-db>/<target-container> [--dry-run]
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '../api/package.json'));

// Properties Cosmos DB manages itself; they must not be copied.
const SYSTEM_PROPERTIES = ['_rid', '_self', '_etag', '_attachments', '_ts'];

export function stripSystemProperties(item) {
    const copy = { ...item };
    for (const property of SYSTEM_PROPERTIES) delete copy[property];
    return copy;
}

function parsePath(value) {
    const [database, container, ...rest] = String(value || '').split('/');
    if (!database || !container || rest.length > 0) {
        throw new Error(`Expected <database>/<container>, got "${value}"`);
    }
    return { database, container };
}

export async function copyContainer(source, target, { dryRun = false, log = console.log } = {}) {
    const { resources: items } = await source.items.readAll().fetchAll();
    log(`Source has ${items.length} items.`);
    if (dryRun) {
        log('Dry run: nothing written.');
        return { copied: 0, missing: [] };
    }

    for (const item of items) {
        await target.items.upsert(stripSystemProperties(item));
    }

    const { resources: copied } = await target.items.readAll().fetchAll();
    const copiedIds = new Set(copied.map((item) => item.id));
    const missing = items.filter((item) => !copiedIds.has(item.id)).map((item) => item.id);
    log(`Target has ${copied.length} items; ${missing.length} of the source items are missing.`);
    return { copied: items.length, missing };
}

async function main() {
    const [sourceArg, targetArg, ...flags] = process.argv.slice(2);
    const { COSMOS_ENDPOINT: endpoint, COSMOS_KEY: key } = process.env;
    if (!endpoint || !key) {
        throw new Error('Set COSMOS_ENDPOINT and COSMOS_KEY.');
    }
    const sourcePath = parsePath(sourceArg);
    const targetPath = parsePath(targetArg);

    const { CosmosClient } = require('@azure/cosmos');
    const client = new CosmosClient({ endpoint, key });
    const source = client.database(sourcePath.database).container(sourcePath.container);
    const target = client.database(targetPath.database).container(targetPath.container);

    const { missing } = await copyContainer(source, target, { dryRun: flags.includes('--dry-run') });
    if (missing.length > 0) {
        throw new Error(`Not copied: ${missing.join(', ')}`);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}
