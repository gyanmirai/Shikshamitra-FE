'use client';

import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { normalizeEmail } from 'src/utils/input-format';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { useGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import { useCreateAdmissionInquiryMutation } from 'src/redux/student/admissions/admission-inquiries-api';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Drawer,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { INQUIRY_SOURCE_OPTIONS } from './inquiry-management/admission-inquiry-list-options';

export function AdmissionUnmatchedInquiryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const cycles = useGetAdmissionCyclesQuery({ maxResultCount: 100, skipCount: 0 }, { skip: !open });
  const [create, createState] = useCreateAdmissionInquiryMutation();
  const [cycleId, setCycleId] = useState('');
  const [source, setSource] = useState<AdmissionInquirySource>(8);
  const [sourceDetail, setSourceDetail] = useState('');
  const [applicantFirstName, setApplicantFirstName] = useState('');
  const [applicantLastName, setApplicantLastName] = useState('');
  const [guardianFirstName, setGuardianFirstName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [separateFamily, setSeparateFamily] = useState(false);
  const [duplicateReason, setDuplicateReason] = useState('');
  const [error, setError] = useState('');
  const publishedCycles = (cycles.data?.items ?? []).filter((cycle) => cycle.status === 1);

  const save = async () => {
    if (
      !cycleId ||
      !applicantFirstName.trim() ||
      !guardianFirstName.trim() ||
      !guardianPhone.trim()
    ) {
      setError('Choose an admission period and enter applicant and guardian details.');
      return;
    }
    if (separateFamily && !duplicateReason.trim()) {
      setError('Enter why a separate family record is needed.');
      return;
    }
    setError('');
    try {
      await create({
        admissionCycleId: cycleId,
        admissionOfferingId: null,
        boardId: '',
        mediumId: '',
        standardId: '',
        applicantName: [applicantFirstName.trim(), applicantLastName.trim()]
          .filter(Boolean)
          .join(' '),
        applicantFirstName: applicantFirstName.trim(),
        applicantLastName: applicantLastName.trim() || null,
        guardianFirstName: guardianFirstName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: normalizeEmail(guardianEmail) || null,
        phone: guardianPhone.trim(),
        preferredLanguageCode: 'en',
        source,
        sourceDetail: sourceDetail.trim() || null,
        createSeparateFamily: separateFamily,
        duplicateOverrideReason: separateFamily ? duplicateReason.trim() : null,
        formValues: [],
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Inquiry captured. Confirm its offering after speaking with the family.',
      });
      onClose();
    } catch (problem) {
      const response = problem as { data?: { error?: { message?: string } } };
      setError(response.data?.error?.message ?? 'Unable to capture inquiry.');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={createState.isLoading ? undefined : onClose}
      PaperProps={{
        sx: { width: { xs: 1, sm: 600 }, maxWidth: 1, height: '100dvh', display: 'flex' },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Capture inquiry before offering is known</Typography>
          <Typography variant="body2" color="text.secondary">
            Record the lead now. Staff can confirm the class offering later.
          </Typography>
        </Box>
        <IconButton aria-label="Close" disabled={createState.isLoading} onClick={onClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          select
          fullWidth
          required
          size="small"
          label="Admission period"
          value={cycleId}
          onChange={(event) => setCycleId(event.target.value)}
          disabled={cycles.isLoading}
        >
          <MenuItem value="">Choose a period</MenuItem>
          {publishedCycles.map((cycle) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          required
          size="small"
          label="How the inquiry arrived"
          value={source}
          onChange={(event) => setSource(Number(event.target.value) as AdmissionInquirySource)}
        >
          {INQUIRY_SOURCE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          size="small"
          label="Source details"
          value={sourceDetail}
          onChange={(event) => setSourceDetail(event.target.value)}
          helperText="Optional event, campaign, referral, or location details."
        />
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Applicant first name"
              value={applicantFirstName}
              onChange={(event) => setApplicantFirstName(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Applicant last name"
              value={applicantLastName}
              onChange={(event) => setApplicantLastName(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Guardian first name"
              value={guardianFirstName}
              onChange={(event) => setGuardianFirstName(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              size="small"
              label="Guardian mobile"
              value={guardianPhone}
              onChange={(event) => setGuardianPhone(event.target.value)}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          size="small"
          type="email"
          label="Guardian email"
          value={guardianEmail}
          onChange={(event) => setGuardianEmail(normalizeEmail(event.target.value))}
          inputProps={{ autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={separateFamily}
              onChange={(_, checked) => setSeparateFamily(checked)}
            />
          }
          label="Create a separate family if this mobile already has an inquiry"
        />
        {separateFamily && (
          <TextField
            fullWidth
            required
            size="small"
            label="Reason for separate family"
            value={duplicateReason}
            onChange={(event) => setDuplicateReason(event.target.value)}
          />
        )}
      </Stack>
      <Divider />
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose} disabled={createState.isLoading}>
          Cancel
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          loading={createState.isLoading}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={save}
        >
          Capture inquiry
        </LoadingButton>
      </Stack>
    </Drawer>
  );
}
