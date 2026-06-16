import type {
  HrReportFormat,
  HrReportSource,
  HrReportRequest,
  HrReportTemplate,
  HrReportFilterCondition,
} from 'src/redux/hr/hrReportsApi';

import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  buildHrReportRequest,
  getHrReportDateFields,
  isHrReportPayrollSource,
  defaultHrReportOperator,
  getHrReportDateRangeError,
  DEFAULT_HR_REPORT_PAGE_SIZE,
  getHrReportChartValueFields,
  createHrReportStateFromSource,
  getHrReportChartCategoryFields,
  createHrReportStateFromTemplate,
} from '../hr-report-utils';

export function useHrReportBuilderState(source: HrReportSource, template?: HrReportTemplate) {
  const [state, setState] = useState(() =>
    template
      ? createHrReportStateFromTemplate(template, source)
      : createHrReportStateFromSource(source)
  );
  const [lastRequest, setLastRequest] = useState<{
    page: number;
    pageSize: number;
    signature: string;
  } | null>(null);

  useEffect(() => {
    setState(
      template
        ? createHrReportStateFromTemplate(template, source)
        : createHrReportStateFromSource(source)
    );
    setLastRequest(null);
  }, [source, template]);

  const columnFields = useMemo(() => source.fields ?? [], [source.fields]);
  const filterFields = useMemo(
    () => columnFields.filter((field) => field.filterable),
    [columnFields]
  );
  const sortableFields = useMemo(
    () => columnFields.filter((field) => field.sortable),
    [columnFields]
  );
  const groupFields = useMemo(
    () => columnFields.filter((field) => field.groupable),
    [columnFields]
  );
  const summaryFields = useMemo(
    () => columnFields.filter((field) => field.summarizable),
    [columnFields]
  );
  const chartCategoryFields = useMemo(() => getHrReportChartCategoryFields(source), [source]);
  const chartValueFields = useMemo(() => getHrReportChartValueFields(source), [source]);
  const dateFields = useMemo(() => getHrReportDateFields(source), [source]);

  const selectedDateField = dateFields.find((field) => field.id === state.dateField);
  const dateRangeError = getHrReportDateRangeError(state.fromDate, state.toDate);
  const isPayrollSource = isHrReportPayrollSource(source);
  const isTimelineInvalid = Boolean(dateRangeError);
  const chartCategoryValue = chartCategoryFields.some(
    (field) => field.id === state.chartCategoryField
  )
    ? state.chartCategoryField
    : '';
  const chartValueField = chartValueFields.some((field) => field.id === state.chartValueField)
    ? state.chartValueField
    : '';

  const timelineChips = useMemo(
    () =>
      [
        selectedDateField ? `Date basis: ${selectedDateField.label}` : '',
        state.fromDate ? `From: ${state.fromDate}` : '',
        state.toDate ? `To: ${state.toDate}` : '',
        state.month ? `Month: ${state.month}` : '',
      ].filter(Boolean),
    [selectedDateField, state.fromDate, state.month, state.toDate]
  );

  const requestFor = useCallback(
    (page = 1, pageSize = DEFAULT_HR_REPORT_PAGE_SIZE, format: HrReportFormat = 'excel') =>
      buildHrReportRequest(state, source, page, pageSize, format),
    [source, state]
  );

  const updateCondition = useCallback(
    (index: number, updater: (condition: HrReportFilterCondition) => HrReportFilterCondition) => {
      setState((current) => ({
        ...current,
        conditions: current.conditions.map((condition, itemIndex) =>
          itemIndex === index ? updater(condition) : condition
        ),
      }));
    },
    []
  );

  const addCondition = useCallback(() => {
    setState((current) => ({
      ...current,
      conditions: [
        ...current.conditions,
        {
          field: filterFields[0]?.id ?? '',
          operator: defaultHrReportOperator(filterFields[0]),
          value: '',
        },
      ],
    }));
  }, [filterFields]);

  const removeCondition = useCallback((index: number) => {
    setState((current) => ({
      ...current,
      conditions: current.conditions.filter((_condition, itemIndex) => itemIndex !== index),
    }));
  }, []);

  const clearTimeline = useCallback(() => {
    setState((current) => ({
      ...current,
      fromDate: '',
      toDate: '',
      month: '',
    }));
  }, []);

  return {
    state,
    setState,
    lastRequest,
    setLastRequest,
    requestFor: requestFor as (
      page?: number,
      pageSize?: number,
      format?: HrReportFormat
    ) => HrReportRequest,
    columnFields,
    filterFields,
    sortableFields,
    groupFields,
    summaryFields,
    chartCategoryFields,
    chartValueFields,
    chartCategoryValue,
    chartValueField,
    dateFields,
    dateRangeError,
    isPayrollSource,
    isTimelineInvalid,
    timelineChips,
    addCondition,
    updateCondition,
    removeCondition,
    clearTimeline,
  };
}

export type HrReportBuilderStateApi = ReturnType<typeof useHrReportBuilderState>;
