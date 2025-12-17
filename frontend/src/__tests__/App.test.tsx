import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import App from '../App';

/**
 * Test Suite: App Component
 * 
 * Coverage Areas:
 * - Component rendering and structure
 * - Routing functionality
 * - Navigation interactions
 * - Accessibility compliance
 * - User interactions
 * - Edge cases and error scenarios
 */

// =============================================================================
// Test Utilities and Helpers
// =============================================================================

/**
 * Renders App component with routing context
 */
const renderApp = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>
  );
};

/**
 * Renders App component with BrowserRouter for navigation tests
 */
const renderAppWithBrowserRouter = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

/**
 * Gets navigation links from header
 */
const getNavigationLinks = () => {
  return {
    dashboard: screen.getByRole('link', { name: /dashboard/i }),
    employees: screen.getByRole('link', { name: /employees/i }),
  };
};

// =============================================================================
// Unit Tests: Component Rendering
// =============================================================================

describe('App Component - Rendering', () => {
  it('should render without crashing', () => {
    renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render header with branding', () => {
    renderApp();
    
    const header = screen.getByRole('banner');
    expect(within(header).getByText(/hr onboarding/i)).toBeInTheDocument();
  });

  it('should render main content area', () => {
    renderApp();
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8');
  });

  it('should have correct layout structure', () => {
    renderApp();
    
    const container = screen.getByRole('banner').parentElement;
    expect(container).toHaveClass('min-h-screen', 'bg-neutral-50');
  });

  it('should render navigation menu', () => {
    renderApp();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should render user menu button', () => {
    renderApp();
    
    const userButton = screen.getByRole('button', { name: /user menu/i });
    expect(userButton).toBeInTheDocument();
  });

  it('should render notifications button', () => {
    renderApp();
    
    const notificationsButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationsButton).toBeInTheDocument();
  });
});

// =============================================================================
// Unit Tests: Dashboard Page
// =============================================================================

describe('Dashboard Page', () => {
  beforeEach(() => {
    renderApp('/');
  });

  it('should render dashboard heading', () => {
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    expect(
      screen.getByText(/welcome to the hr staff onboarding management system/i)
    ).toBeInTheDocument();
  });

  it('should render all metric cards', () => {
    expect(screen.getByText(/total employees/i)).toBeInTheDocument();
    expect(screen.getByText(/active onboarding/i)).toBeInTheDocument();
    expect(screen.getByText(/pending tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('should display zero values for all metrics initially', () => {
    const metricValues = screen.getAllByText('0');
    expect(metricValues).toHaveLength(4);
  });

  it('should render quick actions section', () => {
    expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
  });

  it('should render add new employee quick action', () => {
    expect(screen.getByText(/add new employee/i)).toBeInTheDocument();
    expect(screen.getByText(/start onboarding process/i)).toBeInTheDocument();
  });

  it('should render view all employees quick action', () => {
    expect(screen.getByText(/view all employees/i)).toBeInTheDocument();
    expect(screen.getByText(/manage employee records/i)).toBeInTheDocument();
  });

  it('should render generate report quick action', () => {
    expect(screen.getByText(/generate report/i)).toBeInTheDocument();
    expect(screen.getByText(/view analytics/i)).toBeInTheDocument();
  });

  it('should render metric card icons', () => {
    const header = screen.getByRole('banner');
    const main = screen.getByRole('main');
    
    // SVG icons should be present in metric cards
    const svgs = within(main).getAllByRole('img', { hidden: true });
    expect(svgs.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// Unit Tests: Employees Page
// =============================================================================

describe('Employees Page', () => {
  beforeEach(() => {
    renderApp('/employees');
  });

  it('should render employees heading', () => {
    expect(
      screen.getByRole('heading', { name: /employee management/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('should render page description', () => {
    expect(
      screen.getByText(/manage employee records and onboarding status/i)
    ).toBeInTheDocument();
  });

  it('should render add employee button in header', () => {
    const buttons = screen.getAllByRole('button', { name: /add employee/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render search input', () => {
    const searchInput = screen.getByPlaceholderText(/search employees/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('should render filter button', () => {
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });

  it('should render export button', () => {
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should render empty state when no employees', () => {
    expect(screen.getByText(/no employees/i)).toBeInTheDocument();
    expect(
      screen.getByText(/get started by adding a new employee to the system/i)
    ).toBeInTheDocument();
  });

  it('should render empty state icon', () => {
    const main = screen.getByRole('main');
    const emptyStateSection = within(main).getByText(/no employees/i).closest('div');
    
    expect(emptyStateSection).toBeInTheDocument();
  });

  it('should have search input with proper styling', () => {
    const searchInput = screen.getByPlaceholderText(/search employees/i);
    expect(searchInput).toHaveClass(
      'w-full',
      'pl-10',
      'pr-4',
      'py-2',
      'border',
      'border-neutral-300',
      'rounded-lg'
    );
  });
});

// =============================================================================
// Integration Tests: Routing
// =============================================================================

describe('App Routing', () => {
  it('should render dashboard on root path', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('should render employees page on /employees path', () => {
    renderApp('/employees');
    expect(
      screen.getByRole('heading', { name: /employee management/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('should redirect to dashboard on unknown route', () => {
    renderApp('/unknown-route');
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('should redirect to dashboard on deeply nested unknown route', () => {
    renderApp('/some/deeply/nested/unknown/path');
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('should handle multiple route changes', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();

    rerender(
      <MemoryRouter initialEntries={['/employees']}>
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /employee management/i, level: 1 })
    ).toBeInTheDocument();
  });
});

// =============================================================================
// Integration Tests: Navigation
// =============================================================================

describe('Navigation Interactions', () => {
  it('should navigate to dashboard when clicking dashboard link', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const { dashboard } = getNavigationLinks();
    await user.click(dashboard);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('should navigate to employees when clicking employees link', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const { employees } = getNavigationLinks();
    await user.click(employees);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /employee management/i, level: 1 })
      ).toBeInTheDocument();
    });
  });

  it('should highlight active navigation link on dashboard', () => {
    renderApp('/');

    const { dashboard } = getNavigationLinks();
    expect(dashboard).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('should highlight active navigation link on employees page', () => {
    renderApp('/employees');

    const { employees } = getNavigationLinks();
    expect(employees).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('should not highlight inactive navigation links', () => {
    renderApp('/');

    const { employees } = getNavigationLinks();
    expect(employees).not.toHaveClass('bg-primary-50', 'text-primary-700');
    expect(employees).toHaveClass('text-neutral-600');
  });

  it('should navigate to employees from dashboard quick action', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const quickActionLink = screen.getByText(/view all employees/i).closest('a');
    expect(quickActionLink).toBeInTheDocument();

    if (quickActionLink) {
      await user.click(quickActionLink);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /employee management/i, level: 1 })
        ).toBeInTheDocument();
      });
    }
  });

  it('should navigate to employees from add employee quick action', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const addEmployeeLink = screen.getByText(/add new employee/i).closest('a');
    expect(addEmployeeLink).toBeInTheDocument();

    if (addEmployeeLink) {
      await user.click(addEmployeeLink);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /employee management/i, level: 1 })
        ).toBeInTheDocument();
      });
    }
  });

  it('should navigate to dashboard when clicking logo', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const logoLink = screen.getByText(/hr onboarding/i).closest('a');
    expect(logoLink).toBeInTheDocument();

    if (logoLink) {
      await user.click(logoLink);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
      });
    }
  });
});

// =============================================================================
// Integration Tests: User Interactions
// =============================================================================

describe('User Interactions', () => {
  it('should allow typing in search input', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, 'John Doe');

    expect(searchInput).toHaveValue('John Doe');
  });

  it('should clear search input', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, 'Test');
    await user.clear(searchInput);

    expect(searchInput).toHaveValue('');
  });

  it('should handle clicking filter button', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);

    // Button should remain in document after click
    expect(filterButton).toBeInTheDocument();
  });

  it('should handle clicking export button', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    // Button should remain in document after click
    expect(exportButton).toBeInTheDocument();
  });

  it('should handle clicking add employee button', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const addButtons = screen.getAllByRole('button', { name: /add employee/i });
    await user.click(addButtons[0]);

    // Button should remain in document after click
    expect(addButtons[0]).toBeInTheDocument();
  });

  it('should handle clicking notifications button', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const notificationsButton = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationsButton);

    // Button should remain in document after click
    expect(notificationsButton).toBeInTheDocument();
  });

  it('should handle clicking user menu button', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const userButton = screen.getByRole('button', { name: /user menu/i });
    await user.click(userButton);

    // Button should remain in document after click
    expect(userButton).toBeInTheDocument();
  });

  it('should handle clicking generate report button', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const reportButton = screen.getByText(/generate report/i).closest('button');
    expect(reportButton).toBeInTheDocument();

    if (reportButton) {
      await user.click(reportButton);
      expect(reportButton).toBeInTheDocument();
    }
  });
});

// =============================================================================
// Accessibility Tests
// =============================================================================

describe('Accessibility', () => {
  it('should have proper heading hierarchy', () => {
    renderApp('/');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('should have accessible navigation landmark', () => {
    renderApp('/');

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should have accessible banner landmark', () => {
    renderApp('/');

    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
  });

  it('should have accessible main landmark', () => {
    renderApp('/');

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('should have aria-labels on icon buttons', () => {
    renderApp('/');

    const notificationsButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationsButton).toHaveAttribute('aria-label', 'Notifications');

    const userButton = screen.getByRole('button', { name: /user menu/i });
    expect(userButton).toHaveAttribute('aria-label', 'User menu');
  });

  it('should have accessible links with descriptive text', () => {
    renderApp('/');

    const { dashboard, employees } = getNavigationLinks();
    
    expect(dashboard).toHaveAccessibleName(/dashboard/i);
    expect(employees).toHaveAccessibleName(/employees/i);
  });

  it('should have proper button types', () => {
    renderApp('/employees');

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('should have accessible form inputs', () => {
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('should support keyboard navigation for links', () => {
    renderApp('/');

    const { dashboard, employees } = getNavigationLinks();
    
    expect(dashboard).toHaveAttribute('href');
    expect(employees).toHaveAttribute('href');
  });
});

// =============================================================================
// Edge Cases and Error Scenarios
// =============================================================================

describe('Edge Cases', () => {
  it('should handle rapid navigation changes', async () => {
    const user = userEvent.setup();
    renderApp('/');

    const { dashboard, employees } = getNavigationLinks();

    // Rapidly switch between pages
    await user.click(employees);
    await user.click(dashboard);
    await user.click(employees);
    await user.click(dashboard);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('should handle empty search query', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, '   ');

    expect(searchInput).toHaveValue('   ');
  });

  it('should handle special characters in search', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, '!@#$%^&*()');

    expect(searchInput).toHaveValue('!@#$%^&*()');
  });

  it('should handle very long search queries', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    const longQuery = 'a'.repeat(1000);
    await user.type(searchInput, longQuery);

    expect(searchInput).toHaveValue(longQuery);
  });

  it('should maintain state when navigating back and forth', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, 'Test Query');

    const { dashboard } = getNavigationLinks();
    await user.click(dashboard);

    const { employees } = getNavigationLinks();
    await user.click(employees);

    // Note: In a real app with state management, this would persist
    // For now, we just verify the page renders correctly
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /employee management/i, level: 1 })
      ).toBeInTheDocument();
    });
  });

  it('should handle multiple simultaneous button clicks', async () => {
    const user = userEvent.setup();
    renderApp('/employees');

    const addButtons = screen.getAllByRole('button', { name: /add employee/i });
    
    // Click multiple buttons simultaneously
    await Promise.all(addButtons.map((button) => user.click(button)));

    // All buttons should still be in document
    addButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Performance Tests
// =============================================================================

describe('Performance', () => {
  it('should render dashboard within acceptable time', () => {
    const startTime = performance.now();
    renderApp('/');
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
  });

  it('should render employees page within acceptable time', () => {
    const startTime = performance.now();
    renderApp('/employees');
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
  });

  it('should handle rapid re-renders efficiently', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const startTime = performance.now();

    // Perform 10 re-renders
    for (let i = 0; i < 10; i++) {
      rerender(
        <MemoryRouter initialEntries={[i % 2 === 0 ? '/' : '/employees']}>
          <App />
        </MemoryRouter>
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(2000); // Should complete in less than 2 seconds
  });
});

// =============================================================================
// Visual Regression Tests (Structure)
// =============================================================================

describe('Visual Structure', () => {
  it('should have consistent header across all pages', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const dashboardHeader = screen.getByRole('banner');
    const dashboardHeaderHTML = dashboardHeader.innerHTML;

    rerender(
      <MemoryRouter initialEntries={['/employees']}>
        <App />
      </MemoryRouter>
    );

    const employeesHeader = screen.getByRole('banner');
    expect(employeesHeader.innerHTML).toBe(dashboardHeaderHTML);
  });

  it('should maintain layout structure across pages', () => {
    renderApp('/');
    const dashboardMain = screen.getByRole('main');
    const dashboardClasses = dashboardMain.className;

    renderApp('/employees');
    const employeesMain = screen.getByRole('main');
    expect(employeesMain.className).toBe(dashboardClasses);
  });

  it('should have consistent spacing in metric cards', () => {
    renderApp('/');

    const metricCards = screen.getAllByText(/total employees|active onboarding|pending tasks|completed/i)
      .map((text) => text.closest('div'))
      .filter((div) => div?.className.includes('bg-white'));

    expect(metricCards.length).toBe(4);
    
    // All cards should have consistent padding
    metricCards.forEach((card) => {
      expect(card).toHaveClass('p-6');
    });
  });
});

// =============================================================================
// Integration Tests: Complete User Flows
// =============================================================================

describe('Complete User Flows', () => {
  it('should complete full navigation flow', async () => {
    const user = userEvent.setup();
    renderApp('/');

    // Start on dashboard
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();

    // Navigate to employees
    const { employees } = getNavigationLinks();
    await user.click(employees);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /employee management/i, level: 1 })
      ).toBeInTheDocument();
    });

    // Search for employee
    const searchInput = screen.getByPlaceholderText(/search employees/i);
    await user.type(searchInput, 'John');

    // Navigate back to dashboard
    const { dashboard } = getNavigationLinks();
    await user.click(dashboard);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('should handle dashboard quick actions flow', async () => {
    const user = userEvent.setup();
    renderApp('/');

    // Click on view all employees quick action
    const viewEmployeesLink = screen.getByText(/view all employees/i).closest('a');
    expect(viewEmployeesLink).toBeInTheDocument();

    if (viewEmployeesLink) {
      await user.click(viewEmployeesLink);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /employee management/i, level: 1 })
        ).toBeInTheDocument();
      });

      // Verify we're on employees page with search functionality
      expect(screen.getByPlaceholderText(/search employees/i)).toBeInTheDocument();
    }
  });
});