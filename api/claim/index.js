const { newClaimKey, hashClaimKey } = require('../shared/claimKey');

module.exports = function (context, req, claimItemIn) {
    if (claimItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    if (claimItemIn.claimable != true || claimItemIn.claimed == true) {
        context.res = {
            status: 403,
            body: "Unable to claim item"
        };
        context.done();
        return
    }

    const key = newClaimKey()
    context.bindings.claimItemOut = claimItemIn
    context.bindings.claimItemOut.claimed = true
    context.bindings.claimItemOut.claimKeyHash = hashClaimKey(key)

    context.res = {
        headers: { "content-type": "application/json" },
        body: { status: "Item claimed", key: key }
    };
    context.done();
}
