import type { FormikProps } from 'formik';

import { Box, Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { IVehiclePayload } from '../Components/type';

interface VehicleMaintenanceStepProps {
  formik: FormikProps<IVehiclePayload>;
}

const VehicleMaintenanceStep = ({ formik }: VehicleMaintenanceStepProps) => (
  <Box>
    {/* Insurance Information */}
    <SectionCard title="Insurance Information">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ mb: 1 }}>
          <ShakingTextField
            error={!!(formik.touched.insuranceCompany && formik.errors.insuranceCompany)}
          >
            <TextField
              fullWidth
              name="insuranceCompany"
              label="Insurance Company"
              value={formik.values.insuranceCompany}
              onChange={formik.handleChange}
              error={!!(formik.touched.insuranceCompany && formik.errors.insuranceCompany)}
              helperText={formik.touched.insuranceCompany && formik.errors.insuranceCompany}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.policyNo && formik.errors.policyNo)}>
            <TextField
              fullWidth
              name="policyNo"
              label="Policy No."
              value={formik.values.policyNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('policyNo', value);
              }}
              error={!!(formik.touched.policyNo && formik.errors.policyNo)}
              helperText={formik.touched.policyNo && formik.errors.policyNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.insuranceIssueDate && formik.errors.insuranceIssueDate)}
          >
            <DatePicker
              label="Issue Date"
              value={formik.values.insuranceIssueDate}
              format="DD/MM/YYYY"
              onChange={(date) => formik.setFieldValue('insuranceIssueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.insuranceIssueDate && formik.errors.insuranceIssueDate),
                  helperText: formik.touched.insuranceIssueDate && formik.errors.insuranceIssueDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate)}
          >
            <DatePicker
              label="Expiry Date"
              value={formik.values.insuranceExpiryDate}
              format="DD/MM/YYYY"
              onChange={(date) => formik.setFieldValue('insuranceExpiryDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(
                    formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate
                  ),
                  helperText:
                    formik.touched.insuranceExpiryDate && formik.errors.insuranceExpiryDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={formik.touched.coverageAmount && Boolean(formik.errors.coverageAmount)}
          >
            <NumericFormatCustom
              size="small"
              label="Coverage Amount"
              name="coverageAmount"
              value={formik.values.coverageAmount}
              onChange={formik.handleChange}
              fullWidth
              error={formik.touched.coverageAmount && Boolean(formik.errors.coverageAmount)}
              helperText={formik.touched.coverageAmount && formik.errors.coverageAmount}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>

    {/* PUC Information */}
    <SectionCard title="PUC Information">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.pucCertificateNo && formik.errors.pucCertificateNo)}
          >
            <TextField
              fullWidth
              name="pucCertificateNo"
              label="Certificate No."
              value={formik.values.pucCertificateNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('pucCertificateNo', value);
              }}
              error={!!(formik.touched.pucCertificateNo && formik.errors.pucCertificateNo)}
              helperText={formik.touched.pucCertificateNo && formik.errors.pucCertificateNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.pucIssueDate && formik.errors.pucIssueDate)}>
            <DatePicker
              label="Issue Date"
              format="DD/MM/YYYY"
              value={formik.values.pucIssueDate}
              onChange={(date) => formik.setFieldValue('pucIssueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.pucIssueDate && formik.errors.pucIssueDate),
                  helperText: formik.touched.pucIssueDate && formik.errors.pucIssueDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.pucExpiryDate && formik.errors.pucExpiryDate)}>
            <DatePicker
              label="Expiry Date"
              format="DD/MM/YYYY"
              value={formik.values.pucExpiryDate}
              onChange={(date) => formik.setFieldValue('pucExpiryDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.pucExpiryDate && formik.errors.pucExpiryDate),
                  helperText: formik.touched.pucExpiryDate && formik.errors.pucExpiryDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>

    {/* Fitness Certificate */}
    <SectionCard title="Fitness Certificate">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.fitnessCertificateNo && formik.errors.fitnessCertificateNo)}
          >
            <TextField
              fullWidth
              name="fitnessCertificateNo"
              label="Certificate No."
              value={formik.values.fitnessCertificateNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('fitnessCertificateNo', value);
              }}
              error={!!(formik.touched.fitnessCertificateNo && formik.errors.fitnessCertificateNo)}
              helperText={formik.touched.fitnessCertificateNo && formik.errors.fitnessCertificateNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.fitnessIssueDate && formik.errors.fitnessIssueDate)}
          >
            <DatePicker
              label="Issue Date"
              format="DD/MM/YYYY"
              value={formik.values.fitnessIssueDate}
              onChange={(date) => formik.setFieldValue('fitnessIssueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.fitnessIssueDate && formik.errors.fitnessIssueDate),
                  helperText: formik.touched.fitnessIssueDate && formik.errors.fitnessIssueDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={!!(formik.touched.fitnessExpiryDate && formik.errors.fitnessExpiryDate)}
          >
            <DatePicker
              label="Expiry Date"
              format="DD/MM/YYYY"
              value={formik.values.fitnessExpiryDate}
              onChange={(date) => formik.setFieldValue('fitnessExpiryDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.fitnessExpiryDate && formik.errors.fitnessExpiryDate),
                  helperText: formik.touched.fitnessExpiryDate && formik.errors.fitnessExpiryDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>

    {/* Road Tax */}
    <SectionCard title="Road Tax">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.roadTaxReceiptNo && formik.errors.roadTaxReceiptNo)}
          >
            <TextField
              fullWidth
              name="roadTaxReceiptNo"
              label="Tax Receipt No."
              value={formik.values.roadTaxReceiptNo}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9-\s]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('roadTaxReceiptNo', value);
              }}
              error={!!(formik.touched.roadTaxReceiptNo && formik.errors.roadTaxReceiptNo)}
              helperText={formik.touched.roadTaxReceiptNo && formik.errors.roadTaxReceiptNo}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.roadTaxIssueDate && formik.errors.roadTaxIssueDate)}
          >
            <DatePicker
              label="Issue Date"
              format="DD/MM/YYYY"
              value={formik.values.roadTaxIssueDate}
              onChange={(date) => formik.setFieldValue('roadTaxIssueDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: !!(formik.touched.roadTaxIssueDate && formik.errors.roadTaxIssueDate),
                  helperText: formik.touched.roadTaxIssueDate && formik.errors.roadTaxIssueDate,
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </SectionCard>
  </Box>
);

export default VehicleMaintenanceStep;
