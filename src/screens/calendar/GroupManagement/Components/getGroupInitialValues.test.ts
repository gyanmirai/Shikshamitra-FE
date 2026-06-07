import { it, expect, describe } from 'vitest';

import { getGroupInitialValues } from './getGroupInitialValues';

describe('getGroupInitialValues', () => {
  it('hydrates selected employees from enriched nameBased employees', () => {
    const values = getGroupInitialValues({
      id: 'group-1',
      name: 'Staff Calendar',
      nameBased: {
        selectedMembers: [
          {
            memberType: 1,
            memberId: 'employee-1',
            userId: null,
          },
        ],
        employees: [
          {
            id: 'employee-1',
            employeeName: 'Asha Teacher',
            employeeCode: 'EMP001',
            roleName: 'Teacher',
            department: 'Science',
            designation: 'Senior Teacher',
            employeeStatusType: 0,
            userId: null,
          },
        ],
      },
    });

    expect(values.nameBased.selectedMembers).toEqual([
      expect.objectContaining({
        memberType: 1,
        memberId: 'employee-1',
        userId: null,
        displayName: 'Asha Teacher',
        employeeCode: 'EMP001',
        roleName: 'Teacher',
        department: 'Science',
        designation: 'Senior Teacher',
        employeeStatusType: 0,
      }),
    ]);
  });

  it('keeps unknown selected members without replacing null userId with memberId', () => {
    const values = getGroupInitialValues({
      nameBased: {
        selectedMembers: [
          {
            memberType: 1,
            memberId: 'employee-without-user',
            userId: null,
          },
        ],
      },
    });

    expect(values.nameBased.selectedMembers[0]).toEqual(
      expect.objectContaining({
        memberId: 'employee-without-user',
        userId: null,
      })
    );
  });
});
