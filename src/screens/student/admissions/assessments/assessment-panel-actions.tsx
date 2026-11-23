import type { ReactNode } from 'react';
import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { Stack, Button } from '@mui/material';

import { useAssessmentPermissions } from './use-assessment-permissions';
import { canWaiveAssessment, assessmentActionLabels } from './assessment-action-model';

import type { AssessmentAction } from './assessment-action-model';

type Props = {
  assessment: ManagedApplicationAssessment;
  disabled: boolean;
  canAdvance: boolean;
  onAction: (action: AssessmentAction) => void;
  onComplete: () => void;
  compact?: boolean;
  emptyContent?: ReactNode;
};

export function AssessmentPanelActions({
  assessment,
  disabled,
  canAdvance,
  onAction,
  onComplete,
  compact = false,
  emptyContent,
}: Props) {
  const permissions = useAssessmentPermissions();
  const actions: { action: AssessmentAction; allowed: boolean }[] = [
    { action: 'book', allowed: assessment.canBook && permissions.book },
    { action: 'attendance', allowed: assessment.canRecordAttendance && permissions.attendance },
    { action: 'result', allowed: assessment.canRecordResult && permissions.results },
    { action: 'retake', allowed: assessment.canRetake && permissions.book },
    { action: 'cancel', allowed: assessment.canCancel && permissions.book },
    { action: 'waive', allowed: permissions.waive && canWaiveAssessment(assessment) },
  ];
  const availableActions = actions.filter((item) => item.allowed);
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{
        flexWrap: 'wrap',
        justifyContent: compact && !assessment.attempts.length ? 'center' : 'flex-start',
      }}
    >
      {availableActions.map(({ action }) => (
        <Button
          key={action}
          size="small"
          variant={compact && action === 'book' ? 'contained' : 'outlined'}
          disabled={disabled}
          onClick={() => onAction(action)}
        >
          {compact && action === 'waive'
            ? 'Waive Assessment'
            : action === 'book' && assessment.policy.schedulingEnabled
              ? compact
                ? 'Book Assessment Slot'
                : 'Book Session'
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
          Complete Assessment Step
        </Button>
      )}
      {!availableActions.length && !canAdvance && emptyContent}
    </Stack>
  );
}
