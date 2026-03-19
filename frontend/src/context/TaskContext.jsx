import { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // GET /api/tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // POST /api/tasks
  const addTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      setTasks(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to add task';
    }
  };

  // Alias
  const createTask = addTask;

  // PUT /api/tasks/:id
  const updateTask = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update task';
    }
  };

  // Convenience wrapper — update status field (and optional confidenceScore)
  const updateTaskStatus = async (id, status, confidenceScore) => {
    const updates = { status };
    if (confidenceScore !== undefined) updates.confidenceScore = confidenceScore;
    return updateTask(id, updates);
  };

  // PATCH /api/tasks/:id/complete
  const completeTask = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/complete`);
      setTasks(prev => prev.map(t => (t._id === id ? res.data : t)));
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to complete task';
    }
  };

  // DELETE /api/tasks/:id
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete task';
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      loading,
      error,
      fetchTasks,
      addTask,
      createTask,
      updateTask,
      updateTaskStatus,
      completeTask,
      deleteTask,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
