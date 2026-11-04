import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { Box, Typography } from '@mui/material';

import EvaluationFeedbackCell from './evaluationFeedbackCell';
import { getEvaluationStatusColumns } from './evaluationStatusColumns';

type Options = {
  assignment?: boolean;
  requiresMarks?: boolean;
  canAdd: boolean;
  taskSubmissionType?: number | string | null;
  onView: (row: IData) => void;
  onEdit: (row: IData) => void;
};

const submissionTypes = ['Online Text', 'File Upload', 'In-Person', 'No Submission Required'];

export function getEvaluationSubmissionColumns(options: Options): IColumn[] {
  return [
    {
      id: 'studentName',
      label: 'Student name / GR no.',
      align: 'left',
      rowHeader: true,
      sticky: true,
      stickyPosition: 'left',
      minWidth: 190,
      isFilter: true,
      filterType: 'string',
      searchValue: (value, row) => `${value || ''} ${row.grNumber || ''}`,
      filterValue: (value, row) => `${value || ''} ${row.grNumber || ''}`,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {value || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.grNumber ? `(${row.grNumber})` : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'rollNumber',
      label: 'Roll no.',
      align: 'left',
      minWidth: 90,
      isFilter: true,
      filterType: 'number',
    },
    options.assignment
      ? {
          id: 'submissionType',
          label: 'Type',
          align: 'left',
          minWidth: 120,
          isFilter: true,
          filterType: 'enum',
          enumOptions: submissionTypes.map((label, value) => ({ label, value })),
          render: (value) => submissionTypes[Number(value)] || value || '-',
        }
      : {
          id: 'homeworkType',
          label: 'Type',
          align: 'left',
          minWidth: 120,
          isFilter: true,
          filterType: 'string',
        },
    {
      id: 'submissionDate',
      label: 'Submission date',
      align: 'left',
      minWidth: 160,
      isFilter: true,
      filterType: 'date',
    },
    {
      id: 'dueDate',
      label: 'Due date',
      align: 'left',
      minWidth: 140,
      isFilter: true,
      filterType: 'date',
    },
    ...(options.requiresMarks
      ? [
          {
            id: 'totalMarks',
            label: 'Total marks',
            align: 'left' as const,
            minWidth: 130,
            isFilter: true,
            filterType: 'number' as const,
          },
          {
            id: 'marks',
            label: 'Obtained marks',
            align: 'left' as const,
            minWidth: 150,
            isFilter: true,
            filterType: 'number' as const,
          },
        ]
      : []),
    {
      id: 'feedback',
      label: 'Feedback',
      align: 'left',
      minWidth: 180,
      maxWidth: 260,
      isFilter: true,
      filterType: 'string',
      render: (_value, row) => <EvaluationFeedbackCell {...options} row={row} />,
    },
    ...getEvaluationStatusColumns(options),
  ];
}
