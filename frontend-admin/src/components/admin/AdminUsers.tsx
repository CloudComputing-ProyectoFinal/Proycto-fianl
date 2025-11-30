import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import type { CreateUserPayload } from '../../services/admin';
import { useAuth } from '../../contexts/AuthContext';

export function AdminUsers() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    address: '',
    phoneNumber: '',
    tenant_id: profile?.tenantId || profile?.tenant_id || '',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('[AdminUsers] fetching users list...');
      const res = await adminService.listUsers();
      console.log('[AdminUsers] fetch result:', res);
      
      // Manejar diferentes formatos de respuesta del backend
      let usersList = [];
      if (Array.isArray(res)) {
        usersList = res;
      } else if (res?.data?.users && Array.isArray(res.data.users)) {
        // La respuesta viene en { data: { users: [...] } }
        usersList = res.data.users;
      } else if (res?.data && Array.isArray(res.data)) {
        usersList = res.data;
      } else if (res?.users && Array.isArray(res.users)) {
        usersList = res.users;
      } else if (res?.items && Array.isArray(res.items)) {
        usersList = res.items;
      }
      
      console.log('[AdminUsers] normalized users list:', usersList);
      setUsers(usersList);
    } catch (err) {
      console.error('listUsers', err);
      setUsers([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreateModal = () => {
    console.log('[AdminUsers] openCreateModal');
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'USER',
      address: '',
      phoneNumber: '',
      tenant_id: profile?.tenantId || profile?.tenant_id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (user: any) => {
    console.log('[AdminUsers] openEditModal', user);
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // No mostrar contraseña
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
      tenant_id: user.tenant_id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('[AdminUsers] handleSubmit', { editing: !!editingUser, formData });
      
      if (editingUser) {
        // Editar usuario existente
        const updatePayload: any = {};
        const nameParts = formData.name.trim().split(' ');
        updatePayload.firstName = nameParts[0] || '';
        updatePayload.lastName = nameParts.slice(1).join(' ') || '';
        
        if (formData.password) updatePayload.password = formData.password;
        if (formData.phoneNumber) updatePayload.phoneNumber = formData.phoneNumber;
        if (formData.address) updatePayload.address = formData.address;
        if (formData.role) updatePayload.role = formData.role;
        
        const result = await adminService.updateUser(editingUser.userId || editingUser.id, updatePayload);
        console.log('[AdminUsers] update result', result);
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear usuario nuevo
        const result = await adminService.createUser(formData);
        console.log('[AdminUsers] create result', result);
        alert('Usuario creado exitosamente');
      }
      
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error('handleSubmit', err);
      alert(`Error: ${err}`);
    }
  };

  const handleDeleteUser = async (user: any) => {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    if (!confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      console.log('[AdminUsers] deleteUser', user.userId || user.id);
      await adminService.deleteUser(user.userId || user.id);
      setUsers(prev => prev.filter(u => (u.userId || u.id) !== (user.userId || user.id)));
      alert('Usuario eliminado exitosamente');
    } catch (err) {
      console.error('deleteUser', err);
      alert(`Error al eliminar: ${err}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          {/* Círculo exterior giratorio */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          {/* Círculo interior pulsante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full animate-pulse opacity-20"></div>
          </div>
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">Cargando usuarios</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo información de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <button onClick={openCreateModal} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id || u.userId} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.nombre || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim()}</td>
                <td className="p-3">{u.correo_electronico || u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.phoneNumber || u.phone_number || '-'}</td>
                <td className="p-3 text-sm text-gray-600">{u.address || '-'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => openEditModal(u)} className="text-blue-600 hover:underline text-sm">
                    Editar
                  </button>
                  <button onClick={() => handleDeleteUser(u)} className="text-red-600 hover:underline text-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Alexia Montalban"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="usuario@fridays.pe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder={editingUser ? 'Dejar vacío para mantener' : 'Mínimo 8 caracteres'}
                      required={!editingUser}
                      minLength={editingUser ? 0 : 8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rol *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="USER">USER (Cliente)</option>
                      <option value="COOK">COOK (Cocinero)</option>
                      <option value="Cheff ejecutivo">Cheff ejecutivo</option>
                      <option value="Cheff ejecutivo 2">Cheff ejecutivo 2</option>
                      <option value="DISPATCHER">DISPATCHER (Repartidor)</option>
                      <option value="ADMIN">ADMIN (Administrador)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="+51928745678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sede (Tenant)</label>
                    <input
                      type="text"
                      value={formData.tenant_id}
                      className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                      disabled
                      title="Se asigna automáticamente según la sede del administrador"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Calle 111"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
