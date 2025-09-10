import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { MuiColorInput } from 'mui-color-input';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { ILeaveTypeFormProps } from './type';

const LeaveTypeForm: React.FC<ILeaveTypeFormProps> = ({ dialog, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      leaveTypeName: editData?.leaveTypeName || '',
      backgroundColor: editData?.backgroundColor || '#4caf50', // default green
    },
    validationSchema: Yup.object().shape({
      leaveTypeName: Yup.string().required('Leave Type Name is required'),
      backgroundColor: Yup.string().required('Color is required'),
    }),
    onSubmit: (values) => {
      console.log('Submitted:', values);
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.leaveTypeName && formik.errors.leaveTypeName)}
                >
                  <TextField
                    size="small"
                    label="Leave Type Name"
                    name="leaveTypeName"
                    fullWidth
                    value={formik.values.leaveTypeName}
                    onChange={formik.handleChange}
                    error={formik.touched.leaveTypeName && Boolean(formik.errors.leaveTypeName)}
                    helperText={formik.touched.leaveTypeName && formik.errors.leaveTypeName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <MuiColorInput
                  format="hex"
                  value={formik.values.backgroundColor}
                  onChange={(color) => formik.setFieldValue('backgroundColor', color)}
                  fullWidth
                  placeholder="backgroundColor"
                  label="Background Color"
                  size="small"
                  error={!!(formik.errors.backgroundColor && formik.touched.backgroundColor)}
                  helperText={formik.touched.backgroundColor && formik.errors.backgroundColor}
                />
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default LeaveTypeForm;
