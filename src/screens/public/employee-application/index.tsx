'use client';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

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

type WorkExperienceForm = {
  mediumStageName: string;
  designation: string;
  department: string;
  city: string;
  startDate: string;
  endDate: string;
};

type ApplicationFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  secondaryMobileNo: string;
  positionAppliedFor: string;
  departmentAppliedFor: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  casteType: string;
  familyCaste: string;
  maritalStatus: string;
  bloodGroup: string;
  qualificationSummary: string;
  skillsSummary: string;
  address1: string;
  address2: string;
  address3: string;
  countryName: string;
  countryIsoCode: string;
  stateName: string;
  stateIsoCode: string;
  city: string;
  pinCode: string;
  workExperiences: WorkExperienceForm[];
};

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const emptyExperience: WorkExperienceForm = {
  mediumStageName: '',
  designation: '',
  department: '',
  city: '',
  startDate: '',
  endDate: '',
};

const createInitialForm = (application?: PublicApplication): ApplicationFormState => ({
  firstName: application?.firstName || '',
  middleName: application?.middleName || '',
  lastName: application?.lastName || '',
  email: application?.email || '',
  mobileNo: application?.mobileNo || '',
  secondaryMobileNo: '',
  positionAppliedFor: application?.positionAppliedFor || '',
  departmentAppliedFor: application?.departmentAppliedFor || '',
  dateOfBirth: '',
  gender: '',
  religion: '',
  casteType: '',
  familyCaste: '',
  maritalStatus: '',
  bloodGroup: '',
  qualificationSummary: '',
  skillsSummary: '',
  address1: '',
  address2: '',
  address3: '',
  countryName: 'India',
  countryIsoCode: 'IN',
  stateName: '',
  stateIsoCode: '',
  city: '',
  pinCode: '',
  workExperiences: [],
});

const toNullableNumber = (value: string) => (value === '' ? null : Number(value));

const validateFile = (file: File | null, kind: 'resume' | 'photo') => {
  if (!file) return null;

  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (kind === 'resume') {
    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      return 'Resume must be a PDF, DOC, or DOCX file.';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'Resume must be 10MB or smaller.';
    }
  }

  if (kind === 'photo') {
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      return 'Photo must be an image file.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'Photo must be 5MB or smaller.';
    }
  }

  return null;
};

const getLoadErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message !== 'Failed to fetch') {
    return error.message;
  }

  return 'Application service is unavailable. Please try again later.';
};

export default function PublicEmployeeApplicationScreen({ token }: { token: string }) {
  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [form, setForm] = useState<ApplicationFormState>(createInitialForm());
  const [resume, setResume] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setForm(createInitialForm(payload));
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

  const updateField = (field: keyof ApplicationFormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const updateExperience = (index: number, field: keyof WorkExperienceForm, value: string) =>
    setForm((current) => ({
      ...current,
      workExperiences: current.workExperiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));

  const addExperience = () =>
    setForm((current) => ({
      ...current,
      workExperiences: [...current.workExperiences, { ...emptyExperience }],
    }));

  const removeExperience = (index: number) =>
    setForm((current) => ({
      ...current,
      workExperiences: current.workExperiences.filter((_, itemIndex) => itemIndex !== index),
    }));

  const formError =
    !form.firstName || !form.lastName || !form.email || !form.mobileNo
      ? 'First name, last name, email, and mobile number are required.'
      : validateFile(resume, 'resume') || validateFile(photo, 'photo');

  const handleSubmit = async () => {
    if (formError) {
      setError(formError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        firstName: form.firstName,
        middleName: form.middleName || null,
        lastName: form.lastName,
        email: form.email,
        mobileNo: form.mobileNo,
        secondaryMobileNo: form.secondaryMobileNo || null,
        positionAppliedFor: form.positionAppliedFor || null,
        departmentAppliedFor: form.departmentAppliedFor || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: toNullableNumber(form.gender),
        religion: form.religion || null,
        casteType: toNullableNumber(form.casteType),
        familyCaste: form.familyCaste || null,
        maritalStatus: toNullableNumber(form.maritalStatus),
        bloodGroup: toNullableNumber(form.bloodGroup),
        qualificationSummary: form.qualificationSummary || null,
        skillsSummary: form.skillsSummary || null,
        address1: form.address1 || null,
        address2: form.address2 || null,
        address3: form.address3 || null,
        country: form.countryName
          ? { name: form.countryName, isoCode: form.countryIsoCode || 'IN' }
          : null,
        state: form.stateName ? { name: form.stateName, isoCode: form.stateIsoCode } : null,
        city: form.city || null,
        pinCode: form.pinCode || null,
        workExperiences: form.workExperiences.map((experience) => ({
          mediumStageName: experience.mediumStageName || null,
          designation: experience.designation || null,
          department: experience.department || null,
          city: experience.city || null,
          startDate: experience.startDate || null,
          endDate: experience.endDate || null,
        })),
      };

      const body = new FormData();
      body.append('data', JSON.stringify(data));
      if (resume) body.append('resume', resume);
      if (photo) body.append('photo', photo);

      const response = await fetch(`${API_BASE}/public/employee-applications/${token}/submit`, {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        throw new Error('Could not submit application. Please review the form and try again.');
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Could not submit application.'
      );
    } finally {
      setSubmitting(false);
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
      <Grid container spacing={3} sx={{ maxWidth: 1180, mx: 'auto' }}>
        <Grid size={{ xs: 12, md: 4 }}>
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
              <Iconify icon="mdi:school-outline" width={44} />
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
              <Typography variant="body2" color="text.secondary">
                Submit basic profile, qualification, experience, resume, and photo details.
                Employee-only details are completed by HR later.
              </Typography>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Aadhaar, PAN, bank, payroll, and login details are not collected on this form.
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 1 }}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <Box>
                <Typography variant="h6">Basic details</Typography>
                <Typography variant="body2" color="text.secondary">
                  Fields marked with an asterisk are required.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="First name"
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Middle name"
                    value={form.middleName}
                    onChange={(event) => updateField('middleName', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Last name"
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label="Mobile no."
                    value={form.mobileNo}
                    onChange={(event) => updateField('mobileNo', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Secondary mobile no."
                    value={form.secondaryMobileNo}
                    onChange={(event) => updateField('secondaryMobileNo', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Date of birth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) => updateField('dateOfBirth', event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Gender"
                    value={form.gender}
                    onChange={(event) => updateField('gender', event.target.value)}
                  >
                    <MenuItem value="">Not selected</MenuItem>
                    <MenuItem value="1">Male</MenuItem>
                    <MenuItem value="2">Female</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={form.casteType}
                    onChange={(event) => updateField('casteType', event.target.value)}
                  >
                    <MenuItem value="">Not selected</MenuItem>
                    <MenuItem value="0">General</MenuItem>
                    <MenuItem value="1">OBC</MenuItem>
                    <MenuItem value="2">SC</MenuItem>
                    <MenuItem value="3">ST</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Religion"
                    value={form.religion}
                    onChange={(event) => updateField('religion', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Family caste"
                    value={form.familyCaste}
                    onChange={(event) => updateField('familyCaste', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Marital status"
                    value={form.maritalStatus}
                    onChange={(event) => updateField('maritalStatus', event.target.value)}
                  >
                    <MenuItem value="">Not selected</MenuItem>
                    <MenuItem value="0">Unmarried</MenuItem>
                    <MenuItem value="1">Married</MenuItem>
                    <MenuItem value="2">Divorced</MenuItem>
                    <MenuItem value="3">Widowed</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Position"
                    value={form.positionAppliedFor}
                    onChange={(event) => updateField('positionAppliedFor', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Department"
                    value={form.departmentAppliedFor}
                    onChange={(event) => updateField('departmentAppliedFor', event.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider />
              <Box>
                <Typography variant="h6">Qualification and address</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Qualification summary"
                    value={form.qualificationSummary}
                    onChange={(event) => updateField('qualificationSummary', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={3}
                    label="Skills summary"
                    value={form.skillsSummary}
                    onChange={(event) => updateField('skillsSummary', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Address line 1"
                    value={form.address1}
                    onChange={(event) => updateField('address1', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Address line 2"
                    value={form.address2}
                    onChange={(event) => updateField('address2', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Country"
                    value={form.countryName}
                    onChange={(event) => updateField('countryName', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code"
                    value={form.countryIsoCode}
                    onChange={(event) =>
                      updateField('countryIsoCode', event.target.value.toUpperCase())
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="State"
                    value={form.stateName}
                    onChange={(event) => updateField('stateName', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code"
                    value={form.stateIsoCode}
                    onChange={(event) =>
                      updateField('stateIsoCode', event.target.value.toUpperCase())
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pin code"
                    value={form.pinCode}
                    onChange={(event) => updateField('pinCode', event.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Work experience</Typography>
                <Button startIcon={<Iconify icon="mdi:plus" />} onClick={addExperience}>
                  Add experience
                </Button>
              </Stack>
              <Stack spacing={2}>
                {form.workExperiences.map((experience, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Organization"
                          value={experience.mediumStageName}
                          onChange={(event) =>
                            updateExperience(index, 'mediumStageName', event.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Designation"
                          value={experience.designation}
                          onChange={(event) =>
                            updateExperience(index, 'designation', event.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Department"
                          value={experience.department}
                          onChange={(event) =>
                            updateExperience(index, 'department', event.target.value)
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="City"
                          value={experience.city}
                          onChange={(event) => updateExperience(index, 'city', event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Start"
                          type="date"
                          value={experience.startDate}
                          onChange={(event) =>
                            updateExperience(index, 'startDate', event.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="End"
                          type="date"
                          value={experience.endDate}
                          onChange={(event) =>
                            updateExperience(index, 'endDate', event.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <IconButton color="error" onClick={() => removeExperience(index)}>
                          <Iconify icon="mdi:delete-outline" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {!form.workExperiences.length && (
                  <Typography variant="body2" color="text.secondary">
                    Add prior work experience if applicable.
                  </Typography>
                )}
              </Stack>

              <Divider />
              <Box>
                <Typography variant="h6">Uploads</Typography>
              </Box>
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

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  size="large"
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Iconify icon="mdi:send-outline" />
                    )
                  }
                  data-testid="employee-application-submit"
                >
                  Submit application
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
