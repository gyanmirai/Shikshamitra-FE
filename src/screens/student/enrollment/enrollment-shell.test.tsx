import type { ReactNode } from 'react';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import EnrollmentShell from './enrollment-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/student/enrollment/pipeline',
}));

vi.mock('src/components/loading-screen', () => ({
  SplashScreen: () => <div>Loading</div>,
}));

vi.mock('./admissions-crm/enrollment-workspace-context', () => ({
  EnrollmentWorkspaceProvider: ({ children }: { children: ReactNode }) => children,
}));

describe('EnrollmentShell', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('moves focus to the enrollment workspace when the skip link is activated', () => {
    render(
      <EnrollmentShell>
        <div>Enrollment content</div>
      </EnrollmentShell>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Skip to Enrollment workspace' }));

    expect(document.activeElement).toBe(
      document.getElementById('student-enrollment-content')
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
  });
});
