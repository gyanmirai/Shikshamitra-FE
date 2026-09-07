import { describe, expect, it } from 'vitest';

import { academicType } from 'src/redux/tagTypes';

import { substitutionCreateInvalidationTags } from './substitutionManagementApi';

describe('substitution management cache invalidation', () => {
  it('refreshes affected views without refetching create-form metadata', () => {
    expect(substitutionCreateInvalidationTags).toEqual([
      academicType.substitutionList,
      academicType.substitutionDashboard,
      academicType.substitutionDuties,
      academicType.substitutionAvailability,
      academicType.substitutionDailySheet,
      academicType.substitutionAnalytics,
    ]);
    expect(substitutionCreateInvalidationTags).not.toContain(
      academicType.substitutionCreateMetadata
    );
    expect(substitutionCreateInvalidationTags).not.toContain(academicType.substitutionLectures);
    expect(substitutionCreateInvalidationTags).not.toContain(
      academicType.substitutionAffectedLectures
    );
    expect(substitutionCreateInvalidationTags).not.toContain(academicType.substitutionSuggestions);
  });
});
