import { it, expect, describe } from 'vitest';

import {
  getActivityActorLabel,
  buildActivityActorLookupIds,
} from './applicant-activity-actors';

describe('Applicant activity actors', () => {
  it('builds one stable lookup for distinct staff actors', () => {
    expect(
      buildActivityActorLookupIds([
        { actorUserId: 'staff-b' },
        { actorUserId: null },
        { actorUserId: 'staff-a' },
        { actorUserId: 'staff-b' },
      ])
    ).toBe('staff-a,staff-b');
    expect(buildActivityActorLookupIds([{ actorUserId: null }])).toBe('');
  });

  it('distinguishes system activity, resolved staff, loading, and unavailable identities', () => {
    const staffById = new Map([['staff-a', 'Aarav Shah | EMP-102']]);

    expect(getActivityActorLabel(null, staffById, false)).toBe('System');
    expect(getActivityActorLabel('staff-a', staffById, false)).toBe('Aarav Shah | EMP-102');
    expect(getActivityActorLabel('staff-b', staffById, true)).toBe('Loading staff…');
    expect(getActivityActorLabel('staff-b', staffById, false)).toBe(
      'Staff identity unavailable'
    );
  });
});
