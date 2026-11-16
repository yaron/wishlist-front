// Direct access to the Cosmos container of this instance, for writes that the bindings
// cannot do: replacing an item only when nobody changed it in the meantime, and deleting.
const { CosmosClient } = require('@azure/cosmos');
const instance = require('./instance');

let container;

function getContainer() {
    if (!container) {
        const endpoint = process.env.CosmosDbEndpoint;
        const key = process.env.CosmosDbKey;
        // The connection string is the one the bindings use, so it is always set.
        const client = endpoint && key
            ? new CosmosClient({ endpoint, key })
            : new CosmosClient(process.env.CosmosDbConnectionString);
        container = client.database(instance.database).container(instance.container);
    }
    return container;
}

// Saves an item that was read before. Returns false when the item was changed (or deleted)
// by someone else since it was read, so two visitors cannot both claim the same item.
async function replaceItem(item) {
    const options = item._etag
        ? { accessCondition: { type: 'IfMatch', condition: item._etag } }
        : undefined;
    try {
        await getContainer().item(item.id, item.id).replace(item, options);
        return true;
    } catch (err) {
        if (err && (err.code === 412 || err.code === 404)) {
            return false;
        }
        throw err;
    }
}

// Returns false when there is no item with this id.
async function deleteItem(id) {
    try {
        await getContainer().item(id, id).delete();
        return true;
    } catch (err) {
        if (err && err.code === 404) {
            return false;
        }
        throw err;
    }
}

module.exports = { replaceItem, deleteItem };
