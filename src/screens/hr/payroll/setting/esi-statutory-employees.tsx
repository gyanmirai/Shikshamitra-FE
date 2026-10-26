'use client';

import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type {
  EsiEnrollment,
  EsiImpactPreview,
  EsiEmployeeImpact,
} from 'src/redux/hr/statutory-scheme-api';

import { serverColumnFilters } from 'src/screens/hr/utils/server-column-filters';
import Link from 'next/link';
import { useMemo } from 'react';
import { Visibility } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import {
  Box,
  Chip,
  Alert,
  Button,
  Select,
  MenuItem,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { formatEsiCurrency, enrollmentStatusLabel } from './esi-statutory-utils';

import type { EsiWorkspaceQuery } from './esi-statutory-utils';

type EsiEmployeesPanelProps = {
  query: EsiWorkspaceQuery;
  preview?: EsiImpactPreview;
  isLoading: boolean;
  isError: boolean;
  canManageEnrollment: boolean;
  canApproveOverride: boolean;
  onRetry: () => void;
  onQueryChange: (updates: Record<string, string | number | null>) => void;
  onOpenEmployee: (employee: EsiEmployeeImpact) => void;
};

const enrollmentStatuses: EsiEnrollment['status'][] = [
  'PendingReview',
  'RegistrationPending',
  'Covered',
  'NotCovered',
  'Exited',
];

export function EsiStatutoryEmployees({
  query,
  preview,
  isLoading,
  isError,
  canManageEnrollment,
  canApproveOverride,
  onRetry,
  onQueryChange,
  onOpenEmployee,
}: EsiEmployeesPanelProps) {
  const exportTable = useHrTableExport('esi-employee-impact', {
    ...query,
    monthYear: `${query.month.slice(5)}-${query.month.slice(0, 4)}`,
  });
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'employeeName',
        label: 'Staff',
        minWidth: 190,
        isFilter: false,
        render: (_value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.employeeName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeIdentifier || 'No staff code'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'coverageDecisionLabel',
        label: 'Coverage decision',
        minWidth: 170,
        isFilter: false,
        isSort: false,
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'enrollmentStatus',
        label: 'Enrollment',
        minWidth: 150,
        isFilter: false,
        isSort: false,
        render: (value) => (
          <Chip size="small" variant="outlined" label={enrollmentStatusLabel(value)} />
        ),
      },
      {
        id: 'statutoryWages',
        label: 'Salary used for ESIC',
        minWidth: 175,
        align: 'right',
        isFilter: false,
        render: (value) => formatEsiCurrency(value),
      },
      {
        id: 'employeeContribution',
        label: 'Staff deduction',
        minWidth: 145,
        align: 'right',
        isFilter: false,
        render: (value) => formatEsiCurrency(value),
      },
      {
        id: 'employerContribution',
        label: 'Employer contribution',
        minWidth: 155,
        align: 'right',
        isFilter: false,
        render: (value) => formatEsiCurrency(value),
      },
      {
        id: 'readiness',
        label: 'Readiness',
        minWidth: 230,
        isFilter: false,
        render: (_value, row) => {
          const employee = row as EsiEmployeeImpact;
          const primaryIssue = employee.issues[0];
          if (!primaryIssue) {
            return (
              <Chip
                size="small"
                color="success"
                label={employee.isCovered ? 'Ready' : 'No action needed'}
              />
            );
          }
          return (
            <Box>
              <Typography variant="body2" color="warning.dark">
                {primaryIssue.title}
              </Typography>
              {employee.issues.length > 1 ? (
                <Button
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenEmployee(employee);
                  }}
                  aria-label={`View all ${employee.issues.length} issues for ${employee.employeeName}`}
                >
                  View all issues ({employee.issues.length})
                </Button>
              ) : null}
            </Box>
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        minWidth: 100,
        align: 'right',
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
        render: (_value, row) => {
          const employee = row as EsiEmployeeImpact;
          const needsRevision = employee.issues.some(
            (issue) => issue.resolutionTarget === 'compensationRevision'
          );
          return (
            <Box display="flex" justifyContent="flex-end" gap={0.5}>
              {needsRevision ? (
                <Button
                  component={Link}
                  href={`/hr/payroll/structure?employeeId=${employee.employeeId}`}
                  onClick={(event) => event.stopPropagation()}
                  size="small"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Payroll structure
                </Button>
              ) : null}
              <IconButton
                aria-label={`${canManageEnrollment || canApproveOverride ? 'Manage' : 'View'} ESI details for ${employee.employeeName}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenEmployee(employee);
                }}
                sx={{ width: 44, height: 44 }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [canApproveOverride, canManageEnrollment, onOpenEmployee]
  );

  const tableCriteria = serverColumnFilters(
    columns,
    [
      {
        column: 'coverageDecisionLabel',
        query: 'coverage',
        emptyValue: 'all',
        options: [
          { label: 'Covered decisions', value: 'covered' },
          { label: 'Not covered decisions', value: 'notCovered' },
        ],
      },
      {
        column: 'readiness',
        query: 'readiness',
        emptyValue: 'all',
        options: [
          { label: 'Ready', value: 'ready' },
          { label: 'Needs attention', value: 'needsAttention' },
        ],
      },
    ],
    { coverage: query.coverage, readiness: query.readiness },
    (patch) =>
      onQueryChange({
        coverage: String(patch.coverage),
        readiness: String(patch.readiness),
        page: 0,
      })
  );
  const tableSorts: IParams['sorts'] = [{ column: query.sortBy, direction: query.sortDirection }];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2, minWidth: 0 }}>
      <Box>
        <Typography variant="h6">Staff coverage</Typography>
        <Typography variant="body2" color="text.secondary">
          Review coverage, enrollment, statutory wages, and exceptions for the selected payroll
          month.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>Coverage</InputLabel>
          <Select
            label="Coverage"
            value={query.coverage}
            onChange={(event) => onQueryChange({ coverage: event.target.value, page: 0 })}
          >
            <MenuItem value="all">All coverage decisions</MenuItem>
            <MenuItem value="covered">Covered</MenuItem>
            <MenuItem value="notCovered">Not covered</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Readiness</InputLabel>
          <Select
            label="Readiness"
            value={query.readiness}
            onChange={(event) => onQueryChange({ readiness: event.target.value, page: 0 })}
          >
            <MenuItem value="all">All readiness states</MenuItem>
            <MenuItem value="ready">Ready</MenuItem>
            <MenuItem value="needsAttention">Needs attention</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Enrollment status</InputLabel>
          <Select
            multiple
            label="Enrollment status"
            value={query.enrollmentStatuses}
            renderValue={(selected) =>
              selected.length === 0
                ? 'All enrollment statuses'
                : selected.map(enrollmentStatusLabel).join(', ')
            }
            onChange={(event) =>
              onQueryChange({
                enrollment: (event.target.value as EsiEnrollment['status'][]).join(','),
                page: 0,
              })
            }
          >
            {enrollmentStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {enrollmentStatusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          The staff ESI preview could not be loaded.
        </Alert>
      ) : null}

      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="esi-employee-impact"
        onExport={exportTable}
        tableTitle="ESI staff impact"
        {...tableCriteria}
        data={(preview?.items || []).map((item) => ({ ...item, id: item.employeeId }))}
        totalCount={preview?.totalCount || 0}
        isLoading={isLoading}
        serverSide
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideSortMode="single"
        isFilter={false}
        page={query.page}
        rowsPerPage={query.pageSize}
        rowsPerPageOptions={[10, 25, 50]}
        searchTerm={query.search}
        sorts={tableSorts}
        searchFieldProps={{ placeholder: 'Search staff name or code' }}
        onServerSearch={(search) => onQueryChange({ search: search.trim() || null, page: 0 })}
        onServerPagination={(page, rowsPerPage) =>
          onQueryChange({ page: page - 1, pageSize: rowsPerPage })
        }
        onServerSort={(_column, sorts) => {
          const selectedSort = sorts.at(-1);
          onQueryChange({
            sort: selectedSort?.column || 'employeeName',
            direction: selectedSort?.direction || 'asc',
            page: 0,
          });
        }}
        handleRowClick={(row) => onOpenEmployee(row as EsiEmployeeImpact)}
        rowProps={() => ({ sx: { cursor: 'pointer' } })}
        tableContainerProps={{ sx: { maxWidth: '100%', overflowX: 'auto' } }}
        wrapperProps={{ sx: { minWidth: 0, maxWidth: '100%' } }}
        noDataText="No staff match these filters"
      />
    </Box>
  );
}
