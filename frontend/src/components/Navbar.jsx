import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/plan', label: 'Study Plan' },
  { to: '/tasks', label: 'Tasks' },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link
            to={user ? '/dashboard' : '/login'}
            className="flex items-center gap-2 text-indigo-600 font-bold text-lg"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            AI Study Planner
          </Link>

          {user ? (
            <>
              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map(({ to, label }) => {
                  const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* User + logout */}
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setMenuOpen(o => !o)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 pb-4 space-y-1 pt-2">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === to ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
