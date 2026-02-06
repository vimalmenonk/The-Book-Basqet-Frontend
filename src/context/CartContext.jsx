import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { addCartItem, fetchCart, removeCartItem } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCart = async () => {
    if (!token) {
      setCart({ items: [], total: 0 });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchCart(token);
      setCart(data || { items: [], total: 0 });
    } catch (err) {
      setCart({ items: [], total: 0 });
      setError(err.message || 'Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [token]);

  const addItem = async (bookId) => {
    if (!token) {
      throw new Error('Please login to continue.');
    }
    const data = await addCartItem(bookId, 1, token);
    setCart(data || { items: [], total: 0 });
  };

  const removeItem = async (cartItemId) => {
    if (!token) {
      throw new Error('Please login to continue.');
    }
    await removeCartItem(cartItemId, token);
    await loadCart();
  };

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      loadCart,
      addItem,
      removeItem
    }),
    [cart, loading, error]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
