import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Typography, IconButton } from '@mui/material';

import {
  getSubmissionProgress,
  getEvaluationProgress,
  LearningTaskStatusChip,
  SUBMISSION_TYPE_LABELS,
  LearningTaskSummaryCards,
} from '../../homeworkCreation/component/learningTaskUi';

import type { IAssignment, IAssignmentTableProps } from '../type';
import type { DivisionHomeworkMeta } from '../../homeworkCreation/type';

const AssignmentTable: React.FC<IAssignmentTableProps> = ({
  assignmentData,
  isLoading,
  selectedDivision,
  selectedClass,
  onSwitchToggle,
  onEdit,
  onDelete,
  onView,
  onViewSubmission,
  dialog,
  canAdd = true,
  canView = true,
  canDelete = true,
}) => {
  /**
   * Memoization Justification:
   * - The table needs selected-division schedule values flattened into each row.
   * - It prevents rebuilding normalized rows unless API data or selected division changes.
   * - CustomizableTable performs filtering/sorting on the normalized row shape.
   */
  const filteredData = useMemo(
    () =>
      (assignmentData || []).map((hw: IAssignment) => {
        const schedules = (hw as any).divisionSchedules || hw.divisions || [];
        const currentDivision = schedules.find(
          (d: any) => !selectedDivision || d.divisionId === selectedDivision
        );
        return {
          ...hw,
          assignmentType: (hw as any).assignmentTypeName || (hw as any).assignmentType,
          classDivision: `${(hw as any).standardName || hw.className || '-'} / ${currentDivision?.divisionName || '-'}`,
          subjectChapter: [hw.subjectName, (hw as any).chapterName]
            .filter(Boolean)
            .join(' / '),
          currentDivisionId: currentDivision?.divisionId,
          publishDate: currentDivision?.publishDate || currentDivision?.publishAt,
          dueDate: currentDivision?.dueDate || currentDivision?.dueAt,
          status:
            currentDivision?.status !== undefined
              ? currentDivision.status
              : currentDivision?.isPublished
                ? 1
                : ((hw as any).status ?? 0),
          divisions: schedules,
        };
      }),
    [assignmentData, selectedDivision]
  );

  return (
    <Box>
      <LearningTaskSummaryCards tasks={filteredData} />
      <CustomizableTable
        tableId="assignment-management"
        isLoading={isLoading}
        noDataText={
          <>
            No learning tasks created yet.
            {canAdd && (
              <Box
                onClick={dialog.onTrue}
                color="primary.main"
                fontWeight={600}
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                Create assignment to share work with students.
              </Box>
            )}
          </>
        }
        columns={[
          { id: 'title', label: 'Title', align: 'left', filterType: 'string', sticky: true },
          { id: 'classDivision', label: 'Class / Division', align: 'left', filterType: 'string' },
          { id: 'subjectChapter', label: 'Subject / Chapter', align: 'left', filterType: 'string' },
          {
            id: 'assignmentType',
            label: 'Task Type',
            align: 'left',
            filterType: 'string',
            render: (value, row) => (
              <Stack spacing={0.5}>
                <Typography variant="body2">{value || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {SUBMISSION_TYPE_LABELS[Number((row as any).submissionType)] || '-'}
                </Typography>
              </Stack>
            ),
          },
          {
            id: 'publishDate',
            label: 'Publish Date',
            align: 'left',
            filterType: 'date',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value ? dayjs(value).format('DD-MM-YYYY HH:mm') : '-'}
              </Typography>
            ),
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            render: (value) => (
              <Typography variant="caption" fontSize="13px">
                {value ? dayjs(value).format('DD-MM-YYYY HH:mm') : '-'}
              </Typography>
            ),
          },
          {
            id: 'submittedCount',
            label: 'Submission Progress',
            align: 'left',
            filterType: 'number',
            render: (_value, row) => (
              <Typography variant="caption">{getSubmissionProgress(row)}</Typography>
            ),
          },
          {
            id: 'evaluationPendingCount',
            label: 'Evaluation Progress',
            align: 'left',
            filterType: 'number',
            render: (_value, row) => (
              <Typography variant="caption">{getEvaluationProgress(row)}</Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            isSort: false,
            render: (_value, row) => <LearningTaskStatusChip task={row} />,
          },
          {
            id: 'action',
            label: 'Actions',
            isSort: false,
            align: 'left',
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            minWidth: 220,
            render: (_value, row) => {
              const isDraft = Number((row as any).status ?? 0) === 0;
              const schedules = (row as any).divisionSchedules || row.divisions || [];
              const divisionData = schedules.find(
                (d: DivisionHomeworkMeta) => d.divisionId === selectedDivision
              );
              const rowWithDivision = { ...row, divisionMeta: divisionData } as IAssignment & {
                divisionMeta?: DivisionHomeworkMeta;
              };

              return (
                <Stack direction="row" spacing={0.5}>
                  {canView && (
                    <CustomTooltip title="View Details" arrow>
                      <IconButton size="small" onClick={() => onView(rowWithDivision)}>
                        <Iconify icon="solar:eye-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  {canAdd && isDraft && (
                    <CustomTooltip title="Edit" arrow>
                      <IconButton size="small" onClick={() => onEdit(row as IAssignment)}>
                        <Iconify icon="solar:pen-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  {canAdd && isDraft && (
                    <CustomTooltip title="Publish Now" arrow>
                      <IconButton size="small" onClick={() => onSwitchToggle(row as IAssignment)}>
                        <Iconify icon="solar:upload-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  <CustomTooltip title="View Submissions" arrow>
                    <IconButton size="small" onClick={() => onViewSubmission(row as IAssignment)}>
                      <Iconify icon="solar:inbox-in-bold" width={18} />
                    </IconButton>
                  </CustomTooltip>
                  <CustomTooltip title="Send Reminder will be enabled after notification wiring" arrow>
                    <span>
                      <IconButton size="small" disabled>
                        <Iconify icon="solar:bell-bold" width={18} />
                      </IconButton>
                    </span>
                  </CustomTooltip>
                  {canDelete && (
                    <CustomTooltip title={isDraft ? 'Delete' : 'Archive published tasks later'} arrow>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!isDraft}
                          onClick={() => onDelete(row as IAssignment)}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </span>
                    </CustomTooltip>
                  )}
                </Stack>
              );
            },
          },
        ]}
        data={filteredData || []}
      />
    </Box>
  );
};

export default AssignmentTable;
