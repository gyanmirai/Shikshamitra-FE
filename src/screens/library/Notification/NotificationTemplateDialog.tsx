import type { LibraryNotificationSetting } from 'src/redux/library/library-adapters';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, Button, DialogActions } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useTemplateDraft } from './useTemplateDraft';
import { NotificationTemplateFields } from './NotificationTemplateFields';

export function NotificationTemplateDialog({
  setting,
  canEdit,
  onClose,
}: {
  setting: LibraryNotificationSetting;
  canEdit: boolean;
  onClose: () => void;
}) {
  const editable = canEdit && setting.isChannelAvailable && !setting.isComingSoon;
  const { formik, error, busy } = useTemplateDraft(setting, editable, onClose);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const close = () => guard.requestNavigation(() => undefined);
  return (
    <>
      <CustomDialog
        open
        maxWidth="sm"
        title={`${editable ? 'Edit' : 'View'} Notification Template`}
        titleInfo="Templates are applied to actual event records. Keep existing double-brace variables intact."
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
            {!editable && (
              <Alert severity="info">
                This template is read-only with your current authority or channel availability.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <FormSectionCard
              title="Template Content"
              icon={GlobalIcons.email}
              descriptionTooltip={`${setting.eventName} · ${setting.channel} · ${setting.recipientRole}`}
            >
              <NotificationTemplateFields
                formik={formik}
                eventType={setting.eventType}
                disabled={busy || !editable}
              />
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
            {editable ? 'Cancel' : 'Close'}
          </Button>
          {editable && (
            <Button
              type="submit"
              size="small"
              variant="contained"
              loading={busy}
              disabled={!formik.dirty}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
