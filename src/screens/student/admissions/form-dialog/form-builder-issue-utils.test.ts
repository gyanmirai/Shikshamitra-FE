import { it, expect, describe } from 'vitest';

import { parseOptions } from './form-builder-issue-utils';

describe('Admission Form Builder choice validation', () => {
  it('accepts labeled options and legacy string options', () => {
    expect(parseOptions('[{"value":"YES","label":"Yes"}]')).toBe(true);
    expect(parseOptions('["Yes"]')).toBe(true);
    expect(parseOptions('[{"value":"YES"}]')).toBe(true);
  });

  it('rejects an empty option label while preserving it for editing', () => {
    expect(parseOptions('[{"value":"OPTION_1","label":""}]')).toBe(false);
  });

  it('rejects duplicate or non-string option values', () => {
    expect(parseOptions('[{"value":"yes","label":"Yes"},{"value":"YES","label":"Again"}]')).toBe(false);
    expect(parseOptions('[{"value":1,"label":"One"}]')).toBe(false);
  });
});
