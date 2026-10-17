import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import StudentPendingTasks from './student-pending-tasks';

import type { StudentPendingTask } from './student-setup-summary';

const studentName = 'Jay Patel';
const tasks: StudentPendingTask[] = [
  {
    key: 'documents',
    label: 'Documents need checking',
    actionLabel: 'Review documents',
    view: 'readiness',
  },
  {
    key: 'roll_number',
    label: 'Roll no. not assigned',
    actionLabel: 'Assign roll no.',
    view: 'roll-number',
  },
  {
    key: 'accounts',
    label: 'App login needs setup',
    actionLabel: 'Open App Login',
    view: 'credentials',
  },
];

describe('Visible student pending work', () => {
  it('shows the first task without opening a tooltip and navigates to its owning workspace', () => {
    const onOpenTask = vi.fn();
    render(
      <StudentPendingTasks
        studentName={studentName}
        tasks={[tasks[0]]}
        emptyText="No pending work"
        onOpenTask={onOpenTask}
      />
    );
    const task = screen.getByRole('button', { name: `Documents need checking for ${studentName}` });
    expect(task).toBeVisible();
    expect(screen.queryByRole('button', { name: /Show all pending work/ })).not.toBeInTheDocument();
    fireEvent.click(task);
    expect(onOpenTask).toHaveBeenCalledExactlyOnceWith('readiness');
  });

  it('expands and collapses additional work using a keyboard-accessible control', async () => {
    const user = userEvent.setup();
    const onOpenTask = vi.fn();
    render(
      <StudentPendingTasks
        studentName={studentName}
        tasks={tasks}
        emptyText="No pending work"
        onOpenTask={onOpenTask}
      />
    );
    const expand = screen.getByRole('button', { name: `Show all pending work for ${studentName}` });
    expect(expand).toHaveTextContent('+2 more');
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Roll no. not assigned')).not.toBeInTheDocument();
    expand.focus();
    await user.keyboard('{Enter}');
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(expand).toHaveAccessibleName(`Show less pending work for ${studentName}`);
    expect(
      screen.getByRole('button', { name: `Roll no. not assigned for ${studentName}` })
    ).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: `App login needs setup for ${studentName}` })
    );
    expect(onOpenTask).toHaveBeenCalledExactlyOnceWith('credentials');
    await user.click(expand);
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('App login needs setup')).not.toBeInTheDocument();
  });

  it('opens each supplied destination without triggering a containing row action', () => {
    const onOpenTask = vi.fn();
    const onRowClick = vi.fn();
    const destinations: StudentPendingTask[] = [
      ...tasks,
      {
        key: 'gr_number',
        label: 'GR no. not assigned',
        actionLabel: 'Assign GR no.',
        view: 'gr-number',
      },
      {
        key: 'placement',
        label: 'Division not assigned',
        actionLabel: 'Assign division',
        view: 'division',
      },
      {
        key: 'finance_accounts_services',
        label: 'Fees, app access and services need checking',
        actionLabel: 'Open Fees',
        view: 'fees',
      },
    ];
    render(
      <div role="presentation" onClick={onRowClick}>
        <StudentPendingTasks
          studentName={studentName}
          tasks={destinations}
          emptyText="No pending work"
          onOpenTask={onOpenTask}
        />
      </div>
    );
    fireEvent.click(
      screen.getByRole('button', { name: `Show all pending work for ${studentName}` })
    );
    destinations.forEach((task, index) => {
      fireEvent.click(screen.getByRole('button', { name: `${task.label} for ${studentName}` }));
      expect(onOpenTask).toHaveBeenNthCalledWith(index + 1, task.view);
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('shows the supplied empty explanation without an action or misleading count', () => {
    render(
      <StudentPendingTasks
        studentName={studentName}
        tasks={[]}
        emptyText="Completion check pending"
        onOpenTask={vi.fn()}
      />
    );
    expect(screen.getByText('Completion check pending')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('No pending work')).not.toBeInTheDocument();
  });

  it('disables task navigation during blocking work but keeps the remaining list readable', () => {
    const onOpenTask = vi.fn();
    render(
      <StudentPendingTasks
        studentName={studentName}
        tasks={tasks}
        emptyText="No pending work"
        onOpenTask={onOpenTask}
        disabled
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: `Show all pending work for ${studentName}` })
    );
    tasks.forEach((task) => {
      const button = screen.getByRole('button', { name: `${task.label} for ${studentName}` });
      expect(button).toBeVisible();
      expect(button).toBeDisabled();
      fireEvent.click(button);
    });
    expect(onOpenTask).not.toHaveBeenCalled();
  });
});
