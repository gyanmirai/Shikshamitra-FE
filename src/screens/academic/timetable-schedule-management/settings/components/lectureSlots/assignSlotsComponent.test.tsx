import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AssignSlots from './assignSlotsComponent';

const state = vi.hoisted(() => ({
  classes: {
    currentData: [] as { id: string; name: string; shiftId?: string }[],
    isFetching: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  },
  slots: {
    currentData: { items: [] as { standardId: string }[] },
    isFetching: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  },
  assign: vi.fn(),
  success: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({ globalState: { currentMedium: { id: 'medium' } } }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({ BackPopUpChecked: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: state.success } }));
vi.mock('src/screens/academic/setup/embedding', () => ({
  useAcademicSetupFormState: vi.fn(),
  useAcademicSetupEmbedding: () => ({ embedded: false }),
}));
vi.mock('src/redux/class/classApi', () => ({ useGetClassByMediumQuery: 'classes' }));
vi.mock('src/redux/academicAPI/timetableApi/lectureSlotsApi', () => ({
  useGetLectureSlotsQuery: 'slots',
  useAssignLectureSlotToClassesMutation: 'assign',
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({
    currentQueryAndMutation,
  }: {
    currentQueryAndMutation: 'classes' | 'slots' | 'assign';
  }) =>
    currentQueryAndMutation === 'assign'
      ? [state.assign, { isLoading: false }]
      : state[currentQueryAndMutation],
}));

function openForm() {
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AssignSlots onClose={onClose} lectureSlotId="source-slot" sourceClassName="Class 10" />
    </ThemeProvider>
  );
  return onClose;
}

async function selectTarget() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Target classes/ }));
  fireEvent.click(screen.getByRole('option', { name: /Class 9/ }));
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
}

describe('lecture slot assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(state.classes, {
      currentData: [{ id: 'target', name: 'Class 9', shiftId: 'shift' }],
      isFetching: false,
      isError: false,
      isSuccess: true,
    });
    Object.assign(state.slots, {
      currentData: { items: [{ standardId: 'source' }] },
      isFetching: false,
      isError: false,
      isSuccess: true,
    });
    state.assign.mockResolvedValue({ data: undefined });
  });

  it('shows a required multi-class field and validates native form submission', async () => {
    openForm();
    expect(screen.getByRole('combobox', { name: /Target classes/ })).toHaveAttribute(
      'aria-required',
      'true'
    );
    expect(screen.queryByText('Please select at least one class')).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: 'Assign lecture slot' }));
    expect(await screen.findByText('Please select at least one class')).toBeVisible();
    expect(screen.getByRole('combobox', { name: /Target classes/ })).toHaveFocus();
    expect(state.assign).not.toHaveBeenCalled();
  });

  it('blocks assignment until both eligibility lookups finish', () => {
    state.slots.isFetching = true;
    openForm();
    expect(screen.getByRole('status', { name: 'Loading target classes' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('shows failed lookups with retry rather than an empty or editable list', () => {
    state.classes.isError = true;
    openForm();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load target classes');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(state.classes.refetch).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('explains a successful empty class lookup', () => {
    state.classes.currentData = [];
    openForm();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No classes are available in the selected academic medium'
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('distinguishes configured classes from classes without a school shift', () => {
    state.classes.currentData.push(
      { id: 'configured', name: 'Class 8', shiftId: 'shift' },
      { id: 'unshifted', name: 'Class 7' }
    );
    state.slots.currentData.items.push({ standardId: 'configured' });
    openForm();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Target classes/ }));
    expect(screen.getByRole('option', { name: /Class 8/ })).toHaveTextContent('Already configured');
    expect(screen.getByRole('option', { name: /Class 7/ })).toHaveTextContent(
      'School shift not assigned'
    );
    expect(screen.getByRole('option', { name: /Class 8/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('option', { name: /Class 7/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('explains when every class is unavailable', () => {
    state.slots.currentData.items.push({ standardId: 'target' });
    openForm();
    expect(screen.getByRole('alert')).toHaveTextContent('No eligible target classes');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('locks edits, cancellation and duplicate submits, then closes after a void success', async () => {
    let finish!: (value: { data: undefined }) => void;
    state.assign.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const onClose = openForm();
    await selectTarget();
    const form = screen.getByRole('form', { name: 'Assign lecture slot' });
    fireEvent.submit(form);
    await waitFor(() => expect(state.assign).toHaveBeenCalledOnce());
    expect(state.assign).toHaveBeenCalledWith({
      lectureSlotId: 'source-slot',
      body: { selectedStandardIds: ['target'] },
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.submit(form);
    expect(state.assign).toHaveBeenCalledOnce();
    finish({ data: undefined });
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(state.success).toHaveBeenCalledOnce();
  });

  it('retains selected values after failure and allows retry', async () => {
    state.assign.mockResolvedValue({ error: { status: 500 } });
    const onClose = openForm();
    await selectTarget();
    fireEvent.submit(screen.getByRole('form', { name: 'Assign lecture slot' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Lecture slots could not be assigned'
    );
    expect(screen.getByRole('combobox', { name: /Target classes/ })).toHaveTextContent('Class 9');
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
