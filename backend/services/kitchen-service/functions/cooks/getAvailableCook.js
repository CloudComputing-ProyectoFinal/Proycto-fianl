// Busca el primer cocinero disponible para una orden
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const { tenant_id, order_id } = event;
  // Aquí deberías filtrar por estado disponible y por tenant
  const params = {
    TableName: process.env.COOKS_TABLE,
    IndexName: 'status-index',
    KeyConditionExpression: '#status = :available and #tenant_id = :tenant_id',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#tenant_id': 'tenant_id',
    },
    ExpressionAttributeValues: {
      ':available': 'AVAILABLE',
      ':tenant_id': tenant_id,
    },
    Limit: 1,
  };
  const result = await dynamodb.query(params).promise();
  if (result.Items.length === 0) {
    return { cook: null };
  }
  return { cook: result.Items[0] };
};
