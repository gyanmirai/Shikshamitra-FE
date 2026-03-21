import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Close } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useGetAvailableStopsOptionsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

interface IAddZoneFormProps {
  open: {
    value: boolean;
    onTrue: () => void;
    onFalse: () => void;
    onToggle: () => void;
    setValue: (value: boolean) => void;
  };
  onClose: (_e: any, isSubmit?: boolean) => void;
  editData?: {
    zoneName: string;
    feeAmount: number;
    assignedStops: number;
    color?: string;
    stops?: string[];
  } | null;
  onSubmit: (values: any) => void;
}

const AddZoneForm: React.FC<IAddZoneFormProps> = ({ open, onClose, editData, onSubmit }) => {
  const { data: stopOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAvailableStopsOptionsQuery,
  });

  const validationSchema = Yup.object({
    zoneName: Yup.string().required('Zone Name is required'),
    feeAmount: Yup.number()
      .required('Fee Amount is required')
      .positive('Fee Amount must be positive'),
    stops: Yup.array().min(1, 'At least one stop is required'),
    color: Yup.string().required('Zone Color is required'),
  });

  const formik = useFormik({
    initialValues: {
      zoneName: editData?.zoneName || '',
      feeAmount: editData?.feeAmount || '',
      stops: editData?.stops || [],
      color: editData?.color || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Zone: ${values.zoneName} has been successfully updated`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Zone: ${values.zoneName} has been successfully added`,
        });
      }
      onSubmit(values);
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.zoneName && formik.errors.zoneName)}>
              <TextField
                fullWidth
                size="small"
                label="Zone Name *"
                name="zoneName"
                value={formik.values.zoneName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.zoneName && formik.errors.zoneName)}
                helperText={formik.touched.zoneName && formik.errors.zoneName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.feeAmount && formik.errors.feeAmount)}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Fee Amount (₹) *"
                name="feeAmount"
                value={formik.values.feeAmount || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[₹,\s]/g, '');
                  formik.setFieldValue('feeAmount', Number(val));
                }}
                error={!!(formik.touched.feeAmount && formik.errors.feeAmount)}
                helperText={formik.touched.feeAmount && formik.errors.feeAmount}
                sx={{
                  width: '100%',
                  padding: '0',
                  borderRadius: 1,
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.stops && formik.errors.stops)}>
              <CustomSelect
                label="Select Stops *"
                options={stopOptions || []}
                value={formik.values.stops}
                onChange={(val) => {
                  const arrayValue = Array.isArray(val) ? val : [val];
                  formik.setFieldValue('stops', arrayValue);
                }}
                error={!!(formik.touched.stops && formik.errors.stops)}
                helperText={(formik.touched.stops && formik.errors.stops) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Zone Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('color', color)}
                initialColor={formik.values.color}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={(e) => onClose(e, false)}
          startIcon={<Close />}
          size="small"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => formik.handleSubmit()}
          startIcon={<Iconify icon="mdi:content-save" />}
          size="small"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AddZoneForm;
