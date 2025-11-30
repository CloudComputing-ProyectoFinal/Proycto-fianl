import { useEffect, useState } from 'react';
import adminService from '../../services/admin';
import type { ProductApi } from '../../lib/menu.types';

export function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [category, setCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductApi | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'FOOD',
    price: 0,
    currency: 'PEN',
    isAvailable: true,
    preparationTimeMinutes: 15,
    imageUrl: '',
    tags: [] as string[],
  });

  const loadProducts = async (cat?: string) => {
    setLoading(true);
    try {
      console.log('[AdminProducts] loadProducts start', { category: cat });
      // Use admin endpoint to list products
      const res = await adminService.listProducts();
      console.log('[AdminProducts] loadProducts result', res);

      const items = res?.products ?? [];
      // Normalize backend product shape to ProductApi expected by UI
      const normalized = items.map((p: any) => ({
        imageUrl: p.imageUrl ?? p.image_url ?? '',
        available: (p.isAvailable !== undefined) ? p.isAvailable : (p.available ?? false),
        updatedAt: p.updatedAt ?? p.updated_at ?? '',
        tenantId: p.tenant_id ?? p.tenantId ?? '',
        category: p.category ?? '',
        createdAt: p.createdAt ?? p.created_at ?? '',
        price: p.price ?? 0,
        description: p.description ?? '',
        ingredients: p.ingredients ?? [],
        name: p.name ?? '',
        preparationTime: p.preparationTimeMinutes ?? p.preparationTime ?? 0,
        productId: p.productId ?? p.product_id ?? p.id ?? '',
      })) as ProductApi[];

      setProducts(normalized);
    } catch (err) {
      console.error('loadProducts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(category);
  }, [category]);

  const openCreateModal = () => {
    console.log('[AdminProducts] openCreateModal');
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'FOOD',
      price: 0,
      currency: 'PEN',
      isAvailable: true,
      preparationTimeMinutes: 15,
      imageUrl: '',
      tags: [],
    });
    setShowModal(true);
  };

  const openEditModal = (product: ProductApi) => {
    console.log('[AdminProducts] openEditModal', product.productId);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      currency: 'PEN',
      isAvailable: product.available,
      preparationTimeMinutes: product.preparationTime || 15,
      imageUrl: product.imageUrl || '',
      tags: [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('[AdminProducts] handleSubmit', { editing: !!editingProduct, formData });
      if (editingProduct) {
        // Editar via admin service
        await adminService.updateProduct(editingProduct.productId, {
          name: formData.name,
          price: formData.price,
          description: formData.description,
          category: formData.category,
          preparationTimeMinutes: formData.preparationTimeMinutes,
          imageUrl: formData.imageUrl,
          tags: formData.tags,
        });
      } else {
        // Crear via admin service
        const created = await adminService.createProduct(formData as any);
        console.log('[AdminProducts] create result', created);
      }
      setShowModal(false);
      loadProducts(category);
    } catch (err) {
      console.error('handleSubmit', err);
      alert(`Error: ${err}`);
    }
  };

  const handleToggleAvailability = async (product: ProductApi) => {
    try {
      console.log('[AdminProducts] toggleAvailability', product.productId, !product.available);
      // Use admin update endpoint to toggle availability
      await adminService.updateProduct(product.productId, { isAvailable: !product.available });
      setProducts(prev => prev.map(p => 
        p.productId === product.productId ? { ...p, available: !p.available } : p
      ));
    } catch (err) {
      console.error('toggleProductAvailability', err);
      alert(`Error: ${err}`);
    }
  };

  if (loading) return <div className="p-4">Cargando productos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Productos</h2>
        <button onClick={openCreateModal} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          + Nuevo producto
        </button>
      </div>

      {/* Filtro por categoría */}
      <div className="bg-white p-4 rounded shadow">
        <label className="block text-sm font-medium mb-2">Filtrar por categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-3 py-2">
          <option value="ALL">Todas</option>
          <option value="FOOD">Comida</option>
          <option value="DRINK">Bebidas</option>
          <option value="DESSERT">Postres</option>
        </select>
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Nombre</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Disponible</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.productId} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-sm text-gray-600">{p.description}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">S/ {p.price.toFixed(2)}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleAvailability(p)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      p.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {p.available ? 'Disponible' : 'No disponible'}
                  </button>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="FOOD">FOOD</option>
                      <option value="DRINK">DRINK</option>
                      <option value="DESSERT">DESSERT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Precio (PEN)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiempo prep. (min)</label>
                    <input
                      type="number"
                      value={formData.preparationTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: parseInt(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      />
                      <span className="text-sm font-medium">Disponible</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL Imagen</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com/image.jpg"
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
                    {editingProduct ? 'Guardar cambios' : 'Crear producto'}
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
