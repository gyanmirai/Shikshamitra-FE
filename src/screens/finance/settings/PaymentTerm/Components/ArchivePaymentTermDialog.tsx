import * as Yup from 'yup';
import { useId } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

const REASON_LIMIT = 500;
const validationSchema = Yup.object({
  reason: Yup.string()
    .trim()
    .required('Archive reason is required.')
    .max(REASON_LIMIT, `Archive reason must be ${REASON_LIMIT} characters or fewer.`),
});

interface ArchivePaymentTermDialogProps {
  name: string;
  onClose: () => void;
  onArchive: (reason: string) => Promise<void>;
}

export function ArchivePaymentTermDialog({
  name,
  onClose,
  onArchive,
}: ArchivePaymentTermDialogProps) {
  const impactId = useId();
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema,
    onSubmit: async ({ reason }) => onArchive(reason.trim()),
  });
  const reasonError = formik.touched.reason ? formik.errors.reason : undefined;

  return (
    <CustomDialog
      open
      title={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Iconify aria-hidden="true" icon={GlobalIcons.warning} sx={{ color: 'warning.main' }} />
          Archive Payment Term
        </Box>
      }
      handleClose={onClose}
      formProps={{
        noValidate: true,
        onSubmit: (event) => {
          event.preventDefault();
          event.stopPropagation();
          formik.handleSubmit();
        },
      }}
      guardUnsavedChanges={false}
      disableClose={formik.isSubmitting}
      aria-describedby={impactId}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {name}
            </Typography>
            <Typography id={impactId} variant="body2" color="text.secondary">
              Will no longer be available for new fee structures.
            </Typography>
          </Box>
          <ShakingTextField error={Boolean(reasonError)}>
            <TextField
              {...formik.getFieldProps('reason')}
              label="Archive reason"
              size="small"
              required
              fullWidth
              multiline
              minRows={2}
              slotProps={{ htmlInput: { maxLength: REASON_LIMIT } }}
              disabled={formik.isSubmitting}
              error={Boolean(reasonError)}
              helperText={reasonError}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          disabled={formik.isSubmitting}
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          color="error"
          disabled={!formik.values.reason.trim() || !formik.isValid}
          loading={formik.isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.archive} />}
        >
          Archive
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
