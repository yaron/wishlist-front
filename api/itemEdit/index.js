module.exports = function (context, req, EditItemIn) {
    if (EditItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    const item = EditItemIn
    for (const [key, value] of Object.entries(req.body)) {
        // The claim key hash is managed by claim/unclaim only.
        if (key === 'claimKeyHash') continue
        item[key] = value
    }
    // An item that is no longer claimed has no claim to undo.
    if (item.claimed != true) {
        delete item.claimKeyHash
    }
    context.bindings.EditItemOut = item

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Updated"
    };
    context.done();
}
