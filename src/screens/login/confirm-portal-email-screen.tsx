'use client';

import { useSearchParams } from 'next/navigation';
import { useRef, useState, Suspense } from 'react';
import { Alert, Stack, Skeleton } from '@mui/material';
import { useConfirmStudentPortalEmailMutation } from 'src/redux/student/onboarding/student-onboarding-api';

import { AuthCard } from './components/auth-card';
import { AuthLayout } from './components/auth-layout';
import { AuthBackLink } from './components/auth-back-link';
import { AuthSubmitButton } from './components/auth-submit-button';

export default function ConfirmPortalEmailScreen() {
  return (
    <AuthLayout>
      <Suspense fallback={<Skeleton variant="rounded" height={160} />}>
        <ConfirmPortalEmailForm />
      </Suspense>
    </AuthLayout>
  );
}

export function ConfirmPortalEmailForm() {
  const params = useSearchParams();
  const [confirm, mutation] = useConfirmStudentPortalEmailMutation();
  const [complete, setComplete] = useState(false);
  const [failed, setFailed] = useState(false);
  const submitting = useRef(false);
  const tenantId = params.get('tenantId') || '';
  const userId = params.get('userId') || '';
  const requestId = params.get('requestId') || '';
  const token = params.get('token') || '';
  const guid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
  const valid =
    [tenantId, userId, requestId].every((value) => guid.test(value)) &&
    token.length > 0 &&
    token.length <= 4096;
  return (
    <AuthCard
      headingId="portal-email-heading"
      title={complete ? 'Login email updated' : 'Confirm login email'}
      description={
        complete
          ? 'Your password and linked children are unchanged.'
          : 'Your login email changes only after you confirm.'
      }
    >
      <Stack spacing={2}>
        {!valid || failed ? (
          <Alert severity="error">
            This link is invalid, expired or the account has changed. Ask your school to request a
            new verification email.
          </Alert>
        ) : null}
        {complete ? (
          <Alert severity="success">
            Use your new email and existing password to sign in. If first-time password setup is
            pending, use Forgot password.
          </Alert>
        ) : (
          <AuthSubmitButton
            type="button"
            disabled={!valid || mutation.isLoading}
            loading={mutation.isLoading}
            onClick={async () => {
              if (!valid || submitting.current || complete) return;
              submitting.current = true;
              setFailed(false);
              try {
                await confirm({ tenantId, userId, requestId, token }).unwrap();
                setComplete(true);
              } catch {
                setFailed(true);
              } finally {
                submitting.current = false;
              }
            }}
          >
            Confirm email change
          </AuthSubmitButton>
        )}
        <AuthBackLink />
      </Stack>
    </AuthCard>
  );
}
