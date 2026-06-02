import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { LoadingScreen } from 'src/components/loading-screen';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
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
} from '@mui/material';

import { ConcessionDocumentFormatArray } from '../type';
import { getInitialConcessionTypeData } from './ConcessionInitialValues';
import { concessionTypeValidationSchema } from './ConcessionValidationSchema';

import type { IConcessionDocument, IConcessionTypeFormProps } from '../type';

const ConcessionTypeForm: React.FC<IConcessionTypeFormProps> = ({
  open,
  onClose,
  editData,
}: IConcessionTypeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
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
    initialValues: getInitialConcessionTypeData(concessionTypeDetails),
    validationSchema: concessionTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          documents:
            values.documents?.map((doc: any) => ({
              ...doc,
              documentSize: doc.documentSize
                ? Math.round(Number(doc.documentSize) * 1024 * 1024)
                : doc.documentSize,
              acceptedFormat: Array.isArray(doc.acceptedFormat)
                ? doc.acceptedFormat.map(Number)
                : [],
            })) || [],
          description: values.description || '',
        };

        if (concessionTypeDetails?.id) {
          await updateConcessionType({
            concessionTypeId: concessionTypeDetails.id,
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
        console.error(`Error ${editData?.id ? 'updating' : 'creating'} concession type:`, error);
      }
    },
  });
  // Document add/remove handlers
  const handleAddDocument = () => {
    formik.setFieldValue('documents', [
      ...(formik.values.documents ?? []),
      {
        documentName: '',
        documentSize: '',
        acceptedFormat: [],
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
                label="Concession Name *"
                name="name"
                value={formik.values.name}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  const capitalized = onlyLetters.replace(/\b\w/g, (c) => c.toUpperCase());
                  formik.setFieldValue('name', capitalized);
                }}
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
                  >
                    Document
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column">
                  {(formik?.values?.documents ?? [])?.length > 0 && (
                    <Scrollbar sx={{ height: '150px' }}>
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
                              label="Name *"
                              size="small"
                              name={`documents.${idx}.documentName`}
                              value={doc.documentName}
                              onChange={(e) => {
                                const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                const capitalized = onlyLetters.replace(/\b\w/g, (c) =>
                                  c.toUpperCase()
                                );
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx].documentName = capitalized;
                                formik.setFieldValue('documents', docs);
                              }}
                              sx={{ minWidth: 130 }}
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
                                formik?.touched?.documents?.[idx]?.documentSize &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.documentSize
                              )
                            }
                          >
                            <TextField
                              label="Size (Mb) *"
                              size="small"
                              type="number"
                              name={`documents.${idx}.documentSize`}
                              value={doc.documentSize ?? ''}
                              onChange={(e) => {
                                const docs = [...(formik.values.documents ?? [])];
                                const val = e.target.value;

                                if (val === '') {
                                  // Store undefined when input is empty
                                  docs[idx].documentSize = '';
                                } else if (val.length <= 2) {
                                  docs[idx].documentSize = Number(val);
                                }

                                formik.setFieldValue('documents', docs);
                              }}
                              onKeyDown={(e) => {
                                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              error={
                                !!(
                                  Array.isArray(formik?.touched?.documents) &&
                                  formik?.touched?.documents?.[idx]?.documentSize &&
                                  Array.isArray(formik?.errors?.documents) &&
                                  typeof formik?.errors?.documents?.[idx] === 'object' &&
                                  (
                                    formik.errors.documents[
                                      idx
                                    ] as FormikErrors<IConcessionDocument>
                                  )?.documentSize
                                )
                              }
                              helperText={
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.documentSize &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.documentSize
                                  ? (
                                      formik.errors.documents[
                                        idx
                                      ] as FormikErrors<IConcessionDocument>
                                    )?.documentSize
                                  : ''
                              }
                              inputProps={{
                                min: 0,
                              }}
                              sx={{ minWidth: 120 }}
                            />
                          </ShakingTextField>

                          <ShakingTextField
                            error={
                              !!(
                                Array.isArray(formik?.touched?.documents) &&
                                formik?.touched?.documents?.[idx]?.acceptedFormat &&
                                Array.isArray(formik?.errors?.documents) &&
                                typeof formik?.errors?.documents?.[idx] === 'object' &&
                                (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                  ?.acceptedFormat
                              )
                            }
                          >
                            <Autocomplete
                              multiple
                              options={ConcessionDocumentFormatArray}
                              disableCloseOnSelect
                              getOptionLabel={(option) => option.label}
                              value={ConcessionDocumentFormatArray.filter((item) =>
                                doc.acceptedFormat.includes(item.value)
                              )}
                              onChange={(_, data) => {
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx].acceptedFormat = data.map((item) => item.value);
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
                                  value={`${doc.acceptedFormat?.length || 0} Document Selected`}
                                  size="small"
                                  sx={{ minWidth: 200 }} // Added minWidth to increase dropdown width
                                  error={
                                    !!(
                                      Array.isArray(formik?.touched?.documents) &&
                                      formik?.touched?.documents?.[idx]?.acceptedFormat &&
                                      Array.isArray(formik?.errors?.documents) &&
                                      typeof formik?.errors?.documents?.[idx] === 'object' &&
                                      (
                                        formik.errors.documents[
                                          idx
                                        ] as FormikErrors<IConcessionDocument>
                                      )?.acceptedFormat
                                    )
                                  }
                                  helperText={
                                    Array.isArray(formik?.touched?.documents) &&
                                    formik?.touched?.documents?.[idx]?.acceptedFormat &&
                                    Array.isArray(formik?.errors?.documents) &&
                                    typeof formik?.errors?.documents?.[idx] === 'object' &&
                                    (
                                      formik.errors.documents[
                                        idx
                                      ] as FormikErrors<IConcessionDocument>
                                    )?.acceptedFormat
                                      ? (
                                          formik.errors.documents[
                                            idx
                                          ] as FormikErrors<IConcessionDocument>
                                        )?.acceptedFormat
                                      : ''
                                  }
                                />
                              )}
                            />
                          </ShakingTextField>

                          <IconButton color="error" onClick={() => handleRemoveDocument(idx)}>
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
    </BackPopUpChecked>
  );
};

export default ConcessionTypeForm;
