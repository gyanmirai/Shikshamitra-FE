import { it, expect, describe } from 'vitest';
import {
  shouldClearSelectedOrganization,
  resolveLeaveRequestDetailLabels,
} from 'src/screens/hr/leave-request/leave-calender.utils';

describe('leave calendar organization option helpers', () => {
  it('does not clear selected organization while organization options are loading', () => {
    expect(shouldClearSelectedOrganization('stage-1', [], true)).toBe(false);
  });

  it('clears selected organization only after loaded options do not contain it', () => {
    expect(shouldClearSelectedOrganization('stage-1', [], false)).toBe(true);
    expect(
      shouldClearSelectedOrganization(
        'stage-1',
        [{ id: 'stage-1', label: 'GSEB - Gujarati - Primary' }],
        false
      )
    ).toBe(false);
  });

  it('keeps academic year and organization detail labels semantically separate', () => {
    const labels = resolveLeaveRequestDetailLabels({
      detail: {
        mediumStageName: 'GSEB - Gujarati - Primary',
      },
      editData: {
        organization: 'CBSE - English - Higher Secondary',
      },
      currentYearName: '2026-2027',
    });

    expect(labels).toEqual({
      academicYearLabel: '2026-2027',
      organizationLabel: 'GSEB - Gujarati - Primary',
    });
  });
});
