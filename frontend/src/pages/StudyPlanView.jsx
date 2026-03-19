import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const StudyPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const { data } = await api.get(`/study-plans/${id}`);
      setPlan(data);
    } catch (err) {
      setError('Failed to fetch study plan details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicStatus = async (topicId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await api.put(`/study-plans/${id}/topics/${topicId}`, { status: newStatus });
      fetchPlan(); // Refresh data
    } catch (err) {
      console.error('Failed to update topic status', err);
      // In a real app, you might show a toast notification here
    }
  };

  const deletePlan = async () => {
    if (window.confirm('Are you sure you want to delete this study plan?')) {
      try {
        await api.delete(`/study-plans/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete study plan.');
      }
    }
  };

  const calculateProgress = () => {
    if (!plan || !plan.topics || plan.topics.length === 0) return 0;
    const completed = plan.topics.filter(t => t.status === 'completed').length;
    return Math.round((completed / plan.topics.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Study plan not found'}
        </div>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 hover:underline">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-blue-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>
        <div className="space-x-2">
          <Link to={`/plans/edit/${plan._id}`} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium">Edit</Link>
          <button onClick={deletePlan} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">Delete</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
          {plan.description && <p className="text-gray-600 mb-4">{plan.description}</p>}
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-700">Progress</span>
              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="p-0">
          <ul className="divide-y divide-gray-200">
            {plan.topics && plan.topics.map((topic, index) => (
              <li key={topic._id || index} className="px-6 py-4 hover:bg-gray-50 flex items-center">
                <button 
                  onClick={() => toggleTopicStatus(topic._id, topic.status)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                    topic.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {topic.status === 'completed' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                </button>
                <div className="flex-grow">
                  <span className={`text-lg ${topic.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {topic.title}
                  </span>
                </div>
              </li>
            ))}
            {(!plan.topics || plan.topics.length === 0) && (
              <li className="px-6 py-8 text-center text-gray-500">
                No topics added to this plan yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanView;
