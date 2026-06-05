import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

// Root of the backend server (no trailing /api/)
export const MEDIA_BASE = BASE.replace(/\/api\/?$/, '');

/**
 * Given a raw image value from the DB, return a fully-qualified URL.
 * Handles:
 *   - already absolute  "http://..."        → return as-is
 *   - /media/...        "/media/products/x" → prepend MEDIA_BASE
 *   - bare filename     "x.jpg"             → prepend MEDIA_BASE/media/products/
 *   - empty / null                          → return null
 */
export function resolveImage(image) {
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/media/')) return `${MEDIA_BASE}${image}`;
  // bare filename — assumed to live in /media/products/
  return `${MEDIA_BASE}/media/products/${image}`;
}

const api = axios.create({
  baseURL: BASE,
});

const authRequiredPrefixes = [
  '/orders/',
  '/admin/',
];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const url = config.url || '';
  const shouldAttachToken = Boolean(
    token && authRequiredPrefixes.some((prefix) => url.startsWith(prefix))
  );

  if (shouldAttachToken) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isAdmin');
    }
    return Promise.reject(error);
  }
);

export default api;
