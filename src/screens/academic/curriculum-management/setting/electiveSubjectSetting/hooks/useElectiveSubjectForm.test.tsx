import { act, waitFor, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useElectiveSubjectForm } from './useElectiveSubjectForm';

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  update: vi.fn(),
  checkDuplicate: vi.fn(),
  addHook: vi.fn(),
  updateHook: vi.fn(),
  duplicateHook: vi.fn(),
  subjectsHook: vi.fn(),
  groupsHook: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: { globalState: { currentMedium: { id: string } } }) => unknown) =>
    selector({ globalState: { currentMedium: { id: 'medium-id' } } }),
}));

vi.mock('src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi', () => ({
  useGetCoreSubjectsByMediumQuery: mocks.subjectsHook,
}));

vi.mock('src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi', () => ({
  useGetElectiveGroupsQuery: mocks.groupsHook,
  useAddElectiveGroupMutation: mocks.addHook,
  useUpdateElectiveGroupMutation: mocks.updateHook,
  useCheckElectiveGroupDuplicateMutation: mocks.duplicateHook,
}));

vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) => {
    if (currentQueryAndMutation === mocks.addHook) return [mocks.add, { isLoading: false }];
    if (currentQueryAndMutation === mocks.updateHook) return [mocks.update, { isLoading: false }];
    if (currentQueryAndMutation === mocks.duplicateHook) {
      return [mocks.checkDuplicate, { isLoading: false }];
    }
    if (currentQueryAndMutation === mocks.subjectsHook) {
      return {
        data: [
          { id: 'subject-1', name: 'English', status: 'Active' },
          { id: 'subject-2', name: 'Computer Science', status: 'Active' },
          { id: 'subject-3', name: 'Science', status: 'Active' },
        ],
        isLoading: false,
      };
    }
    return { data: [], isLoading: false };
  },
}));

const editData = {
  id: 'group-1',
  name: 'Language Group',
  groupType: 'Language',
  description: 'Existing group',
  subjects: [
    { id: 'subject-1', name: 'English' },
    { id: 'subject-2', name: 'Computer Science' },
  ],
  subjectIds: ['subject-1', 'subject-2'],
  color: '#8E33FF',
  isUsed: true,
  canModifySubjects: false,
  createdBy: 'Admin',
};

describe('useElectiveSubjectForm subject membership lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkDuplicate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        hasExactDuplicate: false,
        hasSameSubjectCombination: false,
      }),
    });
    mocks.update.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
  });

  it('keeps the original subject IDs when a used group is submitted', async () => {
    const { result } = renderHook(() =>
      useElectiveSubjectForm({ onClose: mocks.onClose, editData })
    );

    expect(result.current.areSubjectsLocked).toBe(true);

    await act(async () => {
      await result.current.formik.setFieldValue('subjectIds', ['subject-1', 'subject-3']);
      await result.current.formik.submitForm();
    });

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          subjectIds: ['subject-1', 'subject-2'],
        }),
      })
    );
  });

  it('keeps subject selection editable for an unused group', () => {
    const { result } = renderHook(() =>
      useElectiveSubjectForm({
        onClose: mocks.onClose,
        editData: { ...editData, isUsed: false, canModifySubjects: true },
      })
    );

    expect(result.current.areSubjectsLocked).toBe(false);
  });
});
