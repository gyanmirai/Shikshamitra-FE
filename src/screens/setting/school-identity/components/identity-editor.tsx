import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

import { IDENTITY_KINDS } from '../types';
import { IdentityPreviewButton } from './identity-preview';
import { IdentityAssetField } from './identity-asset-field';
import { useIdentityEditor } from '../hooks/use-identity-editor';
import { IdentityEditorContext } from './identity-editor-context';
import { IdentityEditorBusyState } from './identity-editor-busy-state';

import type { IdentityContext, IdentityProfile } from '../types';
import type { IdentityEditorScope } from './identity-editor-context';

export function IdentityEditor({
  profile,
  context,
  onClose,
  scope,
}: {
  profile: IdentityProfile;
  context: IdentityContext;
  onClose: () => void;
  scope?: IdentityEditorScope;
}) {
  const [preparingImage, setPreparingImage] = useState(false);
  const {
    formik,
    error,
    busy: saving,
    bodyRef,
    uploadFile,
    uploading,
    uploadedAssets,
  } = useIdentityEditor(profile, context, onClose);
  const busy = saving || preparingImage;
  const router = useRouter();
  const discardTitle = 'Discard School Identity Changes?';
  const navigation = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    title: discardTitle,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { title: discardTitle, busy }),
  });
  return (
    <>
      <CustomDialog
        open
        title={
          context.organizationId
            ? 'Edit Organization Images'
            : context.boardId
              ? 'Edit School Identity Override'
              : 'Edit School Defaults'
        }
        titleInfo="Upload school assets, review the draft PDF, then submit to apply these choices."
        handleClose={() => navigation.requestNavigation(onClose)}
        guardUnsavedChanges={false}
        maxWidth="md"
        disableClose={busy}
        hasUnsavedChanges={formik.dirty}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!busy) formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <Box ref={bodyRef} sx={{ position: 'relative' }}>
            <Stack spacing={2}>
              <IdentityEditorContext scope={scope} />
              {error && (
                <Alert severity="error" role="alert">
                  {error}
                </Alert>
              )}
              {IDENTITY_KINDS.map((kind) => {
                const value = formik.values[kind];
                if (!value) return null;
                const errors = formik.submitCount > 0 ? formik.errors[kind] : undefined;
                return (
                  <IdentityAssetField
                    key={kind}
                    kind={kind}
                    enableFormatting
                    value={value}
                    context={context}
                    asset={uploadedAssets[kind] ?? profile.effective[kind]?.asset}
                    inheritLabel={context.boardId ? 'Use inherited asset' : 'No image configured'}
                    disabled={busy}
                    errors={typeof errors === 'object' ? errors : undefined}
                    onChange={(next) => {
                      formik.setFieldValue(kind, next);
                    }}
                    onUpload={(file) => {
                      uploadFile(kind, file);
                    }}
                    onPreparing={setPreparingImage}
                  />
                );
              })}
            </Stack>
            {busy && (
              <IdentityEditorBusyState preparingImage={preparingImage} uploading={uploading} />
            )}
          </Box>
        </DialogScrollContent>
        <DialogActions>
          <IdentityPreviewButton context={context} choices={formik.values} disabled={busy} />
          <Button
            variant="outlined"
            disabled={busy}
            onClick={() => navigation.requestNavigation(onClose)}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy || !formik.dirty}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
    </>
  );
}
