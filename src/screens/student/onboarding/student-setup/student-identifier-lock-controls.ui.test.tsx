import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentIdentifierLockControls from './student-identifier-lock-controls';

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useSetStudentOnboardingIdentifierLockMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
beforeEach(() => {
  mocks.save.mockReset();
  mocks.save.mockReturnValue({ unwrap: () => Promise.resolve() });
});
it('preserves an unsaved unlock reason until staff explicitly discards it', async () => {
  render(
    <StudentIdentifierLockControls
      academicYearId="year"
      divisionId="5-a"
      identifierType="gr"
      canLock
      canUnlock
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Unlock' }));
  fireEvent.change(screen.getByLabelText(/Unlock reason/), {
    target: { value: 'Correct historical assignment' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('button', { name: 'Keep editing' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText(/Unlock reason/)).toHaveValue('Correct historical assignment');
  expect(mocks.save).not.toHaveBeenCalled();
});
it('blocks duplicate lock submissions before the mutation loading state rerenders', async () => {
  let resolveSave!: () => void;
  mocks.save.mockReturnValue({
    unwrap: () =>
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
  });
  render(
    <StudentIdentifierLockControls
      academicYearId="year"
      divisionId="5-a"
      identifierType="roll"
      canLock
      canUnlock={false}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Lock' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  resolveSave();
});
it('locks only the selected identifier for students in the selected Division', async () => {
  render(
    <StudentIdentifierLockControls
      academicYearId="year"
      divisionId="5-a"
      identifierType="gr"
      canLock
      canUnlock={false}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Lock' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith({
      academicYearId: 'year',
      divisionId: '5-a',
      identifierType: 'gr',
      isLocked: true,
      reason: undefined,
    })
  );
});
it('requires an unlock reason and respects the unlock permission', async () => {
  render(
    <StudentIdentifierLockControls
      academicYearId="year"
      divisionId="5-a"
      identifierType="roll"
      canLock
      canUnlock
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Unlock' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('Enter the reason for unlocking.');
  expect(mocks.save).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Unlock reason/), {
    target: { value: 'Correct assigned Roll numbers' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        identifierType: 'roll',
        isLocked: false,
        reason: 'Correct assigned Roll numbers',
      })
    )
  );
});
it('requires a selected Division and hides unauthorized changes', () => {
  render(
    <StudentIdentifierLockControls
      academicYearId="year"
      identifierType="gr"
      canLock={false}
      canUnlock={false}
    />
  );
  expect(screen.getByRole('button', { name: 'Lock' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Unlock' })).not.toBeInTheDocument();
});
it.each(['gr', 'roll'] as const)(
  'keeps %s locking available while hiding Unlock without the server admin capability',
  (identifierType) => {
    render(
      <StudentIdentifierLockControls
        academicYearId="year"
        divisionId="5-a"
        identifierType={identifierType}
        canLock
        canUnlock={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Lock' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Unlock' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }
);

it.each(['gr', 'roll'] as const)(
  'keeps both %s lock actions compact for an authorized admin',
  (identifierType) => {
    render(
      <StudentIdentifierLockControls
        academicYearId="year"
        divisionId="5-a"
        identifierType={identifierType}
        canLock
        canUnlock
      />
    );
    ['Lock', 'Unlock'].forEach((name) => {
      expect(screen.getByRole('button', { name })).toHaveClass('MuiButton-sizeSmall');
    });
  }
);
