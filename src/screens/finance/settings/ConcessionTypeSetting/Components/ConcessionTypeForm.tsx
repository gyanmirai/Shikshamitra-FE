import { sanitizeFinanceName } from 'src/utils/finance-name';
import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DownstreamUsageWarning } from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import {
  useGetConcessionTypesQuery,
  usePutConcessionTypeMutation,
  usePostConcessionTypeMutation,
  useGetConcessionTypeByIdQuery,
} from 'src/redux/finance/concessionType';
import {
  Box,
  Chip,
  Paper,
  Alert,
  Stack,
  Button,
  Checkbox,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';

import ConcessionTypeFormSkeleton from './ConcessionTypeFormSkeleton';
import { getInitialConcessionTypeData } from './ConcessionInitialValues';
import { concessionTypeValidationSchema } from './ConcessionValidationSchema';
import {
  ConcessionDocumentFormatArray,
  DEFAULT_CONCESSION_DOCUMENT_FORMATS,
  DEFAULT_CONCESSION_DOCUMENT_SIZE_MB,
} from '../type';

import type { IConcessionDocument, IConcessionTypeFormProps } from '../type';

const ConcessionTypeForm: React.FC<IConcessionTypeFormProps> = ({
  open,
  onClose,
  editData,
  onBusyChange,
}: IConcessionTypeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State for downstream usage warning dialog
  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<any>(null);

  const { data: concessionTypesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: { academicYearId: currentYear?.id, maxResultCount: 1000, includeInactive: true },
    options: {
      skip: !currentYear?.id || !open?.value || editData,
    },
  });

  const existingNames = useMemo(
    () =>
      new Set<string>(
        (concessionTypesData?.data?.items ?? []).map((t: any) => t.name.trim().toLowerCase())
      ),
    [concessionTypesData]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

  const {
    currentData: concessionTypeDetails,
    isLoading: isLoadingDetails,
    isFetching: isFetchingDetails,
    refetch: refetchDetails,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeByIdQuery,
    params: {
      concessionTypeId: editData?.id,
    },
    options: {
      skip: !editData?.id,
    },
  });

  const documentsLocked = Boolean(concessionTypeDetails?.data?.isUsedInDownstream);
  const detailsUnavailable = Boolean(editData?.id) && !concessionTypeDetails?.data;
  const detailsLoading = detailsUnavailable && (isLoadingDetails || isFetchingDetails);

  const [addConcessionType, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostConcessionTypeMutation,
  });

  const [updateConcessionType, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutConcessionTypeMutation,
  });

  const isSubmitting = isCreating || isUpdating;
  useEffect(() => {
    onBusyChange?.(isSubmitting);
  }, [isSubmitting, onBusyChange]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialConcessionTypeData(concessionTypeDetails?.data),
    validationSchema: concessionTypeValidationSchema(
      existingNames,
      concessionTypeDetails?.data || editData
    ),
    onSubmit: async (values) => {
      if (detailsUnavailable || isSubmitting) return;
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      await performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        documents:
          values.documents?.map((doc: any) => ({
            ...doc,
            maxFileSizeBytes: Math.round(Number(doc.maxFileSizeMb) * 1024 * 1024),
            acceptedFormats: Array.isArray(doc.acceptedFormats)
              ? doc.acceptedFormats.map(Number)
              : [],
            isRequired: doc.isRequired,
          })) || [],
        description: values.description || '',
        concurrencyStamp: values.concurrencyStamp,
      };

      if (concessionTypeDetails?.data?.id) {
        await updateConcessionType({
          concessionTypeId: concessionTypeDetails.data.id,
          body: payload,
        }).unwrap();
      } else {
        await addConcessionType({
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();
      }

      onClose(null, true);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      const message = parsed.detail || 'Unable to save concession type.';
      if (
        parsed.errorCode === 'Finance:ConcessionType:010001' ||
        message.toLowerCase().includes('already exists') ||
        message.toLowerCase().includes('duplicate')
      ) {
        formik.setFieldError('name', message);
      } else {
        shikshaMitraToast.error({ message });
      }
    }
  };

  // Document add/remove handlers
  const handleAddDocument = () => {
    formik.setFieldValue('documents', [
      ...(formik.values.documents ?? []),
      {
        documentName: '',
        maxFileSizeMb: DEFAULT_CONCESSION_DOCUMENT_SIZE_MB,
        acceptedFormats: DEFAULT_CONCESSION_DOCUMENT_FORMATS,
        isRequired: true,
      },
    ]);
  };

  const handleRemoveDocument = (idx: number) => {
    const docs = [...(formik.values.documents ?? [])];
    docs.splice(idx, 1);
    formik.setFieldValue('documents', docs);
  };
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSubmitting && !detailsUnavailable) formik.handleSubmit(event);
        }}
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.neutral',
          }}
        >
          <FormBusyRegion busy={isSubmitting} label="Saving concession type…">
            {detailsLoading ? (
              <ConcessionTypeFormSkeleton documentCount={editData?.documents?.length} />
            ) : detailsUnavailable ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => refetchDetails()}>
                    Retry
                  </Button>
                }
              >
                Unable to load concession type details.
              </Alert>
            ) : (
              <Stack spacing={2}>
                <FormSectionCard
                  title="General Information"
                  icon={GlobalIcons.notebook}
                  descriptionTooltip="Name this concession type and describe when it should be used."
                >
                  <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
                    <TextField
                      fullWidth
                      label="Concession Type Name *"
                      name="name"
                      value={formik.values.name}
                      onChange={(event) =>
                        formik.setFieldValue(
                          event.target.name,
                          sanitizeFinanceName(event.target.value)
                        )
                      }
                      onBlur={formik.handleBlur}
                      size="small"
                      error={!!(formik.touched.name && formik.errors.name)}
                      helperText={(formik.touched.name && formik.errors.name) || undefined}
                    />
                  </ShakingTextField>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.description && formik.errors.description)}
                    helperText={
                      (formik.touched.description && formik.errors.description) || undefined
                    }
                  />
                </FormSectionCard>

                {formik.values.documents && (
                  <FormSectionCard
                    title="Document Requirements"
                    icon={GlobalIcons.documentIcon}
                    descriptionTooltip="Set the supporting documents, accepted file formats, and maximum file size for concession requests."
                    action={
                      <Button
                        variant="outlined"
                        startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                        onClick={handleAddDocument}
                        size="small"
                        disabled={documentsLocked}
                      >
                        Add document
                      </Button>
                    }
                  >
                    {!formik.values.documents.length && (
                      <Typography variant="body2" color="text.secondary">
                        No document requirements added.
                      </Typography>
                    )}
                    {documentsLocked && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Document requirements cannot be changed because this concession type is
                        already in use.
                      </Typography>
                    )}
                    <Box display="flex" flexDirection="column">
                      {(formik?.values?.documents ?? [])?.length > 0 && (
                        <Stack spacing={1.5}>
                          {formik?.values?.documents?.map((doc, idx) => (
                            <Box
                              key={doc.id ?? idx}
                              component="section"
                              aria-label={`Document ${idx + 1}${doc.documentName.trim() ? `: ${doc.documentName.trim()}` : ''}`}
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: '28px minmax(0, 1fr)',
                                columnGap: 1,
                                alignItems: 'start',
                                minWidth: 0,
                              }}
                            >
                              <Box
                                aria-label={`Document ${idx + 1}`}
                                sx={{
                                  mt: 1.5,
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: 'background.neutral',
                                  color: 'text.secondary',
                                  display: 'grid',
                                  placeItems: 'center',
                                  typography: 'caption',
                                  fontWeight: 600,
                                }}
                              >
                                {idx + 1}
                              </Box>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 1.5,
                                  minWidth: 0,
                                  bgcolor: 'background.neutral',
                                  borderRadius: 2,
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(0, 1fr) 44px',
                                  columnGap: 0.5,
                                  rowGap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    gridColumn: 1,
                                    gridRow: 1,
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: 'minmax(0, 1fr)',
                                      sm: 'repeat(2, minmax(0, 1fr))',
                                    },
                                    gap: 1,
                                    alignItems: 'start',
                                    minWidth: 0,
                                  }}
                                >
                                  <ShakingTextField
                                    sx={{ minWidth: 0 }}
                                    error={
                                      !!(
                                        Array.isArray(formik?.touched?.documents) &&
                                        formik?.touched?.documents?.[idx]?.documentName &&
                                        Array.isArray(formik?.errors?.documents) &&
                                        typeof formik?.errors?.documents?.[idx] === 'object' &&
                                        (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.documentName
                                      )
                                    }
                                  >
                                    <TextField
                                      fullWidth
                                      label="Document Name *"
                                      size="small"
                                      name={`documents.${idx}.documentName`}
                                      value={doc.documentName}
                                      disabled={documentsLocked}
                                      onChange={(e) => {
                                        const docs = [...(formik.values.documents ?? [])];
                                        docs[idx] = {
                                          ...docs[idx],
                                          documentName: sanitizeFinanceName(e.target.value),
                                        };
                                        formik.setFieldValue('documents', docs);
                                      }}
                                      onBlur={() =>
                                        formik.setFieldTouched(
                                          `documents.${idx}.documentName`,
                                          true
                                        )
                                      }
                                      error={
                                        !!(
                                          Array.isArray(formik?.touched?.documents) &&
                                          formik?.touched?.documents?.[idx]?.documentName &&
                                          Array.isArray(formik?.errors?.documents) &&
                                          typeof formik?.errors?.documents?.[idx] === 'object' &&
                                          (
                                            formik.errors.documents[
                                              idx
                                            ] as FormikErrors<IConcessionDocument>
                                          )?.documentName
                                        )
                                      }
                                      helperText={
                                        (Array.isArray(formik?.touched?.documents) &&
                                        formik?.touched?.documents?.[idx]?.documentName &&
                                        Array.isArray(formik?.errors?.documents) &&
                                        typeof formik?.errors?.documents?.[idx] === 'object' &&
                                        (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.documentName
                                          ? (
                                              formik.errors.documents[
                                                idx
                                              ] as FormikErrors<IConcessionDocument>
                                            )?.documentName
                                          : undefined) || undefined
                                      }
                                    />
                                  </ShakingTextField>

                                  <ShakingTextField
                                    sx={{ minWidth: 0 }}
                                    error={
                                      !!(
                                        Array.isArray(formik?.touched?.documents) &&
                                        formik?.touched?.documents?.[idx]?.maxFileSizeMb &&
                                        Array.isArray(formik?.errors?.documents) &&
                                        typeof formik?.errors?.documents?.[idx] === 'object' &&
                                        (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.maxFileSizeMb
                                      )
                                    }
                                  >
                                    <NumericFormatCustom
                                      fullWidth
                                      prefix=""
                                      decimalScale={2}
                                      roundToWholeRupees={false}
                                      label="Maximum File Size (MB) *"
                                      size="small"
                                      name={`documents.${idx}.maxFileSizeMb`}
                                      value={doc.maxFileSizeMb ?? ''}
                                      disabled={documentsLocked}
                                      onBlur={formik.handleBlur}
                                      onValueChange={(values, source) => {
                                        if (source.source === 'event')
                                          formik.setFieldValue(
                                            `documents.${idx}.maxFileSizeMb`,
                                            values.value
                                          );
                                      }}
                                      error={
                                        !!(
                                          Array.isArray(formik?.touched?.documents) &&
                                          formik?.touched?.documents?.[idx]?.maxFileSizeMb &&
                                          Array.isArray(formik?.errors?.documents) &&
                                          typeof formik?.errors?.documents?.[idx] === 'object' &&
                                          (
                                            formik.errors.documents[
                                              idx
                                            ] as FormikErrors<IConcessionDocument>
                                          )?.maxFileSizeMb
                                        )
                                      }
                                      helperText={
                                        (Array.isArray(formik?.touched?.documents) &&
                                        formik?.touched?.documents?.[idx]?.maxFileSizeMb &&
                                        Array.isArray(formik?.errors?.documents) &&
                                        typeof formik?.errors?.documents?.[idx] === 'object' &&
                                        (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.maxFileSizeMb
                                          ? (
                                              formik.errors.documents[
                                                idx
                                              ] as FormikErrors<IConcessionDocument>
                                            )?.maxFileSizeMb
                                          : undefined) || undefined
                                      }
                                      inputProps={{
                                        min: 0.01,
                                        max: 20,
                                        step: 0.01,
                                      }}
                                    />
                                  </ShakingTextField>

                                  <ShakingTextField
                                    sx={{ gridColumn: '1 / -1', minWidth: 0 }}
                                    error={
                                      !!(
                                        Array.isArray(formik?.touched?.documents) &&
                                        formik?.touched?.documents?.[idx]?.acceptedFormats &&
                                        Array.isArray(formik?.errors?.documents) &&
                                        typeof formik?.errors?.documents?.[idx] === 'object' &&
                                        (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.acceptedFormats
                                      )
                                    }
                                  >
                                    <Autocomplete
                                      multiple
                                      fullWidth
                                      disabled={documentsLocked}
                                      options={ConcessionDocumentFormatArray}
                                      disableCloseOnSelect
                                      getOptionLabel={(option) => option.label}
                                      value={ConcessionDocumentFormatArray.filter((item) =>
                                        (doc.acceptedFormats ?? []).some(
                                          (format) => Number(format) === item.value
                                        )
                                      )}
                                      onChange={(_, data) => {
                                        const docs = [...(formik.values.documents ?? [])];
                                        docs[idx] = {
                                          ...docs[idx],
                                          acceptedFormats: data.map((item) => item.value),
                                        };
                                        formik.setFieldValue('documents', docs);
                                      }}
                                      isOptionEqualToValue={(option, value) =>
                                        option.value === value.value
                                      }
                                      renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                          <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon />}
                                            checkedIcon={<CheckBoxIcon />}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                          />
                                          {option.label}
                                        </li>
                                      )}
                                      renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                          <Chip
                                            label={option.label}
                                            {...getTagProps({ index })}
                                            key={index}
                                            variant="soft"
                                            size="small"
                                          />
                                        ))
                                      }
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          fullWidth
                                          label="Accepted Format *"
                                          size="small"
                                          error={
                                            !!(
                                              Array.isArray(formik?.touched?.documents) &&
                                              formik?.touched?.documents?.[idx]?.acceptedFormats &&
                                              Array.isArray(formik?.errors?.documents) &&
                                              typeof formik?.errors?.documents?.[idx] ===
                                                'object' &&
                                              (
                                                formik.errors.documents[
                                                  idx
                                                ] as FormikErrors<IConcessionDocument>
                                              )?.acceptedFormats
                                            )
                                          }
                                          helperText={
                                            (Array.isArray(formik?.touched?.documents) &&
                                            formik?.touched?.documents?.[idx]?.acceptedFormats &&
                                            Array.isArray(formik?.errors?.documents) &&
                                            typeof formik?.errors?.documents?.[idx] === 'object' &&
                                            (
                                              formik.errors.documents[
                                                idx
                                              ] as FormikErrors<IConcessionDocument>
                                            )?.acceptedFormats
                                              ? (
                                                  formik.errors.documents[
                                                    idx
                                                  ] as FormikErrors<IConcessionDocument>
                                                )?.acceptedFormats
                                              : undefined) || undefined
                                          }
                                        />
                                      )}
                                    />
                                  </ShakingTextField>

                                  <FormControlLabel
                                    sx={{ gridColumn: '1 / -1', minWidth: 0, m: 0 }}
                                    control={
                                      <Checkbox
                                        checked={doc.isRequired}
                                        disabled={documentsLocked}
                                        onChange={(event) => {
                                          const docs = [...(formik.values.documents ?? [])];
                                          docs[idx] = {
                                            ...docs[idx],
                                            isRequired: event.target.checked,
                                          };
                                          formik.setFieldValue('documents', docs);
                                        }}
                                      />
                                    }
                                    label={doc.isRequired ? 'Mandatory' : 'Optional'}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    gridColumn: 2,
                                    gridRow: 1,
                                    justifySelf: 'end',
                                    alignSelf: 'start',
                                  }}
                                >
                                  <Tooltip
                                    title={
                                      documentsLocked
                                        ? 'Document requirements cannot be changed because this concession type is already in use.'
                                        : 'Remove document'
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        size="small"
                                        sx={{ width: 44, height: 44 }}
                                        aria-label={`Remove ${doc.documentName || `document ${idx + 1}`}`}
                                        color="error"
                                        disabled={documentsLocked}
                                        onClick={() => handleRemoveDocument(idx)}
                                      >
                                        <Iconify icon={GlobalIcons.delete} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                              </Paper>
                            </Box>
                          ))}
                        </Stack>
                      )}
                      <Typography
                        sx={{
                          margin: 0,
                          position: 'static',
                          whiteSpace: 'normal',
                          color: 'error.main',
                          fontSize: '0.75rem',
                        }}
                      >
                        {formik.touched.documents &&
                          typeof formik.errors.documents === 'string' &&
                          formik.errors.documents}
                      </Typography>
                    </Box>
                  </FormSectionCard>
                )}
              </Stack>
            )}
          </FormBusyRegion>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.75,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            type="button"
            size="small"
            disabled={isSubmitting}
            onClick={() => onClose(null, false)}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            type="submit"
            size="small"
            variant="contained"
            color="inherit"
            loading={isSubmitting}
            disabled={isSubmitting || detailsUnavailable}
          >
            Submit
          </Button>
        </Stack>
      </Box>

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={concessionTypeDetails?.data?.name || ''}
        itemType="Concession Type"
        isLoading={isSubmitting}
        onConfirm={async () => {
          if (pendingFormValues) {
            await performSubmission(pendingFormValues);
            setShowDownstreamWarning(false);
            setPendingFormValues(null);
          }
        }}
        onCancel={() => {
          setShowDownstreamWarning(false);
          setPendingFormValues(null);
        }}
      />
    </BackPopUpChecked>
  );
};

export default ConcessionTypeForm;
