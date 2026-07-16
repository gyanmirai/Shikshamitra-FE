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
} from './learningTaskUi';

import type { IHomework, IHomeworkTableProps, DivisionHomeworkMeta } from '../type';

/**
 * HomeworkTable Component - Displays a table of homework assignments with filtering and action capabilities
 * @param {Object} props - Component props
 * @param {Array<IHomework>} props.filteredData - Array of filtered homework data to display
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
}) => {
  /**
   * Get the MUI theme object for styling
   * Used for accessing theme colors and other theme properties
   */
  /**
   * Memoization Justification:
   * - The table receives normalized row objects with selected-division schedule data.
   * - It prevents rebuilding every row object unless the API data or selected division changes.
   * - CustomizableTable does extra column/filter work, so stable row normalization keeps re-renders tighter.
   */
  const filteredData = useMemo(
    () =>
      (homeworkData || []).map((hw) => {
        const currentDivision = (hw.divisionSchedules || hw.divisions || []).find(
          (d: any) => !selectedDivision || d.divisionId === selectedDivision
        );
        return {
          ...hw,
          homeworkType: hw.homeworkType || hw.homeworkTypeName,
          classDivision: `${hw.standardName || hw.className || '-'} / ${currentDivision?.divisionName || '-'}`,
          subjectChapter: [hw.subjectName || hw.subject, hw.chapterName || hw.chapterNames?.join(', ')]
            .filter(Boolean)
            .join(' / '),
          currentDivisionId: currentDivision?.divisionId,
          createdAt: hw.createdAt,
          publishDate: currentDivision?.publishDate || currentDivision?.publishAt,
          dueDate: currentDivision?.dueDate || currentDivision?.dueAt,
          status:
            currentDivision?.status !== undefined
              ? currentDivision.status
              : currentDivision?.isPublished
                ? 1
              : (hw.status ?? 0),
          divisions: hw.divisionSchedules || hw.divisions || [],
        };
      }),
    [selectedDivision, homeworkData]
  );

  return (
    <Box>
      <LearningTaskSummaryCards tasks={filteredData} />
      <CustomizableTable
        tableId="homework-assignment-management"
        isLoading={isLoading}
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
          { id: 'title', label: 'Title', align: 'left', filterType: 'string', sticky: true },
          { id: 'classDivision', label: 'Class / Division', align: 'left', filterType: 'string' },
          { id: 'subjectChapter', label: 'Subject / Chapter', align: 'left', filterType: 'string' },
          {
            id: 'homeworkType',
            label: 'Task Type',
            align: 'left',
            filterType: 'string',
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

              return (
                <Stack direction="row" spacing={1}>
                  {canView && (
                    <CustomTooltip title="View Details" arrow>
                      <IconButton size="small" onClick={() => onViewDetails(rowWithDivision)}>
                        <Iconify icon="solar:eye-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  {canAdd && isDraft && (
                    <CustomTooltip title="Edit" arrow>
                      <IconButton size="small" onClick={() => onEditDetails(row as IHomework)}>
                        <Iconify icon="solar:pen-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  {canAdd && isDraft && (
                    <CustomTooltip title="Publish Now" arrow>
                      <IconButton size="small" onClick={() => handleSwitchChange(row as IHomework)}>
                        <Iconify icon="solar:upload-bold" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  )}
                  <CustomTooltip title="View Submissions" arrow>
                    <IconButton size="small" onClick={() => onViewSubmission(row as any)}>
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
                          onClick={() => onDeleteDetails(row as IHomework)}
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
        data={filteredData}
      />
    </Box>
  );
};

export default HomeworkTable;
