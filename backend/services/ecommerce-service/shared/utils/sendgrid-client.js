/**
 * SendGrid Client - Email con HTML estilizado
 * Alternativa a SES compatible con AWS Academy
 * 
 * Ventajas:
 * - 100 emails/día gratis
 * - Sin restricciones de sandbox
 * - Setup en 5 minutos
 * - Templates HTML personalizados
 */

const sgMail = require('@sendgrid/mail');

// Configurar API Key desde variable de entorno
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Plantillas HTML por estado de orden
 * Mismo diseño que SES pero con SendGrid
 */
const emailTemplates = {
  CREATED: {
    subject: '✅ Orden recibida - Fridays Perú',
    color: '#4CAF50',
    icon: '✅',
    title: 'Orden recibida',
    message: 'Hemos recibido tu pedido y comenzaremos a prepararlo pronto.'
  },
  PREPARING: {
    subject: '👨‍🍳 Tu orden está en preparación - Fridays Perú',
    color: '#FF9800',
    icon: '👨‍🍳',
    title: 'Preparando tu pedido',
    message: 'Nuestros chefs están preparando tu delicioso pedido con mucho cariño.'
  },
  READY: {
    subject: '✨ Tu orden está lista - Fridays Perú',
    color: '#2196F3',
    icon: '✨',
    title: 'Orden lista',
    message: 'Tu pedido está listo y esperando ser recogido.'
  },
  ASSIGNED: {
    subject: '🚚 Repartidor asignado - Fridays Perú',
    color: '#9C27B0',
    icon: '🚚',
    title: 'Repartidor en camino',
    message: 'Un repartidor ha sido asignado a tu pedido.'
  },
  IN_TRANSIT: {
    subject: '📍 Tu orden va en camino - Fridays Perú',
    color: '#00BCD4',
    icon: '📍',
    title: 'En camino',
    message: 'Tu pedido está en camino. ¡Pronto llegará!'
  },
  DELIVERED: {
    subject: '🎉 Orden entregada - Fridays Perú',
    color: '#4CAF50',
    icon: '🎉',
    title: '¡Entregado!',
    message: '¡Disfruta tu pedido! Gracias por confiar en nosotros.'
  },
  CANCELLED: {
    subject: '❌ Orden cancelada - Fridays Perú',
    color: '#F44336',
    icon: '❌',
    title: 'Orden cancelada',
    message: 'Tu orden ha sido cancelada. Si tienes dudas, contáctanos.'
  }
};

/**
 * Generar HTML del email con diseño responsive
 */
function generateEmailHTML(order, template, driverInfo = null) {
  const { color, icon, title, message } = template;
  
  // Formatear items
  const itemsHTML = order.items?.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name} x${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        S/ ${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('') || '';
  
  // Información del driver (solo si existe)
  const driverHTML = driverInfo ? `
    <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #333;">🚚 Información del Repartidor</h3>
      <p style="margin: 5px 0;"><strong>Nombre:</strong> ${driverInfo.name || 'Asignando...'}</p>
      ${driverInfo.phone ? `<p style="margin: 5px 0;"><strong>Teléfono:</strong> ${driverInfo.phone}</p>` : ''}
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        
        <!-- Header con color del estado -->
        <div style="background: linear-gradient(135deg, ${color}, ${color}dd); padding: 40px; text-align: center; color: white;">
          <h1 style="font-size: 48px; margin: 0;">${icon}</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 24px;">${title}</h2>
        </div>
        
        <!-- Contenido -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hola <strong>${order.customerInfo?.name || order.customer_name || 'Cliente'}</strong>,
          </p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            ${message}
          </p>
          
          <!-- Detalles de la orden -->
          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📋 Detalles de tu Orden</h3>
            <p style="margin: 5px 0;"><strong>Número de Orden:</strong> ${order.orderId || order.order_id}</p>
            <p style="margin: 5px 0;">
              <strong>Estado:</strong> 
              <span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px;">
                ${order.status}
              </span>
            </p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(order.createdAt || order.created_at).toLocaleString('es-PE')}</p>
          </div>
          
          ${driverHTML}
          
          <!-- Items del pedido -->
          <h3 style="color: #333; margin-top: 30px;">🍽️ Tu Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="font-weight: bold; font-size: 18px;">
                <td style="padding: 15px 10px; border-top: 2px solid #333;">Total</td>
                <td style="padding: 15px 10px; border-top: 2px solid #333; text-align: right; color: ${color};">
                  S/ ${(order.totalAmount || order.total_amount || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Dirección de entrega -->
          ${order.deliveryAddress ? `
            <div style="margin: 30px 0;">
              <h3 style="color: #333;">📍 Dirección de Entrega</h3>
              <div style="background: #f9f9f9; border-radius: 8px; padding: 15px;">
                <p style="margin: 5px 0;">${order.deliveryAddress.street || order.deliveryAddress}</p>
                ${order.deliveryAddress.district ? `<p style="margin: 5px 0;">${order.deliveryAddress.district}, ${order.deliveryAddress.city || 'Lima'}</p>` : ''}
                ${order.deliveryAddress.reference ? `<p style="margin: 5px 0; color: #666;"><em>Ref: ${order.deliveryAddress.reference}</em></p>` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Notas especiales -->
          ${order.specialNotes ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">📝 Notas Especiales</h3>
              <p style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; color: #666;">
                ${order.specialNotes}
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #ddd;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Fridays Perú</strong>
          </p>
          <p style="margin: 10px 0; color: #999; font-size: 13px;">
            📞 +51 987 654 321 | ✉️ soporte@fridays.pe
          </p>
          <p style="margin: 10px 0; color: #999; font-size: 12px;">
            © 2025 Fridays Perú. Todos los derechos reservados.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

/**
 * Enviar email de actualización de estado de orden
 */
async function sendOrderStatusEmail(order, driverInfo = null) {
  try {
    const status = order.status;
    const template = emailTemplates[status];
    
    if (!template) {
      console.log(`⚠️ No hay template para estado: ${status}`);
      return;
    }
    
    const customerEmail = order.customerInfo?.email || order.customer_email;
    
    if (!customerEmail) {
      console.log('⚠️ No hay email del cliente en la orden');
      return;
    }
    
    const htmlContent = generateEmailHTML(order, template, driverInfo);
    
    // Preparar mensaje para SendGrid
    const msg = {
      to: customerEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Fridays Perú'
      },
      subject: template.subject,
      html: htmlContent,
      // Texto plano como fallback
      text: `
        ${template.title}
        
        ${template.message}
        
        Número de Orden: ${order.orderId || order.order_id}
        Estado: ${status}
        Total: S/ ${(order.totalAmount || order.total_amount || 0).toFixed(2)}
        
        Gracias por tu preferencia.
        Fridays Perú
      `
    };
    
    // Enviar con SendGrid
    await sgMail.send(msg);
    
    console.log(`✅ Email enviado exitosamente a ${customerEmail} (${status})`);
    
  } catch (error) {
    console.error('❌ Error enviando email con SendGrid:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.body);
    }
    // No lanzar el error para que no falle la actualización de la orden
  }
}

module.exports = {
  sendOrderStatusEmail
};
