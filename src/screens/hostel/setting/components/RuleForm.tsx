import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { getRoomInitialValues } from './ruleInitialValue';
import { hostelRoomValidationSchema } from './ruleValidationSchema';

import type { IRoomFormProps } from './type';

const RuleForm: React.FC<IRoomFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getRoomInitialValues(editData),
    validationSchema: hostelRoomValidationSchema,
    onSubmit: (values, formikHelpers) => {
      // Handle form submission
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.ruleName && formik.errors.ruleName) || false}
                >
                  <TextField
                    size="small"
                    label="Rule Name"
                    name="ruleName"
                    fullWidth
                    value={formik.values.ruleName}
                    onChange={formik.handleChange}
                    error={formik.touched.ruleName && Boolean(formik.errors.ruleName)}
                    helperText={formik.touched.ruleName && formik.errors.ruleName}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.ruleDescription && formik.errors.ruleDescription) || false
                  }
                >
                  <TextField
                    size="small"
                    label="Rule Description"
                    name="ruleDescription"
                    fullWidth
                    rows={3}
                    multiline
                    value={formik.values.ruleDescription}
                    onChange={formik.handleChange}
                    error={formik.touched.ruleDescription && Boolean(formik.errors.ruleDescription)}
                    helperText={formik.touched.ruleDescription && formik.errors.ruleDescription}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={12}>
                <UploadBox
                  onDrop={() => {}}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Upload Rule Document</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default RuleForm;
