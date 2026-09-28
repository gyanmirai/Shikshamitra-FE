import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { AssignmentSubmissionType, ASSIGNMENT_SUBMISSION_TYPE_LABELS } from 'src/enums/assignment';

import { getAssignmentActionVisibility } from './assignment-actions';
import { getLearningTaskTableActions } from '../../homeworkCreation/component/learningTaskTableActions';
import {
  getSubmissionProgress,
  getEvaluationProgress,
  LearningTaskStatusChip,
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
  onClose,
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
          subjectChapter: [hw.subjectName, (hw as any).chapterName].filter(Boolean).join(' / '),
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
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <LearningTaskSummaryCards tasks={filteredData} />
      <CustomizableTable
        tableId="assignment-management"
        isLoading={isLoading}
        handleRowClick={(row) => {
          if (!canView) return;
          const schedules = (row as any).divisionSchedules || row.divisions || [];
          const divisionData = schedules.find(
            (division: DivisionHomeworkMeta) => division.divisionId === selectedDivision
          );
          onView({ ...row, divisionMeta: divisionData } as IAssignment & {
            divisionMeta?: DivisionHomeworkMeta;
          });
        }}
        rowProps={() => ({ sx: { cursor: canView ? 'pointer' : 'default' } })}
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
          {
            id: 'title',
            label: 'Title',
            minWidth: 240,
            align: 'left',
            filterType: 'string',
            sticky: true,
            render: (value) =>
              canView ? (
                <ButtonBase
                  aria-label={`View details for ${value}`}
                  sx={{ color: 'inherit', font: 'inherit', textAlign: 'left' }}
                >
                  {value}
                </ButtonBase>
              ) : (
                value
              ),
          },
          { id: 'classDivision', label: 'Class / Division', align: 'left', filterType: 'string' },
          { id: 'subjectChapter', label: 'Subject / Chapter', align: 'left', filterType: 'string' },
          {
            id: 'assignmentType',
            label: 'Task Type',
            align: 'left',
            filterType: 'string',
            render: (value, row) => (
              <Stack spacing={1}>
                <Typography variant="body2">{value || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {ASSIGNMENT_SUBMISSION_TYPE_LABELS[
                    Number((row as IAssignment).submissionType) as AssignmentSubmissionType
                  ] || '-'}
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
              const assignment = row as IAssignment;
              const actions = getAssignmentActionVisibility(assignment, {
                canAdd,
                canView,
                canDelete,
              });
              const rowActions = getLearningTaskTableActions({
                canEdit: actions.canEdit,
                canPublish: actions.canPublish,
                canClose: actions.canClose,
                canViewSubmissions: actions.canViewSubmissions,
                canDelete,
                deleteDisabled: !actions.canDelete,
                deleteTooltip: actions.canDelete
                  ? 'Delete'
                  : 'Only draft assignments can be deleted',
                onEdit: () => onEdit(assignment),
                onPublish: () => onSwitchToggle(assignment),
                onClose: () => onClose(assignment),
                onViewSubmissions: () => onViewSubmission(assignment),
                onDelete: () => onDelete(assignment),
              });

              return (
                <Box onClick={(event) => event.stopPropagation()}>
                  <AdaptiveThreeDotsActions
                    actions={rowActions}
                    placement="right-top"
                    moreLabel="More assignment actions"
                  />
                </Box>
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
