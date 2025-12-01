/**
 * Amazon SES Client - Email con HTML estilizado
 * Usado para notificar clientes sobre cambios de estado de órdenes
 */

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.SES_REGION || 'us-east-1' });

/**
 * Plantillas HTML por estado de orden
 */
const emailTemplates = {
  CREATED: {
    subject: '✅ Orden Recibida - Fridays Perú',
    color: '#4CAF50',
    icon: '📝',
    title: 'Tu orden ha sido recibida',
    message: 'Hemos recibido tu pedido y estamos procesándolo.'
  },
  PREPARING: {
    subject: '👨‍🍳 Tu pedido se está preparando - Fridays Perú',
    color: '#FF9800',
    icon: '👨‍🍳',
    title: 'Estamos preparando tu pedido',
    message: 'Nuestros chefs están preparando tu orden con mucho cuidado.'
  },
  READY: {
    subject: '✨ Tu pedido está listo - Fridays Perú',
    color: '#2196F3',
    icon: '✨',
    title: '¡Tu pedido está listo!',
    message: 'Tu orden está lista y pronto será recogida por un repartidor.'
  },
  ASSIGNED: {
    subject: '🚚 Repartidor asignado - Fridays Perú',
    color: '#9C27B0',
    icon: '🚚',
    title: 'Repartidor en camino',
    message: 'Un repartidor ha sido asignado a tu pedido y pronto estará en camino.'
  },
  IN_TRANSIT: {
    subject: '📍 Tu pedido está en camino - Fridays Perú',
    color: '#00BCD4',
    icon: '📍',
    title: '¡Tu pedido está en camino!',
    message: 'El repartidor está en ruta hacia tu ubicación.'
  },
  DELIVERED: {
    subject: '🎉 Pedido entregado - Fridays Perú',
    color: '#4CAF50',
    icon: '🎉',
    title: '¡Pedido entregado con éxito!',
    message: 'Esperamos que disfrutes tu comida. ¡Gracias por tu preferencia!'
  },
  CANCELLED: {
    subject: '❌ Orden cancelada - Fridays Perú',
    color: '#F44336',
    icon: '❌',
    title: 'Orden cancelada',
    message: 'Tu orden ha sido cancelada. Si tienes alguna duda, contáctanos.'
  }
};

/**
 * Genera HTML estilizado para el email
 */
function generateEmailHTML(order, template, driverInfo = null) {
  const items = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small style="color: #666;">Cantidad: ${item.quantity} x S/ ${item.price.toFixed(2)}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        S/ ${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const driverSection = driverInfo ? `
    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #333;">🚚 Información del Repartidor</h3>
      <p style="margin: 5px 0;"><strong>Nombre:</strong> ${driverInfo.name || 'Por asignar'}</p>
      <p style="margin: 5px 0;"><strong>Estado:</strong> ${order.status}</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header con color -->
          <tr>
            <td style="background: linear-gradient(135deg, ${template.color} 0%, ${template.color}dd 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 42px;">${template.icon}</h1>
              <h2 style="margin: 10px 0 0 0; color: white; font-size: 24px; font-weight: 600;">${template.title}</h2>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Mensaje principal -->
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0 0 20px 0;">
                Hola <strong>${order.customerInfo?.firstName || 'Cliente'}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 0 0 20px 0;">
                ${template.message}
              </p>
              
              <!-- Información de la orden -->
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Detalles de tu Orden</h3>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Número de Orden:</strong> ${order.orderId.replace('ORDER#', '')}
                </p>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString('es-PE', { 
                    dateStyle: 'long', 
                    timeStyle: 'short' 
                  })}
                </p>
                <p style="margin: 5px 0; color: #666;">
                  <strong>Estado:</strong> 
                  <span style="background: ${template.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                    ${order.status}
                  </span>
                </p>
              </div>

              ${driverSection}
              
              <!-- Items de la orden -->
              <h3 style="margin: 25px 0 15px 0; color: #333; font-size: 18px;">🍽️ Tu Pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                ${items}
                <tr>
                  <td colspan="2" style="padding: 15px; background: #f9f9f9; text-align: right;">
                    <strong style="font-size: 18px; color: #333;">Total: S/ ${order.total.toFixed(2)}</strong>
                  </td>
                </tr>
              </table>
              
              <!-- Dirección de entrega -->
              ${order.deliveryAddress ? `
              <div style="margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">📍 Dirección de Entrega</h3>
                <p style="margin: 5px 0; color: #666; line-height: 1.6;">
                  ${order.deliveryAddress.street}<br>
                  ${order.deliveryAddress.district}, ${order.deliveryAddress.city}<br>
                  ${order.deliveryAddress.zipCode || ''}
                </p>
              </div>
              ` : ''}
              
              <!-- Notas especiales -->
              ${order.notes ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404;">
                  <strong>📝 Notas especiales:</strong> ${order.notes}
                </p>
              </div>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                ¿Tienes alguna pregunta? Contáctanos
              </p>
              <p style="margin: 0 0 15px 0;">
                <a href="tel:+51987654321" style="color: ${template.color}; text-decoration: none; margin: 0 10px;">📞 +51 987 654 321</a>
                <a href="mailto:soporte@fridays.pe" style="color: ${template.color}; text-decoration: none; margin: 0 10px;">✉️ soporte@fridays.pe</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Fridays Perú. Todos los derechos reservados.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Enviar email al cliente usando Amazon SES
 */
async function sendOrderStatusEmail(order, driverInfo = null) {
  try {
    const template = emailTemplates[order.status];
    
    if (!template) {
      console.log(`⚠️ No hay plantilla para el estado: ${order.status}`);
      return null;
    }

    const customerEmail = order.customerInfo?.email;
    
    if (!customerEmail) {
      console.log('⚠️ No se encontró email del cliente');
      return null;
    }

    const htmlBody = generateEmailHTML(order, template, driverInfo);
    
    const params = {
      Source: process.env.SES_FROM_EMAIL || 'notificaciones@fridays.pe',
      Destination: {
        ToAddresses: [customerEmail]
      },
      Message: {
        Subject: {
          Data: template.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `${template.title}\n\n${template.message}\n\nOrden: ${order.orderId}\nEstado: ${order.status}\nTotal: S/ ${order.total.toFixed(2)}`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    const result = await ses.sendEmail(params).promise();
    
    console.log(`📧 Email SES enviado a ${customerEmail}:`, result.MessageId);
    
    return result;
  } catch (error) {
    console.error('❌ Error al enviar email con SES:', error.message);
    throw error;
  }
}

module.exports = {
  sendOrderStatusEmail
};
