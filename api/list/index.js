// Same order as wishlist-go: items that can still be claimed first, then by name.
function compareItems(a, b) {
    const claimed = Number(a.claimed === true) - Number(b.claimed === true);
    if (claimed !== 0) {
        return claimed;
    }
    return String(a.name || '').localeCompare(String(b.name || ''), 'nl', { sensitivity: 'base' });
}

// Only these fields go to the browser; the hash of the claim key and the database's own
// bookkeeping stay on the server.
function publicItem(item) {
    return {
        id: item.id,
        name: item.name,
        price: item.price,
        claimable: item.claimable === true,
        claimed: item.claimed === true,
        url: item.url || '',
        image: item.image || '',
    };
}

module.exports = async function (context) {
    context.res = {
        headers: { 'content-type': 'application/json' },
        body: (context.bindings.items || []).map(publicItem).sort(compareItems),
    };
};
