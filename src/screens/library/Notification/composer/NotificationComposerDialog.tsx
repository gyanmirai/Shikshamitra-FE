import type { NotificationSendResult } from 'src/redux/library/notification-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, DialogActions, LinearProgress } from '@mui/material';
import { useGetLibraryNotificationSettingsQuery } from 'src/redux/library/notifications-api';

import { useNotificationAccess } from '../useNotificationAccess';
import { useNotificationComposer } from './useNotificationComposer';
import { NotificationContentFields } from './NotificationContentFields';
import { NotificationAudienceFields } from './NotificationAudienceFields';

export function NotificationComposerDialog({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (result: NotificationSendResult) => void;
}) {
  const { canView, canAct } = useNotificationAccess();
  const query = useGetLibraryNotificationSettingsQuery(undefined, { skip: !canView });
  const { formik, error, busy } = useNotificationComposer(canAct, query.currentData, onComplete);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const close = () => guard.requestNavigation(() => undefined);
  const disabled = busy || !canAct || !query.currentData;
  return (
    <>
      <CustomDialog
        open
        maxWidth="md"
        title="Send Library Message"
        titleInfo="Select actual members and write a message. Email is queued; inbox delivery requires a verified eligible account. Review the returned delivery outcomes."
        handleClose={close}
        disableClose={busy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {!canAct && <Alert severity="info">Notification send authority is required.</Alert>}
            {query.isFetching && <LinearProgress aria-label="Loading message channels" />}
            {query.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" disabled={busy} onClick={() => query.refetch()}>
                    Retry
                  </Button>
                }
              >
                Could not load current message settings.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <FormSectionCard
              title="Audience and Channel"
              icon={GlobalIcons.family}
              descriptionTooltip="Member search uses your authorized scope. Borrowing quotas do not determine notification eligibility; consent and verified destinations are checked at delivery."
            >
              <NotificationAudienceFields
                formik={formik}
                settings={query.currentData}
                disabled={disabled}
              />
            </FormSectionCard>
            <FormSectionCard
              title="Message Content"
              icon={GlobalIcons.email}
              descriptionTooltip="Write custom content. Only the listed base variables are supported here; actual book and due-date reminders use their own record context."
            >
              <NotificationContentFields formik={formik} disabled={disabled} />
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={close}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            loading={busy}
            disabled={disabled}
            startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
          >
            Submit message
          </Button>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
