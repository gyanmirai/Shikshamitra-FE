'use client';

import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmPipelineColumnKey,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AdmissionCrmApplicantStepKey,
  useGetAdmissionCrmLeadsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { createApplicantRowNavigationProps } from './applicant-row-navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { academicYearId, academicMediumId, openApplicant } = useEnrollmentWorkspace();
  const page = Math.max(0, Number(searchParams.get('page') || '1') - 1);
  const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') || '25')));
  const search = searchParams.get('search') || '';
  const sorting = searchParams.get('sorting') || 'lastActivityTime desc';
  const requestedColumn = Number(searchParams.get('worklist'));
  const selectedColumn = worklistColumns.some((item) => item.key === requestedColumn)
    ? (requestedColumn as AdmissionCrmPipelineColumnKey)
    : defaultColumn;

  const updateUrl = useCallback(
    (changes: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value == null || value === '') params.delete(key);
        else params.set(key, String(value));
      });
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

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
            updateUrl({ worklist: value, page: 1 });
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
        <CustomizableTable
          tableId={tableId}
          tableTitle={title}
          columns={columns}
          data={query.data?.items || []}
          isLoading={query.isLoading || query.isFetching}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          totalCount={query.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          searchTerm={search}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onServerPagination={(nextPage, nextPageSize) =>
            updateUrl({ page: nextPage + 1, pageSize: nextPageSize })
          }
          onServerSearch={(value) => updateUrl({ search: value || null, page: 1 })}
          onServerSort={(_column, sorts) => {
            const sort = sorts[0];
            updateUrl({
              sorting: sort ? `${sort.originalId || sort.column} ${sort.direction}` : null,
              page: 1,
            });
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
      )}
    </Stack>
  );
}
