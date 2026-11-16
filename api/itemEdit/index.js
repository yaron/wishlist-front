const { validateItem, badRequest } = require('../shared/item');
const { denyUnlessAdmin, json } = require('../shared/auth');
const db = require('../shared/db');

module.exports = async function (context, req, existing) {
    const denied = denyUnlessAdmin(req);
    if (denied) {
        context.res = denied;
        return;
    }

    if (existing == undefined) {
        context.res = json(404, { error: 'Unable to find item' });
        return;
    }

    const { item: changes, errors } = validateItem(req.body);
    if (errors) {
        context.res = badRequest(errors);
        return;
    }

    // Without an explicit "claimed" the claim is left alone, so saving an edit cannot
    // undo a claim that a visitor made while the form was open.
    if (typeof req.body.claimed !== 'boolean') {
        delete changes.claimed;
    }

    // Only the validated fields are copied, so id and claimKeyHash cannot be changed here.
    const item = Object.assign(existing, changes);
    // An item that is no longer claimed has no claim to undo.
    if (item.claimed != true) {
        delete item.claimKeyHash;
    }

    if (!await db.replaceItem(item)) {
        context.res = json(409, { error: 'Item was changed by someone else, try again' });
        return;
    }

    context.res = json(200, { status: 'Updated' });
};
