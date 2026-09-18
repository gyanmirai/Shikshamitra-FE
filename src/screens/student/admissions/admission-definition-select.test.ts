import { describe, expect, it } from 'vitest';

import { getAdmissionDefinitionLabel } from './admission-definition-select';

describe('getAdmissionDefinitionLabel', () => {
  it('adds the immutable version when the name does not contain it', () => {
    expect(
      getAdmissionDefinitionLabel({ id: 'workflow-1', name: 'Primary admission', version: 3 })
    ).toBe('Primary admission · v3');
  });

  it('does not duplicate an existing version suffix', () => {
    expect(
      getAdmissionDefinitionLabel({ id: 'workflow-1', name: 'Primary admission v3', version: 3 })
    ).toBe('Primary admission v3');
  });
});
