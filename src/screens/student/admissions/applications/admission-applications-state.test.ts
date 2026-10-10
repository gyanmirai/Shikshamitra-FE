import { it, expect, describe } from 'vitest';

import {
  admissionApplicationsUrl,
  readAdmissionApplicationsState,
} from './admission-applications-state';

describe('Applications shareable table context', () => {
  it('restores page, size, search and an allowed displayed-value sort', () => {
    expect(
      readAdmissionApplicationsState(
        new URLSearchParams('page=4&size=100&search=Riya&sort=decisionEnteredAt&direction=desc')
      )
    ).toEqual({
      page: 3,
      rowsPerPage: 100,
      search: 'Riya',
      sorts: [{ column: 'decisionEnteredAt', direction: 'desc' }],
    });
  });
  it('rejects unsafe paging and unsupported sorting', () => {
    expect(
      readAdmissionApplicationsState(
        new URLSearchParams('page=-2&size=10000&sort=currentStageName')
      )
    ).toEqual({ page: 0, rowsPerPage: 25, search: '', sorts: [] });
  });
  it('cleans obsolete filters while keeping academic scope and paging', () => {
    const value = admissionApplicationsUrl(
      '/student/admissions/applications',
      new URLSearchParams(
        'board=b&medium=m&class=c&page=3&size=25&status=5&counsellor=u&stage=review'
      ),
      {},
      false
    );
    expect(value).toBe('/student/admissions/applications?board=b&medium=m&class=c&page=3&size=25');
  });
  it('resets page for a new search without discarding academic scope or sorting', () => {
    expect(
      admissionApplicationsUrl(
        '/student/admissions/applications',
        new URLSearchParams('board=b&page=5&sort=applicantName&direction=asc'),
        { search: 'Parent & Riya' }
      )
    ).toBe(
      '/student/admissions/applications?board=b&sort=applicantName&direction=asc&search=Parent+%26+Riya'
    );
  });
});
