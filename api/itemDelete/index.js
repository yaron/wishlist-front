const cosmos = require('@azure/cosmos');
const endpoint = process.env.CosmosDbEndpoint;
const key = process.env.CosmosDbKey;
const { CosmosClient } = cosmos;

const instance = require('../shared/instance');

const client = new CosmosClient({ endpoint, key });
const container = client.database(instance.database).container(instance.container);

module.exports = async function (context, req) {
    resp = await container.item(req.params.id, req.params.id).delete()
      
    context.done();
};