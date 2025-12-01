// Asigna el cocinero a la orden
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const { order_id, cook } = event;
  if (!cook || !order_id) {
    throw new Error('Missing cook or order_id');
  }
  // Actualiza la orden con el cocinero asignado
  await dynamodb.update({
    TableName: process.env.ORDERS_TABLE,
    Key: { order_id },
    UpdateExpression: 'set cook_id = :cook_id, status = :status',
    ExpressionAttributeValues: {
      ':cook_id': cook.cook_id,
      ':status': 'COOK_ASSIGNED',
    },
  }).promise();
  return { success: true };
};
