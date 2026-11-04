import type { ComponentProps } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';

import EvaluationRowActions from './evaluationRowActions';
import {
  FeedbackStatusChip,
  EvaluationStatusChip,
  getFeedbackStatusLabel,
} from './evaluationWorkspaceUi';

const submissionStatuses = [
  'Not Submitted',
  'Submitted',
  'Late',
  'Excused',
  'Reviewed',
  'Draft',
  'Needs Review',
];
const evaluationStatuses = ['Not Started', 'Draft', 'Needs Review', 'Reviewed'];

type Options = Omit<ComponentProps<typeof EvaluationRowActions>, 'row'>;

export function getEvaluationStatusColumns(options: Options): IColumn[] {
  return [
    {
      id: 'submissionStatusLabel',
      label: 'Submission status',
      align: 'left',
      minWidth: 150,
      isFilter: true,
      filterType: 'enum',
      enumOptions: submissionStatuses.map((label, value) => ({ label, value })),
      filterValue: (_value, row) => row.status,
      render: (_value, row) => <EvaluationStatusChip row={row} />,
    },
    {
      id: 'evaluationStatus',
      label: 'Evaluation status',
      align: 'left',
      minWidth: 150,
      sticky: true,
      stickyPosition: 'right',
      isFilter: true,
      filterType: 'enum',
      enumOptions: evaluationStatuses.map((label) => ({ label, value: label })),
      filterValue: (_value, row) => getFeedbackStatusLabel(row),
      sortValue: (_value, row) => getFeedbackStatusLabel(row),
      exportValue: (_value, row) => getFeedbackStatusLabel(row),
      render: (_value, row) => <FeedbackStatusChip row={row} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'left',
      minWidth: 100,
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_value, row) => <EvaluationRowActions {...options} row={row} />,
    },
  ];
}
