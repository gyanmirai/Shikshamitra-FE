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
  useGetStructureCopyPoliciesQuery,
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
      if (submitting.current || sources.isFetching || sources.isError || !policiesReady) return;
      const source = sources.currentData?.find((item) => item.structure.id === values.sourceId);
      if (!source) return;
      submitting.current = true;
      onBusyChange(true);
      setError('');
      try {
        const body = {
          feeStructureMetadataId,
          standardId,
          standardFeeStructures: copyStructureCandidate(
            source.structure,
            values.name,
            policies.currentData ?? []
          ),
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
  const policies = useGetStructureCopyPoliciesQuery(
    { sourceId: formik.values.sourceId, feeStructureMetadataId, standardId },
    { skip: !formik.values.sourceId, refetchOnMountOrArgChange: true }
  );
  const selectedSource = sources.currentData?.find(
    (item) => item.structure.id === formik.values.sourceId
  );
  const missingPolicies = (['collection', 'refund'] as const).filter(
    (family) =>
      selectedSource?.structure[`${family}PolicyId`] &&
      !policies.currentData?.some(
        (policy) =>
          policy.family === family &&
          policy.policyId === selectedSource.structure[`${family}PolicyId`]
      )
  );
  const policiesReady = Boolean(
    selectedSource &&
    policies.currentData &&
    !policies.isFetching &&
    !policies.isError &&
    !policies.currentData.some(
      (policy) => policy.family !== 'concession' && (policy.error || !policy.currentVersionId)
    ) &&
    !missingPolicies.length
  );
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
        paperProps={{
          sx: {
            height: formik.values.sourceId ? 'min(760px, calc(100dvh - 64px))' : undefined,
            '& > #dialog-form': { overflow: 'hidden' },
            '& > #dialog-form > :first-child': { flexShrink: 0 },
          },
        }}
      >
        <Box
          component="form"
          id="copy-fee-structure-form"
          noValidate
          onSubmit={formik.handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <DialogScrollContent scrollBarProps={{ sx: { flex: '1 1 auto', minHeight: 0 } }}>
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
                {formik.values.sourceId && (
                  <FormSectionCard
                    title="Linked Policies"
                    icon={GlobalIcons.info}
                    descriptionTooltip="The copy selects the current active version of each linked policy. The source structure keeps its saved snapshots."
                  >
                    {policies.isFetching && (
                      <Typography variant="body2" role="status">
                        Checking linked policy versions…
                      </Typography>
                    )}
                    {policies.isError && (
                      <Alert severity="error">
                        Linked policies could not be checked. Refresh and select current versions
                        before copying.
                      </Alert>
                    )}
                    {!policies.isFetching && !policies.isError && missingPolicies.length > 0 && (
                      <Alert severity="error">
                        {missingPolicies
                          .map((family) => `${family[0].toUpperCase()}${family.slice(1)} Policy`)
                          .join(', ')}
                        : the linked policy could not be resolved. Refresh and select current
                        versions before copying.
                      </Alert>
                    )}
                    {!policies.isFetching &&
                      !policies.isError &&
                      !missingPolicies.length &&
                      policies.currentData?.length === 0 && (
                        <Typography variant="body2">No policies attached.</Typography>
                      )}
                    {policies.currentData?.map((policy) => (
                      <Alert
                        key={policy.family}
                        severity={
                          policy.family === 'concession'
                            ? 'info'
                            : policy.error
                              ? 'error'
                              : policy.sourceVersionId !== policy.currentVersionId
                                ? 'info'
                                : 'success'
                        }
                      >
                        <Typography variant="subtitle2">
                          {policy.family[0].toUpperCase()}
                          {policy.family.slice(1)} Policy: {policy.policyName}
                        </Typography>
                        <Typography variant="body2">
                          Source snapshot:{' '}
                          {policy.sourceVersionNumber == null
                            ? 'Unavailable'
                            : `v${policy.sourceVersionNumber}`}{' '}
                          · Current version:{' '}
                          {policy.currentVersionNumber == null
                            ? 'Unavailable'
                            : `v${policy.currentVersionNumber}`}
                        </Typography>
                        <Typography variant="body2">
                          {policy.family === 'concession'
                            ? 'Legacy attachment; new structures use concession request policies. This attachment is not copied.'
                            : policy.error || `Selected for copy: v${policy.currentVersionNumber}`}
                        </Typography>
                      </Alert>
                    ))}
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      disabled={busy || policies.isFetching}
                      onClick={() => {
                        setError('');
                        policies.refetch();
                      }}
                    >
                      Refresh and select current versions
                    </Button>
                  </FormSectionCard>
                )}
              </Stack>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions sx={{ flexShrink: 0 }}>
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
              disabled={
                sources.isFetching ||
                sources.isError ||
                !options.length ||
                Boolean(formik.values.sourceId && !policiesReady)
              }
            />
          </DialogActions>
        </Box>
      </CustomDialog>
      {confirmation}
    </>
  );
}
