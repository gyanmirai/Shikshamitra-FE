import { it, expect, describe } from 'vitest';

import { getFormRowActionVisibility } from './form-row-actions';

describe('admission form row action visibility', () => {
  it('offers draft-only actions for a draft', () => {
    expect(getFormRowActionVisibility(0, true, true, true)).toEqual({
      edit: true,
      clone: true,
      validate: true,
      publish: true,
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

  it('allows a publisher to publish any draft without a review state', () => {
    expect(getFormRowActionVisibility(0, true, true, false)).toMatchObject({
      edit: true,
      validate: true,
      publish: true,
    });
    expect(getFormRowActionVisibility(0, true, false, false).publish).toBe(false);
  });
});
