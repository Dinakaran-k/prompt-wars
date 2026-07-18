import { useState, useEffect, useCallback } from 'react';
import { plansApi } from '../services/api';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansApi.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.response?.data?.error || 'Failed to retrieve meal plans history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectPlan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansApi.getPlan(id);
      setCurrentPlan(data);
    } catch (err) {
      console.error(`Failed to load plan ${id}:`, err);
      setError(err.response?.data?.error || 'Failed to load the selected meal plan.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await plansApi.createPlan(formData);
      setPlans(prev => [data, ...prev]);
      setCurrentPlan(data);
      return data;
    } catch (err) {
      console.error('Failed to generate plan:', err);
      const msg = err.response?.data?.error || 'Failed to generate meal plan. Please check your server and API key.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async (id) => {
    setError(null);
    try {
      await plansApi.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      setCurrentPlan(prev => {
        if (prev && prev.id === id) {
          return null;
        }
        return prev;
      });
    } catch (err) {
      console.error(`Failed to delete plan ${id}:`, err);
      setError(err.response?.data?.error || 'Failed to delete the meal plan.');
      throw err;
    }
  }, []);

  // Load plans on mount
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    currentPlan,
    setCurrentPlan,
    loading,
    error,
    setError,
    fetchPlans,
    selectPlan,
    generatePlan,
    deletePlan
  };
}
