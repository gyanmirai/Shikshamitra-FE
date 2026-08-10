'use client';

import type { ReactNode } from 'react';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import NextLink from 'next/link';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Link, Stack, Alert, Button, Typography, LinearProgress } from '@mui/material';
import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  AdmissionCrmLeadPriority,
  AdmissionCrmApplicantStepKey,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmLeadsQuery,
  AdmissionCrmCoreLeadsApi,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { ApplicantWorklistStageFilter } from './applicant-worklist-stage-filter';
import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';
import {
  getDateFilterBounds,
  getLatestEnumFilter,
  getLatestStringFilter,
} from './workspace-table-filters';
import {
  createApplicantRowNavigationProps,
  createApplicantLinkNavigationProps,
} from './applicant-row-navigation';
import {
  getRouteTypeLabel,
  formatEnrollmentDate,
  formatApplicantNumber,
  formatApplicantContact,
} from './enrollment-display';
import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';
import type { ApplicantWorklistStageOption } from './applicant-worklist-stage-filter';

export type ApplicantWorklistColumn = ApplicantWorklistStageOption;

export type ApplicantWorklistTableConfiguration = {
  stageFilter?: {
    label: string;
    description: string;
  };
  contextColumns?: readonly ('registrationForm' | 'priority')[];
  serverFilters?: boolean;
  searchPlaceholder?: string;
};

type ApplicantWorklistWorkspaceProps = {
  title: string;
  description: string;
  tableId: string;
  columns: readonly ApplicantWorklistColumn[];
  defaultColumn: AdmissionCrmPipelineColumnKey;
  applicantTab: ApplicantWorkspaceTab;
  headerActions?: ReactNode;
  tableConfiguration?: ApplicantWorklistTableConfiguration;
};

const stepLabels: Record<AdmissionCrmApplicantStepKey, string> = {
  [AdmissionCrmApplicantStepKey.Inquiry]: 'Inquiry',
  [AdmissionCrmApplicantStepKey.Exam]: 'Entrance exam',
  [AdmissionCrmApplicantStepKey.Registration]: 'Registration',
  [AdmissionCrmApplicantStepKey.Finance]: 'Finance verification',
  [AdmissionCrmApplicantStepKey.Placement]: 'Class placement',
  [AdmissionCrmApplicantStepKey.Activation]: 'Activation',
};

const applicantName = (lead: AdmissionCrmLeadDto) =>
  [lead.firstName, lead.middleName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed applicant';

const priorities = Object.values(AdmissionCrmLeadPriority).filter(
  (value): value is AdmissionCrmLeadPriority => typeof value === 'number'
);
const routeTypes = Object.values(AdmissionCrmRouteType).filter(
  (value): value is AdmissionCrmRouteType => typeof value === 'number'
);
const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};
const privateFilterColumns = new Set(['applicant', 'registrationFormNumber', 'lastActivityTime']);
const structuralFilterColumns = new Set(['desiredClassName', 'intendedRouteType', 'priority']);

export function ApplicantWorklistWorkspace({
  title,
  description,
  tableId,
  columns: worklistColumns,
  defaultColumn,
  applicantTab,
  headerActions,
  tableConfiguration,
}: ApplicantWorklistWorkspaceProps) {
  const {
    academicYearId,
    academicMediumId,
    sessionIdentity,
    state,
    updateState,
    getApplicantHref,
    openApplicant,
  } = useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const requestedPageSize = state.pageSize ?? 25;
  const pageSize = [10, 25, 50, 100].includes(requestedPageSize) ? requestedPageSize : 25;
  const {
    search,
    setSearch,
    filters: columnFilters,
    setFilters: setColumnFilters,
  } = useWorkspaceTableSessionState(
    `applicant-worklist:${tableId}:${academicYearId || 'none'}:${sessionIdentity}`
  );
  const [debouncedSearch, setDebouncedSearch] = useState(() => search.trim());
  const prefetchLead = AdmissionCrmCoreLeadsApi.usePrefetch('getAdmissionCrmLead');
  const prefetchProgress = AdmissionCrmCoreLeadsApi.usePrefetch('getAdmissionCrmApplicantProgress');
  const prefetchApplicant = useCallback(
    (leadId: string) => {
      prefetchLead({ leadId }, { ifOlderThan: 30 });
      prefetchProgress({ leadId }, { ifOlderThan: 30 });
    },
    [prefetchLead, prefetchProgress]
  );
  const serverFilters = tableConfiguration?.serverFilters === true;
  const showRegistrationForm =
    tableConfiguration?.contextColumns?.includes('registrationForm') === true;
  const showPriority = tableConfiguration?.contextColumns?.includes('priority') === true;
  const sorting = state.sorting || 'lastActivityTime desc';
  const selectedColumn = worklistColumns.some((item) => item.key === state.pipelineColumn)
    ? (state.pipelineColumn as AdmissionCrmPipelineColumnKey)
    : defaultColumn;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => window.clearTimeout(timer);
  }, [search]);
  const structuralFilters = useMemo<IParams['filters']>(
    () =>
      serverFilters
        ? [
            ...(state.className
              ? [
                  {
                    column: 'desiredClassName',
                    type: 'contains',
                    value: state.className,
                    valueType: 'string',
                    label: 'Target Class',
                    displayValue: state.className,
                  },
                ]
              : []),
            ...(state.routeType == null
              ? []
              : [
                  {
                    column: 'intendedRouteType',
                    type: 'equals',
                    value: state.routeType,
                    valueType: 'enum',
                    label: 'Admission Pathway',
                    displayValue: getRouteTypeLabel(state.routeType),
                  },
                ]),
            ...(state.priority == null
              ? []
              : [
                  {
                    column: 'priority',
                    type: 'equals',
                    value: state.priority,
                    valueType: 'enum',
                    label: 'Priority',
                    displayValue: priorityLabels[state.priority],
                  },
                ]),
          ]
        : [],
    [serverFilters, state.className, state.priority, state.routeType]
  );
  const privateFilters = useMemo(
    () =>
      serverFilters
        ? columnFilters.filter((filter) => privateFilterColumns.has(filter.column))
        : [],
    [columnFilters, serverFilters]
  );
  const tableFilters = useMemo(
    () => [...structuralFilters, ...privateFilters],
    [privateFilters, structuralFilters]
  );
  const dateBounds = getDateFilterBounds(privateFilters, 'lastActivityTime');

  const query = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId: academicYearId || '',
      pipelineColumn: selectedColumn,
      academicMediumId,
      filterText: debouncedSearch || undefined,
      ...(serverFilters
        ? {
            applicantSearch: getLatestStringFilter(privateFilters, 'applicant'),
            registrationFormNumber: getLatestStringFilter(privateFilters, 'registrationFormNumber'),
            lastActivityFrom: dateBounds.from,
            lastActivityUntil: dateBounds.until,
            desiredClassName: state.className,
            intendedRouteType: state.routeType,
            priority: state.priority,
          }
        : {}),
      sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );

  const openLead = useCallback(
    (lead: AdmissionCrmLeadDto) => openApplicant(lead.id, applicantTab),
    [applicantTab, openApplicant]
  );

  const clearAdditionalFilters = useCallback(() => {
    setSearch('');
    setColumnFilters([]);
    updateState(
      {
        className: undefined,
        routeType: undefined,
        priority: undefined,
        page: 1,
      },
      'push'
    );
  }, [setColumnFilters, setSearch, updateState]);

  const handleServerFilter = useCallback(
    (filters: IParams['filters']) => {
      setColumnFilters(filters.filter((filter) => !structuralFilterColumns.has(filter.column)));
      updateState(
        {
          className: getLatestStringFilter(filters, 'desiredClassName'),
          routeType: getLatestEnumFilter(filters, 'intendedRouteType'),
          priority: getLatestEnumFilter(filters, 'priority'),
          page: 1,
        },
        'push'
      );
    },
    [setColumnFilters, updateState]
  );

  const hasAdditionalFilters = search.trim().length > 0 || tableFilters.length > 0;

  const columns = useMemo<IColumn[]>(() => {
    const tableColumns: IColumn[] = [
      {
        id: 'applicantNumber',
        originalId: serverFilters ? 'ApplicantNumber' : undefined,
        label: 'Applicant ID',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: serverFilters,
        isFilter: false,
        render: (value) => (
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatApplicantNumber(value as number)}
          </Typography>
        ),
      },
      {
        id: serverFilters ? 'applicant' : 'applicantName',
        originalId: serverFilters ? 'ApplicantName' : undefined,
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        isSort: serverFilters,
        isFilter: serverFilters,
        filterType: serverFilters ? 'string' : undefined,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Stack spacing={0.15} sx={{ minWidth: 0 }}>
              {serverFilters ? (
                <Link
                  component={NextLink}
                  {...createApplicantLinkNavigationProps({
                    href: getApplicantHref(lead.id, applicantTab),
                    onOpen: () => openLead(lead),
                    onPrefetch: () => prefetchApplicant(lead.id),
                  })}
                  variant="subtitle2"
                  color="inherit"
                  underline="hover"
                  noWrap
                  title={applicantName(lead)}
                >
                  {applicantName(lead)}
                </Link>
              ) : (
                <Typography variant="subtitle2">{applicantName(lead)}</Typography>
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                {formatApplicantContact(lead.primaryContactNo, lead.email)}
              </Typography>
            </Stack>
          );
        },
      },
    ];

    if (showRegistrationForm) {
      tableColumns.push({
        id: 'registrationFormNumber',
        label: 'Registration Form',
        width: 190,
        minWidth: 170,
        filterType: 'string',
        render: (value) => (
          <Chip
            size="small"
            variant="outlined"
            label={value ? `Issued · ${value}` : 'Not issued'}
          />
        ),
      });
    }

    tableColumns.push(
      {
        id: 'desiredClassName',
        label: serverFilters ? 'Target Class' : 'Standard',
        width: serverFilters ? 180 : 140,
        minWidth: serverFilters ? 160 : 125,
        isSort: serverFilters,
        isFilter: serverFilters,
        filterType: serverFilters ? 'string' : undefined,
        render: (value) => value || 'Not captured',
      },
      {
        id: 'currentStep',
        label: 'Current step',
        width: 165,
        minWidth: 150,
        isSort: false,
        isFilter: false,
        render: (value) =>
          value == null ? (
            'Not available'
          ) : (
            <Chip
              size="small"
              variant="outlined"
              label={stepLabels[value as AdmissionCrmApplicantStepKey]}
            />
          ),
      },
      {
        id: 'nextAction',
        label: 'Next action',
        width: 300,
        minWidth: 250,
        isSort: false,
        isFilter: false,
        render: (value) => value || 'Open the applicant to review the next step',
      },
      {
        id: serverFilters ? 'intendedRouteType' : 'intendedRouteNameSnapshot',
        label: 'Admission pathway',
        width: 180,
        minWidth: 160,
        isSort: serverFilters,
        isFilter: serverFilters,
        filterType: serverFilters ? 'enum' : undefined,
        enumOptions: serverFilters
          ? routeTypes.map((routeType) => ({
              value: routeType,
              label: getRouteTypeLabel(routeType),
            }))
          : undefined,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return lead.intendedRouteNameSnapshot || getRouteTypeLabel(lead.intendedRouteType);
        },
      }
    );

    if (showPriority) {
      tableColumns.push({
        id: 'priority',
        label: 'Priority',
        width: 125,
        minWidth: 115,
        filterType: 'enum',
        enumOptions: priorities.map((priority) => ({
          value: priority,
          label: priorityLabels[priority],
        })),
        render: (value) => priorityLabels[value as AdmissionCrmLeadPriority],
      });
    }

    tableColumns.push(
      {
        id: 'lastActivityTime',
        label: 'Last activity',
        width: 165,
        minWidth: 150,
        isSort: true,
        isFilter: serverFilters,
        filterType: serverFilters ? 'date' : undefined,
        render: (value) => formatEnrollmentDate(value as string, true),
      },
      {
        id: 'actions',
        label: serverFilters ? 'Actions' : '',
        ...(serverFilters
          ? enrollmentActionsColumn
          : {
              width: 100,
              minWidth: 100,
              sticky: true,
              stickyPosition: 'right' as const,
              stickyOnMobile: false,
            }),
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => (
          <Button
            size="small"
            variant="outlined"
            aria-label={`Open ${applicantName(row as AdmissionCrmLeadDto)} ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              openLead(row as AdmissionCrmLeadDto);
            }}
          >
            Open
          </Button>
        ),
      }
    );

    return tableColumns;
  }, [
    applicantTab,
    getApplicantHref,
    openLead,
    prefetchApplicant,
    serverFilters,
    showPriority,
    showRegistrationForm,
    title,
  ]);

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title={title}
          description={description}
          actions={headerActions}
        />
        <Alert severity="info">Select an academic year to open this worklist.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader title={title} description={description} actions={headerActions} />
      <ApplicantWorklistStageFilter
        title={title}
        label={tableConfiguration?.stageFilter?.label}
        description={tableConfiguration?.stageFilter?.description}
        columns={worklistColumns}
        selectedColumn={selectedColumn}
        onChange={(value) => updateState({ pipelineColumn: value, queue: undefined, page: 1 })}
      />
      {query.isError ? (
        <EnrollmentWorkspaceErrorState
          message={`${title} could not be loaded.`}
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {query.isFetching && !query.isLoading ? (
            <LinearProgress aria-label={`Refreshing ${title}`} />
          ) : null}
          <CustomizableTable
            tableId={tableId}
            tableTitle={title}
            columns={columns}
            data={query.data?.items || []}
            isLoading={query.isLoading}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideSortMode="single"
            serverSideFilter={serverFilters}
            totalCount={query.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            searchTerm={search}
            defaultSearchTerm={search}
            searchFieldProps={{
              placeholder: tableConfiguration?.searchPlaceholder || 'Search…',
              autoComplete: 'off',
              name: `${tableId}-search`,
              inputProps: { 'aria-label': `Search ${title.toLocaleLowerCase()}` },
            }}
            filters={serverFilters ? tableFilters : undefined}
            sorts={parseEnrollmentTableSorts(sorting, columns)}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onSearchInputChange={setSearch}
            onServerPagination={(nextPage, nextPageSize) =>
              updateState({ page: nextPage, pageSize: nextPageSize }, 'push')
            }
            onServerSearch={(value) => {
              setSearch(value);
              updateState({ page: 1 }, 'replace');
            }}
            onServerSort={(_column, sorts) => {
              const nextSorting = serializeEnrollmentTableSort(sorts);
              updateState({ sorting: nextSorting || undefined, page: 1 }, 'push');
            }}
            onServerFilter={serverFilters ? handleServerFilter : undefined}
            rowProps={(row) => {
              const lead = row as AdmissionCrmLeadDto;
              return createApplicantRowNavigationProps({
                applicantName: applicantName(lead),
                onOpen: () => openLead(lead),
              });
            }}
            noDataText={
              <EnrollmentTableEmptyState
                title={
                  hasAdditionalFilters
                    ? 'No applicants match these filters'
                    : `No ${title.toLocaleLowerCase()} work`
                }
                description={
                  hasAdditionalFilters
                    ? 'Clear the search and table filters to show this registration stage again.'
                    : 'No applicants currently need action in this worklist.'
                }
                action={
                  hasAdditionalFilters ? (
                    <Button size="small" onClick={clearAdditionalFilters}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            }
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
        </>
      )}
    </Stack>
  );
}
