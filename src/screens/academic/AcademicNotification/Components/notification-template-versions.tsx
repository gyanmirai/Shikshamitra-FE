import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';

import { useState } from 'react';
import { Box, Stack, Alert, Button, Typography, CircularProgress } from '@mui/material';
import { useAcademicNotificationTemplateHistoryQuery } from 'src/redux/academic-notifications/template-api';

import { NotificationTemplatePreview } from './notification-template-preview';

export function templateRevisionStatus(template: AcademicNotificationTemplate) {
  if (template.isRetired) return 'Retired';
  if (template.isPublished) return 'Published';
  return template.isCurrent ? 'Draft' : 'Previous draft';
}

export function NotificationTemplateVersions({ identity, templateId }: {
  identity: AcademicNotificationCacheIdentity;
  templateId: string;
}) {
  const query = useAcademicNotificationTemplateHistoryQuery({ ...identity, templateId });
  const [selected, setSelected] = useState('');
  if (query.isFetching && !query.currentData) return <CircularProgress size={20} aria-label="Loading template versions" />;
  if (query.isError) return (
    <Alert severity="error" action={<Button size="small" onClick={query.refetch}>Retry</Button>}>
      Template versions could not be loaded.
    </Alert>
  );
  return (
    <Stack gap={1}>
      {query.currentData?.map((version) => (
        <Box key={version.revisionId} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Typography variant="body2">Version {version.revision} · {templateRevisionStatus(version)}</Typography>
            <Button size="small" aria-expanded={selected === version.revisionId}
              onClick={() => setSelected(selected === version.revisionId ? '' : version.revisionId)}>
              {selected === version.revisionId ? 'Hide preview' : 'Preview'}
            </Button>
          </Stack>
          {selected === version.revisionId && (
            <NotificationTemplatePreview {...{ identity, templateId }} revisionId={version.revisionId} channel={version.channel} />
          )}
        </Box>
      ))}
    </Stack>
  );
}
