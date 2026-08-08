'use client';

import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  AdmissionCrmApplicantStepKey,
  useGetAdmissionCrmLeadsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Typography,
  ToggleButton,
  LinearProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { createApplicantRowNavigationProps } from './applicant-row-navigation';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';
import {
  getRouteTypeLabel,
  formatEnrollmentDate,
  formatApplicantContact,
} from './enrollment-display';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

export type ApplicantWorklistColumn = {
  key: AdmissionCrmPipelineColumnKey;
  label: string;
};

type ApplicantWorklistWorkspaceProps = {
  title: string;
  description: string;
  tableId: string;
  columns: readonly ApplicantWorklistColumn[];
  defaultColumn: AdmissionCrmPipelineColumnKey;
  applicantTab: ApplicantWorkspaceTab;
  headerActions?: ReactNode;
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

export function ApplicantWorklistWorkspace({
  title,
  description,
  tableId,
  columns: worklistColumns,
  defaultColumn,
  applicantTab,
  headerActions,
}: ApplicantWorklistWorkspaceProps) {
  const { academicYearId, academicMediumId, sessionIdentity, state, updateState, openApplicant } =
    useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const requestedPageSize = state.pageSize ?? 25;
  const pageSize = [10, 25, 50, 100].includes(requestedPageSize) ? requestedPageSize : 25;
  const { search, setSearch } = useWorkspaceTableSessionState(
    `applicant-worklist:${tableId}:${academicYearId || 'none'}:${sessionIdentity}`
  );
  const sorting = state.sorting || 'lastActivityTime desc';
  const selectedColumn = worklistColumns.some((item) => item.key === state.pipelineColumn)
    ? (state.pipelineColumn as AdmissionCrmPipelineColumnKey)
    : defaultColumn;

  const query = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId: academicYearId || '',
      pipelineColumn: selectedColumn,
      academicMediumId,
      filterText: search || undefined,
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

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        sticky: true,
        stickyPosition: 'left',
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return (
            <Stack spacing={0.15}>
              <Typography variant="subtitle2">{applicantName(lead)}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {formatApplicantContact(lead.primaryContactNo, lead.email)}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'desiredClassName',
        label: 'Standard',
        width: 140,
        minWidth: 125,
        isSort: false,
        isFilter: false,
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
        id: 'intendedRouteNameSnapshot',
        label: 'Admission pathway',
        width: 180,
        minWidth: 160,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const lead = row as AdmissionCrmLeadDto;
          return lead.intendedRouteNameSnapshot || getRouteTypeLabel(lead.intendedRouteType);
        },
      },
      {
        id: 'lastActivityTime',
        label: 'Last activity',
        width: 165,
        minWidth: 150,
        isSort: true,
        isFilter: false,
        render: (value) => formatEnrollmentDate(value as string, true),
      },
      {
        id: 'actions',
        label: '',
        width: 100,
        minWidth: 100,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => (
          <Button
            size="small"
            variant="outlined"
            onClick={(event) => {
              event.stopPropagation();
              openLead(row as AdmissionCrmLeadDto);
            }}
          >
            Open
          </Button>
        ),
      },
    ],
    [openLead]
  );

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
      <Box sx={{ overflowX: 'auto' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={selectedColumn}
          onChange={(_event, value: AdmissionCrmPipelineColumnKey | null) => {
            if (value == null) return;
            updateState({ pipelineColumn: value, page: 1 });
          }}
          aria-label={`${title} worklist`}
        >
          {worklistColumns.map((item) => (
            <ToggleButton key={item.key} value={item.key}>
              {item.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
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
            totalCount={query.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            searchTerm={search}
            sorts={parseEnrollmentTableSorts(sorting, columns)}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
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
            rowProps={(row) => {
              const lead = row as AdmissionCrmLeadDto;
              return createApplicantRowNavigationProps({
                applicantName: applicantName(lead),
                onOpen: () => openLead(lead),
              });
            }}
            noDataText={
              <EnrollmentTableEmptyState
                title={`No ${title.toLocaleLowerCase()} work`}
                description="No applicants currently need action in this worklist."
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
