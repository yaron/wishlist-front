module.exports = function(context, req) {
    var items = context.bindings.items;

    context.res = {
        body: context.bindings.items
    };
    context.done();
  };