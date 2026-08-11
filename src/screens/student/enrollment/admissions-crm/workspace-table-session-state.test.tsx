import { act, waitFor, renderHook } from '@testing-library/react';
import { it, expect, describe, afterEach, beforeEach } from 'vitest';

import {
  useWorkspaceTableSessionState,
  readWorkspaceTableSessionState,
  writeWorkspaceTableSessionState,
} from './workspace-table-session-state';

const applicantFilter = {
  column: 'applicant',
  type: 'contains',
  value: 'Parent phone or applicant name',
  valueType: 'string',
  label: 'Applicant',
  displayValue: 'Parent phone or applicant name',
};

describe('Student Enrollment table session state', () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it('restores sensitive search and residual filters from session storage', () => {
    writeWorkspaceTableSessionState('pipeline', {
      search: '9988776655',
      filters: [applicantFilter],
    });

    expect(readWorkspaceTableSessionState('pipeline')).toEqual({
      search: '9988776655',
      filters: [applicantFilter],
    });
    expect(window.location.search).not.toContain('9988776655');
  });

  it('ignores corrupted or non-renderable persisted filter data', () => {
    window.sessionStorage.setItem(
      'student-enrollment:table-state:v2:pipeline',
      JSON.stringify({
        version: 1,
        search: 'Aarav',
        filters: [
          applicantFilter,
          { ...applicantFilter, column: '' },
          { ...applicantFilter, value: { unsafe: true } },
          { ...applicantFilter, label: { type: 'div' } },
        ],
      })
    );

    expect(readWorkspaceTableSessionState('pipeline')).toEqual({
      search: 'Aarav',
      filters: [applicantFilter, { ...applicantFilter, label: undefined }],
    });
  });

  it('keeps sensitive state isolated by tenant and user scope', () => {
    writeWorkspaceTableSessionState('pipeline:year-1:tenant-a:user-a', {
      search: '9988776655',
      filters: [],
    });

    expect(readWorkspaceTableSessionState('pipeline:year-1:tenant-a:user-a').search).toBe(
      '9988776655'
    );
    expect(readWorkspaceTableSessionState('pipeline:year-1:tenant-a:user-b').search).toBe('');
  });

  it('persists hook updates and keeps workspace scopes isolated', async () => {
    const { result, rerender } = renderHook(
      ({ scope }: { scope: string }) => useWorkspaceTableSessionState(scope),
      { initialProps: { scope: 'pipeline' } }
    );

    act(() => {
      result.current.setSearch('Riya');
      result.current.setFilters([applicantFilter]);
    });
    expect(readWorkspaceTableSessionState('pipeline')).toEqual({
      search: 'Riya',
      filters: [applicantFilter],
    });
    await waitFor(() =>
      expect(readWorkspaceTableSessionState('pipeline')).toEqual({
        search: 'Riya',
        filters: [applicantFilter],
      })
    );

    rerender({ scope: 'exams' });
    await waitFor(() => expect(result.current.search).toBe(''));

    act(() => result.current.setSearch('Exam slot A'));
    await waitFor(() => expect(readWorkspaceTableSessionState('exams').search).toBe('Exam slot A'));
    expect(readWorkspaceTableSessionState('pipeline').search).toBe('Riya');
  });
});
