import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Header component for the HR Onboarding application
 * Provides responsive navigation, branding, and user authentication status
 * 
 * Features:
 * - Responsive design with Tailwind CSS
 * - Active route highlighting
 * - Accessible navigation with ARIA attributes
 * - User authentication status display
 * - Notification bell icon
 * 
 * @component
 */
const Header: React.FC = () => {
  const location = useLocation();

  /**
   * Determines if the current route matches the provided path
   * Used for active navigation state styling
   * 
   * @param path - The route path to check against current location
   * @returns True if the current path matches the provided path
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <header 
      className="bg-white border-b border-neutral-200 shadow-sm"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Section */}
          <div className="flex items-center">
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              aria-label="HR Onboarding Home"
            >
              <div 
                className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg"
                aria-hidden="true"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-neutral-900">
                HR Onboarding
              </span>
            </Link>

            {/* Main Navigation */}
            <nav 
              className="ml-10 flex items-center space-x-4"
              role="navigation"
              aria-label="Main navigation"
            >
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isActive('/')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Dashboard
              </Link>
              <Link
                to="/employees"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isActive('/employees')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                aria-current={isActive('/employees') ? 'page' : undefined}
              >
                Employees
              </Link>
            </nav>
          </div>

          {/* User Actions Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications Button */}
            <button
              type="button"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="View notifications"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* User Profile Button */}
            <button
              type="button"
              className="flex items-center space-x-3 p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="User menu"
              aria-haspopup="true"
            >
              <div 
                className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-sm font-medium text-white">HR</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;