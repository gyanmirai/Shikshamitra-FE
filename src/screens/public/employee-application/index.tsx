'use client';

import type { FormikTouched } from 'formik';
import type { Dispatch, SetStateAction } from 'react';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { getIn, useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { alpha, useTheme } from '@mui/material/styles';
import { ReligionTypeArray } from 'src/enums/religion';
import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import {
  Box,
  Chip,
  Grid,
  Step,
  Paper,
  Stack,
  Alert,
  Radio,
  Button,
  Select,
  Switch,
  Divider,
  Stepper,
  Tooltip,
  MenuItem,
  StepLabel,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  RadioGroup,
  FormControl,
  FormHelperText,
  LinearProgress,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import {
  validatePhotoFile,
  validateResumeFile,
  emptyWorkExperience,
  isEmptyFamilyMember,
  isEmptyWorkExperience,
  employeeApplicationValidationSchema,
  buildEmployeeApplicationSubmitPayload,
  resolveEmployeeApplicationUploadErrors,
  createEmployeeApplicationInitialValues,
} from './validation';

import type {
  EmployeeApplicationLocation,
  EmployeeApplicationFormValues,
  EmployeeApplicationUploadErrors,
} from './validation';

type PublicApplication = {
  id: string;
  applicationNumber: string;
  status: number | string;
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  mobileNo?: string;
  positionAppliedFor?: string;
  departmentAppliedFor?: string;
  tokenExpiresAt: string;
  canSubmit: boolean;
  isExpired: boolean;
  isSubmitted: boolean;
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
  validationErrors?: Array<{ message?: string; members?: string[] }>;
  error?: {
    message?: string;
    details?: string;
    validationErrors?: Array<{ message?: string; members?: string[] }>;
  };
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const steps = [
  'Personal Information',
  'Family Information',
  'Additional Details',
  'Work Experience',
  'Uploads & Review',
];

const stepErrorRoots = ['personalInfo', 'familyInfo', 'additionalInfo', 'workExperiences'];

const bloodGroups = [
  ['1', 'A+'],
  ['2', 'A-'],
  ['3', 'B+'],
  ['4', 'B-'],
  ['5', 'AB+'],
  ['6', 'AB-'],
  ['7', 'O+'],
  ['8', 'O-'],
];

const getLoadErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message !== 'Failed to fetch') {
    return error.message;
  }
  return 'Application service is unavailable. Please try again later.';
};

const fieldError = (
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>,
  path: string
) => {
  const touched = getIn(formik.touched, path);
  const error = getIn(formik.errors, path);
  return touched && error ? String(error) : undefined;
};

const touchAll = (value: unknown): FormikTouched<any> => {
  if (Array.isArray(value)) {
    return value.map((item) => touchAll(item)) as unknown as FormikTouched<any>;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, touchAll(child)])
    ) as FormikTouched<any>;
  }
  return true as unknown as FormikTouched<any>;
};

const normalizeServerPath = (path: string) =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .map((segment) => {
      if (/^\d+$/.test(segment)) return `[${segment}]`;
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    })
    .join('.')
    .replace(/\.\[/g, '[');

const stepForPath = (path: string) => {
  if (path.startsWith('familyInfo')) return 1;
  if (path.startsWith('additionalInfo')) return 2;
  if (path.startsWith('workExperiences')) return 3;
  if (path.startsWith('resume') || path.startsWith('photo')) return 4;
  return 0;
};

const locationFromOption = (option: any): EmployeeApplicationLocation | null =>
  option?.name && option?.isoCode
    ? {
        name: option.name,
        isoCode: option.isoCode,
        countryCode: option.countryCode,
      }
    : null;

const cityValue = (name?: string | null) => (name ? { name } : null);

const formatLocation = (location?: EmployeeApplicationLocation | null) =>
  [location?.name, location?.isoCode].filter(Boolean).join(' ');

const toDatePickerValue = (val: any): dayjs.Dayjs | null => {
  if (!val) return null;
  if (dayjs.isDayjs(val)) return val;
  const parsed = dayjs(val);
  return parsed.isValid() ? parsed : null;
};

async function parseSubmitProblem(response: Response) {
  let payload: ProblemDetails | null = null;
  try {
    payload = (await response.json()) as ProblemDetails;
  } catch {
    payload = null;
  }

  const fieldErrors: Record<string, string> = {};
  const addFieldError = (path: string | undefined, message: string | undefined) => {
    if (!path || !message) return;
    fieldErrors[normalizeServerPath(path)] = message;
  };

  if (payload?.errors) {
    Object.entries(payload.errors).forEach(([path, messages]) => {
      addFieldError(path, Array.isArray(messages) ? messages[0] : messages);
    });
  }

  const validationErrors = payload?.validationErrors || payload?.error?.validationErrors || [];
  validationErrors.forEach((error) => {
    const member = error.members?.[0];
    addFieldError(member, error.message);
  });

  return {
    summary:
      payload?.detail ||
      payload?.error?.details ||
      payload?.error?.message ||
      payload?.title ||
      'Could not submit application. Please review the form and try again.',
    fieldErrors,
  };
}

// ── SectionCard matching employee-form style ─────────────────────────────────
function SectionCard({
  title,
  children,
  isLoading = false,
}: {
  title?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 2,
        position: 'relative',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        overflow: 'clip',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {isLoading && (
        <LinearProgress sx={{ position: 'absolute', left: 0, top: 0, width: '100%', zIndex: 1 }} />
      )}
      {title && (
        <Box
          sx={{
            borderBottom: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
            pb: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {title}
          </Typography>
        </Box>
      )}
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Paper>
  );
}

// ── Location Fields ───────────────────────────────────────────────────────────
function LocationFields({
  formik,
  basePath,
  required = false,
  testId,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
  basePath: string;
  required?: boolean;
  testId?: string;
}) {
  const country = getIn(formik.values, `${basePath}.country`) as EmployeeApplicationLocation | null;
  const state = getIn(formik.values, `${basePath}.state`) as EmployeeApplicationLocation | null;
  const city = getIn(formik.values, `${basePath}.city`) as string;

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }} data-testid={testId ? `${testId}-country` : undefined}>
        <ShakingTextField error={Boolean(fieldError(formik, `${basePath}.country`))}>
          <CountryComponent
            value={country || undefined}
            onChange={(_, value) => {
              formik.setFieldValue(`${basePath}.country`, locationFromOption(value));
              formik.setFieldValue(`${basePath}.state`, null);
              formik.setFieldValue(`${basePath}.city`, '');
            }}
            textFieldProps={{
              label: required ? 'Country *' : 'Country',
              error: Boolean(fieldError(formik, `${basePath}.country`)),
              helperText: fieldError(formik, `${basePath}.country`) || undefined,
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} data-testid={testId ? `${testId}-state` : undefined}>
        <ShakingTextField error={Boolean(fieldError(formik, `${basePath}.state`))}>
          <StateComponent
            countryValue={country || undefined}
            value={state || undefined}
            onChange={(_, value) => {
              formik.setFieldValue(`${basePath}.state`, locationFromOption(value));
              formik.setFieldValue(`${basePath}.city`, '');
            }}
            textFieldProps={{
              label: required ? 'State *' : 'State',
              error: Boolean(fieldError(formik, `${basePath}.state`)),
              helperText: fieldError(formik, `${basePath}.state`) || undefined,
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} data-testid={testId ? `${testId}-city` : undefined}>
        <ShakingTextField error={Boolean(fieldError(formik, `${basePath}.city`))}>
          <CityComponent
            countryValue={country || undefined}
            stateValue={state || undefined}
            value={cityValue(city) as any}
            onChange={(_, value: any) =>
              formik.setFieldValue(`${basePath}.city`, value?.name || '')
            }
            textFieldProps={{
              label: required ? 'City *' : 'City',
              error: Boolean(fieldError(formik, `${basePath}.city`)),
              helperText: fieldError(formik, `${basePath}.city`) || undefined,
            }}
          />
        </ShakingTextField>
      </Grid>
    </>
  );
}

// ── Family Member Section ─────────────────────────────────────────────────────
function FamilyMemberSection({
  formik,
  title,
  basePath,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
  title: string;
  basePath: string;
}) {
  const fe = (path: string) => fieldError(formik, `${basePath}.${path}`);
  const fp = (path: string) => `${basePath}.${path}`;

  return (
    <SectionCard title={title}>
      {/* Name */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(fe('name'))}>
          <TextField
            fullWidth
            size="small"
            label="Full Name"
            name={fp('name')}
            value={getIn(formik.values, fp('name')) || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              formik.setFieldValue(fp('name'), val);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('name'))}
            helperText={fe('name')}
          />
        </ShakingTextField>
      </Grid>

      {/* Occupation */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Occupation"
          name={fp('occupation')}
          value={getIn(formik.values, fp('occupation')) || ''}
          onChange={(e) => {
            const val = e.target.value;
            const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
            if (/^[A-Za-z ]*$/.test(newName)) {
              formik.setFieldValue(fp('occupation'), newName);
            }
          }}
          onBlur={formik.handleBlur}
          error={Boolean(fe('occupation'))}
          helperText={fe('occupation')}
        />
      </Grid>

      {/* Mobile No */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(fe('mobileNo'))}>
          <PhoneInput
            name={fp('mobileNo')}
            label="Mobile No."
            value={getIn(formik.values, fp('mobileNo')) || ''}
            onChange={(value) => {
              formik.setFieldValue(fp('mobileNo'), value);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('mobileNo'))}
            helperText={fe('mobileNo')}
          />
        </ShakingTextField>
      </Grid>

      {/* Address Line 1 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(fe('address1'))}>
          <TextField
            fullWidth
            size="small"
            label="Building No./Flat/House No."
            name={fp('address1')}
            value={getIn(formik.values, fp('address1')) || ''}
            onChange={formik.handleChange}
            onBlur={(e) => {
              formik.setFieldValue(fp('address1'), e.target.value.trim());
              formik.handleBlur(e);
            }}
            error={Boolean(fe('address1'))}
            helperText={fe('address1')}
          />
        </ShakingTextField>
      </Grid>

      {/* Address Line 2 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(fe('address2'))}>
          <TextField
            fullWidth
            size="small"
            label="Area/Locality/Road Name"
            name={fp('address2')}
            value={getIn(formik.values, fp('address2')) || ''}
            onChange={formik.handleChange}
            onBlur={(e) => {
              formik.setFieldValue(fp('address2'), e.target.value.trim());
              formik.handleBlur(e);
            }}
            error={Boolean(fe('address2'))}
            helperText={fe('address2')}
          />
        </ShakingTextField>
      </Grid>

      {/* Address Line 3 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Landmark"
          name={fp('address3')}
          value={getIn(formik.values, fp('address3')) || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fe('address3'))}
          helperText={fe('address3')}
        />
      </Grid>

      {/* Country / State / City */}
      <LocationFields formik={formik} basePath={basePath} />

      {/* Pincode */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ShakingTextField error={Boolean(fe('pincode'))}>
          <TextField
            fullWidth
            size="small"
            label="PIN Code"
            name={fp('pincode')}
            value={getIn(formik.values, fp('pincode')) || ''}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                formik.setFieldValue(fp('pincode'), value);
              }
            }}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('pincode'))}
            helperText={fe('pincode')}
          />
        </ShakingTextField>
      </Grid>
    </SectionCard>
  );
}

// ── Step 1: Personal Information ──────────────────────────────────────────────
function PersonalStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  const fe = (path: string) => fieldError(formik, `personalInfo.${path}`);
  const fp = (path: string) => `personalInfo.${path}`;

  return (
    <Stack spacing={0} data-testid="employee-application-step-personal">
      {/* Basic Details */}
      <SectionCard title="Basic Details">
        {/* First Name */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('firstName'))}>
            <TextField
              fullWidth
              size="small"
              label="First Name *"
              name={fp('firstName')}
              value={getIn(formik.values, fp('firstName')) || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue(fp('firstName'), newName);
                }
              }}
              onBlur={formik.handleBlur}
              error={Boolean(fe('firstName'))}
              helperText={fe('firstName')}
            />
          </ShakingTextField>
        </Grid>

        {/* Middle Name */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Middle Name"
            name={fp('middleName')}
            value={getIn(formik.values, fp('middleName')) || ''}
            onChange={(e) => {
              const val = e.target.value;
              const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
              if (/^[A-Za-z ]*$/.test(newName)) {
                formik.setFieldValue(fp('middleName'), newName);
              }
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('middleName'))}
            helperText={fe('middleName')}
          />
        </Grid>

        {/* Last Name */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('lastName'))}>
            <TextField
              fullWidth
              size="small"
              label="Last Name *"
              name={fp('lastName')}
              value={getIn(formik.values, fp('lastName')) || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue(fp('lastName'), newName);
                }
              }}
              onBlur={formik.handleBlur}
              error={Boolean(fe('lastName'))}
              helperText={fe('lastName')}
            />
          </ShakingTextField>
        </Grid>

        {/* Short Name */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Short Name"
            name={fp('shortName')}
            value={getIn(formik.values, fp('shortName')) || ''}
            onChange={(e) => {
              const val = e.target.value;
              const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
              formik.setFieldValue(fp('shortName'), newName);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('shortName'))}
            helperText={fe('shortName')}
          />
        </Grid>

        {/* Date of Birth */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('dateOfBirth'))}>
            <DatePicker
              label="Date of Birth *"
              value={toDatePickerValue(getIn(formik.values, fp('dateOfBirth')))}
              onChange={(value) => {
                formik.setFieldValue(fp('dateOfBirth'), value);
              }}
              disableFuture
              minDate={dayjs('1947-01-01')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  placeholder: 'DD/MM/YYYY',
                  error: Boolean(fe('dateOfBirth')),
                  helperText: fe('dateOfBirth'),
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* Religion */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('religion'))}>
            <FormControl fullWidth size="small" error={Boolean(fe('religion'))}>
              <InputLabel id="religion-label">Religion *</InputLabel>
              <Select
                labelId="religion-label"
                id="religion"
                name={fp('religion')}
                value={getIn(formik.values, fp('religion')) ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Religion *"
              >
                {ReligionTypeArray.map((option) => (
                  <MenuItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {fe('religion') && <FormHelperText>{fe('religion')}</FormHelperText>}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Category */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('casteType'))}>
            <FormControl fullWidth size="small" error={Boolean(fe('casteType'))}>
              <InputLabel id="category-label">Category *</InputLabel>
              <Select
                labelId="category-label"
                id="casteType"
                name={fp('casteType')}
                value={getIn(formik.values, fp('casteType')) ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Category *"
              >
                <MenuItem value="0">General</MenuItem>
                <MenuItem value="1">OBC</MenuItem>
                <MenuItem value="2">SC</MenuItem>
                <MenuItem value="3">ST</MenuItem>
              </Select>
              {fe('casteType') && <FormHelperText>{fe('casteType')}</FormHelperText>}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Family Caste */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Family Caste *"
            name={fp('familyCaste')}
            value={getIn(formik.values, fp('familyCaste')) || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z\s]/g, '') || '';
              const newName = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
              formik.setFieldValue(fp('familyCaste'), newName);
            }}
            onBlur={(e) => {
              formik.setFieldValue(fp('familyCaste'), e.target.value.trim());
              formik.handleBlur(e);
            }}
            error={Boolean(fe('familyCaste'))}
            helperText={fe('familyCaste')}
          />
        </Grid>

        {/* Marital Status */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('maritalStatus'))}>
            <FormControl fullWidth size="small" error={Boolean(fe('maritalStatus'))}>
              <InputLabel id="marital-status-label">Marital Status *</InputLabel>
              <Select
                labelId="marital-status-label"
                id="maritalStatus"
                name={fp('maritalStatus')}
                value={getIn(formik.values, fp('maritalStatus')) ?? ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Marital Status *"
              >
                <MenuItem value="0">Unmarried</MenuItem>
                <MenuItem value="1">Married</MenuItem>
                <MenuItem value="2">Divorced</MenuItem>
                <MenuItem value="3">Widowed</MenuItem>
              </Select>
              {fe('maritalStatus') && <FormHelperText>{fe('maritalStatus')}</FormHelperText>}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Blood Group */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="blood-group-label">Blood Group</InputLabel>
            <Select
              labelId="blood-group-label"
              id="bloodGroup"
              name={fp('bloodGroup')}
              value={getIn(formik.values, fp('bloodGroup')) ?? ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Blood Group"
            >
              <MenuItem value="">Not selected</MenuItem>
              {bloodGroups.map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Gender — Radio group */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <ShakingTextField error={Boolean(fe('gender'))}>
            <FormControl fullWidth error={Boolean(fe('gender'))}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    minWidth: 70,
                    flexShrink: 0,
                    color: fe('gender') ? 'error.main' : 'text.secondary',
                  }}
                >
                  Gender *
                </Typography>
                <RadioGroup
                  row
                  name={fp('gender')}
                  value={getIn(formik.values, fp('gender')) ?? ''}
                  onChange={formik.handleChange}
                  sx={{ alignItems: 'center' }}
                >
                  <FormControlLabel
                    value="1"
                    control={<Radio size="small" />}
                    label="Male"
                    sx={{ mr: 2 }}
                  />
                  <FormControlLabel value="2" control={<Radio size="small" />} label="Female" />
                </RadioGroup>
              </Box>
              {/* Helper text below the row — prevents inline shift on resolve */}
              <FormHelperText sx={{ ml: 0, minHeight: '1.25em' }}>
                {fe('gender') || ''}
              </FormHelperText>
            </FormControl>
          </ShakingTextField>
        </Grid>
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title="Contact Information">
        {/* Email */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('email'))}>
            <TextField
              fullWidth
              size="small"
              label="Email *"
              name={fp('email')}
              value={getIn(formik.values, fp('email')) || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(fe('email'))}
              helperText={fe('email')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 0.5 }}>
                      <Iconify icon="mdi-light:email" width={22} color="text.disabled" />
                      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </ShakingTextField>
        </Grid>

        {/* Primary Mobile */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('mobileNo'))}>
            <PhoneInput
              name={fp('mobileNo')}
              label="Primary Contact No. *"
              value={getIn(formik.values, fp('mobileNo')) || ''}
              onChange={(value) => {
                formik.setFieldValue(fp('mobileNo'), value);
                formik.validateField(fp('mobileNo'));
              }}
              onBlur={formik.handleBlur}
              error={Boolean(fe('mobileNo'))}
              helperText={fe('mobileNo')}
            />
          </ShakingTextField>
        </Grid>

        {/* Secondary Mobile */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <PhoneInput
            name={fp('secondaryMobileNo')}
            label="Secondary Contact No."
            value={getIn(formik.values, fp('secondaryMobileNo')) || ''}
            onChange={(value) => {
              formik.setFieldValue(fp('secondaryMobileNo'), value);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('secondaryMobileNo'))}
            helperText={fe('secondaryMobileNo')}
          />
        </Grid>
      </SectionCard>

      {/* Professional Details */}
      <SectionCard title="Professional Details">
        {/* Department */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Department"
            name={fp('department')}
            value={getIn(formik.values, fp('department')) || ''}
            onChange={(e) => {
              const val = e.target.value;
              const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
              if (/^[A-Za-z ]*$/.test(newName)) {
                formik.setFieldValue(fp('department'), newName);
              }
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('department'))}
            helperText={fe('department')}
          />
        </Grid>

        {/* Designation */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Designation"
            name={fp('designation')}
            value={getIn(formik.values, fp('designation')) || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              formik.setFieldValue(fp('designation'), val);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(fe('designation'))}
            helperText={fe('designation')}
          />
        </Grid>

        {/* Teaching Staff */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(getIn(formik.values, fp('isTeaching')))}
                onChange={(e, val) => formik.setFieldValue(fp('isTeaching'), val)}
                name={fp('isTeaching')}
              />
            }
            label="Teaching Staff?"
          />
        </Grid>

        {/* Qualification */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Qualification"
            multiline
            minRows={3}
            name={fp('qualification')}
            value={getIn(formik.values, fp('qualification')) || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(fe('qualification'))}
            helperText={fe('qualification')}
          />
        </Grid>

        {/* Identification Mark */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Identification Mark"
            multiline
            minRows={3}
            name={fp('identificationMark1')}
            value={getIn(formik.values, fp('identificationMark1')) || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(fe('identificationMark1'))}
            helperText={fe('identificationMark1')}
          />
        </Grid>
      </SectionCard>

      {/* Address Details */}
      <SectionCard title="Address Details">
        {/* Address Line 1 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('address1'))}>
            <TextField
              fullWidth
              size="small"
              label="Building No./Flat/House No. *"
              name={fp('address1')}
              value={getIn(formik.values, fp('address1')) || ''}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.setFieldValue(fp('address1'), e.target.value.trim());
                formik.handleBlur(e);
              }}
              error={Boolean(fe('address1'))}
              helperText={fe('address1')}
            />
          </ShakingTextField>
        </Grid>

        {/* Address Line 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('address2'))}>
            <TextField
              fullWidth
              size="small"
              label="Area/Locality/Road Name *"
              name={fp('address2')}
              value={getIn(formik.values, fp('address2')) || ''}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.setFieldValue(fp('address2'), e.target.value.trim());
                formik.handleBlur(e);
              }}
              error={Boolean(fe('address2'))}
              helperText={fe('address2')}
            />
          </ShakingTextField>
        </Grid>

        {/* Address Line 3 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Landmark"
            name={fp('address3')}
            value={getIn(formik.values, fp('address3')) || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(fe('address3'))}
            helperText={fe('address3')}
          />
        </Grid>

        {/* Country / State / City */}
        <LocationFields
          formik={formik}
          basePath="personalInfo"
          required
          testId="employee-application-personal-address"
        />

        {/* Pin Code */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('pincode'))}>
            <TextField
              fullWidth
              size="small"
              label="PIN Code"
              name={fp('pincode')}
              value={getIn(formik.values, fp('pincode')) || ''}
              inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  formik.setFieldValue(fp('pincode'), value);
                  formik.validateField(fp('pincode'));
                }
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
              }}
              onBlur={formik.handleBlur}
              error={Boolean(fe('pincode'))}
              helperText={fe('pincode')}
            />
          </ShakingTextField>
        </Grid>
      </SectionCard>
    </Stack>
  );
}

// ── Step 2: Family Information ────────────────────────────────────────────────
function FamilyStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  return (
    <Stack spacing={0} data-testid="employee-application-step-family">
      <FamilyMemberSection
        formik={formik}
        title="Father Details"
        basePath="familyInfo.fatherDetails"
      />
      <FamilyMemberSection
        formik={formik}
        title="Mother Details"
        basePath="familyInfo.motherDetails"
      />
      <FamilyMemberSection
        formik={formik}
        title="Spouse Details"
        basePath="familyInfo.spouseDetails"
      />
    </Stack>
  );
}

// ── Step 3: Additional Details ────────────────────────────────────────────────
function AdditionalStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  const fe = (path: string) => fieldError(formik, `additionalInfo.${path}`);
  const fp = (path: string) => `additionalInfo.${path}`;

  return (
    <Stack spacing={0} data-testid="employee-application-step-additional">
      <SectionCard title="Additional Details">
        {/* Person with Disability */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('personWithDisability'))}>
            <FormControl fullWidth size="small" error={Boolean(fe('personWithDisability'))}>
              <InputLabel>Person with Disability</InputLabel>
              <Select
                label="Person with Disability"
                name={fp('personWithDisability')}
                value={getIn(formik.values, fp('personWithDisability')) ? 'Yes' : 'No'}
                onChange={(e) => {
                  formik.setFieldValue(fp('personWithDisability'), e.target.value === 'Yes');
                }}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
              {fe('personWithDisability') && (
                <FormHelperText>{fe('personWithDisability')}</FormHelperText>
              )}
            </FormControl>
          </ShakingTextField>
        </Grid>

        {/* Second Language */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ShakingTextField error={Boolean(fe('secondLanguage'))}>
            <TextField
              fullWidth
              size="small"
              label="Second Language"
              name={fp('secondLanguage')}
              value={getIn(formik.values, fp('secondLanguage')) || ''}
              onChange={(e) => {
                const val = e.target.value;
                const newName = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                if (/^[A-Za-z ]*$/.test(newName)) {
                  formik.setFieldValue(fp('secondLanguage'), newName);
                }
              }}
              onBlur={formik.handleBlur}
              error={Boolean(fe('secondLanguage'))}
              helperText={fe('secondLanguage')}
            />
          </ShakingTextField>
        </Grid>

        {/* Library Member */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(getIn(formik.values, fp('isLibraryMember')))}
                onChange={(e, val) => formik.setFieldValue(fp('isLibraryMember'), val)}
                name={fp('isLibraryMember')}
              />
            }
            label="Library Member?"
          />
        </Grid>

        {/* Transport Member */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(getIn(formik.values, fp('isTransportMember')))}
                onChange={(e, val) => formik.setFieldValue(fp('isTransportMember'), val)}
                name={fp('isTransportMember')}
              />
            }
            label="Transport Member?"
          />
        </Grid>
      </SectionCard>
    </Stack>
  );
}

// ── Step 4: Work Experience ───────────────────────────────────────────────────
function WorkExperienceStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  const addExperience = () =>
    formik.setFieldValue('workExperiences', [
      ...formik.values.workExperiences,
      emptyWorkExperience(),
    ]);

  const removeExperience = (index: number) =>
    formik.setFieldValue(
      'workExperiences',
      formik.values.workExperiences.filter((_, itemIndex) => itemIndex !== index)
    );

  return (
    <Stack spacing={2} data-testid="employee-application-step-experience">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={700}>
          Work Experience
        </Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={(event) => {
            event.preventDefault();
            addExperience();
          }}
        >
          Add Experience
        </Button>
      </Stack>

      {formik.values.workExperiences.length === 0 && (
        <Alert severity="info">Add prior work experience if applicable.</Alert>
      )}

      {formik.values.workExperiences.map((experience, index) => {
        const basePath = `workExperiences[${index}]`;
        const fe = (path: string) => fieldError(formik, `${basePath}.${path}`);
        const fp = (path: string) => `${basePath}.${path}`;
        return (
          <Paper
            key={index}
            elevation={0}
            sx={(theme) => ({
              p: { xs: 1.5, md: 2 },
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            })}
            data-testid="employee-application-work-experience-row"
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" fontWeight={700}>
                  Experience {index + 1}
                </Typography>
                <Tooltip title="Remove experience">
                  <IconButton
                    type="button"
                    color="error"
                    size="small"
                    onClick={(event) => {
                      event.preventDefault();
                      removeExperience(index);
                    }}
                  >
                    <Iconify icon="mdi:delete-outline" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Grid container spacing={3}>
                {/* Organization */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(fe('mediumStageName'))}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Organization"
                      name={fp('mediumStageName')}
                      value={getIn(formik.values, fp('mediumStageName')) || ''}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^a-zA-Z0-9\-_\s]/g, '');
                        const capitalized = sanitized.replace(/\b\w/g, (c) => c.toUpperCase());
                        formik.setFieldValue(fp('mediumStageName'), capitalized);
                      }}
                      onBlur={(e) => {
                        formik.setFieldValue(fp('mediumStageName'), e.target.value.trim());
                        formik.handleBlur(e);
                      }}
                      error={Boolean(fe('mediumStageName'))}
                      helperText={fe('mediumStageName')}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Designation */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(fe('designation'))}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Designation"
                      name={fp('designation')}
                      value={getIn(formik.values, fp('designation')) || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        formik.setFieldValue(fp('designation'), value);
                      }}
                      onBlur={(e) => {
                        formik.setFieldValue(fp('designation'), e.target.value.trim());
                        formik.handleBlur(e);
                      }}
                      error={Boolean(fe('designation'))}
                      helperText={fe('designation')}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Department */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Department"
                    name={fp('department')}
                    value={getIn(formik.values, fp('department')) || ''}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^a-zA-Z0-9\-_\s]/g, '');
                      const capitalized = sanitized.replace(/\b\w/g, (c) => c.toUpperCase());
                      formik.setFieldValue(fp('department'), capitalized);
                    }}
                    onBlur={(e) => {
                      formik.setFieldValue(fp('department'), e.target.value.trim());
                      formik.handleBlur(e);
                    }}
                    error={Boolean(fe('department'))}
                    helperText={fe('department')}
                  />
                </Grid>

                {/* Location */}
                <LocationFields formik={formik} basePath={basePath} />

                {/* Start Date */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(fe('startDate'))}>
                    <DatePicker
                      label="Start Date"
                      value={toDatePickerValue(getIn(formik.values, fp('startDate')))}
                      onChange={(value) => {
                        formik.setFieldValue(fp('startDate'), value);
                      }}
                      disableFuture
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          placeholder: 'DD/MM/YYYY',
                          error: Boolean(fe('startDate')),
                          helperText: fe('startDate'),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* End Date */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={Boolean(fe('endDate'))}>
                    <DatePicker
                      label="End Date"
                      value={toDatePickerValue(getIn(formik.values, fp('endDate')))}
                      onChange={(value) => {
                        formik.setFieldValue(fp('endDate'), value);
                      }}
                      disableFuture
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          placeholder: 'DD/MM/YYYY',
                          error: Boolean(fe('endDate')),
                          helperText: fe('endDate'),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}

// ── Step 5: Uploads & Review ──────────────────────────────────────────────────
function SelectedUploadFile({
  file,
  label,
  onRemove,
  testId,
}: {
  file: File;
  label: string;
  onRemove: () => void;
  testId: string;
}) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <Paper variant="outlined" sx={{ p: 1.25 }} data-testid={testId}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" noWrap title={file.name}>
            {file.name}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Button
            component="a"
            href={previewUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            disabled={!previewUrl}
            startIcon={<Iconify icon="mdi:open-in-new" />}
            data-testid={`${testId}-view`}
          >
            View
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={onRemove}
            aria-label={`Remove ${label.toLowerCase()}`}
            data-testid={`${testId}-remove`}
          >
            <Iconify icon="mdi:close-circle-outline" />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

function UploadsReviewStep({
  formik,
  resume,
  photo,
  setResume,
  setPhoto,
  uploadErrors,
  setUploadErrors,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
  resume: File | null;
  photo: File | null;
  setResume: (file: File | null) => void;
  setPhoto: (file: File | null) => void;
  uploadErrors: EmployeeApplicationUploadErrors;
  setUploadErrors: Dispatch<SetStateAction<EmployeeApplicationUploadErrors>>;
}) {
  const father = formik.values.familyInfo.fatherDetails;
  const mother = formik.values.familyInfo.motherDetails;
  const spouse = formik.values.familyInfo.spouseDetails;
  const familyCount = [father, mother, spouse].filter(
    (member) => !isEmptyFamilyMember(member)
  ).length;
  const experienceCount = formik.values.workExperiences.filter(
    (item) => !isEmptyWorkExperience(item)
  ).length;

  return (
    <Stack spacing={3} data-testid="employee-application-step-uploads-review">
      {uploadErrors.resume || uploadErrors.photo ? (
        <Alert severity="error">Upload the required documents before submitting.</Alert>
      ) : null}

      <SectionCard title="Upload Documents">
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-upload-outline" />}
              color={uploadErrors.resume ? 'error' : 'primary'}
              aria-invalid={Boolean(uploadErrors.resume)}
              aria-describedby={
                uploadErrors.resume ? 'employee-application-resume-error' : undefined
              }
            >
              Upload Resume
              <input
                hidden
                type="file"
                accept=".pdf,.doc,.docx"
                data-testid="employee-application-resume-input"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  const validationError = validateResumeFile(file);
                  setResume(validationError ? null : file);
                  setUploadErrors((current) => ({ ...current, resume: validationError }));
                  event.currentTarget.value = '';
                }}
              />
            </Button>
            {resume ? (
              <SelectedUploadFile
                file={resume}
                label="Resume"
                onRemove={() => {
                  setResume(null);
                  setUploadErrors((current) => ({ ...current, resume: null }));
                }}
                testId="employee-application-resume"
              />
            ) : (
              <FormHelperText
                id="employee-application-resume-error"
                error={Boolean(uploadErrors.resume)}
              >
                {uploadErrors.resume || 'PDF, DOC, DOCX up to 10MB'}
              </FormHelperText>
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<Iconify icon="mdi:image-plus-outline" />}
              color={uploadErrors.photo ? 'error' : 'primary'}
              aria-invalid={Boolean(uploadErrors.photo)}
              aria-describedby={uploadErrors.photo ? 'employee-application-photo-error' : undefined}
            >
              Upload Photo
              <input
                hidden
                type="file"
                accept="image/*"
                data-testid="employee-application-photo-input"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  const validationError = validatePhotoFile(file);
                  setPhoto(validationError ? null : file);
                  setUploadErrors((current) => ({ ...current, photo: validationError }));
                  event.currentTarget.value = '';
                }}
              />
            </Button>
            {photo ? (
              <SelectedUploadFile
                file={photo}
                label="Photo"
                onRemove={() => {
                  setPhoto(null);
                  setUploadErrors((current) => ({ ...current, photo: null }));
                }}
                testId="employee-application-photo"
              />
            ) : (
              <FormHelperText
                id="employee-application-photo-error"
                error={Boolean(uploadErrors.photo)}
              >
                {uploadErrors.photo || 'Image up to 5MB'}
              </FormHelperText>
            )}
          </Stack>
        </Grid>
      </SectionCard>

      <SectionCard title="Review Summary">
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Applicant"
            value={`${formik.values.personalInfo.firstName} ${formik.values.personalInfo.lastName}`.trim()}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Contact"
            value={[formik.values.personalInfo.email, formik.values.personalInfo.mobileNo]
              .filter(Boolean)
              .join(' / ')}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Department / Designation"
            value={[formik.values.personalInfo.department, formik.values.personalInfo.designation]
              .filter(Boolean)
              .join(' / ')}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Address"
            value={[
              formik.values.personalInfo.city,
              formatLocation(formik.values.personalInfo.state),
              formatLocation(formik.values.personalInfo.country),
            ]
              .filter(Boolean)
              .join(', ')}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Family Records"
            value={familyCount}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Work Experience Records"
            value={experienceCount}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </SectionCard>
    </Stack>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PublicEmployeeApplicationScreen({ token }: { token: string }) {
  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<EmployeeApplicationUploadErrors>({
    resume: null,
    photo: null,
  });

  const formik = useFormik<EmployeeApplicationFormValues>({
    initialValues: createEmployeeApplicationInitialValues(application || undefined),
    enableReinitialize: true,
    validationSchema: employeeApplicationValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      const nextUploadErrors = resolveEmployeeApplicationUploadErrors(uploadErrors, resume, photo);
      if (nextUploadErrors.resume || nextUploadErrors.photo) {
        setUploadErrors(nextUploadErrors);
        setError(null);
        setActiveStep(4);
        helpers.setSubmitting(false);
        return;
      }

      setError(null);
      setUploadErrors({ resume: null, photo: null });

      try {
        const body = new FormData();
        body.append('data', JSON.stringify(buildEmployeeApplicationSubmitPayload(values)));
        if (resume) body.append('resume', resume);
        if (photo) body.append('photo', photo);

        const response = await fetch(`${API_BASE}/public/employee-applications/${token}/submit`, {
          method: 'POST',
          body,
        });

        if (!response.ok) {
          const problem = await parseSubmitProblem(response);
          Object.entries(problem.fieldErrors).forEach(([path, message]) => {
            helpers.setFieldError(path, message);
          });
          helpers.setTouched(touchAll(values), false);
          const firstPath = Object.keys(problem.fieldErrors)[0];
          if (firstPath) {
            setActiveStep(stepForPath(firstPath));
          }
          throw new Error(problem.summary);
        }

        setSubmitted(true);
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : 'Could not submit application.'
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/public/employee-applications/${token}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('This application link is invalid or no longer available.');
        }

        const payload = (await response.json()) as PublicApplication;
        if (!mounted) return;
        setApplication(payload);
      } catch (loadError) {
        if (mounted) {
          setError(getLoadErrorMessage(loadError));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const validateStep = async () => {
    // Run formik's full validation — this is the only call that actually
    // populates formik.errors, making inline fieldError() work correctly.
    const allErrors = await formik.validateForm();

    const root = stepErrorRoots[activeStep];

    // Check whether the current step has any errors
    const hasErrors = root ? Boolean((allErrors as any)[root]) : Object.keys(allErrors).length > 0;

    if (hasErrors) {
      // Touch ONLY the current step's fields so that:
      //   - Inline helper text appears under each invalid field
      //   - Family / Additional / Work / Upload fields on other steps
      //     are NOT touched and don't show spurious errors
      formik.setTouched(
        root ? { [root]: touchAll((formik.values as any)[root]) } : touchAll(formik.values),
        false // don't re-trigger validateForm after setTouched
      );
      setError('Please fix the highlighted fields before continuing.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = async () => {
    if (!(await validateStep())) return;
    setActiveStep((current) => {
      const next = Math.min(current + 1, steps.length - 1);
      setMaxVisitedStep((visited) => Math.max(visited, next));
      return next;
    });
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <PersonalStep formik={formik} />;
      case 1:
        return <FamilyStep formik={formik} />;
      case 2:
        return <AdditionalStep formik={formik} />;
      case 3:
        return <WorkExperienceStep formik={formik} />;
      default:
        return (
          <UploadsReviewStep
            formik={formik}
            resume={resume}
            photo={photo}
            setResume={setResume}
            setPhoto={setPhoto}
            uploadErrors={uploadErrors}
            setUploadErrors={setUploadErrors}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading application
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error && !application) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}
        data-testid="employee-application-unavailable"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (submitted || application?.isSubmitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          bgcolor: 'background.neutral',
        }}
        data-testid="employee-application-submit-success"
      >
        <Paper variant="outlined" sx={{ maxWidth: 560, p: 4, borderRadius: 1 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Iconify icon="mdi:check-circle-outline" width={54} color="success.main" />
            <Typography variant="h5">Application submitted</Typography>
            <Typography variant="body2" color="text.secondary">
              HR has received your details. You can close this page.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (application?.isExpired || !application?.canSubmit) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          bgcolor: 'background.neutral',
        }}
        data-testid="employee-application-unavailable"
      >
        <Paper variant="outlined" sx={{ maxWidth: 560, p: 4, borderRadius: 1 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Iconify icon="mdi:timer-off-outline" width={54} />
            <Typography variant="h5">Application link unavailable</Typography>
            <Typography variant="body2" color="text.secondary">
              This link is no longer available. Please contact HR for help.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{ minHeight: '100vh', bgcolor: 'background.neutral', p: { xs: 2, md: 4 } }}
      data-testid="employee-application-public-form"
    >
      <Grid container spacing={3} sx={{ maxWidth: 1240, mx: 'auto' }}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              position: { md: 'sticky' },
              top: 24,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2}>
              <Iconify icon="mdi:account-tie-outline" width={42} />
              <Box>
                <Typography variant="h5">Employee Application</Typography>
                <Typography variant="body2" color="text.secondary">
                  {application?.applicationNumber}
                </Typography>
              </Box>
              <Chip
                label={application?.positionAppliedFor || 'Position to be confirmed'}
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Divider />
              <Alert severity="info" variant="outlined">
                Aadhaar, PAN, BPL card, bank, payroll, login, and policy details are completed by
                HR.
              </Alert>
            </Stack>
          </Paper>
        </Grid>

        {/* Main Form */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              /* Fill almost the full viewport height so content scrolls inside */
              height: { xs: 'calc(100vh - 80px)', md: 'calc(100vh - 99.5px)' },
              overflow: 'hidden',
            }}
          >
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
            >
              {/* ── Sticky top: stepper + error banner ── */}
              <Box sx={{ flexShrink: 0, px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 1 }}>
                {/* Desktop Stepper */}
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{ display: { xs: 'none', md: 'flex' }, mb: 1 }}
                >
                  {steps.map((label, index) => (
                    <Step
                      key={label}
                      completed={index < activeStep}
                      onClick={() => {
                        if (index <= maxVisitedStep) {
                          setActiveStep(index);
                        }
                      }}
                      sx={{ cursor: index <= maxVisitedStep ? 'pointer' : 'default' }}
                    >
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Mobile Stepper */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}>
                  <Typography variant="subtitle2">{steps[activeStep]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Step {activeStep + 1} of {steps.length}
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* ── Scrollable step content ── */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  px: { xs: 2, md: 3 },
                  py: 2,
                  /* Thin, styled scrollbar that works in Chrome/Edge/Safari */
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-track': {
                    borderRadius: 3,
                    bgcolor: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: 3,
                    bgcolor: (theme) => theme.palette.grey[400],
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.grey[600],
                    },
                  },
                  /* Firefox */
                  scrollbarWidth: 'thin',
                  scrollbarColor: (theme: any) => `${theme.palette.grey[400]} transparent`,
                }}
              >
                {renderStep()}
              </Box>

              <Divider />

              {/* ── Sticky bottom: navigation buttons ── */}
              <Box
                sx={{
                  flexShrink: 0,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.5, md: 2 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={(event) => {
                    event.preventDefault();
                    setError(null);
                    setActiveStep((current) => Math.max(current - 1, 0));
                  }}
                  disabled={activeStep === 0 || formik.isSubmitting}
                  startIcon={<Iconify icon="mdi:arrow-left" />}
                >
                  Back
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={(event) => {
                      event.preventDefault();
                      handleNext();
                    }}
                    disabled={formik.isSubmitting}
                    endIcon={<Iconify icon="mdi:arrow-right" />}
                    data-testid={`employee-application-step-${activeStep}-next`}
                  >
                    Next
                  </Button>
                ) : (
                  <LoadingButton
                    size="small"
                    variant="contained"
                    type="submit"
                    loading={formik.isSubmitting}
                    startIcon={<Iconify icon={GlobalIcons.submit} />}
                    data-testid="employee-application-submit"
                  >
                    Submit Application
                  </LoadingButton>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
