import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { UploadAvatar } from 'src/components/upload';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { shikshaMitraToast } from 'src/components/toast';
import { toLettersTitleCase } from 'src/utils/input-format';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  CardActions,
  SectionCard,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Radio,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import type { SectionProps } from './section-types';

const StudentSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
  onSave,
  onCancel,
}) => (
  <SectionCard
    title="Student"
    headerContent={
      !isMainForm && (
        <CardActions
          isLoading={formik.isSubmitting}
          isEdit={isEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      )
    }
  >
    <Grid size={{ xs: 12, md: 3 }}>
      <UploadAvatar
        maxSize={3145728}
        onDrop={async (acceptedFiles: File[]) => {
          const value = acceptedFiles[0];
          if (!value) return;
          if (value.size > 3 * 1024 * 1024) {
            shikshaMitraToast.error({ message: 'File size should be less than 3MB.' });
            return;
          }
          const base64 = await fileToBase64(value);
          formik.setFieldValue('photo', base64);
          formik.setFieldTouched('photo', true);
        }}
        onDelete={() => {
          formik.setFieldValue('photo', '');
        }}
        value={(formik.values as any).photo}
        error={(formik.touched as any).photo && Boolean((formik.errors as any).photo)}
        disabled={!isEdit.value}
      />
    </Grid>
    <Grid size={{ xs: 12, md: 9 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={(formik.touched as any).firstName && Boolean((formik.errors as any).firstName)}
          >
            <TextField
              key="firstName"
              size="small"
              name="firstName"
              label="First Name *"
              value={(formik.values as any).firstName}
              onBlur={formik.handleBlur}
              error={(formik.touched as any).firstName && Boolean((formik.errors as any).firstName)}
              helperText={(formik.touched as any).firstName && (formik.errors as any).firstName}
              fullWidth
              onChange={(e) => {
                formik.setFieldValue('firstName', toLettersTitleCase(e.target.value));
              }}
              disabled={!isEdit.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={(formik.touched as any).middleName && Boolean((formik.errors as any).middleName)}
          >
            <TextField
              key="middleName"
              size="small"
              label="Middle Name"
              name="middleName"
              value={(formik.values as any).middleName}
              onBlur={formik.handleBlur}
              error={
                (formik.touched as any).middleName && Boolean((formik.errors as any).middleName)
              }
              helperText={(formik.touched as any).middleName && (formik.errors as any).middleName}
              fullWidth
              onChange={(e) => {
                formik.setFieldValue('middleName', toLettersTitleCase(e.target.value));
                formik.setFieldTouched('middleName', true);
              }}
              disabled={!isEdit.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={(formik.touched as any).lastName && Boolean((formik.errors as any).lastName)}
          >
            <TextField
              key="lastName"
              size="small"
              label="Last Name *"
              name="lastName"
              value={(formik.values as any).lastName}
              onBlur={formik.handleBlur}
              error={(formik.touched as any).lastName && Boolean((formik.errors as any).lastName)}
              helperText={(formik.touched as any).lastName && (formik.errors as any).lastName}
              fullWidth
              onChange={(e) => {
                formik.setFieldValue('lastName', toLettersTitleCase(e.target.value));
              }}
              disabled={!isEdit.value}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField
            error={(formik.touched as any).dob && Boolean((formik.errors as any).dob)}
          >
            <DatePicker
              label="Date of Birth *"
              name="dob"
              value={(formik.values as any).dob as any}
              disabled={!isEdit.value}
              format="DD-MM-YYYY"
              disableFuture
              onClose={() => formik.setFieldTouched('dob', true, true)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: (formik.touched as any).dob && Boolean((formik.errors as any).dob),
                  helperText: (formik.touched as any).dob && (formik.errors as any).dob,
                  disabled: !isEdit.value,
                },
              }}
              onChange={(newValue) => {
                formik.setFieldValue('dob', newValue);
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={(formik.touched as any).gender && Boolean((formik.errors as any).gender)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: 40 }}>
              <Typography
                variant="body2"
                color={
                  (formik.touched as any).gender && (formik.errors as any).gender
                    ? 'error.main'
                    : 'text.secondary'
                }
                sx={{ fontWeight: 500 }}
              >
                Gender *
              </Typography>
              <FormControl
                component="fieldset"
                error={!!((formik.touched as any).gender && (formik.errors as any).gender)}
              >
                <RadioGroup
                  row
                  name="gender"
                  value={String((formik.values as any).gender ?? '')}
                  onChange={(e) => {
                    const num = Number(e.target.value) as GenderType;
                    formik.setFieldValue('gender', num);
                  }}
                >
                  {GenderTypeArray.map((i) => (
                    <FormControlLabel
                      key={i}
                      value={String(i)}
                      control={<Radio size="small" />}
                      label={GenderType[i]}
                      disabled={!isEdit.value}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>
          </ShakingTextField>
        </Grid>
      </Grid>
    </Grid>
  </SectionCard>
);

export default StudentSection;
