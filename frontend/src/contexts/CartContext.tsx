import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (menuItem: any, quantity?: number) => Promise<{ success: boolean; error?: any }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fridays_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    console.log('📦 CartProvider: Loading cart from localStorage');
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('📦 Loaded cart items:', parsed);
        setCartItems(parsed);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cartItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [cartItems]);

  const addToCart = async (menuItem: any, quantity: number = 1) => {
    try {
      setLoading(true);

      console.log('🛒 Adding to cart:', menuItem);

      const productId = menuItem.id || menuItem.productId;

      console.log('Product ID:', productId);
      console.log('Current cart items:', cartItems);

      const existingItem = cartItems.find(item => item.menu_item_id === productId);

      if (existingItem) {
        console.log('Item exists, updating quantity');
        setCartItems(items =>
          items.map(item =>
            item.menu_item_id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        console.log('Adding new item to cart');
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random()}`,
          menu_item_id: productId,
          quantity,
          menu_item: {
            id: productId,
            name: menuItem.name,
            price: menuItem.price,
            image_url: menuItem.image_url || menuItem.imageUrl,
          },
        };
        console.log('New cart item:', newItem);
        setCartItems(items => {
          const newItems = [...items, newItem];
          console.log('Updated cart items:', newItems);
          return newItems;
        });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      console.log('Update quantity:', { cartItemId, quantity });

      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

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

  const value: CartContextType = {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
