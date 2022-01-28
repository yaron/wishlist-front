module.exports = function(context, req) {
    var items = context.bindings.items;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: context.bindings.items
    };
    context.done();
  };