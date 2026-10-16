import { it, vi, expect, describe } from 'vitest';
import { emptyAccessSelection } from 'src/utils/academicHierarchyUtils';

import { submitAccessControlForm } from './services/submit-access-control';

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
    const addAccessControl = vi.fn((_body: Record<string, unknown>) => ({ unwrap }));
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
    const addAccessControl = vi.fn((_body: Record<string, unknown>) => ({ unwrap }));
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

    const payload = addAccessControl.mock.calls[0][0];
    expect(payload).toEqual({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      scopes: [
        {
          educationBoardId: 'board-1',
          educationMediumId: 'medium-1',
        },
      ],
      clearExisting: false,
    });
    expect(payload).not.toHaveProperty('academicYearIds');
    expect(payload).not.toHaveProperty('educationBoardIds');
    expect(payload).not.toHaveProperty('educationMediumIds');
    expect(payload).not.toHaveProperty('educationMediumStageIds');
    expect(payload).not.toHaveProperty('standardIds');
    expect(payload).not.toHaveProperty('divisionIds');
    expect(unwrap).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('sends clearExisting with empty scopes for an empty selection', async () => {
    const unwrap = vi.fn().mockResolvedValue({});
    const addAccessControl = vi.fn((_body: Record<string, unknown>) => ({ unwrap }));

    await expect(
      submitAccessControlForm({
        addAccessControl,
        userId: 'user-1',
        currentYearId: 'year-1',
        checkedItem: emptyAccessSelection(),
        allBoards,
      })
    ).resolves.toBe(true);

    expect(addAccessControl).toHaveBeenCalledWith({
      academicYearId: 'year-1',
      userIds: ['user-1'],
      scopes: [],
      clearExisting: true,
    });
  });
});
