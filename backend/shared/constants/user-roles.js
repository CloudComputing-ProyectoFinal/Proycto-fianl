/**
 * Roles de usuarios del sistema Fridays Perú
 * 
 * @description Define todos los roles posibles para los usuarios
 * IMPORTANTE: Estos valores deben coincidir exactamente en toda la aplicación
 */

module.exports = {
  USER_ROLES: {
    CLIENTE: 'CLIENTE',               // Cliente final que realiza pedidos
    DIGITADOR: 'DIGITADOR',           // Digitador de pedidos (toma pedidos)
    CHEF_EJECUTIVO: 'CHEF_EJECUTIVO', // Chef Ejecutivo (supervisa cocina)
    COCINERO: 'COCINERO',             // Cocinero (prepara pedidos)
    EMPACADOR: 'EMPACADOR',           // Empacador (empaca pedidos)
    REPARTIDOR: 'REPARTIDOR',         // Repartidor/Delivery (entrega pedidos)
    ADMIN_SEDE: 'ADMIN_SEDE'          // Administrador de Sede
  },

  // Helper: Verificar si un rol es válido
  isValidRole: (role) => {
    return Object.values(module.exports.USER_ROLES).includes(role);
  },

  // Helper: Roles que pertenecen al staff de cocina
  isKitchenStaff: (role) => {
    return [
      module.exports.USER_ROLES.CHEF_EJECUTIVO,
      module.exports.USER_ROLES.COCINERO,
      module.exports.USER_ROLES.EMPACADOR
    ].includes(role);
  },

  // Helper: Roles administrativos
  isAdmin: (role) => {
    return [
      module.exports.USER_ROLES.ADMIN_SEDE,
      module.exports.USER_ROLES.CHEF_EJECUTIVO
    ].includes(role);
  },

  // Helper: Roles que pueden ver todos los pedidos de la sede
  canViewAllOrders: (role) => {
    return [
      module.exports.USER_ROLES.ADMIN_SEDE,
      module.exports.USER_ROLES.CHEF_EJECUTIVO,
      module.exports.USER_ROLES.DIGITADOR
    ].includes(role);
  }
};
