const addIndexAliases = async ({
  esClient,
  index,
  aadIndexAliasName,
}: {
  esClient: ElasticsearchClient;
  index: string;
  aadIndexAliasName: string;
}) => {
  const { body: indices } = await esClient.indices.getAlias({ index: `${index}-*`, name: index });
  const aliasActions = {
    actions: Object.keys(indices).map((concreteIndexName) => {
      return {
        add: {
          index: concreteIndexName,
          alias: aadIndexAliasName,
          is_write_index: false,
        },
      };
    }),
  };
  await esClient.indices.updateAliases({ body: aliasActions });
};
