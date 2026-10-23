'use client';

import type { StudentFeedbackProps } from 'src/components/student-feedback';

import { Stack } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useLocalStorage } from 'src/hooks/use-local-storage';
import { StudentFeedback } from 'src/components/student-feedback';

type Props = Omit<StudentFeedbackProps, 'notificationKey' | 'severity' | 'onClose'> & {
  notificationKey?: string;
  severity: 'info' | 'warning';
  closeDisabled?: boolean;
  dismissalKey?: string;
};

export function AdmissionIntakeNotice({ dismissalKey, ...props }: Props) {
  return dismissalKey ? (
    <PersistentAdmissionIntakeNotice key={dismissalKey} dismissalKey={dismissalKey} {...props} />
  ) : (
    <DismissibleAdmissionIntakeNotice {...props} />
  );
}

function PersistentAdmissionIntakeNotice({
  dismissalKey,
  ...props
}: Props & { dismissalKey: string }) {
  const { state: dismissed, setState } = useLocalStorage(dismissalKey, false);

  return (
    <DismissibleAdmissionIntakeNotice
      {...props}
      scopeKey={dismissalKey}
      dismissed={dismissed}
      onDismiss={() => setState(true)}
    />
  );
}

function DismissibleAdmissionIntakeNotice({
  notificationKey = 'admission-intake-notice',
  severity,
  action,
  closeDisabled = false,
  dismissed = false,
  onDismiss,
  ...props
}: Omit<Props, 'dismissalKey'> & { dismissed?: boolean; onDismiss?: () => void }) {
  const visible = useBoolean(true);

  // Dismissing a message must not remove its required recovery action.
  if (dismissed || !visible.value) {
    return action ? (
      <Stack direction="row" justifyContent="flex-end" sx={props.sx}>
        {action}
      </Stack>
    ) : null;
  }

  return (
    <StudentFeedback
      {...props}
      notificationKey={notificationKey}
      severity={severity}
      closeDisabled={closeDisabled}
      closeText={`Dismiss ${severity === 'info' ? 'information' : 'warning'} message`}
      action={action}
      onClose={() => {
        visible.onFalse();
        onDismiss?.();
      }}
    />
  );
}
