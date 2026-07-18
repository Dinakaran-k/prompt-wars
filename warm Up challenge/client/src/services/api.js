import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 25000, // 25 second timeout to accommodate Gemini generation and database operations
});

export const plansApi = {
  createPlan: async (planData) => {
    const response = await api.post('/plans', planData);
    return response.data;
  },
  getPlans: async () => {
    const response = await api.get('/plans');
    return response.data;
  },
  getPlan: async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  }
};

export default api;
