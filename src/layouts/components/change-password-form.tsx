import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, TextField, DialogActions } from '@mui/material';

import { passwordFields, type useChangePasswordForm } from './hooks/use-change-password-form';

type Props = ReturnType<typeof useChangePasswordForm> & { onClose: () => void };

export function ChangePasswordForm({ formik, busy, errorMessage, contentRef, onClose }: Props) {
  return (
    <>
      <DialogScrollContent>
        <Box ref={contentRef}>
          <Stack spacing={2}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <FormBusyRegion busy={busy} label="Changing password..." showOverlay={false}>
              <FormSectionCard
                title="Password Details"
                icon={GlobalIcons.lockIcon}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Enter your old password, then enter and confirm your new password."
              >
                <Stack spacing={2}>
                  {passwordFields.map(({ name, label, autoComplete }) => {
                    const error = Boolean(
                      (formik.touched[name] || formik.submitCount > 0) && formik.errors[name]
                    );
                    return (
                      <ShakingTextField key={name} error={error}>
                        <TextField
                          id={`change-password-${name}`}
                          fullWidth
                          required
                          size="small"
                          type="password"
                          name={name}
                          label={label}
                          autoComplete={autoComplete}
                          disabled={busy}
                          value={formik.values[name]}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={error}
                          helperText={error ? formik.errors[name] : undefined}
                        />
                      </ShakingTextField>
                    );
                  })}
                </Stack>
              </FormSectionCard>
            </FormBusyRegion>
          </Stack>
        </Box>
      </DialogScrollContent>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button
          type="button"
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          variant="outlined"
          color="inherit"
          size="small"
          disabled={busy}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          loading={busy}
          disabled={busy}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
}
