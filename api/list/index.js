module.exports = function(context, req) {
    // Never expose the hash of the claim key to the client.
    const items = (context.bindings.items || []).map(({ claimKeyHash, ...item }) => item);

    context.res = {
        body: items
    };
    context.done();
  };
