import React from 'react';
import { useFormik } from 'formik';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Grid, TextField, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { initialResourceVerifiedFormValues } from '../initialValue';
import { resourceVerifiedValidationSchema } from '../validationSchema';

import type { IResourceVerifiedAllocateDialogProps } from '../audit-verifaction-interface';

const ResourceVerifiedAllocateDialog: React.FC<IResourceVerifiedAllocateDialogProps> = ({
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: initialResourceVerifiedFormValues,
    validationSchema: resourceVerifiedValidationSchema,
    onSubmit: (values) => {
      // Handle form submission
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.resourceStatusAfterAudit &&
                Boolean(formik.errors.resourceStatusAfterAudit)
              }
            >
              <CustomSelect
                autoFocus
                label="Select Status *"
                options={[]}
                value={formik.values.resourceStatusAfterAudit}
                onChange={(value) => formik.setFieldValue('resourceStatusAfterAudit', value)}
                error={
                  formik.touched.resourceStatusAfterAudit &&
                  Boolean(formik.errors.resourceStatusAfterAudit)
                }
                helperText={
                  formik.touched.resourceStatusAfterAudit && formik.errors.resourceStatusAfterAudit
                    ? String(formik.errors.resourceStatusAfterAudit)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          {/* <Grid size={6} pb="10px">
            <ShakingTextField
              error={formik.touched.allocationTarget && Boolean(formik.errors.allocationTarget)}
            >
              <CustomSelect
                label="Select Allocation Target *"
                options={[]}
                value={formik.values.allocationTarget}
                onChange={(value) => formik.setFieldValue('allocationTarget', value)}
                disabled={isEdit}
                error={formik.touched.allocationTarget && Boolean(formik.errors.allocationTarget)}
                helperText={
                  formik.touched.allocationTarget && formik.errors.allocationTarget
                    ? String(formik.errors.allocationTarget)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>
          <Grid size={6} pb="10px">
            <ShakingTextField
              error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
            >
              <CustomSelect
                label="Select Assigned To *"
                options={[]}
                value={formik.values.assignedTo}
                onChange={(value) => formik.setFieldValue('assignedTo', value)}
                disabled={isEdit}
                error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
                helperText={
                  formik.touched.assignedTo && formik.errors.assignedTo
                    ? String(formik.errors.assignedTo)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={6}>
            <ShakingTextField
              error={formik.touched.allocationDate && Boolean(formik.errors.allocationDate)}
            >
              <DatePicker
                format="DD-MM-YYYY"
                label="Allocation Date *"
                value={formik.values.allocationDate}
                onChange={(value) => {
                  formik.setFieldValue('allocationDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.allocationDate && Boolean(formik.errors.allocationDate),
                    helperText: formik.touched.allocationDate && formik.errors.allocationDate,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={6}>
            <ShakingTextField
              error={formik.touched.expectedReturnDate && Boolean(formik.errors.expectedReturnDate)}
            >
              <DatePicker
                format="DD-MM-YYYY"
                label="Expected Return Date *"
                value={formik.values.expectedReturnDate}
                onChange={(value) => {
                  formik.setFieldValue('expectedReturnDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error:
                      formik.touched.expectedReturnDate &&
                      Boolean(formik.errors.expectedReturnDate),
                    helperText:
                      formik.touched.expectedReturnDate && formik.errors.expectedReturnDate,
                  },
                }}
              />
            </ShakingTextField>
          </Grid> */}

          <Grid size={12} pb="10px">
            <ShakingTextField
              error={
                formik.touched.descriptionAfterResourceAudit &&
                Boolean(formik.errors.descriptionAfterResourceAudit)
              }
            >
              <TextField
                multiline
                rows={4}
                name=""
                label="Write Description *"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={
                  formik.touched.descriptionAfterResourceAudit &&
                  Boolean(formik.errors.descriptionAfterResourceAudit)
                }
                helperText={
                  formik.touched.descriptionAfterResourceAudit &&
                  formik.errors.descriptionAfterResourceAudit
                }
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <CancelButton onClick={onClose} />
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </form>
  );
};
export default ResourceVerifiedAllocateDialog;
