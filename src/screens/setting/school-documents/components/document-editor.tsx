import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Alert, Stack, Button, DialogActions } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useDocumentEditor } from '../hooks/use-document-editor';
import { DocumentDetailsFields } from './document-details-fields';
import { documentDiscardConfirmation } from './discard-confirmation';
import { DocumentAttachmentsField } from './document-attachments-field';

import type { SchoolDocument } from '../types';

export function DocumentEditor({
  document,
  canDelete,
  onClose,
}: {
  document?: SchoolDocument;
  canDelete: boolean;
  onClose: () => void;
}) {
  const { formik, error } = useDocumentEditor(document, onClose);
  const router = useRouter();
  const guard = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: formik.isSubmitting,
    renderConfirmation: documentDiscardConfirmation,
  });
  const cancel = () => guard.requestNavigation(onClose);
  return (
    <>
      <CustomDialog
        open
        maxWidth="sm"
        title={document ? 'Edit School Document' : 'Add School Document'}
        titleInfo="Save school approvals, permissions and related files in the school's private document library."
        disableClose={formik.isSubmitting}
        guardUnsavedChanges={false}
        handleClose={cancel}
        onSubmit={(event) => {
          event.preventDefault();
          formik.submitForm();
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={formik.isSubmitting} label="Saving document...">
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <DocumentDetailsFields formik={formik} isEditing={Boolean(document)} />
              <DocumentAttachmentsField
                formik={formik}
                documentId={document?.id}
                canRemove={canDelete}
              />
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            color="inherit"
            disabled={formik.isSubmitting || !formik.dirty}
            loading={formik.isSubmitting}
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
