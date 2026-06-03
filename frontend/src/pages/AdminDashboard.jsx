import { useState, useEffect, useRef } from 'react';
import api from '../api';
import './AdminDashboard.css';

/* ── Edit Modal ──────────────────────────────────────────── */
const EditModal = ({ product, onClose, onSaved }) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(product.quantity);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product.image || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    if (imageFile) formData.append('image', imageFile);
    try {
      // Do NOT set Content-Type — let browser set it with the boundary
      const res = await api.patch(`/admin/products/${product.id}/`, formData);
      setMsg({ type: 'success', text: 'Product updated!' });
      onSaved(res.data);
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Update failed.';
      setMsg({ type: 'error', text: detail });
    } finally {
      setLoading(false);
    }
  };

  const imgSrc = preview.startsWith('blob:')
    ? preview
    : preview
    ? `http://localhost:8000${preview}`
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Product</h3>
          <button className="modal-close" onClick={onClose}>&#x2715;</button>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Toy Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></label>
          <div className="form-row">
            <label>Price (&#8377;)<input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
            <label>Quantity<input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></label>
          </div>
          <label>Replace Image (optional)<input type="file" accept="image/*" onChange={handleImageChange} /></label>
          {imgSrc && (
            <div className="edit-img-preview">
              <img src={imgSrc} alt="preview" />
            </div>
          )}
          {msg.text && <p className={msg.type === 'error' ? 'error-msg' : 'success-msg'}>{msg.text}</p>}
          <div className="form-row">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Dashboard ──────────────────────────────────────── */
const AdminDashboard = () => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);

  const [orders, setOrders] = useState([]);
  const [orderError, setOrderError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.get('/products/?limit=100&offset=0');
      setProducts(res.data.results || []);
    } catch { /* silent */ }
    finally { setProductsLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders/');
      const orderData = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];
      setOrders(orderData);
    } catch {
      setOrderError('Failed to load orders.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { setUploadMsg({ type: 'error', text: 'Please select an image.' }); return; }
    setUploadLoading(true);
    setUploadMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('image', imageFile);

    try {
      // Do NOT set Content-Type manually — Axios + browser sets it with the multipart boundary
      const res = await api.post('/admin/products/', formData);
      setUploadMsg({ type: 'success', text: 'Product uploaded successfully!' });
      setProducts((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setProductName(''); setDescription(''); setPrice(''); setQuantity('');
      setImageFile(null);
      document.getElementById('image-upload').value = '';
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      setUploadMsg({ type: 'error', text: `Upload failed: ${detail}` });
    } finally { setUploadLoading(false); }
  };

  const handleSaved = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditTarget(null);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { alert('Delete failed.'); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/`, { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch { alert('Failed to update status.'); }
  };

  return (
    <div className="admin-dashboard container fade-in">
      <h2>Admin Dashboard</h2>

      <div className="admin-layout">
        {/* Add New Toy */}
        <section className="admin-section glass upload-section">
          <h3>Add New Toy</h3>
          <form onSubmit={handleProductSubmit} className="admin-form">
            <label>Toy Name<input value={productName} onChange={(e) => setProductName(e.target.value)} required /></label>
            <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required /></label>
            <div className="form-row">
              <label>Price (&#8377;)<input type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
              <label>Quantity<input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></label>
            </div>
            <label>Product Image<input type="file" id="image-upload" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required /></label>
            {uploadMsg.text && <p className={uploadMsg.type === 'error' ? 'error-msg' : 'success-msg'}>{uploadMsg.text}</p>}
            <button type="submit" className="btn-primary" disabled={uploadLoading}>
              {uploadLoading ? 'Uploading...' : 'Upload Toy'}
            </button>
          </form>
        </section>

        {/* Manage Products */}
        <section className="admin-section glass products-section">
          <h3>Manage Products</h3>
          {productsLoading ? <p className="loading-text">Loading products...</p>
          : products.length === 0 ? <p className="empty-text">No products yet.</p>
          : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.image ? `http://localhost:8000${p.image}` : 'https://placehold.co/48x48/1a1a2e/7c3aed?text=?'}
                          alt={p.name} className="product-thumb"
                        />
                      </td>
                      <td>{p.name}</td>
                      <td>&#8377;{Number(p.price).toLocaleString()}</td>
                      <td>{p.quantity}</td>
                      <td className="action-cell">
                        <button className="btn-secondary btn-sm" onClick={() => setEditTarget(p)}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Orders */}
      <section className="admin-section glass orders-section" style={{ marginTop: '2rem' }}>
        <h3>Manage Orders</h3>
        {ordersLoading ? <p className="loading-text">Loading orders...</p>
        : orderError ? <p className="error-msg">{orderError}</p>
        : orders.length === 0 ? <p className="empty-text">No orders placed yet.</p>
        : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Order ID</th><th>User</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map((order) => {
                  const status = order.status || 'Unknown';
                  const statusClass = status.toLowerCase().replace(/ /g, '-');
                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user_email || `User ${order.user}`}</td>
                      <td>&#8377;{Number(order.total_amount).toLocaleString()}</td>
                      <td><span className={`status-badge status-${statusClass}`}>{status}</span></td>
                      <td>
                        <select className="status-select" value={status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                          <option>Pending</option><option>Packed</option><option>Shipped</option>
                          <option>Out for Delivery</option><option>Delivered</option><option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editTarget && <EditModal product={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
    </div>
  );
};

export default AdminDashboard;
