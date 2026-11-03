import { useRef, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, Skeleton } from '@mui/material';

import type { useAssignSlotsForm } from '../hooks/useAssignSlotsForm';

export function AssignSlotTargets({ form }: { form: ReturnType<typeof useAssignSlotsForm> }) {
  const targetInput = useRef<HTMLInputElement>(null);
  const { formik, busy, loading, loadError, options, disabledIds } = form;
  const showError = Boolean(
    (formik.touched.classNames || formik.submitCount > 0) && formik.errors.classNames
  );
  useEffect(() => {
    if (showError && formik.submitCount > 0) targetInput.current?.focus();
  }, [showError, formik.submitCount]);
  const refreshAction = (
    <Button
      type="button"
      variant="text"
      color="inherit"
      size="small"
      aria-label={loadError ? 'Retry' : 'Refresh classes'}
      sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      disabled={busy || loading}
      onClick={form.refresh}
      startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
    >
      {loadError ? 'Retry' : 'Refresh'}
    </Button>
  );
  return (
    <FormSectionCard
      title="Select Target Classes"
      icon={GlobalIcons.family}
      descriptionTooltip="Choose one or more classes to receive the source class's lecture slot configuration. Classes need a school shift and must not already have lecture slots configured."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      action={
        form.hasMedium && form.hasSource ? (
          <Stack direction="row" justifyContent="flex-end">
            {refreshAction}
          </Stack>
        ) : undefined
      }
      actionFullWidthOnMobile
      sx={{ minWidth: 0 }}
    >
      <Stack spacing={2}>
        {!form.hasMedium ? (
          <Alert severity="info">Select an academic medium to load target classes.</Alert>
        ) : !form.hasSource ? (
          <Alert severity="info">Return to Lecture Slots and choose a source configuration.</Alert>
        ) : loading ? (
          <Box role="status" aria-label="Loading target classes" aria-busy>
            <Skeleton variant="rounded" height={40} />
          </Box>
        ) : loadError ? (
          <Alert severity="error">
            Unable to load target classes and their lecture slot configuration. Try again.
          </Alert>
        ) : form.ready && options.length === 0 ? (
          <Alert severity="info">
            No classes are available in the selected academic medium. Add classes in Academic Setup,
            then refresh here.
          </Alert>
        ) : (
          <>
            <ShakingTextField error={showError}>
              <CustomSelect
                inputRef={targetInput}
                required
                id="lecture-slot-target-classes"
                name="classNames"
                label="Target classes"
                multiple
                options={options}
                value={formik.values.classNames}
                onChange={(value) => formik.setFieldValue('classNames', value)}
                onBlur={() => formik.setFieldTouched('classNames', true)}
                labelKey="name"
                valueKey="id"
                disabledReasonKey="disabledReason"
                disabledValues={disabledIds}
                disabled={busy || !form.ready || !form.hasEligibleClasses}
                error={showError}
                helperText={
                  showError ? String(formik.errors.classNames) : 'Select one or more classes.'
                }
                formControlProps={{ fullWidth: true, sx: { minWidth: 0 } }}
                sx={{ '& .MuiSelect-select': { whiteSpace: 'normal' } }}
              />
            </ShakingTextField>
            {disabledIds.length > 0 && (
              <Alert severity="info">
                {!form.hasEligibleClasses && 'No eligible target classes. '}
                Classes with existing lecture slots or without a school shift cannot be selected.
                Assign missing school shifts in Academic Setup, then refresh here.
              </Alert>
            )}
          </>
        )}
        {formik.status && <Alert severity="error">{formik.status}</Alert>}
      </Stack>
    </FormSectionCard>
  );
}
