import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentPendingTasks, { pendingTaskView } from './student-pending-tasks';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

it('maps pending checks to their owning tasks', () => {
  expect(pendingTaskView('fee_structure')).toBe('fees');
  expect(pendingTaskView('roll_number')).toBe('roll-number');
  expect(pendingTaskView('gr_number')).toBe('gr-number');
  expect(pendingTaskView('placement')).toBe('division');
  expect(pendingTaskView('documents')).toBe('readiness');
});
it('opens pending tasks on touch/click and links straight to the selected task', async () => {
  const open = vi.fn();
  const student = { ...studentOnboardingTestData[0], readinessItems: [{ key: 'fee_structure', label: 'Fee structure', detail: '', status: 'pending' as const, blocking: true, owner: 'Onboarding' }] };
  render(<StudentPendingTasks student={student} onOpenTask={open} />);
  fireEvent.click(screen.getByRole('button', { name: /View 1 pending items/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Fee structure' }));
  expect(open).toHaveBeenCalledWith('fees');
});
