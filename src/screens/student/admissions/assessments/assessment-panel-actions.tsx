import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { Stack, Button } from '@mui/material';

import { assessmentActionLabels } from './assessment-action-model';
import { useAssessmentPermissions } from './use-assessment-permissions';

import type { AssessmentAction } from './assessment-action-model';

type Props = {
  assessment: ManagedApplicationAssessment;
  disabled: boolean;
  canAdvance: boolean;
  onAction: (action: AssessmentAction) => void;
  onComplete: () => void;
};

export function AssessmentPanelActions({
  assessment,
  disabled,
  canAdvance,
  onAction,
  onComplete,
}: Props) {
  const permissions = useAssessmentPermissions();
  const actions: { action: AssessmentAction; allowed: boolean }[] = [
    { action: 'book', allowed: assessment.canBook && permissions.book },
    { action: 'attendance', allowed: assessment.canRecordAttendance && permissions.attendance },
    { action: 'result', allowed: assessment.canRecordResult && permissions.results },
    { action: 'review', allowed: assessment.canReview && permissions.review },
    { action: 'retake', allowed: assessment.canRetake && permissions.book },
    { action: 'cancel', allowed: assessment.canCancel && permissions.book },
    { action: 'waive', allowed: assessment.canWaive && permissions.waive },
  ];
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {actions
        .filter((item) => item.allowed)
        .map(({ action }) => (
          <Button
            key={action}
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => onAction(action)}
          >
            {action === 'book' && assessment.policy.schedulingEnabled
              ? 'Book session'
              : assessmentActionLabels[action]}
          </Button>
        ))}
      {canAdvance && (
        <Button
          size="small"
          variant="contained"
          disabled={disabled || !assessment.canComplete}
          onClick={() => onComplete()}
        >
          Complete assessment step
        </Button>
      )}
    </Stack>
  );
}
