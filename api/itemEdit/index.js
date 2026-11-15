const { validateItem, badRequest } = require('../shared/item');

module.exports = function (context, req, EditItemIn) {
    if (EditItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    const { item: changes, errors } = validateItem(req.body);
    if (errors) {
        context.res = badRequest(errors);
        context.done();
        return
    }

    // Only the validated fields are copied, so id and claimKeyHash cannot be changed here.
    const item = Object.assign(EditItemIn, changes)
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
