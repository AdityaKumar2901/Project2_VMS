import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import styles from './CheckoutPage.module.css';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'USA',
    notes: ''
  });

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

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await customerAPI.createOrder(formData);
      if (response.data.success) {
        navigate(`/orders/${response.data.data.order_id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>Your cart is empty</h2>
          <p>Add some products before checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Checkout</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h2>📍 Shipping Address</h2>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>City *</label>
                <input
                  type="text"
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>State *</label>
                <input
                  type="text"
                  value={formData.shipping_state}
                  onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>ZIP Code *</label>
                <input
                  type="text"
                  value={formData.shipping_zip}
                  onChange={(e) => setFormData({ ...formData, shipping_zip: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Country</label>
                <input
                  type="text"
                  value={formData.shipping_country}
                  onChange={(e) => setFormData({ ...formData, shipping_country: e.target.value })}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Order Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </form>

        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          {cart.items.map(item => (
            <div key={item.id} className={styles.orderItem}>
              <div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemQty}>Qty: {item.quantity}</div>
              </div>
              <div className={styles.itemPrice}>
                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
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
            className={styles.placeOrderBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Placing Order...' : '🛍️ Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
