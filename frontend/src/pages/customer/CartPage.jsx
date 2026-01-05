import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import styles from './CartPage.module.css';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await customerAPI.getCart();
      if (response.data.success) {
        setCart(response.data.data.cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await customerAPI.removeFromCart(itemId);
      loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>🛒 Your cart is empty</h2>
          <p>Looks like you haven't added any products yet</p>
          <Link to="/" className={styles.shopBtn}>Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shopping Cart ({cart.items.length} items)</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.cartItems}>
          {cart.items.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img 
                src={item.image_url || 'https://via.placeholder.com/120'} 
                alt={item.name}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemVendor}>by {item.shop_name || 'Vendor'}</p>
                <p className={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</p>
                <div className={styles.itemActions}>
                  <div className={styles.qtyControl}>
                    <span className={styles.qtyValue}>Qty: {item.quantity}</span>
                  </div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <button 
            className={styles.checkoutBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
