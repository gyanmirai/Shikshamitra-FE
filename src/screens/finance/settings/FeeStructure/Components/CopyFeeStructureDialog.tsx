import type { StructureRecord } from 'src/redux/finance/feeStructureWorkspace';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useSaveStructureDraftMutation,
  useGetStructureCopySourcesQuery,
} from 'src/redux/finance/feeStructureWorkspace';

import { structureError } from '../feeStructureModel';
import { availableCopyName, copyStructureCandidate } from '../copyFeeStructure';

interface Props {
  feeStructureMetadataId: string;
  standardId: string;
  classes: { id: string; name: string }[];
  existingNames: string[];
  onClose: () => void;
  onCopied: (record: StructureRecord) => void;
  onBusyChange: (busy: boolean) => void;
}

export default function CopyFeeStructureDialog({
  feeStructureMetadataId,
  standardId,
  classes,
  existingNames,
  onClose,
  onCopied,
  onBusyChange,
}: Props) {
  const sources = useGetStructureCopySourcesQuery(
    { feeStructureMetadataId, classes },
    { refetchOnMountOrArgChange: true }
  );
  const [save] = useSaveStructureDraftMutation();
  const [error, setError] = useState('');
  const submitting = useRef(false);
  // An unchanged retry must use the same idempotency key, including after a lost response.
  const request = useRef<{ fingerprint: string; id: string } | null>(null);
  const options = (sources.currentData ?? []).map((source) => ({
    value: source.structure.id,
    label: source.structure.name,
    group: source.className,
    description: `${source.className} · v${source.structure.revisionNumber}`,
  }));
  const formik = useFormik({
    initialValues: { sourceId: '', name: '' },
    validationSchema: Yup.object({
      sourceId: Yup.string()
        .required('Select a fee structure to copy.')
        .oneOf(
          options.map((option) => option.value),
          'Select an available fee structure.'
        ),
      name: Yup.string()
        .trim()
        .required('Enter a structure name.')
        .max(256, 'Use at most 256 characters.'),
    }),
    onSubmit: async (values, helpers) => {
      if (submitting.current || sources.isFetching || sources.isError) return;
      const source = sources.currentData?.find((item) => item.structure.id === values.sourceId);
      if (!source) return;
      submitting.current = true;
      onBusyChange(true);
      setError('');
      try {
        const body = {
          feeStructureMetadataId,
          standardId,
          standardFeeStructures: copyStructureCandidate(source.structure, values.name),
        };
        const fingerprint = JSON.stringify(body);
        if (request.current?.fingerprint !== fingerprint)
          request.current = { fingerprint, id: crypto.randomUUID() };
        const record = await save({ ...body, requestId: request.current.id }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({ message: 'Fee structure copied successfully as a draft.' });
        onCopied(record);
      } catch (failure) {
        setError(structureError(failure));
      } finally {
        submitting.current = false;
        onBusyChange(false);
      }
    },
  });
  const busy = formik.isSubmitting;
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    keepEditingLabel: 'Keep Editing',
    discardLabel: 'Discard Changes',
    blockNavigation: busy,
  });
  const requestClose = () => requestNavigation(onClose);
  const sourceError = Boolean(
    (formik.touched.sourceId || formik.submitCount) && formik.errors.sourceId
  );
  const nameError = Boolean((formik.touched.name || formik.submitCount) && formik.errors.name);
  useEffect(() => {
    if (formik.submitCount && !formik.isValid && !busy)
      document
        .querySelector<HTMLElement>('#copy-fee-structure-form [aria-invalid="true"]')
        ?.focus();
  }, [formik.submitCount, formik.isValid, busy]);

  return (
    <>
      <CustomDialog
        open
        title="Copy Fee Structure"
        titleInfo="Copy saved fee heads, payment terms, schedules and policies into the selected class as a new draft."
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={requestClose}
      >
        <Box
          component="form"
          id="copy-fee-structure-form"
          noValidate
          onSubmit={formik.handleSubmit}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} label="Copying fee structure…">
              <Stack spacing={2}>
                <Typography variant="body2">
                  Copy to :{' '}
                  <Box component="strong">
                    {classes.find((item) => item.id === standardId)?.name}
                  </Box>
                </Typography>
                {sources.isError && (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" onClick={() => sources.refetch()}>
                        Retry
                      </Button>
                    }
                  >
                    Fee structures could not be loaded. Retry to see all available sources.
                  </Alert>
                )}
                {!sources.isFetching && !sources.isError && !options.length && (
                  <Alert severity="info">
                    No saved fee structures are available in this medium.
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
                    {error}
                  </Alert>
                )}
                <FormSectionCard
                  title="Structure Details"
                  icon={GlobalIcons.copy}
                  descriptionTooltip="Choose a saved structure under its class. Only classes in the current medium are listed."
                >
                  <ShakingTextField error={sourceError}>
                    <CustomSelect
                      name="sourceId"
                      label="Source fee structure"
                      required
                      isSearch
                      groupKey="group"
                      optionDescriptionKey="description"
                      options={options}
                      value={formik.values.sourceId}
                      isLoading={sources.isLoading}
                      disabled={busy || sources.isFetching || sources.isError || !options.length}
                      onBlur={() => formik.setFieldTouched('sourceId', true)}
                      onChange={(value) => {
                        const source = sources.currentData?.find(
                          (item) => item.structure.id === value
                        );
                        formik.setValues({
                          sourceId: String(value),
                          name: source
                            ? availableCopyName(source.structure.name, existingNames)
                            : '',
                        });
                        setError('');
                      }}
                      error={sourceError}
                      helperText={sourceError ? formik.errors.sourceId : undefined}
                    />
                  </ShakingTextField>
                  <ShakingTextField error={nameError}>
                    <TextField
                      name="name"
                      label="Structure name"
                      required
                      fullWidth
                      size="small"
                      disabled={busy || !formik.values.sourceId}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={nameError}
                      helperText={nameError ? formik.errors.name : undefined}
                    />
                  </ShakingTextField>
                </FormSectionCard>
              </Stack>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions>
            <Button
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={requestClose}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <SubmitButton
              loading={busy}
              disabled={sources.isFetching || sources.isError || !options.length}
            />
          </DialogActions>
        </Box>
      </CustomDialog>
      {confirmation}
    </>
  );
}
