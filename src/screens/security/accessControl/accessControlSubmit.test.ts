import { describe, expect, it, vi } from 'vitest';

import { emptyAccessSelection } from 'src/utils/academicHierarchyUtils';

import { submitAccessControlForm } from './index';

describe('access control submit', () => {
  const allBoards = [
    {
      id: 'board-1',
      academicYearId: 'year-1',
      educationMediums: [
        {
          id: 'medium-1',
          educationMediumStages: [],
        },
      ],
    },
  ] as any;

  it('keeps the dialog open when bulk assign fails', async () => {
    const error = new Error('bulk assign failed');
    const unwrap = vi.fn().mockRejectedValue(error);
    const addAccessControl = vi.fn(() => ({ unwrap }));
    const handleClose = vi.fn();

    await expect(
      submitAccessControlForm({
        addAccessControl,
        userId: 'user-1',
        currentYearId: 'year-1',
        checkedItem: {
          ...emptyAccessSelection(),
          mediums: ['medium-1'],
        },
        allBoards,
        handleClose,
      })
    ).rejects.toThrow(error);

    expect(addAccessControl).toHaveBeenCalledTimes(1);
    expect(unwrap).toHaveBeenCalledTimes(1);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('closes only after a successful bulk assign save', async () => {
    const unwrap = vi.fn().mockResolvedValue({});
    const addAccessControl = vi.fn(() => ({ unwrap }));
    const handleClose = vi.fn();

    await expect(
      submitAccessControlForm({
        addAccessControl,
        userId: 'user-1',
        currentYearId: 'year-1',
        checkedItem: {
          ...emptyAccessSelection(),
          mediums: ['medium-1'],
        },
        allBoards,
        handleClose,
      })
    ).resolves.toBe(true);

    expect(addAccessControl).toHaveBeenCalledWith({
      academicYearIds: ['year-1'],
      userIds: ['user-1'],
      educationBoardIds: [],
      educationMediumIds: ['medium-1'],
      educationMediumStageIds: [],
      standardIds: [],
      divisionIds: [],
      clearExisting: false,
    });
    expect(unwrap).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
