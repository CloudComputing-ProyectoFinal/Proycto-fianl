/**
 * Lambda: Asignar driver a una orden
 * Usada por Step Function
 */

const { getItem, updateItem } = require('../../shared/database/dynamodb-client');
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'Orders-dev';

exports.handler = async (event) => {
  const { orderId, driverInfo } = event;
  // Obtiene la orden
  const order = await getItem(ORDERS_TABLE, { orderId });
  if (!order) throw new Error('Orden no encontrada');
  // Actualiza la orden con el driver asignado
  order.driverId = driverInfo.driverId;
  order.driverInfo = driverInfo;
  order.status = 'PACKED'; // o el estado que corresponda tras la asignación
  await updateItem(ORDERS_TABLE, order);
  return { orderId, driverId: driverInfo.driverId, status: order.status };
};
