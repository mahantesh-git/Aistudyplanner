import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import topicService from '../services/topicService';
import subjectService from '../services/subjectService';

const DIFF_LABELS = { 1: 'Beginner', 2: 'Easy', 3: 'Medium', 4: 'Hard', 5: 'Expert' };
const DIFF_COLORS = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-teal-100 text-teal-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
};

const TopicsPage = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [subjectId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Pull subject (which contains the embedded topics array)
      const subjectData = await subjectService.getById(subjectId);
      setSubject(subjectData);
      setTopics(subjectData.topics || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch subject/topics', err);
      setError('Failed to load topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Topic title is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        difficulty: Number(difficulty),
        ...(estimatedTime ? { estimatedTime: Number(estimatedTime) } : {}),
      };
      await topicService.create(subjectId, payload);
      setTitle('');
      setDescription('');
      setDifficulty(3);
      setEstimatedTime('');
      await fetchAll(); // Refresh — response is the whole subject
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (topicId) => {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await topicService.delete(subjectId, topicId);
      setTopics(prev => prev.filter(t => t._id !== topicId));
    } catch (err) {
      console.error('Failed to delete topic', err);
    }
  };

  const handleMarkStudied = async (topicId) => {
    try {
      const updated = await topicService.markStudied(subjectId, topicId);
      setTopics(updated.topics || []);
    } catch (err) {
      console.error('Failed to mark topic as studied', err);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/subjects"
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Subjects
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">
          {subject?.name || 'Loading…'}
        </h1>
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add topic form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Topic</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Sorting Algorithms"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Time (minutes)</label>
              <input
                type="number"
                min="1"
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
                placeholder="e.g. 45"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty: <span className="font-bold text-indigo-600">{DIFF_LABELS[difficulty] || difficulty}</span>
            </label>
            <input
              type="range" min="1" max="5" step="1"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Beginner</span><span>Easy</span><span>Medium</span><span>Hard</span><span>Expert</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {submitting ? 'Adding…' : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Topic
              </>
            )}
          </button>
        </form>
      </div>

      {/* Topics list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No topics yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first topic above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium mb-4">{topics.length} topic{topics.length !== 1 ? 's' : ''}</p>
          {topics.map(topic => (
            <div
              key={topic._id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 group hover:shadow-md transition ${
                topic.completed ? 'border-emerald-100 opacity-75' : 'border-gray-100'
              }`}
            >
              {/* Completion indicator */}
              <button
                onClick={() => !topic.completed && handleMarkStudied(topic._id)}
                title={topic.completed ? 'Completed' : 'Mark as studied'}
                className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  topic.completed
                    ? 'bg-emerald-500 border-emerald-500 text-white cursor-default'
                    : 'border-gray-300 hover:border-indigo-500 cursor-pointer'
                }`}
              >
                {topic.completed && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className={`font-medium text-gray-900 ${topic.completed ? 'line-through text-gray-400' : ''}`}>
                    {topic.title}
                  </p>
                  {topic.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[topic.difficulty] || 'bg-gray-100 text-gray-500'}`}>
                      {DIFF_LABELS[topic.difficulty] || `Difficulty ${topic.difficulty}`}
                    </span>
                  )}
                  {topic.completed && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Studied
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {topic.estimatedTime && <span>⏱ {topic.estimatedTime} min</span>}
                  {topic.lastStudied && (
                    <span>Last studied: {new Date(topic.lastStudied).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                {!topic.completed && (
                  <button
                    onClick={() => handleMarkStudied(topic._id)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-xs font-medium px-2"
                    title="Mark as studied"
                  >
                    ✓ Done
                  </button>
                )}
                <button
                  onClick={() => handleDelete(topic._id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsPage;
