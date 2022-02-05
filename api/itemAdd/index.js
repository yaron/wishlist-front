module.exports = function (context, req) {
    context.bindings.addItem = JSON.stringify(req.body);
      
    context.done();
};