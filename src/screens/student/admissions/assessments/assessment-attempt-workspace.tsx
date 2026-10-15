import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useEffect } from 'react';
import { Alert, Stack, Button } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import { FormBusyRegion } from 'src/components/form-busy-region';

import { AssessmentAttemptCard } from './assessment-attempt-card';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { useAssessmentQuickActions } from './use-assessment-quick-actions';

import type { AssessmentAction } from './assessment-action-model';

export function AssessmentAttemptWorkspace({
  assessment,
  disabled,
  readOnly,
  onAction,
  onStateChange,
}: {
  assessment: ManagedApplicationAssessment;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: AssessmentAction) => void;
  onStateChange: (state: { dirty: boolean; busy: boolean }) => void;
}) {
  const permissions = useAssessmentPermissions();
  const quick = useAssessmentQuickActions(assessment, disabled || readOnly);
  const { dirty } = quick.formik;
  const { busy } = quick;
  useEffect(() => {
    onStateChange({ dirty, busy });
  }, [dirty, busy, onStateChange]);
  useEffect(
    () => () => {
      onStateChange({ dirty: false, busy: false });
    },
    [onStateChange]
  );
  return (
    <FormBusyRegion busy={busy} label="Updating assessment…">
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        {!readOnly && assessment.canBook && permissions.book && (
          <Button
            size="small"
            variant="contained"
            disabled={disabled || busy || dirty}
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => onAction('book')}
          >
            {assessment.policy.schedulingEnabled ? 'Book Assessment Slot' : 'Start assessment'}
          </Button>
        )}
        {quick.error && <Alert severity="error">{quick.error}</Alert>}
        {assessment.attempts.length ? (
          [...assessment.attempts]
            .sort((a, b) => b.attemptNumber - a.attemptNumber)
            .map((attempt) => (
              <AssessmentAttemptCard
                key={attempt.id}
                assessment={assessment}
                attempt={attempt}
                quick={quick}
                disabled={disabled || busy}
                readOnly={readOnly}
                onAction={onAction}
              />
            ))
        ) : (
          <EmptyContent
            title="No assessment attempt yet"
            description="Assessment attempts and results will appear here."
            sx={{ py: 3, height: 'auto' }}
            slotProps={{ img: { maxWidth: 64 } }}
          />
        )}
        {dirty && (
          <Button
            size="small"
            sx={{ alignSelf: 'flex-start' }}
            disabled={busy}
            onClick={quick.discardResult}
          >
            Discard result
          </Button>
        )}
        {!assessment.attempts.length && !readOnly && assessment.canWaive && permissions.waive && (
          <Button
            size="small"
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
            disabled={disabled || busy || dirty}
            onClick={() => onAction('waive')}
          >
            Waive assessment
          </Button>
        )}
      </Stack>
    </FormBusyRegion>
  );
}
