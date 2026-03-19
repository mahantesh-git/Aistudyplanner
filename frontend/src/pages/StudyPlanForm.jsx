import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const StudyPlanForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      const fetchPlan = async () => {
        try {
          const { data } = await api.get(`/study-plans/${id}`);
          setTitle(data.title);
          setDescription(data.description || '');
          setTopics(data.topics && data.topics.length > 0 ? data.topics.map(t => t.title) : ['']);
        } catch (err) {
          setError('Failed to load study plan.');
        }
      };
      fetchPlan();
    }
  }, [id, isEdit]);

  const handleTopicChange = (index, value) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const removeTopic = (index) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const planData = {
        title,
        description,
        topics: topics.filter(t => t.trim() !== '').map(t => ({ title: t }))
      };

      if (isEdit) {
        await api.put(`/study-plans/${id}`, planData);
      } else {
        await api.post('/study-plans', planData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Study Plan' : 'Create New Study Plan'}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Master React in 30 Days"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the goal of this plan?"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Topics</label>
            {topics.map((topic, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  value={topic}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  placeholder="e.g. React Hooks"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  className="ml-2 text-red-500 hover:text-red-700 px-2"
                  disabled={topics.length === 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTopic}
              className="text-blue-500 text-sm hover:underline mt-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Topic
            </button>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={`px-4 py-2 rounded-lg text-white ${loading || !title.trim() ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyPlanForm;
