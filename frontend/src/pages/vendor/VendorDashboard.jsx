import { useState, useEffect, useMemo } from 'react';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './VendorDashboard.module.css';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data states
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    category_id: 1,
    price: '',
    stock_qty: '',
    image_url: ''
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    shop_name: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, productsRes, ordersRes] = await Promise.all([
        vendorAPI.getProfile(),
        vendorAPI.getProducts(),
        vendorAPI.getOrders()
      ]);

      if (profileRes.data.success) {
        const vendor = profileRes.data.data.vendor;
        setProfile(vendor);
        setProfileForm({
          shop_name: vendor.shop_name || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          description: vendor.description || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          zip: vendor.zip || ''
        });
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.data.products || []);
      }

      if (ordersRes.data.success) {
        const orderList = ordersRes.data.data.orders || [];
        setOrders(orderList);
        
        // Calculate stats
        const pendingOrders = orderList.filter(o => o.status === 'pending').length;
        // Revenue only from delivered orders
        const totalRevenue = orderList
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + parseFloat(o.total || o.total_amount || 0), 0);

        setStats({
          totalProducts: productsRes.data.data.products?.length || 0,
          totalOrders: orderList.length,
          pendingOrders,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
    }
    setLoading(false);
  };

  // Product handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await vendorAPI.updateProduct(editingProduct.id, productForm);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await vendorAPI.createProduct(productForm);
        setMessage({ type: 'success', text: 'Product created successfully!' });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save product' });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      category_id: product.category_id,
      price: product.price,
      stock_qty: product.stock_qty,
      image_url: product.image_url || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await vendorAPI.deleteProduct(productId);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete product' });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      description: '',
      category_id: 1,
      price: '',
      stock_qty: '',
      image_url: ''
    });
  };

  // Order handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, newStatus);
      setMessage({ type: 'success', text: 'Order status updated!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update order status' });
    }
  };

  // Profile handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await vendorAPI.updateProfile(profileForm);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const getStockClass = (qty) => {
    if (qty === 0) return styles.outOfStock;
    if (qty < 10) return styles.lowStock;
    return styles.inStock;
  };

  const getStockLabel = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty < 10) return `Low: ${qty}`;
    return `In Stock: ${qty}`;
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Welcome, <span className={styles.shopName}>{profile?.shop_name || user?.name}</span>!</h1>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} style={{float: 'right', background: 'none', border: 'none', cursor: 'pointer'}}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ Profile
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Products</h3>
              <div className={styles.statValue}>{stats.totalProducts}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Total Orders</h3>
              <div className={styles.statValue}>{stats.totalOrders}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Pending Orders</h3>
              <div className={styles.statValue}>{stats.pendingOrders}</div>
            </div>
            <div className={`${styles.statCard} ${styles.highlight}`}>
              <h3>Total Revenue</h3>
              <div className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h2>📈 Sales Overview</h2>
              <span className={styles.chartSubtitle}>Revenue from delivered orders over time</span>
            </div>
            <div className={styles.chartWrapper}>
              {orders.length === 0 ? (
                <div className={styles.chartEmpty}>
                  <p>No sales data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={(() => {
                      // Process orders into daily sales data
                      const salesByDate = {};
                      const deliveredOrders = orders.filter(o => o.status === 'delivered');
                      
                      // Get last 30 days
                      const today = new Date();
                      for (let i = 29; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split('T')[0];
                        salesByDate[dateStr] = { date: dateStr, sales: 0, orders: 0 };
                      }
                      
                      // Fill in actual sales
                      deliveredOrders.forEach(order => {
                        const orderDate = new Date(order.placed_at || order.created_at).toISOString().split('T')[0];
                        if (salesByDate[orderDate]) {
                          salesByDate[orderDate].sales += parseFloat(order.total || order.total_amount || 0);
                          salesByDate[orderDate].orders += 1;
                        }
                      });
                      
                      return Object.values(salesByDate).map(d => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }));
                    })()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value, name) => [
                        name === 'sales' ? `$${value.toFixed(2)}` : value,
                        name === 'sales' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#salesGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h2>Recent Orders</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className={styles.empty}>
              <p>📭 No orders yet</p>
              <p>Orders will appear here once customers start buying</p>
            </div>
          ) : (
            orders.slice(0, 5).map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>Order #{order.order_number || order.id}</span>
                    <span className={styles.orderDate}> • {new Date(order.placed_at || order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.customerName}>👤 {order.customer_name || 'Customer'}</span>
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>Total: ${parseFloat(order.total || order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className={styles.sectionHeader}>
            <h2>My Products</h2>
            <button className={styles.addBtn} onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductModal(true); }}>
              ➕ Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className={styles.empty}>
              <p>📦 No products yet</p>
              <p>Click "Add Product" to create your first listing</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className={styles.productImage} />
                          )}
                          <div>
                            <div className={styles.productName}>{product.name}</div>
                            <div className={styles.productCategory}>SKU: {product.sku || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.category_name}</td>
                      <td className={styles.price}>${parseFloat(product.price).toFixed(2)}</td>
                      <td>
                        <span className={`${styles.stock} ${getStockClass(product.stock_qty)}`}>
                          {getStockLabel(product.stock_qty)}
                        </span>
                      </td>
                      <td>⭐ {(product.avg_rating || 0).toFixed(1)} ({product.review_count || 0})</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => handleEditProduct(product)}>
                            Edit
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <div className={styles.sectionHeader}>
            <h2>All Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className={styles.empty}>
              <p>📭 No orders yet</p>
              <p>Orders will appear here once customers start buying your products</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <span className={styles.orderId}>Order #{order.id}</span>
                    <span className={styles.orderDate}> • {new Date(order.placed_at || order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>Total: ${parseFloat(order.total || order.total_amount || 0).toFixed(2)}</span>
                  <select 
                    className={styles.statusSelect}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="packed">Packed</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Shop Name</label>
              <input
                type="text"
                value={profileForm.shop_name}
                onChange={(e) => setProfileForm({ ...profileForm, shop_name: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Description</label>
              <textarea
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                placeholder="Tell customers about your shop..."
              />
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>State</label>
              <input
                type="text"
                value={profileForm.state}
                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>ZIP Code</label>
              <input
                type="text"
                value={profileForm.zip}
                onChange={(e) => setProfileForm({ ...profileForm, zip: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className={styles.saveBtn}>
            💾 Save Profile
          </button>
        </form>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className={styles.modalOverlay} onClick={() => setShowProductModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, stock_qty: e.target.value })}
                    required
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
