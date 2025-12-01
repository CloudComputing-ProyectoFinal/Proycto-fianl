const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

const params = {
  TableName: 'Cooks-dev',
  AttributeDefinitions: [
    { AttributeName: 'tenant_id', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexUpdates: [
    {
      Create: {
        IndexName: 'tenant-index',
        KeySchema: [
          { AttributeName: 'tenant_id', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    }
  ]
};

dynamodb.updateTable(params, (err, data) => {
  if (err) {
    console.error('❌ Error creando el índice:', err);
  } else {
    console.log('✅ Índice tenant-index creado:', data);
  }
});