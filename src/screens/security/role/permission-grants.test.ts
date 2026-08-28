import { describe, expect, it } from 'vitest';

import { getChangedPermissionGrants, setPermissionGrants } from './permission-grants';

describe('permission grant changes', () => {
  it('updates select-all grants without mutating the original permission snapshot', () => {
    const initial = [
      { name: 'ShikshaMitra.Module.HR.Dashboard', isGranted: false },
      { name: 'ShikshaMitra.Module.HR.Employee', isGranted: false },
    ];

    const updated = setPermissionGrants(
      initial,
      ['ShikshaMitra.Module.HR.Dashboard', 'ShikshaMitra.Module.HR.Employee'],
      true
    );

    expect(initial.every((permission) => permission.isGranted === false)).toBe(true);
    expect(updated.every((permission) => permission.isGranted === true)).toBe(true);
    expect(updated[0]).not.toBe(initial[0]);
  });

  it('builds the update payload by permission name and grant value', () => {
    const initial = [
      { name: 'ShikshaMitra.Module.HR', isGranted: false },
      { name: 'ShikshaMitra.Module.HR.Employee', isGranted: false },
    ];
    const current = setPermissionGrants(
      initial,
      ['ShikshaMitra.Module.HR', 'ShikshaMitra.Module.HR.Employee'],
      true
    );

    expect(getChangedPermissionGrants(current, initial)).toEqual(current);
  });

  it('correctly manages Question Bank and Question Papers View, Add, Delete permissions', () => {
    const initial = [
      { name: 'Academics.Examination.QuestionBank.View', isGranted: false },
      { name: 'Academics.Examination.QuestionBank.Add', isGranted: false },
      { name: 'Academics.Examination.QuestionBank.Delete', isGranted: false },
      { name: 'Academics.Examination.QuestionPapers.View', isGranted: false },
      { name: 'Academics.Examination.QuestionPapers.Add', isGranted: false },
      { name: 'Academics.Examination.QuestionPapers.Delete', isGranted: false },
    ];

    const granted = setPermissionGrants(
      initial,
      [
        'Academics.Examination.QuestionBank.View',
        'Academics.Examination.QuestionBank.Add',
        'Academics.Examination.QuestionBank.Delete',
        'Academics.Examination.QuestionPapers.View',
        'Academics.Examination.QuestionPapers.Add',
        'Academics.Examination.QuestionPapers.Delete',
      ],
      true
    );

    expect(granted.every((p) => p.isGranted === true)).toBe(true);
    expect(getChangedPermissionGrants(granted, initial)).toHaveLength(6);
  });
});
