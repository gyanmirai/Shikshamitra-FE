import { addIcon } from '@iconify/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { useSubjectForm } from './useSubjectForm';

addIcon('basil:cross-solid', { body: '<path />' });
addIcon('hugeicons:tick-01', { body: '<path />' });

const mocks = vi.hoisted(() => ({
  addSubject: vi.fn(),
  updateSubject: vi.fn(),
  checkDuplicate: vi.fn(),
  addSubjectHook: vi.fn(),
  updateSubjectHook: vi.fn(),
  checkDuplicateHook: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (
    selector: (state: { globalState: { currentMedium: { id: string } } }) => unknown
  ) => selector({ globalState: { currentMedium: { id: 'medium-id' } } }),
}));

vi.mock(
  'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi',
  () => ({
    useAddSubjectMutation: mocks.addSubjectHook,
    useUpdateSubjectMutation: mocks.updateSubjectHook,
    useCheckSubjectDuplicateMutation: mocks.checkDuplicateHook,
  })
);

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) => {
    if (currentQueryAndMutation === mocks.addSubjectHook) {
      return [mocks.addSubject, { isLoading: false }];
    }
    if (currentQueryAndMutation === mocks.updateSubjectHook) {
      return [mocks.updateSubject, { isLoading: false }];
    }
    return [mocks.checkDuplicate, { isLoading: false }];
  },
}));

function SubjectFormHarness() {
  const { formik, possibleDuplicateDialog } = useSubjectForm({
    onClose: mocks.onClose,
    editData: null,
  });

  return (
    <>
      <input
        aria-label="Subject name"
        name="subjectName"
        value={formik.values.subjectName}
        onChange={formik.handleChange}
      />
      <button
        type="button"
        onClick={() => {
          formik.setFieldValue('subjectColor', '#00A76F');
        }}
      >
        Select color
      </button>
      <button
        type="button"
        onClick={() => {
          formik.submitForm();
        }}
      >
        Submit
      </button>
      {possibleDuplicateDialog}
    </>
  );
}

describe('useSubjectForm possible duplicate confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkDuplicate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        hasExactDuplicate: false,
        hasSimilarDuplicate: true,
        matches: [{ name: 'Mathematics' }],
      }),
    });
    mocks.addSubject.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('uses an in-app confirmation, preserves values on review, and creates once on approval', async () => {
    const nativeConfirm = vi.fn();
    Object.defineProperty(window, 'confirm', { configurable: true, value: nativeConfirm });
    render(<SubjectFormHarness />);

    fireEvent.change(screen.getByLabelText('Subject name'), {
      target: { value: 'Regular Mathematics' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Select color' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Possible Duplicate Subject')).toBeVisible();
    expect(screen.getByText(/existing subject "Mathematics"/)).toBeVisible();
    expect(nativeConfirm).not.toHaveBeenCalled();
    expect(mocks.addSubject).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Review Subject' }));
    await waitFor(() => expect(screen.queryByText('Possible Duplicate Subject')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Subject name')).toHaveValue('Regular Mathematics');

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Possible Duplicate Subject');
    fireEvent.click(screen.getByRole('button', { name: 'Create Anyway' }));

    await waitFor(() => expect(mocks.addSubject).toHaveBeenCalledTimes(1));
    expect(mocks.onClose).toHaveBeenCalledWith(null, true);
  });
});
