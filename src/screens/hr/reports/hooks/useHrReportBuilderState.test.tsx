import type { HrReportSource, HrReportTemplate } from 'src/redux/hr/hrReportsApi';

import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { DEFAULT_HR_REPORT_PAGE_SIZE } from '../hr-report-utils';
import { useHrReportBuilderState } from './useHrReportBuilderState';

const source: HrReportSource = {
  id: 'employee',
  category: 'Employee',
  label: 'Staff Reports',
  description: 'Staff report source',
  defaultColumns: ['employeeCode', 'employeeName'],
  defaultSorts: ['employeeCode'],
  fields: [
    {
      id: 'employeeCode',
      label: 'Staff Code',
      type: 'string',
      filterable: true,
      sortable: true,
      groupable: true,
      summarizable: false,
      operators: ['equals', 'contains'],
      options: [],
    },
    {
      id: 'employeeName',
      label: 'Staff Name',
      type: 'string',
      filterable: true,
      sortable: true,
      groupable: true,
      summarizable: false,
      operators: ['equals', 'contains'],
      options: [],
    },
    {
      id: 'dateOfJoining',
      label: 'Date of Joining',
      type: 'date',
      filterable: true,
      sortable: true,
      groupable: false,
      summarizable: false,
      operators: ['equals', 'gte', 'lte'],
      options: [],
    },
  ],
};

const template: HrReportTemplate = {
  id: 'template-1',
  name: 'Saved Staff Report',
  category: 'Employee',
  dataSource: 'employee',
  visibility: 'organization',
  status: 'Published',
  ownerUserId: 'user-1',
  creationTime: '2026-06-01T10:00:00Z',
  definition: {
    reportType: 'Saved Staff Report',
    dataSource: 'employee',
    columns: ['employeeName'],
    filters: {
      dateField: 'dateOfJoining',
      fromDate: '2026-01-01',
      toDate: '2026-06-30',
      conditions: [{ field: 'employeeCode', operator: 'contains', value: 'EMP' }],
    },
    sorts: [{ field: 'employeeName', direction: 'desc' }],
  },
};

describe('useHrReportBuilderState', () => {
  it('creates requests from the current builder state', () => {
    const { result } = renderHook(() => useHrReportBuilderState(source));

    expect(result.current.requestFor()).toMatchObject({
      reportType: 'Staff Reports',
      dataSource: 'employee',
      format: 'excel',
      page: 1,
      pageSize: DEFAULT_HR_REPORT_PAGE_SIZE,
      columns: ['employeeCode', 'employeeName'],
      sorts: [{ field: 'employeeCode', direction: 'asc' }],
    });
  });

  it('resets state when switching from a saved template back to a source', () => {
    type HookProps = { currentTemplate?: HrReportTemplate };
    const { result, rerender } = renderHook(
      ({ currentTemplate }: HookProps) => useHrReportBuilderState(source, currentTemplate),
      { initialProps: { currentTemplate: template } as HookProps }
    );

    expect(result.current.state.reportName).toBe('Saved Staff Report');
    expect(result.current.state.conditions).toHaveLength(1);

    rerender({});

    expect(result.current.state.reportName).toBe('Staff Reports');
    expect(result.current.state.conditions).toEqual([]);
    expect(result.current.lastRequest).toBeNull();
  });

  it('adds, updates, removes, and clears scoped state without mutating unrelated fields', () => {
    const { result } = renderHook(() => useHrReportBuilderState(source));

    act(() => result.current.addCondition());
    expect(result.current.state.conditions).toEqual([
      { field: 'employeeCode', operator: 'equals', value: '' },
    ]);

    act(() =>
      result.current.updateCondition(0, (condition) => ({
        ...condition,
        value: 'EMP-1',
      }))
    );
    expect(result.current.state.conditions[0]).toMatchObject({ value: 'EMP-1' });

    act(() => {
      result.current.setState((current) => ({
        ...current,
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        month: '2026-06',
      }));
    });
    expect(result.current.timelineChips).toEqual([
      'Date basis: Date of Joining',
      'From: 2026-01-01',
      'To: 2026-12-31',
      'Month: 2026-06',
    ]);

    act(() => result.current.clearTimeline());
    expect(result.current.state).toMatchObject({
      fromDate: '',
      toDate: '',
      month: '',
    });

    act(() => result.current.removeCondition(0));
    expect(result.current.state.conditions).toEqual([]);
  });
});
