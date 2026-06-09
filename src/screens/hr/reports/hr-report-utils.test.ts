import type { HrReportSource, HrReportTemplate } from 'src/redux/hr/hrReportsApi';

import { it, expect, describe } from 'vitest';

import {
  buildHrReportRequest,
  cleanHrReportConditions,
  mapHrSourcesToCategories,
  getHrReportExportFileName,
  getHrReportDateRangeError,
  mapHrSourcesToSubCategories,
  DEFAULT_HR_REPORT_PAGE_SIZE,
  getHrReportChartValueFields,
  createHrReportStateFromSource,
  getHrReportChartCategoryFields,
  createHrReportStateFromTemplate,
} from './hr-report-utils';

const source: HrReportSource = {
  id: 'employee',
  category: 'Employee',
  label: 'Employee Reports',
  description: 'Employee report source',
  defaultColumns: ['employeeCode', 'employeeName'],
  defaultSorts: ['employeeCode'],
  fields: [
    {
      id: 'employeeCode',
      label: 'Employee Code',
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
    {
      id: 'grossSalary',
      label: 'Gross Salary',
      type: 'number',
      filterable: true,
      sortable: true,
      groupable: false,
      summarizable: true,
      operators: ['equals', 'gte', 'lte'],
      options: [],
    },
  ],
};

const template: HrReportTemplate = {
  id: 'template-1',
  name: 'Employee Directory',
  category: 'Employee',
  dataSource: 'employee',
  visibility: 'organization',
  status: 'Published',
  ownerUserId: 'user-1',
  creationTime: '2026-06-01T10:00:00Z',
  definition: {
    reportType: 'Employee Directory',
    dataSource: 'employee',
    columns: ['employeeName'],
    filters: {
      dateField: 'dateOfJoining',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
      conditions: [{ field: 'employeeCode', operator: 'contains', value: 'EMP' }],
    },
    sorts: [{ field: 'employeeName', direction: 'desc' }],
    groups: ['employeeCode'],
    summaries: [{ field: 'grossSalary', function: 'sum' }],
  },
};

describe('HR report utils', () => {
  it('maps backend sources to common report categories', () => {
    expect(mapHrSourcesToCategories([source])).toEqual([
      expect.objectContaining({
        id: 'employee',
        name: 'Employee',
      }),
    ]);
  });

  it('maps every source to a custom report and source templates', () => {
    const subCategories = mapHrSourcesToSubCategories([source], [template], () => null);

    expect(subCategories).toHaveLength(2);
    expect(subCategories[0]).toMatchObject({
      id: 'employee-custom-report',
      name: 'New Employee Report',
      categoryId: 'employee',
    });
    expect(subCategories[1]).toMatchObject({
      id: 'template-1',
      name: 'Employee Directory',
      categoryId: 'employee',
    });
  });

  it('creates default builder state from a source', () => {
    expect(createHrReportStateFromSource(source)).toMatchObject({
      selectedSourceId: 'employee',
      reportName: 'Employee Reports',
      columns: ['employeeCode', 'employeeName'],
      sortField: 'employeeCode',
      dateField: 'dateOfJoining',
      visibility: 'private',
    });
  });

  it('creates builder state from a template definition', () => {
    expect(createHrReportStateFromTemplate(template, source)).toMatchObject({
      selectedSourceId: 'employee',
      reportName: 'Employee Directory',
      columns: ['employeeName'],
      sortField: 'employeeName',
      sortDirection: 'desc',
      groups: ['employeeCode'],
      summaryField: 'grossSalary',
      dateField: 'dateOfJoining',
      fromDate: '2026-01-01',
      toDate: '2026-12-31',
      visibility: 'organization',
    });
  });

  it('builds a normalized report request from builder state', () => {
    const state = createHrReportStateFromTemplate(template, source);

    expect(buildHrReportRequest(state, source)).toEqual({
      reportType: 'Employee Directory',
      dataSource: 'employee',
      format: 'excel',
      page: 1,
      pageSize: DEFAULT_HR_REPORT_PAGE_SIZE,
      columns: ['employeeName'],
      groups: ['employeeCode'],
      summaries: [{ field: 'grossSalary', function: 'sum' }],
      sorts: [{ field: 'employeeName', direction: 'desc' }],
      filters: {
        dateField: 'dateOfJoining',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        month: undefined,
        conditions: [{ field: 'employeeCode', operator: 'contains', value: 'EMP' }],
      },
    });
  });

  it('adds chart definition when analytics are enabled', () => {
    const state = {
      ...createHrReportStateFromTemplate(template, source),
      chartType: 'bar' as const,
      chartCategoryField: 'employeeCode',
      chartValueField: 'grossSalary',
    };

    expect(buildHrReportRequest(state, source)).toMatchObject({
      chart: {
        type: 'bar',
        categoryField: 'employeeCode',
        valueField: 'grossSalary',
        function: 'sum',
      },
    });
  });

  it('uses source metadata to expose only chart-compatible fields', () => {
    const chartSource: HrReportSource = {
      ...source,
      fields: [
        { ...source.fields[0], chartable: true },
        { ...source.fields[1], groupable: true, chartable: false },
        { ...source.fields[2], chartable: true },
      ],
    };

    expect(getHrReportChartCategoryFields(chartSource).map((field) => field.id)).toEqual([
      'employeeCode',
    ]);
    expect(getHrReportChartValueFields(chartSource).map((field) => field.id)).toEqual([
      'grossSalary',
    ]);
  });

  it('validates timeline ranges', () => {
    expect(getHrReportDateRangeError('2026-12-31', '2026-01-01')).toBe(
      'From Date must be on or before To Date.'
    );
    expect(getHrReportDateRangeError('2026-01-01', '2026-12-31')).toBe('');
  });

  it('removes incomplete filter conditions', () => {
    expect(
      cleanHrReportConditions([
        { field: '', operator: 'equals', value: 'x' },
        { field: 'employeeCode', operator: 'equals', value: '' },
        { field: 'employeeCode', operator: 'in', values: ['EMP-1'] },
      ])
    ).toEqual([{ field: 'employeeCode', operator: 'in', values: ['EMP-1'] }]);
  });

  it('falls back to report name when an export file name is missing', () => {
    expect(getHrReportExportFileName({ reportType: 'Payroll Register' })).toBe('Payroll Register');
  });
});
