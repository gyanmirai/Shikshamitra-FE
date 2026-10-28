import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SetupShell from 'src/screens/initial-setup-screen/components/setup-shell';

vi.mock('src/components/logo', () => ({ Logo: () => <span>School logo</span> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

it('preserves initial setup labels, pending-save state and six-step navigation', () => {
  const onStep = vi.fn();
  render(
    <SetupShell
      step={2}
      furthest={3}
      pendingSteps={[1]}
      schoolCode="SCHOOL_01"
      disabled={false}
      onStep={onStep}
      footer={<button type="button">Save progress</button>}
    >
      <h1>Start with your academic year</h1>
    </SetupShell>
  );
  expect(screen.getByText('INSTITUTE SETUP')).toBeInTheDocument();
  expect(screen.getByText('Initial setup')).toBeInTheDocument();
  expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();
  expect(
    screen.getByText('Your progress is saved to your institute. You can return and continue later.')
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Welcome, completed', hidden: true })).toBeEnabled();
  const profile = screen.getByRole('button', {
    name: 'Institute profile, changes need saving',
    hidden: true,
  });
  fireEvent.click(profile);
  expect(onStep).toHaveBeenCalledWith(1);
  expect(
    screen.getByRole('button', { name: 'Academic year, completed', hidden: true })
  ).toHaveAttribute('aria-current', 'step');
  expect(screen.getByRole('contentinfo')).toContainElement(
    screen.getByRole('button', { name: 'Save progress' })
  );
});
