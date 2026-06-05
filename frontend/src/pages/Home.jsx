import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const PAGE_SIZE = 12;

function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await api.get('/products/', { params });
      setProducts(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / PAGE_SIZE));
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.has('search') && !searchQuery) {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, searchQuery, setSearchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className="home-container container fade-in">
      {searchQuery && (
        <div className="search-results-header">
          <h2>Search Results for "{searchQuery}"</h2>
          <button className="btn-secondary" onClick={() => { setSearchParams({}); setPage(1); }}>
            Clear Search
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading amazing toys...</div>
      ) : products.length === 0 ? (
        <div className="empty-state glass">
          <p>No toys found. {searchQuery ? 'Try a different search term.' : ''}</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls glass">
              <button className="btn-secondary" onClick={prevPage} disabled={page === 1}>
                ← Prev
              </button>
              <span>
                Page <span className="page-num">{page}</span> of {totalPages}
              </span>
              <button className="btn-secondary" onClick={nextPage} disabled={page === totalPages}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
