const { claimKeyMatches } = require('../shared/claimKey');

module.exports = function (context, req, unclaimItemIn) {
    if (unclaimItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    const key = req.body && req.body.key
    if (unclaimItemIn.claimed != true || !claimKeyMatches(key, unclaimItemIn.claimKeyHash)) {
        context.res = {
            status: 403,
            body: "Unable to unclaim item"
        };
        context.done();
        return
    }

    context.bindings.unclaimItemOut = unclaimItemIn
    context.bindings.unclaimItemOut.claimed = false
    delete context.bindings.unclaimItemOut.claimKeyHash

    context.res = {
        headers: { "content-type": "application/json" },
        body: { status: "Item unclaimed" }
    };
    context.done();
}
