import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { userLocation } = useAuth();

  useEffect(() => {
    fetchData();
  }, [userLocation, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 12,
        ...(userLocation && { lat: userLocation.lat, lng: userLocation.lng }),
        ...(selectedCategory && { category: selectedCategory }),
      };

      const [productsRes, categoriesRes, vendorsRes] = await Promise.all([
        publicAPI.getProducts(params),
        publicAPI.getCategories(),
        publicAPI.getVendors({ ...params, limit: 6 }),
      ]);

      setProducts(productsRes.data.data.products);
      setCategories(categoriesRes.data.data.categories);
      setVendors(vendorsRes.data.data.vendors);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const params = {
        search,
        page: 1,
        limit: 12,
        ...(userLocation && { lat: userLocation.lat, lng: userLocation.lng }),
      };
      const response = await publicAPI.getProducts(params);
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading marketplace...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Discover Local Shops Near You</h1>
        <p>Support local businesses and get quality products delivered to your door</p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            🔍 Search
          </button>
        </form>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <h2>Browse by Category</h2>
        <div className={styles.categories}>
          <button
            onClick={() => setSelectedCategory('')}
            className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`${styles.categoryBtn} ${
                selectedCategory === category.slug ? styles.active : ''
              }`}
            >
              {category.name} ({category.product_count})
            </button>
          ))}
        </div>
      </section>

      {/* Nearby Vendors */}
      {vendors.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Nearby Vendors</h2>
            <Link to="/vendors" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          <div className={styles.vendorGrid}>
            {vendors.map((vendor) => (
              <Link key={vendor.id} to={`/vendors/${vendor.id}`} className={styles.vendorCard}>
                <h3>{vendor.shop_name}</h3>
                <p className={styles.vendorLocation}>
                  📍 {vendor.city}, {vendor.state}
                </p>
                {vendor.distance && (
                  <p className={styles.distance}>{vendor.distance.toFixed(1)} km away</p>
                )}
                <div className={styles.vendorStats}>
                  <span>⭐ {parseFloat(vendor.avg_rating || 0).toFixed(1)}</span>
                  <span>📦 {vendor.product_count} products</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className={styles.section}>
        <h2>Featured Products</h2>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className={styles.productCard}>
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className={styles.productImage} />
              )}
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.vendorName}>{product.vendor_name}</p>
                {product.distance && (
                  <p className={styles.distance}>{product.distance.toFixed(1)} km away</p>
                )}
                <div className={styles.productFooter}>
                  <span className={styles.price}>${parseFloat(product.price).toFixed(2)}</span>
                  <span className={styles.rating}>
                    ⭐ {parseFloat(product.avg_rating || 0).toFixed(1)}
                  </span>
                </div>
                {product.stock_qty <= 5 && product.stock_qty > 0 && (
                  <p className={styles.lowStock}>Only {product.stock_qty} left!</p>
                )}
                {product.stock_qty === 0 && (
                  <p className={styles.outOfStock}>Out of Stock</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className={styles.noResults}>
            <p>No products found. Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
