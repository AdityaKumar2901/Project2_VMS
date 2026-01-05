import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import styles from './VendorDirectoryPage.module.css';

const VendorDirectoryPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const response = await publicAPI.getVendors();
      if (response.data.success) {
        setVendors(response.data.data.vendors || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
    setLoading(false);
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏪 Local Vendors</h1>
        <p>Discover vendors in your area</p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search vendors by name or city..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredVendors.length === 0 ? (
        <div className={styles.empty}>
          <h2>No vendors found</h2>
          <p>Try adjusting your search</p>
        </div>
      ) : (
        <div className={styles.vendorGrid}>
          {filteredVendors.map(vendor => (
            <Link 
              key={vendor.id} 
              to={`/vendors/${vendor.id}`} 
              className={styles.vendorCard}
            >
              <div 
                className={styles.vendorImage}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${vendor.id * 40}, 70%, 60%), hsl(${vendor.id * 40 + 40}, 70%, 50%))` 
                }}
              />
              <div className={styles.vendorInfo}>
                <h3 className={styles.shopName}>{vendor.shop_name}</h3>
                <div className={styles.vendorLocation}>
                  📍 {vendor.city}, {vendor.state}
                </div>
                <p className={styles.vendorDescription}>
                  {vendor.description || 'Quality products from a local vendor'}
                </p>
                <div className={styles.vendorStats}>
                  <span className={styles.stat}>
                    <span className={styles.rating}>⭐</span>
                    <strong>{(vendor.avg_rating || 0).toFixed(1)}</strong>
                  </span>
                  <span className={styles.stat}>
                    📦 <strong>{vendor.product_count || 0}</strong> products
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDirectoryPage;
