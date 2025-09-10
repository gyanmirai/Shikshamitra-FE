import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import React, { useCallback } from 'react';
import { Form, Field, Formik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Upload } from 'src/components/upload';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, Checkbox, TextField, DialogActions, FormControlLabel } from '@mui/material';

import { getLeaveValidationSchema } from './validationSchema';

import type { ILeaveFormValues, IAddLeaveRequestProps } from '../type';

const HostelLeaveForm: React.FC<IAddLeaveRequestProps> = ({ open, onClose, editData }) => {
  // Handler to remove a single file attachment
  const handleRemoveFile = useCallback(
    (
      inputFile: File | string,
      values: ILeaveFormValues,
      setFieldValue: (field: string, value: any) => void
    ) => {
      setFieldValue('docs', '');
    },
    []
  );

  // Handler to remove all file attachments
  const handleRemoveAllFiles = useCallback(
    (values: ILeaveFormValues, setFieldValue: (field: string, value: any) => void) => {
      setFieldValue('docs', '');
    },
    []
  );

  // Configuration for file upload component
  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };
  return (
    <Formik
      enableReinitialize
      validateOnChange
      initialValues={{
        leaveType: editData?.leaveTypeId || '',
        description: editData?.description || '',
        startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
        endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
        isHalfDay: editData?.halfDay || false,
        rejectionReason: editData?.rejectionReason || '',
        status: editData?.status || 0,
        docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
      }}
      validationSchema={getLeaveValidationSchema(editData)}
      onSubmit={async (values: ILeaveFormValues, { setSubmitting, resetForm }) => {
        try {
          if (editData) {
            console.log('editdata for leave');
          } else {
            resetForm();
          }
          onClose?.(null, true);
        } catch (errors) {
          console.log(errors);
        }
      }}
    >
      {({ initialValues, errors, touched, setFieldValue, values, submitForm }) => (
        <Form>
          <BackPopUpChecked initialValues={initialValues} currentValues={values}>
            <Scrollbar sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!touched.leaveType && !!errors.leaveType}>
                    <CustomSelect
                      options={[]}
                      label="Leave Type *"
                      value={values.leaveType}
                      name="leaveType"
                      valueKey="id"
                      disabled={editData}
                      labelKey="leaveType"
                      error={!!touched.leaveType && !!errors.leaveType}
                      helperText={(touched.leaveType && errors.leaveType) || ''}
                      onChange={(value) => setFieldValue('leaveType', value)}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Field
                        name="isHalfDay"
                        as={Checkbox}
                        checked={values.isHalfDay}
                        disabled={editData}
                        onChange={(e: any) => {
                          setFieldValue('isHalfDay', e.target.checked);
                          if (e.target.checked) setFieldValue('endDate', null);
                        }}
                      />
                    }
                    label="Half Day"
                  />
                </Grid>

                <Grid size={{ xs: values.isHalfDay ? 12 : 6 }}>
                  <ShakingTextField error={touched.startDate && Boolean(errors.startDate)}>
                    <DateTimePicker
                      label={values.isHalfDay ? 'Date and Time *' : 'Start Date and Time *'}
                      onChange={(value) => setFieldValue('startDate', value)}
                      format="DD-MM-YYYY HH:mm:ss"
                      value={values.startDate}
                      disabled={editData}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          helperText: touched.startDate && errors.startDate,
                          error: touched.startDate && Boolean(errors.startDate),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {!values.isHalfDay && (
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={touched.endDate && Boolean(errors.endDate)}>
                      <DateTimePicker
                        label="End Date and Time *"
                        onChange={(value) => setFieldValue('endDate', value)}
                        value={values.endDate}
                        format="DD-MM-YYYY HH:mm:ss"
                        disabled={editData}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            helperText: touched.endDate && errors.endDate,
                            error: touched.endDate && Boolean(errors.endDate),
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                )}

                <Grid size={{ xs: 6 }}>
                  <Upload
                    {...uploadProps}
                    thumbnail
                    value={values.docs}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        setFieldValue('docs', reader.result);
                      };
                    }}
                    multiple={false}
                    onRemove={(file) => handleRemoveFile(file, values, setFieldValue)}
                    onRemoveAll={() => handleRemoveAllFiles(values, setFieldValue)}
                    disabled={editData}
                  />
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <ShakingTextField error={touched.description && Boolean(errors.description)}>
                    <Editor
                      onChange={(value) => setFieldValue('description', value)}
                      value={values.description}
                      placeholder="Leave description *"
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      editable={!editData}
                      sx={{ height: '100%' }}
                      slotProps={{ wrap: { height: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                  {editData && (
                    <>
                      {editData.status !== EmployeeLeaveStatusType.Rejected && (
                        <LoadingButton
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={async () => {}}
                          style={{ marginRight: '10px' }}
                        >
                          Approve
                        </LoadingButton>
                      )}
                      <LoadingButton
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => setFieldValue('status', EmployeeLeaveStatusType.Rejected)}
                      >
                        Reject
                      </LoadingButton>
                    </>
                  )}
                </Grid>

                {values.status === EmployeeLeaveStatusType.Rejected && (
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      value={values.rejectionReason}
                      label="Rejection Reason *"
                      onChange={(e) => setFieldValue('rejectionReason', e.target.value)}
                      error={touched.rejectionReason && Boolean(errors.rejectionReason)}
                      helperText={touched.rejectionReason && errors.rejectionReason}
                      sx={{ my: 1 }}
                    />
                  </Grid>
                )}
              </Grid>
            </Scrollbar>
            <DialogActions sx={{ flexShrink: 0, p: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                onClick={() => {
                  onClose?.(null, false);
                }}
              >
                Cancel
              </Button>
              {!editData && <SubmitButton />}

              {values.status === EmployeeLeaveStatusType.Rejected && <SubmitButton />}
            </DialogActions>
          </BackPopUpChecked>
        </Form>
      )}
    </Formik>
  );
};

export default HostelLeaveForm;
