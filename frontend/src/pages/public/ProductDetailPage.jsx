import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI, customerAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const { isCustomer, isVendor, userLocation } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const params = userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : {};
      const response = await publicAPI.getProductById(id, params);
      setProduct(response.data.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isCustomer) {
      setMessage('Please login as a customer to add items to cart');
      return;
    }

    try {
      await customerAPI.addToCart({ product_id: id, qty });
      setMessage('Added to cart successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="container" style={{padding: '2rem'}}>Product not found</div>;

  return (
    <div className="container" style={{padding: '2rem'}}>
      <Link to="/" style={{color: '#2563eb', marginBottom: '1rem', display: 'inline-block'}}>← Back to Products</Link>
      
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem'}}>
        <div>
          {product.image_url && (
            <img src={product.image_url} alt={product.name} style={{width: '100%', borderRadius: '0.75rem'}} />
          )}
        </div>
        
        <div>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>{product.name}</h1>
          <p style={{fontSize: '2rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '1rem'}}>
            ${parseFloat(product.price).toFixed(2)}
          </p>
          
          <div style={{marginBottom: '1rem'}}>
            <strong>Vendor:</strong> <Link to={`/vendors/${product.vendor_id}`}>{product.vendor_name}</Link>
          </div>
          
          {product.distance && (
            <div style={{color: '#10b981', marginBottom: '1rem'}}>
              📍 {product.distance.toFixed(1)} km away
            </div>
          )}
          
          <div style={{marginBottom: '1rem'}}>
            <strong>Stock:</strong> {product.stock_qty} available
          </div>
          
          <div style={{marginBottom: '2rem'}}>
            <strong>Rating:</strong> ⭐ {parseFloat(product.avg_rating || 0).toFixed(1)} ({product.review_count} reviews)
          </div>
          
          <div style={{marginBottom: '1rem'}}>
            <strong>Description:</strong>
            <p style={{marginTop: '0.5rem'}}>{product.description}</p>
          </div>
          
          {message && <div className={message.includes('success') ? 'success-message' : 'error-message'}>{message}</div>}
          
          {product.stock_qty > 0 && !isVendor && (
            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
              <input 
                type="number" 
                min="1" 
                max={product.stock_qty}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value))}
                style={{width: '80px', padding: '0.75rem', borderRadius: '0.5rem', border: '2px solid #e5e7eb'}}
              />
              <button onClick={handleAddToCart} className="btn btn-primary">
                Add to Cart
              </button>
            </div>
          )}
          
          {isVendor && (
            <div style={{marginTop: '2rem', padding: '1rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#92400e'}}>
              ℹ️ Vendors cannot purchase products. Switch to a customer account to shop.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
