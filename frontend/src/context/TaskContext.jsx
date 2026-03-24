import { createContext, useState, useContext, useCallback } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';
import { normalizeTask, normalizeTasks, prepareTaskForBackend } from '../utils/taskUtils';
import { createErrorFromResponse } from '../utils/errorUtils';

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
      const normalizedTasks = normalizeTasks(res.data);
      setTasks(normalizedTasks);
      setError(null);
    } catch (err) {
      const error = createErrorFromResponse(err);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // POST /api/tasks
  const addTask = async (taskData) => {
    try {
      const backendData = prepareTaskForBackend(taskData);
      const res = await api.post('/tasks', backendData);
      const normalizedTask = normalizeTask(res.data);
      setTasks(prev => [...prev, normalizedTask]);
      return normalizedTask;
    } catch (err) {
      const error = createErrorFromResponse(err);
      throw error;
    }
  };

  // Alias
  const createTask = addTask;

  // PUT /api/tasks/:id
  const updateTask = async (id, updates) => {
    try {
      const backendUpdates = prepareTaskForBackend(updates);
      const res = await api.put(`/tasks/${id}`, backendUpdates);
      const normalizedTask = normalizeTask(res.data);
      setTasks(prev => prev.map(t => (t._id === id ? normalizedTask : t)));
      return normalizedTask;
    } catch (err) {
      const error = createErrorFromResponse(err);
      throw error;
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
      const normalizedTask = normalizeTask(res.data);
      setTasks(prev => prev.map(t => (t._id === id ? normalizedTask : t)));
      return normalizedTask;
    } catch (err) {
      const error = createErrorFromResponse(err);
      throw error;
    }
  };

  // DELETE /api/tasks/:id
  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      const error = createErrorFromResponse(err);
      throw error;
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
