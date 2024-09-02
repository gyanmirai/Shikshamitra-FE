import * as Yup from 'yup';
import React, { useMemo } from 'react';
import { Form, Field, Formik } from 'formik';

import { DateTimePicker } from '@mui/x-date-pickers';
import { Grid, Button, MenuItem, Checkbox, TextField, FormControlLabel } from '@mui/material';

import { Editor } from 'src/components/editor';

import type { TabComponentType } from '.';

const leaveTypes = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
];

type AddLeaveRequestProps = TabComponentType & {
  editData?: any;
  handleClose?: () => void;
};

const AddLeaveRequest = (props: AddLeaveRequestProps) => {
  const { editData, handleClose } = props;

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        leaveType: Yup.string().required('Leave type is required'),
        isHalfDay: Yup.boolean(),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date().when('isHalfDay', (isHalfDay, schema) =>
          isHalfDay ? schema : schema.required('End date is required')
        ),
        description: Yup.string().required('Description is required'),
        status: editData ? Yup.string().required('Status is required') : Yup.string(),

        rejectionReason: Yup.string().when('status', (status, schema) =>
          status[0] === 'rejected' ? schema.required('Rejection reason is required') : schema
        ),
      }),
    [editData]
  );
  return (
    <Formik
      initialValues={{
        leaveType: '',
        description: '',
        startDate: null,
        endDate: null,
        isHalfDay: false,
        rejectionReason: '',
        status: null,
      }}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        handleClose?.();
      }}
    >
      {({ errors, touched, setFieldValue, values, submitForm }) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Field
                name="leaveType"
                as={TextField}
                select
                fullWidth
                label="Leave Type"
                size="small"
                error={touched.leaveType && errors.leaveType}
                helperText={touched.leaveType && errors.leaveType}
              >
                {leaveTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field>
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Field
                    name="isHalfDay"
                    as={Checkbox}
                    onChange={(e: any) => {
                      setFieldValue('isHalfDay', e.target.checked);
                      if (e.target.checked) {
                        setFieldValue('endDate', null);
                      }
                    }}
                  />
                }
                label="Half Day"
              />
            </Grid>
            <Grid item xs={4}>
              <DateTimePicker
                label={values.isHalfDay ? 'Date and Time' : 'Start Date and Time'}
                onChange={(value) => setFieldValue('startDate', value)}
                slotProps={{
                  textField: {
                    size: 'small',
                    helperText: touched.startDate && errors.startDate,
                    error: touched.startDate && Boolean(errors.startDate),
                  },
                }}
              />
            </Grid>
            {!values.isHalfDay && (
              <Grid item xs={4}>
                <DateTimePicker
                  label="End Date and Time"
                  onChange={(value) => setFieldValue('endDate', value)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      helperText: touched.endDate && errors.endDate,
                      error: touched.endDate && Boolean(errors.endDate),
                    },
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Editor
                onChange={(value) => {
                  setFieldValue('description', value);
                }}
                placeholder="Leave description"
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              {!editData && (
                <Button type="submit" variant="contained" size="small" color="primary">
                  Submit Leave Request
                </Button>
              )}

              {editData && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => {
                      setFieldValue('status', 'approved');
                      submitForm();
                    }}
                    style={{ marginRight: '10px' }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => setFieldValue('status', 'rejected')}
                  >
                    Reject
                  </Button>
                </>
              )}

              {values.status === 'rejected' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Rejection Reason"
                    onChange={(e) => setFieldValue('rejectionReason', e.target.value)}
                    error={touched.rejectionReason && Boolean(errors.rejectionReason)}
                    helperText={touched.rejectionReason && errors.rejectionReason}
                    sx={{ my: 1 }}
                  />
                  <Button variant="contained" type="submit" sx={{ mt: 2 }}>
                    Submit
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default AddLeaveRequest;
