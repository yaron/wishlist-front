module.exports = function (context, req, EditItemIn) {
    if (EditItemIn == undefined) {
        context.res = {
            status: 404,
            body: "Unable to find item"
        };
        context.done();
        return
    }

    item = EditItemIn
    for (const [key, value] of Object.entries(req.body)) { 
       item[key] = value
    }
    context.bindings.EditItemOut = item

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Updated"
    };
    context.done();
}