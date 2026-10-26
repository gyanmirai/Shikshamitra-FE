import type { IRecipient } from 'src/screens/student/studentNotification/editNotificationDialogInterface';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import { Box, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function AcademicNotificationRecipientDetails({ recipient }: { recipient: IRecipient }) {
  return (
    <FormSectionCard
      title={recipient.name}
      icon={GlobalIcons.assigned}
      descriptionTooltip={`Review the saved communication channels and message for ${recipient.name}.`}
      action={
        <Label color={recipient.isEnable ? 'success' : 'default'}>
          {recipient.isEnable ? 'Enabled' : 'Disabled'}
        </Label>
      }
      sx={{ height: 1 }}
    >
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Communication channels
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {recipient.communicationChannel.length ? (
            recipient.communicationChannel.map((channel) => (
              <Label key={channel} color="default">
                {channel}
              </Label>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No channels configured.
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          Message
        </Typography>
        {recipient.message ? (
          <Box
            sx={{
              typography: 'body2',
              color: 'text.primary',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              '& p': { mt: 0, mb: 1 },
              '& p:last-child': { mb: 0 },
              '& ul, & ol': { my: 1, pl: 3 },
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(recipient.message) }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No message configured.
          </Typography>
        )}
      </Stack>
    </FormSectionCard>
  );
}
