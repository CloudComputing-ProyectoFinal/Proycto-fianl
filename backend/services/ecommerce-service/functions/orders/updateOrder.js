const { success, error, forbidden } = require('../../shared/utils/response');
const { getItem, putItem, query, scan, updateItem, deleteItem } = require('../../shared/database/dynamodb-client');
const { validateOwnership, validateTenantAccess } = require('../../shared/utils/validation');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const SNS_TOPIC_ARN = process.env.SNS_NOTIFICATIONS_TOPIC_ARN;

/**
 * PUT /orders/{{orderId}} - Admin update order
 */
exports.handler = async (event) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    const { orderId } = event.pathParameters;
    const { status, ...updateFields } = JSON.parse(event.body);
    if (!orderId || !status) {
      return error('orderId y status son requeridos');
    }

    // Obtener orden actual
    const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';
    const orderResult = await getItem(ORDERS_TABLE, { orderId });
    if (!orderResult) {
      return error('Orden no encontrada');
    }

    // Actualizar estado y otros campos
    const updatedOrder = {
      ...orderResult,
      status,
      ...updateFields,
      updatedAt: new Date().toISOString()
    };
    await putItem(ORDERS_TABLE, updatedOrder);

    // Publicar en SNS
    if (SNS_TOPIC_ARN) {
      try {
        await sns.publish({
          TopicArn: SNS_TOPIC_ARN,
          Subject: `Estado de orden actualizado: ${orderId}`,
          Message: `La orden ${orderId} cambió a estado: ${status}\n\n${JSON.stringify(updatedOrder, null, 2)}`
        }).promise();
        console.log('📧 Notificación SNS enviada');
      } catch (snsError) {
        console.error('❌ Error al publicar en SNS:', snsError);
      }
    }

    return success({ message: 'Orden actualizada', order: updatedOrder });
  } catch (err) {
    console.error('Error:', err);
    return error(err.message || 'Error interno del servidor');
  }
};
