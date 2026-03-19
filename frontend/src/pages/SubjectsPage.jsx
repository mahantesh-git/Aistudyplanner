import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subjectService from '../services/subjectService';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await subjectService.create({ name, description });
      setName('');
      setDescription('');
      fetchSubjects();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.delete(id);
        fetchSubjects();
      } catch (err) {
        console.error('Failed to delete subject', err);
      }
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Subjects</h1>
      
      {error && <div className="bg-red-50 text-red-500 p-4 mb-6 rounded">{error}</div>}

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Subject</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Subject
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject._id} className="bg-white shadow rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{subject.name}</h3>
            <p className="text-gray-500 text-sm mb-4 flex-grow">{subject.description}</p>
            <div className="flex justify-between items-center mt-auto">
              <Link
                to={`/subjects/${subject._id}/topics`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View Topics →
              </Link>
              <button
                onClick={() => handleDelete(subject._id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No subjects found. Create your first subject above!
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;
