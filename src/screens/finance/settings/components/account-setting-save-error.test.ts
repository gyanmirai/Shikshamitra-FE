import { it, expect, describe } from 'vitest';

import { getAccountSettingSaveError } from './account-setting-save-error';

describe('account setting save feedback', () => {
  const duplicate = {
    data: {
      error: {
        code: 'Finance:Accounts:Settings:DuplicateName',
        message: 'One or more business rules were violated.',
      },
    },
  };
  it('maps edit and create category duplicates to the name field', () => {
    expect(getAccountSettingSaveError(duplicate, 'category')).toEqual({
      field: 'name',
      message: 'This category name already exists for the academic year.',
    });
  });
  it('maps bank duplicates to account number without including the entered identifier', () => {
    expect(getAccountSettingSaveError(duplicate, 'bank')).toEqual({
      field: 'accountNumber',
      message: 'This account number already exists for the academic year.',
    });
  });
});
