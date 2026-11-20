import type { LibraryCopyState } from 'src/redux/library/copy-lifecycle-types';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Alert, TextField } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useCopyStatusDraft } from './useCopyStatusDraft';
import { useCirculationBusy } from './useCirculationBusy';
import { CirculationFormFooter } from './CirculationFormFooter';

export function CopyStatusEditor({
  state,
  canUpdate,
  onClose,
  onBusyChange,
}: {
  state: LibraryCopyState;
  canUpdate: boolean;
  onClose: (event: unknown, submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { formik, error, busy, snapshot, options, canEdit, canSubmit } = useCopyStatusDraft(
    state,
    canUpdate,
    onClose
  );
  useCirculationBusy(busy, onBusyChange);
  const fieldError = Boolean(formik.touched.status && formik.errors.status);
  const remarksError = Boolean(formik.touched.remarks && formik.errors.remarks);
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy} showOverlay={false} label="Updating copy status">
            <FormSectionCard
              title="Copy Status"
              icon={GlobalIcons.bookIcon}
              descriptionTooltip="Change the saved copy condition or remarks. Copy changes and financial obligations are tracked separately."
            >
              {error && <Alert severity="error">{error}</Alert>}
              {!canUpdate && (
                <Alert severity="info">You do not have permission to change copy status.</Alert>
              )}
              {snapshot.requiresLoanReconciliation && (
                <Alert severity="warning">
                  This copy needs loan reconciliation before changes can be saved.
                </Alert>
              )}
              {snapshot.blockedReasons.map((reason) => (
                <Alert key={reason} severity="info">
                  {reason}
                </Alert>
              ))}
              {error && (
                <Alert severity="info">
                  Your draft is retained. Close and reopen this editor to load the current copy
                  state, then review your changes before submitting again.
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid size={12}>
                  <ShakingTextField error={fieldError}>
                    <CustomSelect
                      label="Copy status"
                      name="status"
                      required
                      fullWidth
                      size="small"
                      disabled={!canEdit || busy}
                      value={formik.values.status}
                      options={options}
                      labelKey="name"
                      valueKey="id"
                      onChange={(value) =>
                        formik.setFieldValue('status', value === '' ? '' : Number(value))
                      }
                      onBlur={() => formik.setFieldTouched('status', true)}
                      error={fieldError}
                      helperText={fieldError ? formik.errors.status : undefined}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={12}>
                  <ShakingTextField error={remarksError}>
                    <TextField
                      name="remarks"
                      label="Remarks"
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      disabled={!canEdit || busy}
                      required={formik.values.status !== snapshot.status}
                      error={remarksError}
                      helperText={
                        remarksError
                          ? formik.errors.remarks
                          : 'For a status change, explain the reason in remarks.'
                      }
                      slotProps={{ htmlInput: { maxLength: 500 } }}
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </FormSectionCard>
          </FormBusyRegion>
        </DialogScrollContent>
        <CirculationFormFooter
          busy={busy}
          disabled={!canSubmit || !formik.dirty}
          onCancel={() => onClose(null, false)}
          label="Submit"
        />
      </Box>
    </BackPopUpChecked>
  );
}
