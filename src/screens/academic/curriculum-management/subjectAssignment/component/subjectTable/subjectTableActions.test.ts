import { vi, it, expect, describe } from 'vitest';

import { SubjectAssignmentStatus } from '../../enum/subjectType';

import { getSubjectTableActions } from './subjectTableActions';

import type { ISubjectFormValues } from '../type';

const createSubject = (
  status: SubjectAssignmentStatus,
  overrides: Partial<ISubjectFormValues> = {}
): ISubjectFormValues => ({
  status,
  classId: 'class-1',
  className: 'Nursery',
  subjectName: 'Science',
  subjectType: 1,
  ...overrides,
});

describe('getSubjectTableActions', () => {
  const createOptions = () => ({
    canAdd: true,
    canView: true,
    canDelete: true,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onArchive: vi.fn(),
    onRestore: vi.fn(),
  });

  it('orders published-row actions so remove is the fourth overflow action', () => {
    const options = createOptions();
    const subject = createSubject(SubjectAssignmentStatus.Published);

    const actions = getSubjectTableActions(subject, options);

    expect(actions.map((action) => action.id)).toEqual(['view', 'edit', 'archive', 'remove']);
    actions[0].onClick();
    actions[1].onClick();
    actions[2].onClick();
    actions[3].onClick();
    expect(options.onView).toHaveBeenCalledWith(subject);
    expect(options.onEdit).toHaveBeenCalledWith(subject);
    expect(options.onArchive).toHaveBeenCalledWith(subject);
    expect(options.onDelete).toHaveBeenCalledWith(subject);
  });

  it('uses reactivate as the third action for archived rows', () => {
    const actions = getSubjectTableActions(
      createSubject(SubjectAssignmentStatus.Archived),
      createOptions()
    );

    expect(actions.map((action) => action.id)).toEqual(['view', 'edit', 'reactivate', 'remove']);
  });

  it('keeps a draft row to three direct actions', () => {
    const actions = getSubjectTableActions(
      createSubject(SubjectAssignmentStatus.Draft),
      createOptions()
    );

    expect(actions.map((action) => action.id)).toEqual(['view', 'edit', 'remove']);
  });

  it('preserves the server-provided reason when remove is disabled', () => {
    const actions = getSubjectTableActions(
      createSubject(SubjectAssignmentStatus.Published, {
        canDelete: false,
        deleteDisabledReason: 'Science is linked to a timetable.',
      }),
      createOptions()
    );
    const removeAction = actions.find((action) => action.id === 'remove');

    expect(removeAction).toMatchObject({
      disabled: true,
      tooltip: 'Science is linked to a timetable.',
    });
  });
});
