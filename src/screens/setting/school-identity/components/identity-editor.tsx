import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { IDENTITY_KINDS } from '../types';
import { IdentityPreviewButton } from './identity-preview';
import { IdentityAssetField } from './identity-asset-field';
import { useIdentityEditor } from '../hooks/use-identity-editor';

import type { IdentityContext, IdentityProfile } from '../types';

export function IdentityEditor({
  profile,
  context,
  onClose,
}: {
  profile: IdentityProfile;
  context: IdentityContext;
  onClose: () => void;
}) {
  const { formik, error, busy, bodyRef, uploadFile, cancel, uploading, uploadedAssets } =
    useIdentityEditor(profile, context, onClose);
  const router = useRouter();
  const navigation = useUnsavedNavigation(formik.dirty, {
    push: router.push,
    blockNavigation: busy,
    title: 'Discard School Identity Changes?',
  });
  return (
    <>
      <CustomDialog
        open
        title={context.boardId ? 'Edit School Identity Override' : 'Edit School Defaults'}
        titleInfo="Upload school assets, review the draft PDF, then submit to apply these choices."
        handleClose={onClose}
        maxWidth="md"
        disableClose={busy}
        hasUnsavedChanges={formik.dirty}
        onSubmit={(event) => {
          event.preventDefault();
          formik.submitForm();
        }}
      >
        <DialogScrollContent>
          <Box ref={bodyRef} sx={{ position: 'relative' }}>
            <Stack spacing={2}>
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
                  />
                );
              })}
            </Stack>
            {busy && (
              <Box
                role="status"
                aria-live="polite"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  bgcolor: 'action.disabledBackground',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress />
                  <span>{uploading ? 'Uploading image…' : 'Saving…'}</span>
                </Stack>
              </Box>
            )}
          </Box>
        </DialogScrollContent>
        <DialogActions>
          <IdentityPreviewButton context={context} choices={formik.values} disabled={busy} />
          <Button disabled={busy} onClick={cancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={busy || !formik.dirty}>
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {navigation.confirmation}
    </>
  );
}
