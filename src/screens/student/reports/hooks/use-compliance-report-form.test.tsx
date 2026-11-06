import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useComplianceReportForm } from './use-compliance-report-form';

const mocks = vi.hoisted(() => ({
  year: { id: 'year-1', name: '2026–27' },
  permissions: [
    'Students.Records.Reports.View',
    'Students.Records.StudentList.View',
    'Students.IdentityCompliance.View',
    'Students.Records.Reports.Add',
  ],
  query: vi.fn(),
  response: {
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–27' }],
      boards: [
        { id: 'board-1', name: 'CBSE' },
        { id: 'board-2', name: 'GSEB' },
      ],
      mediums: [
        { id: 'medium-1', name: 'English', parentId: 'board-1' },
        { id: 'medium-2', name: 'Gujarati', parentId: 'board-2' },
      ],
      standards: [
        { id: 'class-1', name: 'Class 1', parentId: 'medium-1' },
        { id: 'class-2', name: 'Class 2', parentId: 'medium-2' },
      ],
      divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
    },
    isFetching: false,
    isError: false,
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: object) => unknown) =>
    selector({
      globalState: { currentYear: mocks.year },
      auth: { permissions: mocks.permissions.map((name) => ({ name, isGranted: true })) },
    }),
}));
vi.mock('src/redux/student/records/student-records-api', () => ({
  useGetStudentRecordsDirectoryOptionsQuery: (...args: unknown[]) => {
    mocks.query(...args);
    return mocks.response;
  },
}));

beforeEach(() => {
  mocks.year = { id: 'year-1', name: '2026–27' };
  mocks.permissions = [
    'Students.Records.Reports.View',
    'Students.Records.StudentList.View',
    'Students.IdentityCompliance.View',
    'Students.Records.Reports.Add',
  ];
  mocks.response.currentData.boards[1].name = 'GSEB';
  mocks.response.isError = false;
  mocks.query.mockClear();
});

describe('Compliance report scope', () => {
  it('previews all permitted divisions without a hidden required division or organization', async () => {
    const { result } = renderHook(() => useComplianceReportForm('UdiseBaseline'));
    await act(async () => {
      await result.current.form.submitForm();
    });
    expect(result.current.request).toEqual({
      reportType: 'UdiseBaseline',
      academicYearId: 'year-1',
      boardId: undefined,
      mediumId: undefined,
      standardId: undefined,
      divisionId: undefined,
      skipCount: 0,
      maxResultCount: 25,
    });
  });
  it('sends the actual selected board/medium/class/division and clears descendants when parent changes', async () => {
    const { result } = renderHook(() => useComplianceReportForm('EligibilityTracking'));
    await act(async () => {
      await result.current.form.setValues({
        academicYearId: 'year-1',
        boardId: 'board-1',
        mediumId: 'medium-1',
        standardId: 'class-1',
        divisionId: 'division-1',
      });
    });
    await act(async () => {
      await result.current.form.submitForm();
    });
    expect(result.current.request).toMatchObject({
      mediumId: 'medium-1',
      standardId: 'class-1',
      divisionId: 'division-1',
    });
    await act(async () => {
      result.current.change('boardId', 'board-2');
    });
    expect(result.current.form.values).toEqual({
      academicYearId: 'year-1',
      boardId: 'board-2',
      mediumId: '',
      standardId: '',
      divisionId: '',
    });
    expect(result.current.request).toBeNull();
  });
  it.each(['Renamed state board', 'gseb'])(
    'passes authorized board IDs unchanged when the displayed name is %s',
    async (name) => {
      mocks.response.currentData.boards[1].name = name;
      const { result } = renderHook(() => useComplianceReportForm('GujaratCompliance'));
      expect(result.current.boards.map((item) => item.id)).toEqual(['board-1', 'board-2']);
      await act(async () => {
        result.current.change('boardId', 'board-2');
      });
      expect(result.current.mediums.map((item) => item.id)).toEqual(['medium-2']);
      await act(async () => {
        result.current.change('mediumId', 'medium-2');
      });
      await act(async () => {
        result.current.change('standardId', 'class-2');
      });
      await act(async () => {
        await result.current.form.submitForm();
      });
      expect(result.current.request).toMatchObject({
        reportType: 'GujaratCompliance',
        academicYearId: 'year-1',
        boardId: 'board-2',
        mediumId: 'medium-2',
        standardId: 'class-2',
      });
    }
  );
  it('preserves its visible captured year when global selection changes', () => {
    const { result, rerender } = renderHook(() => useComplianceReportForm('IdentityExceptions'));
    mocks.year = { id: 'year-2', name: '2027–28' };
    rerender();
    expect(result.current.year?.id).toBe('year-1');
    expect(result.current.form.values.academicYearId).toBe('year-1');
    expect(mocks.query).toHaveBeenLastCalledWith({ academicYearId: 'year-1' }, { skip: false });
  });
  it('does not fetch or preview compliance data without Identity Compliance view access', async () => {
    mocks.permissions = mocks.permissions.filter(
      (name) => name !== 'Students.IdentityCompliance.View'
    );
    const { result } = renderHook(() => useComplianceReportForm('UdiseBaseline'));
    await act(async () => {
      await result.current.form.submitForm();
    });
    expect(result.current.request).toBeNull();
    expect(mocks.query).toHaveBeenLastCalledWith({ academicYearId: 'year-1' }, { skip: true });
  });
  it('keeps the filters after a scope read fails', async () => {
    const { result, rerender } = renderHook(() => useComplianceReportForm('UdiseBaseline'));
    await act(async () => {
      result.current.change('boardId', 'board-1');
    });
    mocks.response.isError = true;
    rerender();
    await act(async () => {
      await result.current.form.submitForm();
    });
    expect(result.current.request).toBeNull();
    expect(result.current.form.values.boardId).toBe('board-1');
  });
});
