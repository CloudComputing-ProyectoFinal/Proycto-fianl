// Script para crear la tabla DynamoDB de cocineros (Cooks) y su índice por status
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1' });

const stage = process.env.STAGE || 'dev';
const tableName = `Cooks-${stage}`;

const params = {
  TableName: tableName,
  AttributeDefinitions: [
    { AttributeName: 'cook_id', AttributeType: 'S' },
    { AttributeName: 'tenant_id', AttributeType: 'S' },
    { AttributeName: 'status', AttributeType: 'S' }
  ],
  KeySchema: [
    { AttributeName: 'cook_id', KeyType: 'HASH' }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'status-index',
      KeySchema: [
        { AttributeName: 'status', KeyType: 'HASH' },
        { AttributeName: 'tenant_id', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ]
};

dynamodb.createTable(params, (err, data) => {
  if (err) {
    console.error('❌ Error creando tabla Cooks:', err);
  } else {
    console.log('✅ Tabla Cooks creada:', data);
  }
});
