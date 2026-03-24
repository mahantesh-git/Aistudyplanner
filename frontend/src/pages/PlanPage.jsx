import React, { useContext, useEffect, useState } from 'react';
import { PlanContext } from '../context/PlanContext';
import { TaskContext } from '../context/TaskContext';
import { Link } from 'react-router-dom';

const PlanPage = () => {
  const { plans, loading: plansLoading, fetchPlans, generatePlan, startSession, completeStudySession } = useContext(PlanContext);
  const { tasks, loading: tasksLoading, fetchTasks, updateTaskStatus, completeTask } = useContext(TaskContext);
  const [activePlan, setActivePlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentSessionTimer, setCurrentSessionTimer] = useState(0);

  useEffect(() => {
    fetchPlans();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (plans && plans.length > 0) {
      setActivePlan(plans[0]); // Just pick the first one for now
    }
  }, [plans]);

  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setCurrentSessionTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    await generatePlan();
    setGenerating(false);
  };

  const handleStartSession = async (taskIds) => {
    try {
      await startSession(activePlan._id, taskIds);
      setSessionActive(true);
      setCurrentSessionTimer(0);
    } catch (error) {
      console.error('Error starting session', error);
      alert('Failed to start session');
    }
  };

  const handleCompleteSession = async () => {
    try {
      await completeStudySession(activePlan._id, Math.ceil(currentSessionTimer / 60));
      setSessionActive(false);
      setCurrentSessionTimer(0);
      alert('Session completed! Good job.');
    } catch (error) {
      console.error('Error completing session', error);
      alert('Failed to complete session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (plansLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Find due tasks that we can focus on
  const dueTasks = tasks.filter(task => task.status === 'pending');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your AI Study Plan</h1>
          <p className="text-gray-600 mt-2">Personalized learning schedule based on spaced repetition</p>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 disabled:opacity-50"
        >
          {generating ? 'Regenerating...' : 'Regenerate Plan'}
        </button>
      </div>

      {!activePlan ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <h2 className="text-xl font-medium text-gray-700 mb-2">No Active Study Plan Found</h2>
          <p className="text-gray-500 mb-6">Create subjects and topics to generate a personalized study schedule.</p>
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
          >
            {generating ? 'Generating...' : 'Generate New Plan'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Plan Area */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Active Study Session */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center text-gray-800">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  Focus Session
                </h2>
                {sessionActive && (
                  <div className="text-2xl font-mono font-bold text-blue-600">
                    {formatTime(currentSessionTimer)}
                  </div>
                )}
              </div>
              
              {!sessionActive ? (
                <div>
                  <p className="text-gray-600 mb-6">Start a focused study session to review your tasks and improve retention.</p>
                  
                  {dueTasks.length > 0 ? (
                    <button
                      onClick={() => handleStartSession(dueTasks.map(t => t._id))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 shadow-sm flex justify-center items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Start Recommended Session ({dueTasks.length} tasks)
                    </button>
                  ) : (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm mt-1">Check back later or manually review subjects.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">In Progress</h3>
                    <p className="text-sm text-blue-600">You are currently studying {dueTasks.length} tasks. Minimize distractions and focus on the material.</p>
                  </div>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {dueTasks.map(task => (
                      <div key={task._id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          {task.topic && <p className="text-xs text-gray-500 mt-1">{task.topic.title}</p>}
                        </div>
                        <button
                          onClick={() => completeTask(task._id)}
                          className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded border border-emerald-200 text-sm transition"
                        >
                          Mark Complete
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleCompleteSession}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 shadow-sm mt-4"
                  >
                    Finish Session
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Review Schedule</h2>
              <div className="space-y-4">
                {activePlan.schedule && activePlan.schedule.length > 0 ? (
                  activePlan.schedule.map((entry, index) => (
                    <div key={index} className="flex border-l-2 border-gray-200 pl-4 py-2 relative">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full -left-[7px] top-4 border-2 border-white"></div>
                      <div className="w-1/4">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="w-3/4 space-y-2">
                        {entry.items.map((item, i) => (
                          <div key={i} className="bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-100">
                            <span className="font-medium">{item.task?.title || 'Unknown Task'}</span>
                            <span className="text-gray-400 mx-2">•</span>
                            <span>{item.type === 'learning' ? 'Learn' : 'Review'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No scheduled items found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Plan Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending Review</span>
                  <span className="font-medium text-yellow-600">{dueTasks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-medium text-emerald-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  Manage all tasks
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanPage;
