import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import chefExecutiveService from '../../services/chefExecutive';
import type { KitchenOrder, Chef } from '../../services/chefExecutive';

export function ChefExecutiveDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'chefs'>('orders');
  const [loading, setLoading] = useState(true);
  
  // Orders state
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [createdOrders, setCreatedOrders] = useState<KitchenOrder[]>([]);
  
  // Chefs state
  const [chefs, setChefs] = useState<Chef[]>([]);
  
  // Assign order modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [selectedChefId, setSelectedChefId] = useState('');

  const tenantId = profile?.tenantId || profile?.tenant_id || '';

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'chefs') {
      loadChefs();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [allOrdersRes, createdRes] = await Promise.all([
        chefExecutiveService.listOrders(),
        chefExecutiveService.getCreatedOrders(),
      ]);
      
      setOrders(allOrdersRes?.data?.orders || []);
      setCreatedOrders(createdRes?.data?.orders || []);
    } catch (err) {
      console.error('loadOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChefs = async () => {
    setLoading(true);
    try {
      // Filtrar solo Cocineros (no Cheff Ejecutivo)
      const res = await chefExecutiveService.listChefs('Cocinero');
      console.log('[ChefExecutiveDashboard] listChefs response:', res);
      // El API devuelve 'cooks' en lugar de 'chefs'
      const chefsList = res?.data?.cooks || res?.data?.chefs || [];
      setChefs(chefsList);
    } catch (err) {
      console.error('loadChefs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ========== ORDER FUNCTIONS ==========

  const openAssignModal = (order: KitchenOrder) => {
    setSelectedOrder(order);
    setSelectedChefId('');
    setShowAssignModal(true);
  };

  const handleAssignOrder = async () => {
    if (!selectedOrder || !selectedChefId) {
      alert('Seleccione un chef');
      return;
    }

    try {
      await chefExecutiveService.assignOrder(selectedOrder.orderId, {
        chefId: selectedChefId,
        tenantId,
      });
      
      alert('Orden asignada exitosamente');
      setShowAssignModal(false);
      loadOrders();
    } catch (err) {
      console.error('assignOrder error:', err);
      alert(`Error al asignar orden: ${err}`);
    }
  };

  // ========== CHEF FUNCTIONS ==========

  const handleDeleteChef = async (chef: Chef) => {
    const chefName = chef.name || `${chef.firstName || ''} ${chef.lastName || ''}`.trim();
    if (!confirm(`¿Eliminar al chef ${chefName}?`)) return;

    try {
      const chefId = chef.cook_id || chef.chefId;
      if (!chefId) {
        alert('Error: No se pudo obtener el ID del chef');
        return;
      }
      await chefExecutiveService.deleteChef(chefId);
      alert('Chef eliminado exitosamente');
      loadChefs();
    } catch (err) {
      console.error('deleteChef error:', err);
      alert(`Error al eliminar: ${err}`);
    }
  };

  // ========== RENDER LOADING ==========

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-purple-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando datos de cocina</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo información...</p>
        </div>
      </div>
    );
  }

  // ========== RENDER MAIN ==========

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chef Ejecutivo - Gestión de Cocina</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'orders'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Órdenes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('chefs')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'chefs'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          Chefs ({chefs.length})
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Órdenes sin asignar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Órdenes Sin Asignar ({createdOrders.length})
            </h2>
            
            {createdOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">ID Orden</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Hora</th>
                      <th className="p-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdOrders.map((order) => (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">
                          {order.orderId.replace('ORDER#', '')}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">
                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{order.customerInfo?.email}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {order.items.map((item, idx) => (
                              <div key={idx}>
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-semibold">S/ {order.total.toFixed(2)}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => openAssignModal(order)}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                          >
                            Asignar Chef
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay órdenes pendientes de asignación
              </div>
            )}
          </div>

          {/* Todas las órdenes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Todas las Órdenes ({orders.length})</h2>
            
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">ID Orden</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Chef Asignado</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">
                          {order.orderId.replace('ORDER#', '')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PREPARING' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'COOKING' ? 'bg-red-100 text-red-800' :
                            order.status === 'READY' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {order.assignedChefName || (
                            <span className="text-gray-400 italic">Sin asignar</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium">
                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                          </div>
                        </td>
                        <td className="p-3 font-semibold">S/ {order.total.toFixed(2)}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay órdenes registradas
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHEFS TAB */}
      {activeTab === 'chefs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Lista de Chefs ({chefs.length})</h2>
            
            {chefs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Teléfono</th>
                      <th className="p-3">Especialización</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chefs.map((chef) => {
                      const chefId = chef.cook_id || chef.chefId || '';
                      const chefName = chef.name || `${chef.firstName || ''} ${chef.lastName || ''}`.trim();
                      const isAvailable = chef.isAvailable !== undefined ? chef.isAvailable : (chef.status === 'ACTIVE');
                      
                      return (
                        <tr key={chefId} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            {chefName}
                          </td>
                          <td className="p-3 text-sm text-gray-600">{chef.email || '-'}</td>
                          <td className="p-3 text-sm">{chef.phoneNumber || '-'}</td>
                          <td className="p-3 text-sm">{chef.specialization || chef.role || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                            {chef.currentOrders !== undefined && chef.currentOrders > 0 && (
                              <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                {chef.currentOrders} órdenes
                              </span>
                            )}
                          </td>
                          <td className="p-3 space-x-2">
                            <button
                              onClick={() => handleDeleteChef(chef)}
                              className="text-red-600 hover:underline"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay chefs registrados
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Asignar Orden */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Asignar Orden a Chef</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Orden: <span className="font-mono">{selectedOrder.orderId}</span>
              </p>
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold">S/ {selectedOrder.total.toFixed(2)}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Seleccionar Chef</label>
              <select
                value={selectedChefId}
                onChange={(e) => setSelectedChefId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">-- Seleccione un chef --</option>
                {chefs
                  .filter((c) => c.isAvailable !== false && (c.status === 'ACTIVE' || !c.status))
                  .map((chef) => {
                    const chefId = chef.cook_id || chef.chefId || '';
                    const chefName = chef.name || `${chef.firstName || ''} ${chef.lastName || ''}`.trim();
                    const spec = chef.specialization || chef.role || 'General';
                    
                    return (
                      <option key={chefId} value={chefId}>
                        {chefName} - {spec}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignOrder}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
