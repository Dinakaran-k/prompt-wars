import axios from 'axios';
import { getOrCreateSessionId } from '../hooks/useSession';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  config.headers['X-Session-Id'] = getOrCreateSessionId();
  return config;
});

export default api;
