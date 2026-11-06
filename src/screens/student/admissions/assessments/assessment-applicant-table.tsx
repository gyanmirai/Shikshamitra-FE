import type { IColumn, ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tooltip, Checkbox, Typography, IconButton } from '@mui/material';

import { useAssessmentPermissions } from './use-assessment-permissions';
import { getPrimaryAssessmentAction } from './assessment-workbench-model';
import { assessmentActionLabels, latestAssessmentAttempt } from './assessment-action-model';
import {
  assessmentStatusColor,
  assessmentStatusLabels,
  assessmentAttendanceLabels,
  getAssessmentRosterDisplay,
} from './assessment-roster-status';

import type { AssessmentAction } from './assessment-action-model';

type Props = Omit<ICustomizableTableProps, 'columns' | 'data' | 'tableId'> & {
  items: AssessmentRosterItem[];
  selectedSessionId?: string;
  selectedIds?: ReadonlySet<string>;
  onSelectionChange?: (rows: AssessmentRosterItem[], checked: boolean) => void;
  canAdvance: boolean;
  onAction: (row: AssessmentRosterItem, action: AssessmentAction | 'continue') => void;
  onDetails: (row: AssessmentRosterItem) => void;
};
export function AssessmentApplicantTable({
  items,
  selectedSessionId,
  selectedIds = new Set<string>(),
  onSelectionChange,
  canAdvance,
  onAction,
  onDetails,
  ...table
}: Props) {
  const permissions = useAssessmentPermissions();
  const narrow = useResponsive('down', 'sm');
  const selectable = items.filter((row) => row.isActive && !!row.assessment.policy);
  const pageSelectionReason = selectable.length
    ? ''
    : 'No active managed assessments on this page. Open a student row to view assessment details.';
  const displayAttempt = (row: AssessmentRosterItem) =>
    !row.isActive && selectedSessionId
      ? latestAssessmentAttempt({
          ...row.assessment,
          attempts: row.assessment.attempts.filter(
            (attempt) => attempt.sessionId === selectedSessionId
          ),
        })
      : latestAssessmentAttempt(row.assessment);
  const columns: IColumn[] = [
    ...(onSelectionChange
      ? [
          {
            id: 'selection',
            label: (
              <Tooltip title={pageSelectionReason} describeChild>
                <Box
                  component="span"
                  tabIndex={pageSelectionReason ? 0 : undefined}
                  aria-label={pageSelectionReason ? 'Why Page Selection Is Unavailable' : undefined}
                  sx={{ display: 'inline-flex' }}
                >
                  <Checkbox
                    size="small"
                    sx={narrow ? { width: 44, height: 44 } : undefined}
                    checked={
                      selectable.length > 0 &&
                      selectable.every((row) => selectedIds.has(row.stageInstanceId))
                    }
                    indeterminate={
                      selectable.some((row) => selectedIds.has(row.stageInstanceId)) &&
                      !selectable.every((row) => selectedIds.has(row.stageInstanceId))
                    }
                    disabled={!selectable.length}
                    inputProps={{
                      'aria-label': 'Select Applicants on This Page',
                      'aria-description': pageSelectionReason || undefined,
                    }}
                    onChange={(_, checked) => onSelectionChange(selectable, checked)}
                  />
                </Box>
              </Tooltip>
            ),
            isSort: false,
            isFilter: false,
            excludeFromExport: true,
            width: 44,
            headerSx: narrow ? { px: 0 } : undefined,
            cellSx: narrow ? { px: 0 } : undefined,
            render: (_: unknown, data: Record<string, unknown>) => {
              const row = data as AssessmentRosterItem;
              const selectionReason = !row.isActive
                ? 'This assessment stage is no longer active. Open the student row to view its history.'
                : !row.assessment.policy
                  ? 'Managed assessment is not configured for this stage.'
                  : '';
              return (
                <Tooltip title={selectionReason} describeChild>
                  <Box
                    component="span"
                    tabIndex={selectionReason ? 0 : undefined}
                    aria-label={
                      selectionReason
                        ? `Why Selection Is Unavailable For ${row.applicantName}`
                        : undefined
                    }
                    sx={{ display: 'inline-flex' }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      size="small"
                      sx={narrow ? { width: 44, height: 44 } : undefined}
                      checked={selectedIds.has(row.stageInstanceId)}
                      disabled={!row.isActive || !row.assessment.policy}
                      inputProps={{
                        'aria-label': `Select ${row.applicantName}`,
                        'aria-description': selectionReason || undefined,
                      }}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(_event, checked) => onSelectionChange([row], checked)}
                    />
                  </Box>
                </Tooltip>
              );
            },
          },
        ]
      : []),
    {
      id: 'applicantName',
      label: 'Student Name',
      // Combined name/reference identity remains read-only; global search covers both.
      isFilter: false,
      minWidth: narrow ? 120 : 200,
      headerSx: narrow ? { px: 0.5 } : undefined,
      cellSx: narrow ? { px: 0.5, overflowWrap: 'anywhere' } : undefined,
      render: (_, data) => (
        <Box>
          <Typography variant="subtitle2">{data.applicantName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {data.applicationNumber}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'applicationNumber',
      label: 'Application Number',
      defaultHidden: true,
      isFilter: true,
      filterType: 'string',
    },
    {
      id: 'className',
      label: 'Class',
      isSort: false,
      isFilter: true,
      filterType: 'string',
      minWidth: 100,
      render: (_, row) => row.className || '—',
    },
    {
      id: 'sessionName',
      label: 'Session',
      isSort: false,
      isFilter: true,
      filterType: 'string',
      minWidth: 150,
      render: (_, data) => displayAttempt(data as AssessmentRosterItem)?.sessionName ?? '—',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      isSort: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: Object.entries(assessmentAttendanceLabels).map(([value, label]) => ({
        value,
        label,
      })),
      render: (_, data) => {
        const row = data as AssessmentRosterItem;
        const value = getAssessmentRosterDisplay(row, displayAttempt(row)).attendance;
        return (
          <Label
            color={
              value === 'present'
                ? 'success'
                : value === 'absent'
                  ? 'error'
                  : value === 'pending'
                    ? 'warning'
                    : 'default'
            }
          >
            {assessmentAttendanceLabels[value]}
          </Label>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      isSort: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: Object.entries(assessmentStatusLabels)
        .filter(([value]) => value !== 'unavailable')
        .map(([value, label]) => ({ value, label })),
      minWidth: 160,
      width: 160,
      render: (_, data) => {
        const row = data as AssessmentRosterItem;
        const value = getAssessmentRosterDisplay(row, displayAttempt(row)).status;
        return <Label color={assessmentStatusColor(value)}>{assessmentStatusLabels[value]}</Label>;
      },
    },
    {
      id: 'actions',
      label: 'Action',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      width: 64,
      minWidth: 64,
      render: (_, data) => {
        const row = data as AssessmentRosterItem;
        const action = getPrimaryAssessmentAction(row, permissions, canAdvance);
        const labels: Record<AssessmentAction | 'continue', string> = {
          book: row.assessment.policy?.schedulingEnabled ? 'Book assessment' : 'Start assessment',
          attendance: 'Record attendance',
          result: 'Record result',
          resultDraft: assessmentActionLabels.resultDraft,
          retake: 'Retake',
          cancel: 'Cancel',
          waive: 'Waive',
          continue: 'Continue',
        };
        const icons: Record<AssessmentAction | 'continue' | 'details', string> = {
          book: 'mdi:calendar-plus-outline',
          attendance: 'mdi:calendar-check-outline',
          result: 'mdi:clipboard-check-outline',
          resultDraft: 'mdi:content-save-outline',
          retake: 'mdi:refresh',
          cancel: 'mdi:calendar-remove-outline',
          waive: 'mdi:calendar-minus-outline',
          continue: 'mdi:arrow-right-circle-outline',
          details: 'mdi:eye-outline',
        };
        const label = action ? labels[action] : 'View details';
        return (
          <CustomTooltip title={label} arrow>
            <IconButton
              size="small"
              color="inherit"
              sx={{ color: 'text.secondary', width: 40, height: 40 }}
              onClick={(event) => {
                event.stopPropagation();
                if (action) onAction(row, action);
                else onDetails(row);
              }}
              aria-label={`${label} for ${row.applicantName}`}
            >
              <Iconify icon={icons[action ?? 'details']} width={20} aria-hidden />
            </IconButton>
          </CustomTooltip>
        );
      },
    },
  ];
  const data = items.map((row) => {
    const attempt = displayAttempt(row);
    return {
      ...row,
      id: row.stageInstanceId,
      sessionName: attempt?.sessionName ?? '',
      attendance: assessmentAttendanceLabels[getAssessmentRosterDisplay(row, attempt).attendance],
    };
  });
  return (
    <CustomizableTable
      {...table}
      tableId="admission-assessment-students-v3"
      handleRowClick={(row) => onDetails(row as AssessmentRosterItem)}
      rowProps={(record) => ({
        tabIndex: 0,
        'aria-label': `Assessment Details For ${record.applicantName}`,
        onKeyDown: (event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            onDetails(record as AssessmentRosterItem);
          }
        },
        sx: {
          cursor: 'pointer',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        },
      })}
      columns={columns}
      data={data}
      tableTitle="Assessment Students"
      exportLabel="Export"
      wrapperProps={{ sx: { height: 1, minWidth: 0, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      isSearch
      isPagination
      serverSidePagination
      serverSideSearch
      serverSideFilter
      serverSideSort
      serverSideSortMode="single"
      searchFieldProps={{
        placeholder: 'Search Students or Application Number',
        inputProps: { 'aria-label': 'Search Assessment Applicants', maxLength: 128 },
      }}
    />
  );
}
