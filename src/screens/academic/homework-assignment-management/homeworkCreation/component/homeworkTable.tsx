import React from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { formatLearningTaskDateTime } from 'src/utils/learning-task-date-time';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { getLearningTaskTableActions } from './learningTaskTableActions';
import {
  getSubmissionProgress,
  getEvaluationProgress,
  LearningTaskStatusChip,
  SUBMISSION_TYPE_LABELS,
} from './learningTaskUi';

import type {
  IHomework,
  IHomeworkDetail,
  IHomeworkTableProps,
  DivisionHomeworkMeta,
} from '../type';

/**
 * HomeworkTable Component - Displays a table of homework assignments with filtering and action capabilities
 * @param {Object} props - Component props
 * @param {Array<IHomework>} props.homeworkData - Normalized homework rows to display
 * @param {Function} props.setOpen - Function to control the dialog open state
 * @param {Object} props.dialog - Dialog control object containing onTrue method
 * @param {Function} props.handleSwitchChange - Handler for publish/unpublish status toggle
 * @param {Function} props.onDeleteDetails - Handler for deleting homework
 * @param {Function} props.onEditDetails - Handler for editing homework
 * @param {Function} props.onViewDetails - Handler for viewing homework details
 * @param {Function} props.onViewSubmission - Handler for viewing homework submissions
 */
const HomeworkTable: React.FC<IHomeworkTableProps> = ({
  homeworkData,
  isLoading,
  selectedDivision,
  setOpen,
  dialog,
  handleSwitchChange,
  onDeleteDetails,
  onEditDetails,
  onViewDetails,
  onViewSubmission,
  canAdd = true,
  canView = true,
  canDelete = true,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
    <CustomizableTable
      tableTitle="Homework"
      tableId="homework-assignment-management"
      isLoading={isLoading}
      handleRowClick={(row) => {
        if (!canView) return;
        const divisionData = row.divisions?.find(
          (division: DivisionHomeworkMeta) => division.divisionId === selectedDivision
        );
        onViewDetails({ ...row, divisionMeta: divisionData } as IHomework & {
          divisionMeta?: DivisionHomeworkMeta;
        });
      }}
      rowProps={() => ({ sx: { cursor: canView ? 'pointer' : 'default' } })}
      noDataText={
        <>
          No learning tasks created yet.
          {canAdd && (
            <Box
              onClick={() => {
                dialog.onTrue();
                setOpen(true);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create homework to share work with students.
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
          filterType: 'string' as const,
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
        {
          id: 'classDivision',
          label: 'Class / Division',
          align: 'left',
          filterType: 'string' as const,
        },
        {
          id: 'subjectChapter',
          label: 'Subject / Chapter',
          align: 'left',
          filterType: 'string' as const,
        },
        {
          id: 'homeworkType',
          label: 'Task Type',
          align: 'left',
          filterType: 'string' as const,
          render: (value, row) => (
            <Stack spacing={1}>
              <Typography variant="body2">{value || '-'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {SUBMISSION_TYPE_LABELS[Number((row as any).submissionType)] || '-'}
              </Typography>
            </Stack>
          ),
        },
        {
          id: 'publishDate',
          label: 'Publish date (IST)',
          align: 'left',
          filterType: 'date' as const,
          render: (value) => (
            <Typography component="time" dateTime={value} variant="caption" fontSize="13px">
              {formatLearningTaskDateTime(value)}
            </Typography>
          ),
        },
        {
          id: 'dueDate',
          label: 'Due date (IST)',
          align: 'left',
          filterType: 'date' as const,
          render: (value) => (
            <Typography component="time" dateTime={value} variant="caption" fontSize="13px">
              {formatLearningTaskDateTime(value)}
            </Typography>
          ),
        },
        {
          id: 'submittedCount',
          label: 'Submission Progress',
          align: 'left',
          filterType: 'number' as const,
          render: (_value, row) => (
            <Typography variant="caption">{getSubmissionProgress(row)}</Typography>
          ),
        },
        {
          id: 'evaluationPendingCount',
          label: 'Evaluation Progress',
          align: 'left',
          filterType: 'number' as const,
          render: (_value, row) => (
            <Typography variant="caption">{getEvaluationProgress(row)}</Typography>
          ),
        },
        {
          id: 'status',
          label: 'Status',
          filterType: 'string' as const,
          align: 'left',
          isFilter: true,
          sticky: true,
          stickyPosition: 'right',
          isSort: false,
          render: (_value, row) => <LearningTaskStatusChip task={row} />,
        },
        {
          id: 'action',
          label: 'Actions',
          isSort: false,
          isFilter: false,
          sticky: true,
          stickyPosition: 'right',
          align: 'left',
          minWidth: 220,
          render: (_value, row) => {
            const isDraft = Number((row as any).status ?? 0) === 0;
            const divisionData = row.divisions?.find(
              (d: DivisionHomeworkMeta) => d.divisionId === selectedDivision
            );
            const rowWithDivision = { ...row, divisionMeta: divisionData } as IHomework & {
              divisionMeta?: DivisionHomeworkMeta;
            };
            const actions = getLearningTaskTableActions({
              canEdit: canAdd && isDraft,
              canPublish: canAdd && isDraft,
              canViewSubmissions: true,
              canDelete,
              deleteDisabled: !isDraft,
              deleteTooltip: isDraft ? 'Delete' : 'Archive published tasks later',
              onEdit: () => onEditDetails(row as IHomework),
              onPublish: () => handleSwitchChange(row as IHomework),
              onViewSubmissions: () =>
                onViewSubmission(rowWithDivision as unknown as IHomeworkDetail),
              onDelete: () => onDeleteDetails(row as IHomework),
            });

            return (
              <Box onClick={(event) => event.stopPropagation()}>
                <AdaptiveThreeDotsActions
                  directActionLimit={2}
                  actions={actions}
                  placement="right-top"
                  moreLabel="More homework actions"
                />
              </Box>
            );
          },
        },
      ]}
      data={homeworkData}
    />
  </Box>
);

export default HomeworkTable;
