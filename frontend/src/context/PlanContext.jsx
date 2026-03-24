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
      
      // Transform the response to match frontend expectations
      const transformedPlan = {
        ...res.data,
        schedule: res.data.plan ? res.data.plan.map(item => ({
          date: item.scheduledTime,
          items: [{
            task: {
              title: item.topicTitle,
              _id: item.topicId
            },
            type: item.difficulty > 3 ? 'learning' : 'review'
          }]
        })) : []
      };
      
      setPlan(transformedPlan);
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
      const res = await api.post('/study-plan/generate', {
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        overwrite: true // Overwrite existing auto-generated tasks for today
      });
      console.log('Plan generation response:', res.data);
      
      // Transform the response to match frontend expectations
      const transformedPlan = {
        ...res.data,
        schedule: res.data.plan ? res.data.plan.map(item => ({
          date: item.scheduledTime,
          items: [{
            task: {
              title: item.topicTitle,
              _id: item.topicId
            },
            type: item.difficulty > 3 ? 'learning' : 'review'
          }]
        })) : []
      };
      
      setPlan(transformedPlan);
      setError(null);
      return transformedPlan;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate plan';
      setError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  // POST /api/study-sessions/start  — start a study session (local implementation)
  const startSession = async (planId, taskIds) => {
    try {
      // For now, just return a mock session since backend doesn't have session endpoints
      // In a real implementation, this would call the backend
      const sessionData = {
        sessionId: `session_${Date.now()}`,
        planId,
        taskIds,
        startTime: new Date().toISOString()
      };
      
      // Store session data locally
      localStorage.setItem('currentStudySession', JSON.stringify(sessionData));
      
      return sessionData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start session';
      throw msg;
    }
  };

  // POST /api/study-sessions/complete  — complete a study session (local implementation)
  const completeStudySession = async (sessionId, duration) => {
    try {
      // For now, just handle session completion locally
      // In a real implementation, this would call the backend
      const sessionData = {
        sessionId,
        duration,
        endTime: new Date().toISOString()
      };
      
      // Clear session data from localStorage
      localStorage.removeItem('currentStudySession');
      
      return sessionData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete session';
      throw msg;
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
      startSession,
      completeStudySession,
    }}>
      {children}
    </PlanContext.Provider>
  );
};
