'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, IconButton, Typography, LinearProgress } from '@mui/material';
import {
  useGetStudentCredentialEmailsQuery,
  useSendStudentCredentialEmailMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { StudentSetupLoadingRows } from './student-setup-loading';
import GuardianCredentialEmailDialog from './guardian-credential-email-dialog';
import { requiresCredentialResendConfirmation } from './student-credential-delivery';
import { getOnboardingMessage, getOnboardingErrorMessage } from './student-onboarding-messages';

export default function StudentOnboardingCredentialEmails({
  caseId,
  concurrencyStamp,
  canEnableGuardianEmail = false,
  caseLabel,
}: {
  caseId: string;
  concurrencyStamp?: string | null;
  canEnableGuardianEmail?: boolean;
  caseLabel?: string;
}) {
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const emails = useGetStudentCredentialEmailsQuery(caseId);
  const [sendEmail, sending] = useSendStudentCredentialEmailMutation();
  const submitting = useRef(false);
  const [resendTarget, setResendTarget] = useState<{
    caseId: string;
    accountType: 'student' | 'guardian';
    email: string;
  } | null>(null);
  const resendEmail = emails.data?.find(
    (email) =>
      resendTarget?.caseId === caseId &&
      email.accountType === resendTarget.accountType &&
      email.email === resendTarget.email &&
      requiresCredentialResendConfirmation(email) &&
      !['Pending', 'Processing'].includes(email.status)
  );
  useEffect(() => {
    if (resendTarget && !resendEmail) setResendTarget(null);
  }, [resendTarget, resendEmail]);

  const send = async (accountType: 'student' | 'guardian', resend = false) => {
    const email = emails.data?.find((item) => item.accountType === accountType);
    if (
      submitting.current ||
      sending.isLoading ||
      emails.isFetching ||
      emails.isError ||
      !email?.canSend ||
      email.emailEnabled === false ||
      ['Pending', 'Processing'].includes(email.status) ||
      requiresCredentialResendConfirmation(email) !== resend
    )
      return;
    submitting.current = true;
    try {
      const result = await sendEmail({ id: caseId, accountType, concurrencyStamp }).unwrap();
      if (result.status === 'Failed' || result.status === 'Blocked') {
        shikshaMitraToast.error({
          message: getOnboardingMessage(
            result.message,
            'Login email could not be requested. Review the account requirements.'
          ),
        });
      } else if (result.status === 'Sent') {
        shikshaMitraToast.success({ message: 'Login email submitted for sending.' });
      } else shikshaMitraToast.info({ message: 'Login email is queued.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(
          error,
          'Login email could not be requested. Refresh and try again.'
        ),
      });
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography component="h4" variant="subtitle2">
          Login Emails
        </Typography>
        <CustomTooltip
          title="Sent means accepted by the email sender; inbox delivery is not confirmed. Existing parent accounts keep their password when another child is linked."
          arrow
        >
          <IconButton size="small" aria-label="Login Emails information">
            <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} />
          </IconButton>
        </CustomTooltip>
      </Stack>
      {emails.isFetching && emails.data && (
        <LinearProgress aria-label="Loading credential email status" />
      )}
      {emails.isFetching && !emails.isError && !emails.data && (
        <StudentSetupLoadingRows label="Loading credential email status" count={2} />
      )}
      {emails.isError ? (
        <StudentFeedback
          notificationKey="STU-0983"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => emails.refetch()}>
              Retry email status
            </Button>
          }
        >
          Credential email status could not be loaded.
        </StudentFeedback>
      ) : !emails.isFetching || emails.data ? (
        (emails.data ?? []).map((email) => (
          <Stack
            key={email.accountType}
            spacing={0.5}
            sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={1}
            >
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {email.accountType === 'student' ? 'Student' : 'Parent/guardian'}:{' '}
                {email.email || 'Email unavailable'}
              </Typography>
              <Label
                color={
                  email.emailEnabled === false
                    ? 'default'
                    : email.status === 'Sent'
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
                {email.emailEnabled === false
                  ? 'Disabled'
                  : email.status === 'NotRequested'
                    ? 'Not requested'
                    : email.status === 'Pending'
                      ? 'Queued'
                      : email.status === 'Sent'
                        ? 'Login details sent'
                        : email.status}
              </Label>
            </Stack>
            {email.emailEnabled === false && (
              <Typography variant="body2" color="text.secondary">
                Email sending is disabled in the saved settings.
              </Typography>
            )}
            {email.accountType === 'guardian' &&
              email.emailEnabled === false &&
              canEnableGuardianEmail &&
              concurrencyStamp && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:email-check-outline" />}
                  sx={{ alignSelf: 'flex-start' }}
                  disabled={emails.isFetching || sending.isLoading}
                  onClick={() => setCorrectionOpen(true)}
                >
                  Enable parent email for this case
                </Button>
              )}
            {email.message && (
              <Typography variant="body2" color="text.secondary">
                {getOnboardingMessage(
                  email.message,
                  'Review the login email status before retrying.'
                )}
              </Typography>
            )}
            {email.sentAt && (
              <Typography variant="caption" color="text.secondary">
                Accepted by the email sender · {fDateTime(email.sentAt)} · {email.attemptCount}{' '}
                attempt(s)
              </Typography>
            )}
            {email.status === 'Pending' && (
              <Typography variant="caption">
                Login email is queued. Refresh to check progress.
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
                  emails.isError ||
                  ['Pending', 'Processing'].includes(email.status)
                }
                onClick={() => {
                  if (requiresCredentialResendConfirmation(email))
                    setResendTarget({ caseId, accountType: email.accountType, email: email.email });
                  else send(email.accountType);
                }}
              >
                {sending.isLoading && sending.originalArgs?.accountType === email.accountType
                  ? 'Requesting email…'
                  : requiresCredentialResendConfirmation(email)
                    ? 'Resend login details'
                    : email.status === 'Failed'
                      ? 'Retry email'
                      : 'Send login details'}
              </Button>
            )}
          </Stack>
        ))
      ) : null}
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
      <ConfirmDialog
        open={Boolean(resendEmail)}
        title="Resend Login Details?"
        icon="info"
        content={
          <>
            Send another login email to <strong>{resendEmail?.email}</strong>? Their current
            password stays unchanged.
          </>
        }
        onClose={() => setResendTarget(null)}
        disableCancel={sending.isLoading}
        action={
          <LoadingButton
            type="button"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mdi:email-send-outline" width={18} />}
            loading={sending.isLoading}
            disabled={
              !resendEmail?.canSend ||
              resendEmail.emailEnabled === false ||
              emails.isFetching ||
              emails.isError ||
              sending.isLoading
            }
            onClick={() => {
              if (!resendEmail) return;
              setResendTarget(null);
              send(resendEmail.accountType, true);
            }}
          >
            Resend login details
          </LoadingButton>
        }
      />
      {correctionOpen && canEnableGuardianEmail && concurrencyStamp && (
        <GuardianCredentialEmailDialog
          caseId={caseId}
          concurrencyStamp={concurrencyStamp}
          caseLabel={caseLabel}
          onClose={() => setCorrectionOpen(false)}
        />
      )}
    </Stack>
  );
}
