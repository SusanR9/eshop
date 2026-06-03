import { useEffect, useState } from 'react';
import api from '../api';
import './History.css';

const STATUS_SEQUENCE = [
  'Pending',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const normalizeOrders = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const buildStatusSlug = (status) => {
  if (!status) return 'pending';
  return status.toLowerCase().replace(/\s+/g, '-');
};

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/history/');
        setOrders(normalizeOrders(response.data));
      } catch (err) {
        setError('Failed to fetch order history.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="history-loading">Loading your orders...</div>;
  if (error) return <div className="history-error">{error}</div>;

  return (
    <div className="history-page container fade-in">
      <h2>Order History</h2>

      {orders.length === 0 ? (
        <div className="empty-history glass">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = order.status || 'Pending';
            const statusSlug = buildStatusSlug(status);
            const activeStep = STATUS_SEQUENCE.findIndex(
              (step) => step.toLowerCase() === status.toLowerCase()
            );

            return (
              <div key={order.id} className="order-card glass">
                <div className="order-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={`order-status status-${statusSlug}`}>
                    {status}
                  </span>
                </div>

                <div className="order-body">
                  <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₹{Number(order.total_amount || 0).toLocaleString()}</p>
                  <p><strong>Payment:</strong> {order.payment_mode === 'razorpay' ? 'Online' : 'Cash on Delivery'}</p>
                </div>

                <div className="tracking-steps">
                  {STATUS_SEQUENCE.map((step, index) => (
                    <div
                      key={step}
                      className={`tracking-step ${index <= activeStep ? 'active' : ''}`}
                    >
                      <div className="tracking-dot" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="order-items">
                  <h4>Items</h4>
                  <ul>
                    {order.items?.length > 0 ? (
                      order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.product_name} × {item.quantity} (₹{item.price})
                        </li>
                      ))
                    ) : (
                      <li>No items found for this order.</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
