import { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // GET /api/study-plan  — preview the AI-generated plan
  const fetchDailyPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/study-plan');
      setPlan(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch study plan');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Alias — some components call fetchPlans
  const fetchPlans = fetchDailyPlan;
  // plans array for components that expect an array
  const plans = plan ? [plan] : [];

  // POST /api/study-plan/generate  — generate and save plan as tasks
  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/study-plan/generate');
      console.log(res.data);
      setPlan(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate plan';
      setError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlanContext.Provider value={{
      plan,
      plans,
      loading,
      error,
      fetchDailyPlan,
      fetchPlans,
      generatePlan,
    }}>
      {children}
    </PlanContext.Provider>
  );
};
