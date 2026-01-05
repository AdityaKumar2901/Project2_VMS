import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../../services/api';
import styles from './OrdersPage.module.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await customerAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h2>📦 No orders yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/" className={styles.shopBtn}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Orders</h1>
      </div>

      <div className={styles.ordersList}>
        {orders.map(order => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <span className={styles.orderId}>Order #{order.id}</span>
                <span className={styles.orderDate}>
                  {' • '}{new Date(order.placed_at || order.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className={styles.orderBody}>
              <div className={styles.orderFooter}>
                <span className={styles.orderTotal}>
                  Total: ${parseFloat(order.total_amount).toFixed(2)}
                </span>
                <Link to={`/orders/${order.id}`} className={styles.viewBtn}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
