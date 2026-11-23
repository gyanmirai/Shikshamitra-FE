import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useEffect } from 'react';
import { Stack, Button } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';

import { AssessmentAttemptCard } from './assessment-attempt-card';
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
    <FormBusyRegion busy={busy} label="Updating Assessment…">
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        {quick.error && (
          <StudentFeedback notificationKey="STU-0244" presentation="persistent" severity="error">
            {quick.error}
          </StudentFeedback>
        )}
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
            title="No Assessment Attempt Yet"
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
            Discard Result
          </Button>
        )}
      </Stack>
    </FormBusyRegion>
  );
}
