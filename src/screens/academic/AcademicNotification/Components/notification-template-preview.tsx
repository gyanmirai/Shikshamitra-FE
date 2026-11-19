import type { AcademicNotificationChannel, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useState } from 'react';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { Box, Stack, Alert, Button, Typography, CircularProgress } from '@mui/material';
import { useLazyAcademicNotificationTemplatePreviewQuery } from 'src/redux/academic-notifications/template-api';

export function NotificationTemplatePreview({ identity, templateId, revisionId, channel }: {
  identity: AcademicNotificationCacheIdentity;
  templateId: string;
  revisionId: string;
  channel: AcademicNotificationChannel;
}) {
  const [trigger, query] = useLazyAcademicNotificationTemplatePreviewQuery();
  const [requested, setRequested] = useState(false);
  const result = query.currentData;

  function load() {
    setRequested(true);
    trigger({ ...identity, templateId, revisionId });
  }

  if (!requested) return <Button size="small" variant="outlined" onClick={() => load()}>Load sample preview</Button>;
  if (query.isFetching) return <CircularProgress size={20} aria-label="Loading sample preview" />;
  if (query.isError) return (
    <Alert severity="error" action={<Button size="small" onClick={() => load()}>Retry</Button>}>
      The sample preview could not be loaded.
    </Alert>
  );
  if (result?.isSynthetic !== true || !result.rendered.isSuccess) {
    return <Alert severity="warning">This revision could not render with sample data.</Alert>;
  }

  return (
    <Stack gap={1.5}>
      <Typography variant="caption" color="text.secondary">Preview with sample data</Typography>
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{result.rendered.subject}</Typography>
      {channel === CommunicationChannelType.Email ? (
        <Box sx={{ overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.rendered.body) }} />
      ) : (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{result.rendered.body}</Typography>
      )}
    </Stack>
  );
}
