import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI, customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './VendorDetailPage.module.css';

const VendorDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    loadVendor();
  }, [id]);

  const loadVendor = async () => {
    try {
      const response = await publicAPI.getVendorById(id);
      if (response.data.success) {
        const data = response.data.data;
        setVendor(data.vendor);
        setProducts(data.products || []);
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading vendor:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = async (productId) => {
    if (!user || user.role !== 'customer') {
      alert('Please login as a customer to add items to cart');
      return;
    }

    setAddingToCart(productId);
    try {
      await customerAPI.addToCart({ product_id: productId, quantity: 1 });
      alert('Added to cart!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    }
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading vendor...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Vendor not found</h2>
          <Link to="/vendors">← Back to Vendors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/vendors" className={styles.backLink}>
        ← Back to Vendors
      </Link>

      <div className={styles.vendorHeader}>
        <div className={styles.headerContent}>
          <div 
            className={styles.vendorAvatar}
            style={{ 
              background: `linear-gradient(135deg, hsl(${vendor.id * 40}, 70%, 60%), hsl(${vendor.id * 40 + 40}, 70%, 50%))` 
            }}
          >
            🏪
          </div>
          <div className={styles.vendorInfo}>
            <h1 className={styles.shopName}>{vendor.shop_name}</h1>
            <div className={styles.vendorMeta}>
              <span className={styles.metaItem}>📍 {vendor.city}, {vendor.state}</span>
              {vendor.email && <span className={styles.metaItem}>✉️ {vendor.email}</span>}
              {vendor.phone && <span className={styles.metaItem}>📞 {vendor.phone}</span>}
            </div>
            <p className={styles.description}>
              {vendor.description || 'Quality products from a local vendor'}
            </p>
            <div className={styles.stats}>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{products.length}</div>
                <div className={styles.statLabel}>Products</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>⭐ {(vendor.avg_rating || 0).toFixed(1)}</div>
                <div className={styles.statLabel}>Rating</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statValue}>{reviews.length}</div>
                <div className={styles.statLabel}>Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products ({products.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews ({reviews.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div className={styles.productsGrid}>
          {products.length === 0 ? (
            <div className={styles.empty}>
              <p>No products available from this vendor yet</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className={styles.productCard}>
                <img 
                  src={product.image_url || 'https://via.placeholder.com/250x180'} 
                  alt={product.name}
                  className={styles.productImage}
                />
                <div className={styles.productInfo}>
                  <Link to={`/products/${product.id}`} className={styles.productName}>
                    {product.name}
                  </Link>
                  <div className={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</div>
                  <div className={styles.productStock}>
                    {product.stock_qty > 0 ? (
                      <span className={styles.inStock}>In Stock ({product.stock_qty})</span>
                    ) : (
                      <span className={styles.outOfStock}>Out of Stock</span>
                    )}
                  </div>
                  {user?.role !== 'vendor' && (
                    <button
                      className={styles.addToCartBtn}
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id || product.stock_qty === 0}
                    >
                      {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className={styles.reviewsList}>
          {reviews.length === 0 ? (
            <div className={styles.empty}>
              <p>No reviews yet for this vendor</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewerName}>{review.customer_name || 'Customer'}</span>
                  <span className={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                </div>
                <div className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
                <p className={styles.reviewText}>{review.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDetailPage;
