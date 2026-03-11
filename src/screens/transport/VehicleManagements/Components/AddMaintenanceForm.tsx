'use client';

import type { Dayjs } from 'dayjs';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useAddMaintenanceRecordMutation } from 'src/redux/transport/vehicle-management/vehicle-management-api';

import { maintenanceValidationSchema } from './MaintenanceValidationSchema';

interface AddMaintenanceFormProps {
  open: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
  vehicleId: string;
}

interface MaintenanceFormValues {
  serviceType: string[];
  serviceDate: Dayjs | null;
  serviceNotes: string;
  serviceCost: string;
  serviceProvider: string;
  nextServiceDate: Dayjs | null;
  documents: File[];
}

const initialValues: MaintenanceFormValues = {
  serviceType: [],
  serviceDate: null,
  serviceNotes: '',
  serviceCost: '',
  serviceProvider: '',
  nextServiceDate: null,
  documents: [],
};

const AddMaintenanceForm: React.FC<AddMaintenanceFormProps> = ({ open, onClose, vehicleId }) => {
  // Add Maintenance Record
  const { addMaintenanceRecord, isLoading } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddMaintenanceRecordMutation,
  });

  const formik = useFormik({
    initialValues,
    validationSchema: maintenanceValidationSchema,
    onSubmit: async (values) => {
      try {
        // Create FormData to match API specification
        const formData = new FormData();

        // Required fields
        formData.append('serviceType', values.serviceType.join(', ')); // Convert array to comma-separated string
        formData.append('serviceDate', values.serviceDate?.format('YYYY-MM-DD') || '');

        // Optional fields
        if (values.nextServiceDate) {
          formData.append('nextServiceDate', values.nextServiceDate.format('YYYY-MM-DD'));
        }
        if (values.serviceCost) {
          formData.append('cost', values.serviceCost);
        }
        if (values.serviceProvider) {
          formData.append('provider', values.serviceProvider);
        }
        if (values.serviceNotes) {
          formData.append('notes', values.serviceNotes);
        }

        // Append photos array
        if (values.documents && values.documents.length > 0) {
          values.documents.forEach((file: File) => {
            formData.append('photos', file);
          });
        }

        await addMaintenanceRecord({ vehicleId, body: formData }).unwrap();

        shikshaMitraToast.success({
          message: 'Maintenance record added successfully',
        });
        onClose(values, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to add maintenance record',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Service Date */}

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.serviceType && formik.errors.serviceType)}>
              <CustomSelect
                label="Service Type *"
                multiple
                options={[
                  { value: 'Regular', label: 'Regular' },
                  { value: 'Major', label: 'Major' },
                  { value: 'Minor', label: 'Minor' },
                  { value: 'Emergency', label: 'Emergency' },
                  { value: 'Body Work', label: 'Body Work' },
                ]}
                name="serviceType"
                value={formik.values.serviceType}
                onChange={(val) => formik.setFieldValue('serviceType', val)}
                formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                error={!!(formik.touched.serviceType && formik.errors.serviceType)}
                helperText={
                  ((formik.touched.serviceType && formik.errors.serviceType) as string) || ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.serviceDate && formik.errors.serviceDate)}>
              <DatePicker
                value={formik.values.serviceDate}
                label="Service Date *"
                onChange={(date) => formik.setFieldValue('serviceDate', date)}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.serviceDate && formik.errors.serviceDate),
                    helperText: (formik.touched.serviceDate && formik.errors.serviceDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Next Service Due Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.nextServiceDate && formik.errors.nextServiceDate)}
            >
              <DatePicker
                label="Next Service Date"
                value={formik.values.nextServiceDate}
                onChange={(date) => formik.setFieldValue('nextServiceDate', date)}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.nextServiceDate && formik.errors.nextServiceDate),
                    helperText: (formik.touched.nextServiceDate &&
                      formik.errors.nextServiceDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Service Cost & Provider */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.serviceCost && formik.errors.serviceCost)}>
              <NumericFormatCustom
                size="small"
                label="Service Cost"
                name="serviceCost"
                value={formik.values.serviceCost}
                onChange={formik.handleChange}
                fullWidth
                error={!!(formik.touched.serviceCost && formik.errors.serviceCost)}
                helperText={(formik.touched.serviceCost && formik.errors.serviceCost) as string}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.serviceProvider && formik.errors.serviceProvider)}
            >
              <TextField
                name="serviceProvider"
                value={formik.values.serviceProvider}
                onChange={formik.handleChange}
                fullWidth
                label="Service Provider"
                size="small"
                error={!!(formik.touched.serviceProvider && formik.errors.serviceProvider)}
                helperText={
                  (formik.touched.serviceProvider && formik.errors.serviceProvider) as string
                }
              />
            </ShakingTextField>
          </Grid>

          {/* Service Notes */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.serviceNotes && formik.errors.serviceNotes)}>
              <TextField
                name="serviceNotes"
                label="Service Notes"
                value={formik.values.serviceNotes}
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={3}
                size="small"
                error={!!(formik.touched.serviceNotes && formik.errors.serviceNotes)}
                helperText={(formik.touched.serviceNotes && formik.errors.serviceNotes) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Upload Photos */}
          <Grid size={{ xs: 12 }}>
            <CustomUpload
              multiple
              previewCount={6}
              onChange={(files) => {
                formik.setFieldValue('documents', files);
              }}
              value={formik.values.documents}
              label="Upload photos of maintenance"
              outputFormat="file"
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon="mdi:content-save" width={16} height={16} />}
          type="submit"
          size="small"
          variant="contained"
          disabled={isLoading}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AddMaintenanceForm;
