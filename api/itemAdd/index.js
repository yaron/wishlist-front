const { validateItem, badRequest } = require('../shared/item');

module.exports = function (context, req) {
    const { item, errors } = validateItem(req.body);
    if (errors) {
        context.res = badRequest(errors);
        context.done();
        return
    }

    context.bindings.addItem = JSON.stringify(item);
    context.res = {
        body: "Item added"
    };
    context.done();
};
