import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import styles from './OrderDetailPage.module.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await customerAPI.getOrderById(id);
      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (error) {
      setError('Failed to load order details');
      console.error('Error loading order:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Order not found</h2>
          <Link to="/orders">← Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/orders" className={styles.backLink}>
        ← Back to Orders
      </Link>

      <div className={styles.orderHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.orderId}>Order #{order.id}</h1>
          <span className={`${styles.orderStatus} ${styles[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className={styles.orderMeta}>
          <span>📅 Placed on {new Date(order.placed_at || order.created_at).toLocaleDateString()}</span>
          <span>💳 Payment: {order.payment_method || 'COD'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2>📦 Order Items</h2>
        <div className={styles.itemsList}>
          {order.items?.map(item => (
            <div key={item.id} className={styles.item}>
              <img 
                src={item.image_url || 'https://via.placeholder.com/80'} 
                alt={item.name}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <div className={styles.itemName}>{item.product_name || item.name}</div>
                <div className={styles.itemVendor}>by {item.shop_name || 'Vendor'}</div>
                <div className={styles.itemQty}>Qty: {item.quantity}</div>
              </div>
              <div className={styles.itemPrice}>
                ${(parseFloat(item.unit_price || item.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grand}`}>
            <span>Total</span>
            <span>${parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2>📍 Shipping Details</h2>
        <div className={styles.addressGrid}>
          <div className={styles.addressBlock}>
            <h3>Shipping Address</h3>
            <p>
              {order.shipping_address}<br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
              {order.shipping_country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
