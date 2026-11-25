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

  it('keeps validation details from the API', () => {
    const error = {
      status: 400,
      data: {
        error: {
          message: 'One or more validation errors occurred.',
          validationErrors: [
            { message: 'Enter a name with 2 to 40 characters.', members: ['name'] },
          ],
        },
      },
    };
    expect(getAccountSettingSaveError(error, 'category')).toEqual({
      message: 'Enter a name with 2 to 40 characters.',
    });
  });

  it('explains what to check when the server cannot confirm the save', () => {
    const failed = { status: 500, data: { detail: 'The request failed.' } };
    const offline = { status: 'FETCH_ERROR', error: 'TypeError: Failed to fetch' };
    expect(getAccountSettingSaveError(failed, 'category')).toEqual({
      message: 'Could not save the category. Refresh the list to check it before retrying.',
    });
    expect(getAccountSettingSaveError(offline, 'bank')).toEqual({
      message: 'Could not save the bank account. Refresh the list to check it before retrying.',
    });
  });
});
