import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React, { useRef, useMemo, useState } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DownstreamUsageWarning } from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetConcessionTypesQuery,
  usePutConcessionTypeMutation,
  usePostConcessionTypeMutation,
  useGetConcessionTypeByIdQuery,
} from 'src/redux/finance/concessionType';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Button,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

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

  const { data: concessionTypeDetails, isLoading: isLoadingDetails } = useQueryAndMutation({
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

  const [addConcessionType, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostConcessionTypeMutation,
  });

  const [updateConcessionType, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutConcessionTypeMutation,
  });

  const isSubmitting = isCreating || isUpdating;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialConcessionTypeData(concessionTypeDetails?.data),
    validationSchema: concessionTypeValidationSchema(
      existingNames,
      concessionTypeDetails?.data || editData
    ),
    onSubmit: async (values) => {
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
  if (isLoadingDetails) {
    return <LoadingScreen />;
  }
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name) || false}>
              <TextField
                fullWidth
                label="Concession Type Name *"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                size="small"
                error={!!(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>

          {formik.values.documents && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography mb={1} fontWeight={600}>
                    Add Documents
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddDocument}
                    size="small"
                    disabled={documentsLocked}
                  >
                    Document
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column">
                  {(formik?.values?.documents ?? [])?.length > 0 && (
                    <Scrollbar sx={{ height: '150px', pt: 1 }}>
                      {formik?.values?.documents?.map((doc, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} mb={2}>
                          <ShakingTextField
                            error={
                              !!(
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.documentName &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.documentName
                              )
                            }
                          >
                            <TextField
                              label="Document Name *"
                              size="small"
                              name={`documents.${idx}.documentName`}
                              value={doc.documentName}
                              disabled={documentsLocked}
                              onChange={(e) => {
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx] = { ...docs[idx], documentName: e.target.value };
                                formik.setFieldValue('documents', docs);
                              }}
                              onBlur={() =>
                                formik.setFieldTouched(`documents.${idx}.documentName`, true)
                              }
                              sx={{ minWidth: 250 }}
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
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.documentName &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.documentName
                                  ? (
                                      formik.errors.documents[
                                        idx
                                      ] as FormikErrors<IConcessionDocument>
                                    )?.documentName
                                  : ''
                              }
                            />
                          </ShakingTextField>

                          <ShakingTextField
                            error={
                              !!(
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.maxFileSizeMb &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.maxFileSizeMb
                              )
                            }
                          >
                            <TextField
                              label="Maximum File Size (MB) *"
                              size="small"
                              type="number"
                              name={`documents.${idx}.maxFileSizeMb`}
                              value={doc.maxFileSizeMb ?? ''}
                              disabled={documentsLocked}
                              onChange={(e) => {
                                const docs = [...(formik.values.documents ?? [])];
                                const val = e.target.value;

                                docs[idx] = {
                                  ...docs[idx],
                                  maxFileSizeMb: val === '' ? '' : Number(val),
                                };

                                formik.setFieldValue('documents', docs);
                              }}
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                  e.preventDefault();
                                }
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
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.maxFileSizeMb &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.maxFileSizeMb
                                  ? (
                                      formik.errors.documents[
                                        idx
                                      ] as FormikErrors<IConcessionDocument>
                                    )?.maxFileSizeMb
                                  : ''
                              }
                              inputProps={{
                                min: 0.01,
                                max: 20,
                                step: 0.01,
                              }}
                              sx={{ minWidth: 150 }}
                            />
                          </ShakingTextField>

                          <ShakingTextField
                            error={
                              !!(
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.acceptedFormats &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.acceptedFormats
                              )
                            }
                          >
                            <Autocomplete
                              multiple
                              disabled={documentsLocked}
                              options={ConcessionDocumentFormatArray}
                              disableCloseOnSelect
                              getOptionLabel={(option) => option.label}
                              value={ConcessionDocumentFormatArray.filter((item) =>
                                doc.acceptedFormats.includes(item.value)
                              )}
                              onChange={(_, data) => {
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx].acceptedFormats = data.map((item) => item.value);
                                formik.setFieldValue('documents', docs);
                              }}
                              isOptionEqualToValue={(option, value) => option.value === value.value}
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
                                  label="Accepted Format *"
                                  value={`${doc.acceptedFormats?.length || 0} formats selected`}
                                  size="small"
                                  sx={{ minWidth: 350 }} // Added minWidth to increase dropdown width
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
                                  helperText={
                                    Array.isArray(formik?.touched?.documents) &&
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
                                      : ''
                                  }
                                />
                              )}
                            />
                          </ShakingTextField>

                          <FormControlLabel
                            sx={{ minWidth: 115, m: 0 }}
                            control={
                              <Checkbox
                                checked={doc.isRequired}
                                disabled={documentsLocked}
                                onChange={(event) => {
                                  const docs = [...(formik.values.documents ?? [])];
                                  docs[idx].isRequired = event.target.checked;
                                  formik.setFieldValue('documents', docs);
                                }}
                              />
                            }
                            label={doc.isRequired ? 'Mandatory' : 'Optional'}
                          />

                          <IconButton
                            color="error"
                            disabled={documentsLocked}
                            onClick={() => handleRemoveDocument(idx)}
                          >
                            <Iconify icon={GlobalIcons.delete} />
                          </IconButton>
                        </Box>
                      ))}
                    </Scrollbar>
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
              </Paper>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <ShakingTextField>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            onClose(null, false);
          }}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          variant="contained"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>

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
