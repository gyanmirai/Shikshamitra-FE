'use client';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import {
  useGetStudentCredentialEmailsQuery,
  useSendStudentCredentialEmailMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

export default function StudentOnboardingCredentialEmails({
  caseId,
  concurrencyStamp,
}: {
  caseId: string;
  concurrencyStamp?: string | null;
}) {
  const emails = useGetStudentCredentialEmailsQuery(caseId);
  const [sendEmail, sending] = useSendStudentCredentialEmailMutation();

  const send = async (accountType: 'student' | 'guardian') => {
    try {
      const result = await sendEmail({ id: caseId, accountType, concurrencyStamp }).unwrap();
      if (result.status === 'Failed' || result.status === 'Blocked') {
        shikshaMitraToast.error({
          message:
            result.message ||
            'Email could not be requested. Review the account and readiness checks.',
        });
      } else {
        shikshaMitraToast.success({
          message:
            result.status === 'Sent' ? 'Email sent.' : 'Email requested. Check the sending status.',
        });
      }
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message: problem.detail || 'Unable to request the email. Refresh the case and retry.',
      });
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Credential emails</Typography>
      {emails.isFetching && <LinearProgress aria-label="Loading credential email status" />}
      {emails.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => emails.refetch()}>
              Retry email status
            </Button>
          }
        >
          Credential email status could not be loaded.
        </Alert>
      ) : (
        (emails.data ?? []).map((email) => (
          <Stack
            key={email.accountType}
            spacing={0.5}
            sx={{ p: 1.25, border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
              {email.accountType === 'student' ? 'Student' : 'Parent/guardian'}:{' '}
              {email.email || 'Email unavailable'}
            </Typography>
            <Typography variant="body2">
              {email.emailEnabled === false ? (
                'Email sending is disabled in the saved settings.'
              ) : (
                <Label
                  color={
                    email.status === 'Sent'
                      ? 'success'
                      : email.status === 'Failed'
                        ? 'error'
                        : email.status === 'Blocked'
                          ? 'warning'
                          : email.status === 'Pending'
                            ? 'info'
                            : 'default'
                  }
                >
                  {email.status === 'NotRequested' ? 'Not requested' : email.status}
                </Label>
              )}
            </Typography>
            {email.message && (
              <Typography variant="body2" color="text.secondary">
                {email.message}
              </Typography>
            )}
            {email.sentAt && (
              <Typography variant="caption" color="text.secondary">
                Sent {fDateTime(email.sentAt)} · {email.attemptCount} attempt(s)
              </Typography>
            )}
            {email.status === 'Pending' && (
              <Typography variant="caption">
                Sending is pending. Refresh status to check progress.
              </Typography>
            )}
            {email.emailEnabled !== false && (
              <Button
                size="small"
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
                disabled={
                  !email.canSend ||
                  sending.isLoading ||
                  emails.isFetching ||
                  email.status === 'Pending'
                }
                onClick={() => send(email.accountType)}
              >
                {sending.isLoading && sending.originalArgs?.accountType === email.accountType
                  ? 'Requesting email…'
                  : email.status === 'Failed'
                    ? 'Retry email'
                    : email.status === 'Sent'
                      ? 'Send access email again'
                      : 'Send credential email'}
              </Button>
            )}
          </Stack>
        ))
      )}
      {!emails.isFetching && !emails.isError && !emails.data?.length && (
        <Typography variant="body2" color="text.secondary">
          No credential email requests are available for this case.
        </Typography>
      )}
      {!!emails.data?.length && (
        <Button
          size="small"
          disabled={emails.isFetching || sending.isLoading}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => emails.refetch()}
        >
          Refresh email status
        </Button>
      )}
      <Typography variant="caption" color="text.secondary">
        Sent means the email sender accepted the message. New accounts receive initial credentials;
        existing parent accounts keep their password when another child is linked.
      </Typography>
    </Stack>
  );
}
