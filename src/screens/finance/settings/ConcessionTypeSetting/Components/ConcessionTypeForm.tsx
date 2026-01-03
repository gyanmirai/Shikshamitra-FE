import type { FormikErrors } from 'formik';
import type { RootState } from 'src/redux/store';

import React from 'react';
import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { DocumentTypeArray } from 'src/enums/documnet-type';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  usePutConcessionTypeMutation,
  usePostConcessionTypeMutation,
} from 'src/redux/finance/concessionType';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Radio,
  Button,
  Switch,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  RadioGroup,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { getInitialConcessionTypeData } from './ConcessionInitialValues';
import { concessionTypeValidationSchema } from './ConcessionValidationSchema';

import type { IConcessionDocument, IConcessionTypeFormProps } from '../type';

const feeHeadOptions = ['Tuition Fee', 'Library Fee'];

const ConcessionTypeForm: React.FC<IConcessionTypeFormProps> = ({
  open,
  onClose,
  editData,
}: IConcessionTypeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { addConcessionType, isLoading: isCreating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostConcessionTypeMutation,
  });

  const { updateConcessionType, isLoading: isUpdating } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutConcessionTypeMutation,
  });

  const isSubmitting = isCreating || isUpdating;

  const formik = useFormik({
    initialValues: getInitialConcessionTypeData(editData),
    validationSchema: concessionTypeValidationSchema,
    onSubmit: async (values) => {
      try {
        // Transform form data to match API requirements
        const payload = {
          name: values.concessionName,
          baseAmount: values.concessionType === 'fixed' ? values.amount || 0 : 0,
          amount:
            values.concessionType === 'percentage' ? values.percentage || 0 : values.amount || 0,
          applicableFeeHeads: values.applicableFeeHeads.map((head) => ({
            id: head,
            name: head,
          })),
          documentRequired: values.documentRequired,
          documents: values.documentRequired
            ? (values.documents || []).map((doc) => ({
                documentName: doc.documentName,
                documentSize: Number(doc.documentSize),
                acceptedFormat: doc.acceptedFormat,
              }))
            : [],
          description: values.description || '',
        };

        if (editData?.id) {
          // Update existing concession type
          await updateConcessionType({
            academicYearId: currentYear?.id,
            concessionTypeId: editData.id,
            body: payload,
          }).unwrap();
        } else {
          // Create new concession type
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

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.concessionName && formik.errors.concessionName) || false}
            >
              <TextField
                fullWidth
                label="Concession Name *"
                name="concessionName"
                value={formik.values.concessionName}
                onChange={(e) => {
                  const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  const capitalized = onlyLetters.replace(/\b\w/g, (c) => c.toUpperCase());
                  formik.setFieldValue('concessionName', capitalized);
                }}
                size="small"
                error={!!(formik.touched.concessionName && formik.errors.concessionName)}
                helperText={formik.touched.concessionName && formik.errors.concessionName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.concessionType && formik.errors.concessionType)}
            >
              <FormControl
                component="fieldset"
                error={!!(formik.touched.concessionType && formik.errors.concessionType)}
              >
                <RadioGroup
                  row
                  name="concessionType"
                  value={formik.values.concessionType}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue('amount', '');
                    formik.setFieldValue('percentage', '');
                  }}
                >
                  <FormControlLabel value="fixed" control={<Radio />} label="Fixed" />
                  <FormControlLabel
                    value="percentage"
                    control={<Radio />}
                    label="Percentage Based"
                  />
                </RadioGroup>

                {formik.touched.concessionType && formik.errors.concessionType && (
                  <Typography variant="caption" color="error">
                    {formik.errors.concessionType}
                  </Typography>
                )}
              </FormControl>
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {formik.values.concessionType === 'fixed' ? (
              <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                <NumericFormatCustom
                  label="Amount *"
                  name="amount"
                  size="small"
                  fullWidth
                  value={formik.values.amount || ''}
                  onChange={(e) => {
                    let val = e.target.value;
                    val = val.replace(/[₹,\s]/g, '');
                    const numVal = val === '' ? null : Number(val);
                    formik.setFieldValue('amount', numVal);
                  }}
                  error={!!(formik.touched.amount && formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  sx={{
                    minWidth: 120,
                    width: '100%',
                    padding: '0',
                    borderRadius: 1,
                  }}
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      position: 'static',
                      whiteSpace: 'normal',
                    },
                  }}
                  inputProps={{ min: 0 }}
                  disabled={formik.values.concessionType !== 'fixed'}
                />
              </ShakingTextField>
            ) : (
              <ShakingTextField error={!!(formik.touched.percentage && formik.errors.percentage)}>
                <TextField
                  label="Percentage *"
                  name="percentage"
                  type="number"
                  size="small"
                  fullWidth
                  value={formik.values.percentage || ''}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldTouched('percentage', true);
                  }}
                  error={!!(formik.touched.percentage && formik.errors.percentage)}
                  helperText={formik.touched.percentage && formik.errors.percentage}
                  sx={{ minWidth: 120 }}
                  disabled={formik.values.concessionType !== 'percentage'}
                />
              </ShakingTextField>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.applicableFeeHeads && formik.errors.applicableFeeHeads)}
            >
              <CustomSelect
                label="Applicable Fee Heads *"
                options={feeHeadOptions.map((head) => ({ value: head, label: head }))}
                value={formik.values.applicableFeeHeads}
                onChange={(val) => formik.setFieldValue('applicableFeeHeads', val)}
                formControlProps={{ fullWidth: true }}
                multiple
                error={
                  !!(formik.touched.applicableFeeHeads && formik.errors.applicableFeeHeads) || false
                }
                helperText={
                  (formik.touched.applicableFeeHeads && formik.errors.applicableFeeHeads) as string
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.documentRequired}
                    onChange={() =>
                      formik.setFieldValue('documentRequired', !formik.values.documentRequired)
                    }
                  />
                }
                label="Document Required?"
              />
            </ShakingTextField>
          </Grid>

          {formik.values.documentRequired && (
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
                        <Box key={idx} display="flex" alignItems="center" gap={3} mb={2} mt={2}>
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
                              onChange={(e) => {
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx].documentName = e.target.value;
                                formik.setFieldValue('documents', docs);
                              }}
                              sx={{ minWidth: 180 }}
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
                              label="Document Size (Mb) *"
                              size="small"
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
                              sx={{ minWidth: 100 }}
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
                              options={DocumentTypeArray}
                              disableCloseOnSelect
                              getOptionLabel={(option) => option.label}
                              value={DocumentTypeArray.filter((item) =>
                                doc.acceptedFormat.includes(item.value.toString())
                              )}
                              onChange={(_, data) => {
                                const docs = [...(formik.values.documents ?? [])];
                                docs[idx].acceptedFormat = data.map((item) =>
                                  item.value.toString()
                                );
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
                                  sx={{ minWidth: 290 }} // Added minWidth to increase dropdown width
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
