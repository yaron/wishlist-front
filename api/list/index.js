// Same order as wishlist-go: items that can still be claimed first, then by name.
function compareItems(a, b) {
    const claimed = Number(a.claimed === true) - Number(b.claimed === true);
    if (claimed !== 0) {
        return claimed;
    }
    return String(a.name || '').localeCompare(String(b.name || ''), 'nl', { sensitivity: 'base' });
}

module.exports = function(context, req) {
    // Never expose the hash of the claim key to the client.
    const items = (context.bindings.items || [])
        .map(({ claimKeyHash, ...item }) => item)
        .sort(compareItems);

    context.res = {
        body: items
    };
    context.done();
  };
