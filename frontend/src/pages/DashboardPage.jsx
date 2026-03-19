import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TaskContext } from '../context/TaskContext';
import { PlanContext } from '../context/PlanContext';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-4 items-center`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const QuickLink = ({ to, label, description, icon, colorClass }) => (
  <Link
    to={to}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-start gap-4"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition">{label}</p>
      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
    <svg className="w-5 h-5 ml-auto self-center text-gray-300 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { tasks, fetchTasks } = useContext(TaskContext);
  const { plan, fetchDailyPlan, loading: planLoading } = useContext(PlanContext);

  useEffect(() => {
    fetchTasks();
    fetchDailyPlan();
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="text-indigo-600">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your study overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          color="bg-indigo-50"
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          color="bg-emerald-50"
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Review"
          value={pendingTasks}
          color="bg-yellow-50"
          sub={pendingTasks > 0 ? 'Needs attention' : 'All caught up!'}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          color="bg-purple-50"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Overall Progress</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{completedTasks} of {tasks.length} tasks completed</p>
        </div>
      )}

      {/* AI Plan status */}
      {!planLoading && (
        <div className={`rounded-2xl border p-5 mb-10 flex items-center gap-4 ${
          plan ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            plan ? 'bg-indigo-100' : 'bg-gray-200'
          }`}>
            <svg className={`w-5 h-5 ${plan ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className={`font-semibold ${plan ? 'text-indigo-800' : 'text-gray-600'}`}>
              {plan ? 'Your AI study plan is ready!' : 'No AI study plan yet'}
            </p>
            <p className={`text-sm ${plan ? 'text-indigo-600' : 'text-gray-400'}`}>
              {plan ? 'Review your personalized schedule and start a session.' : 'Generate a plan based on your subjects and topics.'}
            </p>
          </div>
          <Link
            to="/plan"
            className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition ${
              plan
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {plan ? 'Open Plan' : 'Generate Plan'}
          </Link>
        </div>
      )}

      {/* Quick nav */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink
          to="/subjects"
          label="Subjects"
          description="Manage subjects and topics"
          colorClass="bg-blue-50"
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <QuickLink
          to="/plan"
          label="Study Plan"
          description="View and start study sessions"
          colorClass="bg-purple-50"
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />
        <QuickLink
          to="/tasks"
          label="Tasks"
          description="Create and manage your tasks"
          colorClass="bg-emerald-50"
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
