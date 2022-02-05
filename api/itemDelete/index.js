const cosmos = require('@azure/cosmos');
const endpoint = process.env.CosmosDbEndpoint;
const key = process.env.CosmosDbKey;
const { CosmosClient } = cosmos;

const client = new CosmosClient({ endpoint, key });
const container = client.database("yaron").container("items");

module.exports = async function (context, req) {
    resp = await container.item(req.params.id, req.params.id).delete()
      
    context.done();
};