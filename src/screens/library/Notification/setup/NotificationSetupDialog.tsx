import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Stack, Button, DialogActions } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useUpdateLibraryNotificationSettingsMutation } from 'src/redux/library/notifications-api';

import { setupChanges, inboxRoutingChoices } from './setup-model';
import { NotificationSetupFields } from './NotificationSetupFields';

import type { SetupValues, NotificationSetup } from './setup-model';

export function NotificationSetupDialog({
  setup,
  canManage,
  onClose,
}: {
  setup: NotificationSetup;
  canManage: boolean;
  onClose: () => void;
}) {
  const [snapshot] = useState(setup);
  const [save, result] = useUpdateLibraryNotificationSettingsMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const formik = useFormik<SetupValues>({
    initialValues: {
      automaticReminderTimeLocal: snapshot.automaticReminderTimeLocal,
      studentInboxRouting: snapshot.studentInboxRouting,
      operationalRecipientUserIds: snapshot.operationalRecipientUserIds,
    },
    validationSchema: Yup.object({
      automaticReminderTimeLocal: Yup.string().matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
        excludeEmptyString: true,
        message: 'Enter a local time in HH:mm format',
      }),
      studentInboxRouting: Yup.string()
        .oneOf(inboxRoutingChoices.map((item) => item.value))
        .required('Choose inbox recipients'),
      operationalRecipientUserIds: Yup.array()
        .of(Yup.string().required())
        .max(100, 'Choose at most 100 accounts'),
    }),
    onSubmit: async (values) => {
      if (!canManage || inFlight.current) return;
      const body = setupChanges(formik.initialValues, values);
      if (!Object.keys(body).length) return;
      inFlight.current = true;
      setError('');
      try {
        await save(body).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Notification delivery setup updated.' });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not update delivery setup. Your edits are retained.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const busy = formik.isSubmitting || result.isLoading;
  const hasChanges = Object.keys(setupChanges(formik.initialValues, formik.values)).length > 0;
  const guard = useUnsavedNavigation(hasChanges, {
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
        title="Configure Notification Delivery"
        titleInfo="Draft setup can be saved before scheduling is ready. Automatic reminders wait for a confirmed Library timezone and local reminder time."
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
            {!canManage && (
              <Alert severity="info">
                You no longer have authority to update global notification settings.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <NotificationSetupFields
              setup={snapshot}
              formik={formik}
              disabled={busy || !canManage}
            />
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
            disabled={!canManage || !hasChanges}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
