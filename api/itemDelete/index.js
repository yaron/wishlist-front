const { denyUnlessAdmin, json } = require('../shared/auth');
const db = require('../shared/db');

module.exports = async function (context, req) {
    const denied = denyUnlessAdmin(req);
    if (denied) {
        context.res = denied;
        return;
    }

    if (!await db.deleteItem(req.params.id)) {
        context.res = json(404, { error: 'Unable to find item' });
        return;
    }

    context.res = json(200, { status: 'Item deleted' });
};
