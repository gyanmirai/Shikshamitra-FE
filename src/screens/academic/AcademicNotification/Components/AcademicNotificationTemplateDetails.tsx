import type { INotificationData } from 'src/screens/student/studentNotification/editNotificationDialogInterface';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Alert, Stack, Button, Typography, DialogActions } from '@mui/material';

import { AcademicNotificationRecipientDetails } from './AcademicNotificationRecipientDetails';

type Props = {
  data: INotificationData | null;
  onClose: () => void;
};

export function AcademicNotificationTemplateDetails({ data, onClose }: Props) {
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ p: 2, flex: 1, minHeight: 0 }}>
        <Stack spacing={2}>
          <Alert severity="info">
            Notification templates are read-only. Saving templates and enabling automatic
            notifications are not available yet.
          </Alert>
          {data ? (
            <>
              <FormSectionCard
                title="Event Details"
                icon={GlobalIcons.bell}
                descriptionTooltip="The notification event and condition associated with this template."
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Event name
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {data.event}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Trigger condition
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {data.triggerCondition}
                    </Typography>
                  </Grid>
                </Grid>
              </FormSectionCard>
              {data.recipient.length ? (
                <Grid container spacing={2}>
                  {data.recipient.map((recipient) => (
                    <Grid size={{ xs: 12, md: 6 }} key={recipient.name}>
                      <AcademicNotificationRecipientDetails recipient={recipient} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyContent title="No recipient templates are configured." />
              )}
            </>
          ) : (
            <EmptyContent title="Notification details are unavailable." />
          )}
        </Stack>
      </Scrollbar>
      <DialogActions
        sx={{
          px: 2,
          py: 1.75,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Box>
  );
}
