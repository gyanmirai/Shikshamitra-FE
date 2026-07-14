import { it, expect, describe } from 'vitest';

import { updateEnrollmentSettingsDirtySources } from './enrollment-settings-dirty-state';

describe('Enrollment settings dirty sources', () => {
  it('remains dirty until every independent editor is clean', () => {
    const sources = new Set<string>();

    expect(updateEnrollmentSettingsDirtySources(sources, { source: 'cycle', dirty: true })).toBe(
      true
    );
    expect(updateEnrollmentSettingsDirtySources(sources, { source: 'playbook', dirty: true })).toBe(
      true
    );
    expect(updateEnrollmentSettingsDirtySources(sources, { source: 'cycle', dirty: false })).toBe(
      true
    );
    expect(
      updateEnrollmentSettingsDirtySources(sources, { source: 'playbook', dirty: false })
    ).toBe(false);
  });
});
