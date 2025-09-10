import type { FormikErrors } from 'formik';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Paper,
  Radio,
  Button,
  Switch,
  TextField,
  IconButton,
  Typography,
  RadioGroup,
  FormControl,
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
  const [feeHeads, setFeeHeads] = useState(feeHeadOptions);

  const formik = useFormik({
    initialValues: getInitialConcessionTypeData(editData),
    validationSchema: concessionTypeValidationSchema,
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  console.log('Formik values:', formik.values);
  console.log('Formik errors:', formik.errors);

  // Document add/remove handlers
  const handleAddDocument = () => {
    formik.setFieldValue('documents', [
      ...(formik.values.documents ?? []),
      { documentName: '', documentSize: '5mb', acceptedFormat: 'jpg, png' },
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
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.concessionName && formik.errors.concessionName) || false}
            >
              <TextField
                fullWidth
                label="Concession Name *"
                name="concessionName"
                value={formik.values.concessionName}
                onChange={formik.handleChange}
                size="small"
                error={!!(formik.touched.concessionName && formik.errors.concessionName)}
                helperText={formik.touched.concessionName && formik.errors.concessionName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                  onChange={formik.handleChange}
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

          <Grid size={{ xs: 12 }}>
            {formik.values.concessionType === 'fixed' ? (
              <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                <TextField
                  label="Amount *"
                  name="amount"
                  size="small"
                  type="number"
                  fullWidth
                  value={formik.values.amount || ''}
                  onChange={formik.handleChange}
                  error={!!(formik.touched.amount && formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  sx={{ minWidth: 120 }}
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
                  onChange={formik.handleChange}
                  error={!!(formik.touched.percentage && formik.errors.percentage)}
                  helperText={formik.touched.percentage && formik.errors.percentage}
                  sx={{ minWidth: 120 }}
                  disabled={formik.values.concessionType !== 'percentage'}
                />
              </ShakingTextField>
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
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

          <Grid size={{ xs: 12 }}>
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
                {formik?.values?.documents?.map((doc, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={2} mb={3}>
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
                            (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                              ?.documentName
                          )
                        }
                        helperText={
                          Array.isArray(formik?.touched?.documents) &&
                          formik?.touched?.documents?.[idx]?.documentName &&
                          Array.isArray(formik?.errors?.documents) &&
                          typeof formik?.errors?.documents?.[idx] === 'object' &&
                          (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                            ?.documentName
                            ? (formik.errors.documents[idx] as FormikErrors<IConcessionDocument>)
                                ?.documentName
                            : ''
                        }
                      />
                    </ShakingTextField>

                    <ShakingTextField>
                      <TextField
                        label="Document Size *"
                        size="small"
                        name={`documents.${idx}.documentSize`}
                        value={doc.documentSize}
                        onChange={(e) => {
                          const docs = [...(formik.values.documents ?? [])];
                          docs[idx].documentSize = e.target.value;
                          formik.setFieldValue('documents', docs);
                        }}
                        sx={{ minWidth: 80 }}
                      />
                    </ShakingTextField>

                    <ShakingTextField>
                      <TextField
                        label="Accepted Format *"
                        size="small"
                        name={`documents.${idx}.acceptedFormat`}
                        value={doc.acceptedFormat}
                        onChange={(e) => {
                          const docs = [...(formik.values.documents ?? [])];
                          docs[idx].acceptedFormat = e.target.value;
                          formik.setFieldValue('documents', docs);
                        }}
                        sx={{ minWidth: 100 }}
                      />
                    </ShakingTextField>

                    <IconButton color="error" onClick={() => handleRemoveDocument(idx)}>
                      <Iconify icon={GlobalIcons.delete} />
                    </IconButton>
                  </Box>
                ))}
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
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ConcessionTypeForm;
