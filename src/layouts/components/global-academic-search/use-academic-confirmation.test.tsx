import { vi, it, expect, beforeEach } from 'vitest';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { useAcademicConfirmation } from './use-academic-confirmation';

import type { GlobalAcademicSearchOption } from './types';

const state = vi.hoisted(() => ({ show: vi.fn() }));
beforeEach(() => state.show.mockReset());
vi.mock('src/hooks/use-confirm-dialog', () => ({ useConfirmDialog: () => [state.show, null] }));
const option = {
  label: '2027-28',
  value: 'year-2',
  academicYear: { id: 'year-2', name: '2027-28' },
  board: {},
  medium: {},
} as GlobalAcademicSearchOption;

function Fixture({
  busy = false,
  dirty = false,
  apply,
}: {
  busy?: boolean;
  dirty?: boolean;
  apply: () => void;
}) {
  const guard = useUnsavedNavigation(dirty, { guardContextChanges: true, blockNavigation: busy });
  const { changeSelection } = useAcademicConfirmation({
    isYearOnly: true,
    isStudentModule: true,
    options: [option],
    selectedOption: null,
    applyAcademicOption: apply,
  });
  return (
    <>
      <button type="button" onClick={() => changeSelection(option)}>
        Change year
      </button>
      {guard.confirmation}
    </>
  );
}

it('rechecks active writes after the clean year-change confirmation resolves', async () => {
  let confirm!: (value: boolean) => void;
  state.show.mockReturnValueOnce(
    new Promise<boolean>((resolve) => {
      confirm = resolve;
    })
  );
  const apply = vi.fn();
  const view = render(<Fixture apply={apply} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change year' }));
  view.rerender(<Fixture apply={apply} busy />);
  await act(async () => confirm(true));
  await waitFor(() => expect(state.show).toHaveBeenCalledOnce());
  expect(apply).not.toHaveBeenCalled();
});

it('protects a draft created while the clean year-change confirmation was open', async () => {
  let confirm!: (value: boolean) => void;
  state.show.mockReturnValueOnce(
    new Promise<boolean>((resolve) => {
      confirm = resolve;
    })
  );
  const apply = vi.fn();
  const view = render(<Fixture apply={apply} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change year' }));
  view.rerender(<Fixture apply={apply} dirty />);
  await act(async () => confirm(true));
  expect(apply).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(apply).not.toHaveBeenCalled();
});
