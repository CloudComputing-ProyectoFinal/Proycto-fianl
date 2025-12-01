// Worker Lambda para procesar órdenes desde SQS y disparar el Step Function de asignación de cocinero
const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

module.exports.handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    // Extrae los datos necesarios de la orden
    const { order_id, tenant_id } = body;
    // Invoca el Step Function
    const params = {
      stateMachineArn: process.env.ASSIGN_COOK_STEPFUNCTION_ARN,
      input: JSON.stringify({ order_id, tenant_id })
    };
    await stepfunctions.startExecution(params).promise();
    // Si necesitas lógica adicional, agrégala aquí
  }
  return { success: true };
};
