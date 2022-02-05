module.exports = function (context, req, claimItemIn) {
    body = JSON.stringify(req.body)
    if (claimItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    if (claimItemIn.claimable != true) {
        context.res = {
            status: 403,
            body: "Unable to claim item"
        };
        context.done();
        return
    }
    
    context.bindings.claimItemOut = claimItemIn
    context.bindings.claimItemOut.claimed = true

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Updated"
    };
    context.done();
}