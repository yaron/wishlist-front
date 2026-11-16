const { claimKeyMatches } = require('../shared/claimKey');
const { json } = require('../shared/auth');
const db = require('../shared/db');

module.exports = async function (context, req, item) {
    if (item == undefined) {
        context.res = json(404, { error: 'Unable to find item' });
        return;
    }

    const key = req.body && req.body.key;
    if (item.claimed != true || !claimKeyMatches(key, item.claimKeyHash)) {
        context.res = json(403, { error: 'Unable to unclaim item' });
        return;
    }

    item.claimed = false;
    delete item.claimKeyHash;

    if (!await db.replaceItem(item)) {
        context.res = json(409, { error: 'Item was changed, try again' });
        return;
    }

    context.res = json(200, { status: 'Item unclaimed' });
};
