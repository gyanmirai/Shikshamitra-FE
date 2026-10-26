import { configureStore } from '@reduxjs/toolkit';
import { Provider, useDispatch } from 'react-redux';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import confirmPopup, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { useSubjectAssignment } from './useSubjectAssignment';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), refetch: vi.fn() }));

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/hooks/use-debounce', () => ({ useDebounceEffect: vi.fn() }));
vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/academic/curriculumSubjects',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => ({ data: [], isLoading: false, isFetching: false, refetch: mocks.refetch }),
}));
vi.mock(
  'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api',
  () => ({
    useGetSubjectKpiQuery: vi.fn(),
    useGetSubjectAssignmentsQuery: vi.fn(),
    useCopySubjectAssignmentsMutation: () => [mocks.mutate, { isLoading: false }],
    useArchiveSubjectAssignmentMutation: () => [mocks.mutate, { isLoading: false }],
    useRestoreSubjectAssignmentMutation: () => [mocks.mutate, { isLoading: false }],
  })
);
vi.mock('./useClassSelection', () => ({
  useClassSelection: () => ({ allClass: [], classes: 'Class 6', classId: 'class-6' }),
}));
vi.mock('./useSubjectMutations', () => ({
  useSubjectMutations: () => ({ isDeleteLoading: false, isPublishLoading: false }),
}));

function Fixture() {
  const assignment = useSubjectAssignment();
  const dispatch = useDispatch();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          assignment.handleEditSubject({
            id: 'allocation-1',
            status: 0,
            classId: 'class-6',
            className: 'Class 6',
            subjectName: 'English',
            subjectType: 0,
          })
        }
      >
        Edit allocation
      </button>
      <output aria-label="Edit identity">
        {assignment.isEdit ? assignment.selectedSubject?.id : 'None'}
      </output>
      {assignment.addSubjectDialog.value && (
        <section aria-label="Allocation form">
          <input
            aria-label="Learning goal"
            defaultValue="Original goal"
            onChange={() => dispatch(setIsChanges(true))}
          />
          <button type="button" onClick={() => assignment.handleClose(null, false)}>
            Back
          </button>
          <button type="button" onClick={() => assignment.handleClose(null, true)}>
            Complete save
          </button>
        </section>
      )}
      {assignment.discardConfirmation}
    </>
  );
}

function setup() {
  const store = configureStore({
    reducer: { confirmPopup, globalState: () => ({ currentMedium: null }) },
  });
  render(
    <Provider store={store}>
      <Fixture />
    </Provider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit allocation' }));
  return store;
}

beforeEach(() => {
  mocks.mutate.mockClear();
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('keeps the dirty allocation and edit identity mounted until discard is chosen', () => {
  const store = setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Learning goal' }), {
    target: { value: 'Revised goal' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));

  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Learning goal' })).toHaveValue('Revised goal');
  expect(screen.getByLabelText('Edit identity')).toHaveTextContent('allocation-1');
  expect(store.getState().confirmPopup.isChanges).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.queryByRole('region', { name: 'Allocation form' })).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Edit identity')).toHaveTextContent('None');
  expect(store.getState().confirmPopup.isChanges).toBe(false);
  expect(window.confirm).not.toHaveBeenCalled();
  expect(mocks.mutate).not.toHaveBeenCalled();
});

it.each([false, true])(
  'closes a clean or successfully submitted allocation without prompting (submitted: %s)',
  (submitted) => {
    const store = setup();
    if (submitted) {
      fireEvent.change(screen.getByRole('textbox', { name: 'Learning goal' }), {
        target: { value: 'Saved goal' },
      });
    }
    fireEvent.click(screen.getByRole('button', { name: submitted ? 'Complete save' : 'Back' }));

    expect(screen.queryByRole('region', { name: 'Allocation form' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Edit identity')).toHaveTextContent('None');
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mocks.mutate).not.toHaveBeenCalled();
  }
);
