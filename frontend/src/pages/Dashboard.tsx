import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Dashboard page component for HR administrators
 * 
 * Provides an overview of the onboarding system with:
 * - Welcome message with current date
 * - Quick statistics cards showing key metrics
 * - Navigation cards to main features
 * - Responsive design using Tailwind CSS
 * 
 * @component
 */
const Dashboard: React.FC = () => {
  /**
   * Get formatted current date for welcome message
   * @returns Formatted date string (e.g., "Monday, December 16, 2025")
   */
  const getCurrentDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  /**
   * Statistics data for quick overview cards
   * In production, these would be fetched from the API
   */
  const stats = [
    {
      id: 'total-employees',
      label: 'Total Employees',
      value: '0',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      id: 'active-onboarding',
      label: 'Active Onboarding',
      value: '0',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'pending-tasks',
      label: 'Pending Tasks',
      value: '0',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'completed-this-month',
      label: 'Completed This Month',
      value: '0',
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  /**
   * Quick action cards for navigation to main features
   */
  const quickActions = [
    {
      id: 'add-employee',
      title: 'Add New Employee',
      description: 'Start the onboarding process for a new hire',
      link: '/employees/new',
      icon: (
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      hoverBgColor: 'hover:bg-primary-100',
    },
    {
      id: 'view-employees',
      title: 'View All Employees',
      description: 'Manage and track employee onboarding status',
      link: '/employees',
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverBgColor: 'hover:bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome to HR Onboarding
          </h1>
          <p className="text-neutral-600">{getCurrentDate()}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.link}
                className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${action.hoverBgColor}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.bgColor} flex-shrink-0`}>
                    <div className={action.color}>{action.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {action.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-neutral-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-neutral-600 mb-2">No recent activity</p>
              <p className="text-sm text-neutral-500">
                Activity will appear here once you start onboarding employees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;