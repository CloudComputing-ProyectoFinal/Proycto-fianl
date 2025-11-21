import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CartItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  menu_item: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addToCart = async (menuItemId: string, quantity: number = 1) => {
    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }
    
    try {
      setLoading(true);
      // TODO: POST a /cart endpoint del backend AWS Lambda
      console.log('Add to cart:', { menuItemId, quantity, userId: user.id });
      
      // Simulación temporal
      alert('Producto agregado al carrito (demo mode)');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      // TODO: PUT a /cart/{id} endpoint del backend AWS Lambda
      console.log('Update quantity:', { cartItemId, quantity });
      
      setCartItems(items =>
        items.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      // TODO: DELETE a /cart/{id} endpoint del backend AWS Lambda
      console.log('Remove from cart:', cartItemId);
      
      setCartItems(items => items.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      // TODO: DELETE a /cart endpoint del backend AWS Lambda
      console.log('Clear cart');
      
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount,
  };
}
