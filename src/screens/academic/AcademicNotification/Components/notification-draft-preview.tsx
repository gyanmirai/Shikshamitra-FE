import type {
  AcademicNotificationEvent,
  AcademicNotificationCacheIdentity,
} from 'src/redux/academic-notifications/types';

import { useMemo, useState, useEffect } from 'react';
import { Alert, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { usePreviewAcademicNotificationDraftMutation } from 'src/redux/academic-notifications/template-api';

import { templateMessageError } from '../notification-template-model';
import { NotificationSampleMessage } from './notification-template-preview';

import type { TemplateFormValues } from '../use-notification-template-form';

export function NotificationDraftPreview({ event, values, academicMediumId, identity }: {
  event: AcademicNotificationEvent;
  values: TemplateFormValues;
  academicMediumId: string | null;
  identity: AcademicNotificationCacheIdentity;
}) {
  const { channel, recipientKind, languageCode, subject, body } = values;
  const { eventKey, variables } = event.definition;
  const { tenantCacheKey, userCacheKey } = identity;
  const [retry, setRetry] = useState(0);
  const [preview, result] = usePreviewAcademicNotificationDraftMutation();
  const command = useMemo(() => {
    if (!recipientKind || !languageCode.trim() ||
      templateMessageError(subject, 'subject', channel, variables) ||
      templateMessageError(body, 'body', channel, variables)) return null;
    return { eventKey, academicMediumId, recipientKind, channel, languageCode: languageCode.trim(), subject, body };
  }, [eventKey, academicMediumId, recipientKind, channel, languageCode, subject, body, variables]);

  useEffect(() => {
    if (!command) return undefined;
    let request: ReturnType<typeof preview> | undefined;
    const timer = setTimeout(() => {
      request = preview({ command, tenantCacheKey, userCacheKey });
    }, 400);
    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [command, preview, retry, tenantCacheKey, userCacheKey]);

  const previewArgs = result.originalArgs;
  const current = previewArgs && previewArgs.command === command &&
    previewArgs.tenantCacheKey === tenantCacheKey && previewArgs.userCacheKey === userCacheKey;
  const rendered = result.data?.isSynthetic === true ? result.data.rendered : undefined;

  return (
    <Stack gap={1.5} aria-live="polite">
      <Typography variant="caption" color="text.secondary">Draft preview with sample data</Typography>
      {!command ? (
        <Typography variant="body2" color="text.secondary">Enter a valid subject and message to see the preview.</Typography>
      ) : !current || result.isLoading ? (
        <CircularProgress size={20} aria-label="Loading draft preview" />
      ) : result.isError ? (
        <Alert severity="error" action={<Button size="small" onClick={() => setRetry((value) => value + 1)}>Retry</Button>}>
          The draft preview could not be loaded.
        </Alert>
      ) : rendered?.isSuccess ? (
        <NotificationSampleMessage rendered={rendered} channel={channel} />
      ) : (
        <Alert severity="warning">This draft could not render with sample data.</Alert>
      )}
    </Stack>
  );
}
