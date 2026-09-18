import { it, expect, describe } from 'vitest';

import { getFormRowActionVisibility } from './form-row-actions';

describe('admission form row action visibility', () => {
  it('offers draft-only actions for a draft', () => {
    expect(getFormRowActionVisibility(0, true, true, true)).toEqual({
      edit: true,
      clone: true,
      validate: true,
      requestApproval: true,
      approve: false,
      reject: false,
      publish: false,
      delete: true,
      history: true,
      createVersion: false,
      archive: false,
    });
  });

  it('offers immutable-version actions for a published form', () => {
    expect(getFormRowActionVisibility(1, true, true, true)).toEqual({
      edit: false,
      clone: true,
      validate: false,
      requestApproval: false,
      approve: false,
      reject: false,
      publish: false,
      delete: false,
      history: true,
      createVersion: true,
      archive: true,
    });
  });

  it('only allows cloning an archived form when management is granted', () => {
    expect(getFormRowActionVisibility(2, true, true, false)).toEqual({
      edit: false,
      clone: true,
      validate: false,
      requestApproval: false,
      approve: false,
      reject: false,
      publish: false,
      delete: false,
      history: true,
      createVersion: false,
      archive: false,
    });
  });

  it('hides every mutating action without permission', () => {
    const actions = getFormRowActionVisibility(0, false, false, false);
    expect(
      Object.entries(actions)
        .filter(([name]) => name !== 'history')
        .map(([, value]) => value)
    ).not.toContain(true);
  });

  it('allows review while pending and publishing only after approval', () => {
    expect(getFormRowActionVisibility(0, true, true, false, 1)).toMatchObject({
      edit: false,
      approve: true,
      reject: true,
      publish: false,
    });
    expect(getFormRowActionVisibility(0, true, true, false, 2)).toMatchObject({
      edit: false,
      approve: false,
      reject: false,
      publish: true,
    });
  });

  it('does not offer approve or reject to the user who requested approval', () => {
    expect(getFormRowActionVisibility(0, true, true, false, 1, true)).toMatchObject({
      approve: false,
      reject: false,
      publish: false,
    });
  });

  it('allows an administrator to review their own approval request', () => {
    expect(getFormRowActionVisibility(0, true, true, false, 1, true, true)).toMatchObject({
      approve: true,
      reject: true,
      publish: false,
    });
  });
});
