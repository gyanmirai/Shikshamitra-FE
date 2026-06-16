'use client';

import type { FormikTouched } from 'formik';

import { getIn, useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
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
  Button,
  Stepper,
  Divider,
  Tooltip,
  MenuItem,
  Checkbox,
  StepLabel,
  TextField,
  Typography,
  IconButton,
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
  createEmployeeApplicationInitialValues,
} from './validation';

import type { EmployeeApplicationLocation, EmployeeApplicationFormValues } from './validation';

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

const textFieldProps = (
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>,
  path: string
) => {
  const error = fieldError(formik, path);
  return {
    value: getIn(formik.values, path) ?? '',
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    name: path,
    error: Boolean(error),
    helperText: error || ' ',
  };
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
        <CountryComponent
          value={country || undefined}
          onChange={(_, value) => {
            formik.setFieldValue(`${basePath}.country`, locationFromOption(value));
            formik.setFieldValue(`${basePath}.state`, null);
            formik.setFieldValue(`${basePath}.city`, '');
          }}
          textFieldProps={{
            label: 'Country',
            required,
            error: Boolean(fieldError(formik, `${basePath}.country`)),
            helperText: fieldError(formik, `${basePath}.country`) || ' ',
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} data-testid={testId ? `${testId}-state` : undefined}>
        <StateComponent
          countryValue={country || undefined}
          value={state || undefined}
          onChange={(_, value) => {
            formik.setFieldValue(`${basePath}.state`, locationFromOption(value));
            formik.setFieldValue(`${basePath}.city`, '');
          }}
          textFieldProps={{
            label: 'State',
            required,
            error: Boolean(fieldError(formik, `${basePath}.state`)),
            helperText: fieldError(formik, `${basePath}.state`) || ' ',
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} data-testid={testId ? `${testId}-city` : undefined}>
        <CityComponent
          countryValue={country || undefined}
          stateValue={state || undefined}
          value={cityValue(city) as any}
          onChange={(_, value: any) => formik.setFieldValue(`${basePath}.city`, value?.name || '')}
          textFieldProps={{
            label: 'City',
            required,
            error: Boolean(fieldError(formik, `${basePath}.city`)),
            helperText: fieldError(formik, `${basePath}.city`) || ' ',
          }}
        />
      </Grid>
    </>
  );
}

function FamilyMemberSection({
  formik,
  title,
  basePath,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
  title: string;
  basePath: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{title}</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Name"
              {...textFieldProps(formik, `${basePath}.name`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Occupation"
              {...textFieldProps(formik, `${basePath}.occupation`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Mobile no."
              {...textFieldProps(formik, `${basePath}.mobileNo`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Address line 1"
              {...textFieldProps(formik, `${basePath}.address1`)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Address line 2"
              {...textFieldProps(formik, `${basePath}.address2`)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Address line 3"
              {...textFieldProps(formik, `${basePath}.address3`)}
            />
          </Grid>
          <LocationFields formik={formik} basePath={basePath} />
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Pin code"
              {...textFieldProps(formik, `${basePath}.pincode`)}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}

function PersonalStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  return (
    <Stack spacing={3} data-testid="employee-application-step-personal">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="First name"
            {...textFieldProps(formik, 'personalInfo.firstName')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Middle name"
            {...textFieldProps(formik, 'personalInfo.middleName')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Last name"
            {...textFieldProps(formik, 'personalInfo.lastName')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Short name"
            {...textFieldProps(formik, 'personalInfo.shortName')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Email"
            {...textFieldProps(formik, 'personalInfo.email')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Mobile no."
            {...textFieldProps(formik, 'personalInfo.mobileNo')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Secondary mobile no."
            {...textFieldProps(formik, 'personalInfo.secondaryMobileNo')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            type="date"
            label="Date of birth"
            InputLabelProps={{ shrink: true }}
            {...textFieldProps(formik, 'personalInfo.dateOfBirth')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Gender"
            {...textFieldProps(formik, 'personalInfo.gender')}
          >
            <MenuItem value="1">Male</MenuItem>
            <MenuItem value="2">Female</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Category"
            {...textFieldProps(formik, 'personalInfo.casteType')}
          >
            <MenuItem value="0">General</MenuItem>
            <MenuItem value="1">OBC</MenuItem>
            <MenuItem value="2">SC</MenuItem>
            <MenuItem value="3">ST</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Religion"
            {...textFieldProps(formik, 'personalInfo.religion')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Family caste"
            {...textFieldProps(formik, 'personalInfo.familyCaste')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            required
            select
            fullWidth
            size="small"
            label="Marital status"
            {...textFieldProps(formik, 'personalInfo.maritalStatus')}
          >
            <MenuItem value="0">Unmarried</MenuItem>
            <MenuItem value="1">Married</MenuItem>
            <MenuItem value="2">Divorced</MenuItem>
            <MenuItem value="3">Widowed</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Blood group"
            {...textFieldProps(formik, 'personalInfo.bloodGroup')}
          >
            <MenuItem value="">Not selected</MenuItem>
            {bloodGroups.map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Department"
            {...textFieldProps(formik, 'personalInfo.department')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Designation"
            {...textFieldProps(formik, 'personalInfo.designation')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.personalInfo.isTeaching}
                onChange={(event) =>
                  formik.setFieldValue('personalInfo.isTeaching', event.target.checked)
                }
              />
            }
            label="Teaching staff"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Qualification"
            multiline
            minRows={3}
            {...textFieldProps(formik, 'personalInfo.qualification')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Identification mark"
            multiline
            minRows={3}
            {...textFieldProps(formik, 'personalInfo.identificationMark1')}
          />
        </Grid>
      </Grid>
      <Divider />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Address line 1"
            {...textFieldProps(formik, 'personalInfo.address1')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            fullWidth
            size="small"
            label="Address line 2"
            {...textFieldProps(formik, 'personalInfo.address2')}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            label="Address line 3"
            {...textFieldProps(formik, 'personalInfo.address3')}
          />
        </Grid>
        <LocationFields
          formik={formik}
          basePath="personalInfo"
          required
          testId="employee-application-personal-address"
        />
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Pin code"
            {...textFieldProps(formik, 'personalInfo.pincode')}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

function FamilyStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  return (
    <Stack spacing={2} data-testid="employee-application-step-family">
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

function AdditionalStep({
  formik,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
}) {
  return (
    <Stack spacing={2} data-testid="employee-application-step-additional">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.additionalInfo.personWithDisability}
                onChange={(event) =>
                  formik.setFieldValue('additionalInfo.personWithDisability', event.target.checked)
                }
              />
            }
            label="Person with disability"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Second language"
            {...textFieldProps(formik, 'additionalInfo.secondLanguage')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.additionalInfo.isLibraryMember}
                onChange={(event) =>
                  formik.setFieldValue('additionalInfo.isLibraryMember', event.target.checked)
                }
              />
            }
            label="Library member"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.additionalInfo.isTransportMember}
                onChange={(event) =>
                  formik.setFieldValue('additionalInfo.isTransportMember', event.target.checked)
                }
              />
            }
            label="Transport member"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

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
        <Typography variant="subtitle1">Work Experience</Typography>
        <Button
          type="button"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={(event) => {
            event.preventDefault();
            addExperience();
          }}
        >
          Add experience
        </Button>
      </Stack>
      {formik.values.workExperiences.length === 0 && (
        <Alert severity="info">Add prior work experience if applicable.</Alert>
      )}
      {formik.values.workExperiences.map((experience, index) => {
        const basePath = `workExperiences[${index}]`;
        return (
          <Paper
            key={index}
            variant="outlined"
            sx={{ p: 2, borderRadius: 1 }}
            data-testid="employee-application-work-experience-row"
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Experience {index + 1}</Typography>
                <Tooltip title="Remove experience">
                  <IconButton
                    type="button"
                    color="error"
                    onClick={(event) => {
                      event.preventDefault();
                      removeExperience(index);
                    }}
                  >
                    <Iconify icon="mdi:delete-outline" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Organization"
                    {...textFieldProps(formik, `${basePath}.mediumStageName`)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Designation"
                    {...textFieldProps(formik, `${basePath}.designation`)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Department"
                    {...textFieldProps(formik, `${basePath}.department`)}
                  />
                </Grid>
                <LocationFields formik={formik} basePath={basePath} />
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start"
                    InputLabelProps={{ shrink: true }}
                    {...textFieldProps(formik, `${basePath}.startDate`)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End"
                    InputLabelProps={{ shrink: true }}
                    {...textFieldProps(formik, `${basePath}.endDate`)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}

function UploadsReviewStep({
  formik,
  resume,
  photo,
  setResume,
  setPhoto,
  fileError,
}: {
  formik: ReturnType<typeof useFormik<EmployeeApplicationFormValues>>;
  resume: File | null;
  photo: File | null;
  setResume: (file: File | null) => void;
  setPhoto: (file: File | null) => void;
  fileError: string | null;
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
      {fileError && <Alert severity="error">{fileError}</Alert>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Iconify icon="mdi:file-upload-outline" />}
        >
          Resume
          <input
            hidden
            type="file"
            accept=".pdf,.doc,.docx"
            data-testid="employee-application-resume-input"
            onChange={(event) => setResume(event.target.files?.[0] || null)}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {resume?.name || 'PDF, DOC, DOCX up to 10MB'}
        </Typography>
        <Button
          component="label"
          variant="outlined"
          startIcon={<Iconify icon="mdi:image-plus-outline" />}
        >
          Photo
          <input
            hidden
            type="file"
            accept="image/*"
            data-testid="employee-application-photo-input"
            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {photo?.name || 'Image up to 5MB'}
        </Typography>
      </Stack>
      <Divider />
      <Grid container spacing={2}>
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
            label="Department / designation"
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
            label="Family records"
            value={familyCount}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Work experience records"
            value={experienceCount}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export default function PublicEmployeeApplicationScreen({ token }: { token: string }) {
  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const formik = useFormik<EmployeeApplicationFormValues>({
    initialValues: createEmployeeApplicationInitialValues(application || undefined),
    enableReinitialize: true,
    validationSchema: employeeApplicationValidationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      const uploadError = validateResumeFile(resume) || validatePhotoFile(photo);
      if (uploadError) {
        setFileError(uploadError);
        setError(null);
        setActiveStep(4);
        helpers.setSubmitting(false);
        return;
      }

      setError(null);
      setFileError(null);

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
    const root = stepErrorRoots[activeStep];
    try {
      if (root) {
        await employeeApplicationValidationSchema.validateAt(root, formik.values);
      } else {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length) {
          throw new Error('Invalid form');
        }
      }
    } catch {
      formik.setTouched(touchAll(formik.values), false);
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
            fileError={fileError}
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
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 1,
              position: { md: 'sticky' },
              top: 24,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2}>
              <Iconify icon="mdi:account-tie-outline" width={42} />
              <Box>
                <Typography variant="h5">Employee application</Typography>
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

        <Grid size={{ xs: 12, md: 8.5 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1 }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{ display: { xs: 'none', md: 'flex' } }}
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
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Typography variant="subtitle2">{steps[activeStep]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Step {activeStep + 1} of {steps.length}
                  </Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                {renderStep()}

                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                    <Button
                      size="large"
                      variant="contained"
                      type="submit"
                      disabled={formik.isSubmitting}
                      startIcon={
                        formik.isSubmitting ? (
                          <CircularProgress size={18} />
                        ) : (
                          <Iconify icon="mdi:send-outline" />
                        )
                      }
                      data-testid="employee-application-submit"
                    >
                      Submit application
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
