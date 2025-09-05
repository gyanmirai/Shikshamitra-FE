import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetSelectStatusOptionsQuery } from 'src/redux/memberManagement/memberManagementApi';

import type { IChangeStatusPayload, IChangeStatusFormProps } from './type';

const ChangeStatusForm: React.FC<IChangeStatusFormProps> = ({ open, onClose }) => {
  const { data: selectStatusOptions, isLoading: selectStatusLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelectStatusOptionsQuery,
  });
  const formik = useFormik<IChangeStatusPayload>({
    initialValues: {
      status: 'Active',
      remarks: 'Active for this member.',
    },
    validateOnChange: true,
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Member status changed to ${values.status} successfully`,
      });
      onClose(null, true);
    },
  });

  return selectStatusLoading ? (
    'loading.. ...'
  ) : (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Select Status */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
              <CustomSelect
                label="Select Status *"
                name="status"
                options={selectStatusOptions || []}
                value={formik.values.status}
                onChange={(value) => formik.setFieldValue('status', value)}
                error={!!(formik.touched.status && formik.errors.status)}
                helperText={(formik.touched.status && formik.errors.status) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Remarks */}
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.remarks && formik.errors.remarks)}>
              <TextField
                fullWidth
                name="remarks"
                label="Remarks"
                multiline
                rows={4}
                value={formik.values.remarks}
                onChange={formik.handleChange}
                error={!!(formik.touched.remarks && formik.errors.remarks)}
                helperText={formik.touched.remarks && formik.errors.remarks}
                size="small"
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Save
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChangeStatusForm;
