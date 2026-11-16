const { validateItem, badRequest } = require('../shared/item');
const { denyUnlessAdmin, json } = require('../shared/auth');

module.exports = async function (context, req) {
    const denied = denyUnlessAdmin(req);
    if (denied) {
        context.res = denied;
        return;
    }

    const { item, errors } = validateItem(req.body);
    if (errors) {
        context.res = badRequest(errors);
        return;
    }

    context.bindings.addItem = JSON.stringify(item);
    context.res = json(200, { status: 'Item added' });
};
