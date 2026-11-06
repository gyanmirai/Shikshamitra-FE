import { it, expect, describe } from 'vitest';

import { studentReportHistoryColumns } from '../components/student-report-history-columns';
import {
  reportCellValue,
  reportJobActions,
  reportRegenerationInput,
  studentReportSourceGrants,
} from './compliance-report-model';

describe('Student report lifecycle', () => {
  it.each(['Queued', 'Generating'])(
    'offers cancellation but never download or regeneration while %s',
    (status) => {
      expect(reportJobActions(status, false, true, true)).toEqual({
        download: false,
        cancel: true,
        regenerate: false,
      });
    }
  );
  it.each(['Failed', 'Expired', 'Cancelled'])(
    'offers regeneration but never download for %s',
    (status) => {
      expect(reportJobActions(status, true, true, true)).toEqual({
        download: false,
        cancel: false,
        regenerate: true,
      });
    }
  );
  it('uses server download authority and independent source/action grants', () => {
    expect(reportJobActions('Completed', false, true, false)).toEqual({
      download: false,
      cancel: false,
      regenerate: false,
    });
    expect(reportJobActions('Completed', true, false, true)).toEqual({
      download: true,
      cancel: false,
      regenerate: false,
    });
  });
  it('regenerates the entire saved academic scope with a fresh command key', () => {
    expect(
      reportRegenerationInput({
        reportType: 'GujaratCompliance',
        academicYearId: 'year',
        boardId: 'board',
        mediumId: 'medium',
        standardId: 'class',
        divisionId: 'division',
        clientKey: 'old-command',
        skipCount: 25,
        maxResultCount: 25,
      })
    ).toEqual({
      reportType: 'GujaratCompliance',
      academicYearId: 'year',
      boardId: 'board',
      mediumId: 'medium',
      standardId: 'class',
      divisionId: 'division',
      skipCount: 0,
      maxResultCount: 100,
    });
  });
  it.each([
    'UdiseBaseline',
    'GujaratCompliance',
    'IdentityExceptions',
    'EligibilityTracking',
  ] as const)('requires source and sensitive-data view grants for %s', (type) => {
    expect(studentReportSourceGrants(type)).toEqual([
      'Students.Records.StudentList.View',
      'Students.IdentityCompliance.View',
    ]);
  });
  it('formats factual status labels without changing missing or restricted data', () => {
    expect(reportCellValue('APAAR consent', 'NotAsked')).toBe('Not Asked');
    expect(reportCellValue('Student', 'Restricted student')).toBe('Restricted student');
    expect(reportCellValue('PEN (masked)', null)).toBe('—');
  });
});

it('uses slash-formatted Created and Expires dates while retaining the report history time', () => {
  const history = {} as Parameters<typeof studentReportHistoryColumns>[0];
  const columns = studentReportHistoryColumns(history);
  ['creationTime', 'expiresAt'].forEach((id) => {
    const column = columns.find((item) => item.id === id)!;
    expect(column.render?.('2026-10-13T06:07:00Z', {})).toBe('13/10/2026 11:37 am');
  });
});
