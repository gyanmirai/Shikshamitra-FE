import type { IData } from 'src/components/customizabaleTable/types';

import { Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

import { isRowEvaluationDisabled } from './evaluationWorkspaceUi';

type Props = {
  row: IData;
  canAdd: boolean;
  taskSubmissionType?: number | string | null;
  onView: (row: IData) => void;
  onEdit: (row: IData) => void;
};

export default function EvaluationFeedbackCell({
  row,
  canAdd,
  taskSubmissionType,
  onView,
  onEdit,
}: Props) {
  const text = row.feedback && row.feedback !== '-' ? String(row.feedback) : '';
  const name = String(row.studentName || 'student');
  if (isRowEvaluationDisabled(row, taskSubmissionType)) {
    return (
      <Typography variant="body2" color="text.secondary">
        No submission
      </Typography>
    );
  }
  const action = canAdd ? (text ? 'Edit feedback' : 'Add feedback') : 'View feedback';

  return (
    <CustomTooltip title={text || `${action} for ${name}`}>
      <Button
        variant="text"
        color="inherit"
        size="small"
        aria-label={`${action} for ${name}`}
        onClick={() => (canAdd ? onEdit(row) : onView(row))}
        sx={{ maxWidth: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left' }}
      >
        <Typography component="span" variant="body2" noWrap>
          {text || (canAdd ? 'Add feedback' : 'View feedback')}
        </Typography>
      </Button>
    </CustomTooltip>
  );
}
