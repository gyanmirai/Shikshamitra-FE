'use client';

import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { AdmissionDirectFamilyMatch } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionClassCapacityQuery,
  useLazyGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useLazyFindAdmissionDirectFamiliesQuery,
  useGetAdmissionApplicationCounsellorsQuery,
  useStartAdmissionDirectRegistrationMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';

type Props = { open: boolean; onClose: () => void };
type FormValues = {
  offeringId: string;
  counsellorId: string;
  applicantFirstName: string;
  applicantMiddleName: string;
  applicantLastName: string;
  applicantDateOfBirth: string;
  applicantGender: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianMobile: string;
  guardianEmail: string;
  guardianRelationship: 0 | 1 | 2 | 3;
  existingFamilyId: string;
  createSeparateFamily: boolean;
  separateFamilyReason: string;
};

const initialValues: FormValues = {
  offeringId: '',
  counsellorId: '',
  applicantFirstName: '',
  applicantMiddleName: '',
  applicantLastName: '',
  applicantDateOfBirth: '',
  applicantGender: '',
  guardianFirstName: '',
  guardianLastName: '',
  guardianMobile: '',
  guardianEmail: '',
  guardianRelationship: 0,
  existingFamilyId: '',
  createSeparateFamily: false,
  separateFamilyReason: '',
};

const schema = Yup.object({
  offeringId: Yup.string().required('Select a direct-registration offering.'),
  applicantFirstName: Yup.string().trim().required('Applicant first name is required.').max(128),
  applicantMiddleName: Yup.string().trim().max(128),
  applicantLastName: Yup.string().trim().max(128),
  applicantDateOfBirth: Yup.string().required('Date of birth is required.'),
  applicantGender: Yup.string().oneOf(['Male', 'Female']).required('Gender is required.'),
  guardianFirstName: Yup.string().trim().required('Guardian first name is required.').max(128),
  guardianLastName: Yup.string().trim().max(128),
  guardianMobile: Yup.string()
    .required('Guardian mobile is required.')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  guardianEmail: Yup.string().email('Enter a valid email address.').max(256),
  separateFamilyReason: Yup.string().max(512),
});

export default function AdmissionDirectRegistrationDialog({ open, onClose }: Props) {
  if (!open) return null;
  return <DirectRegistrationDrawer onClose={onClose} />;
}

function DirectRegistrationDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [requestId] = useState(() => crypto.randomUUID());
  const [offerings, setOfferings] = useState<AdmissionOfferingListItem[]>([]);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const [offeringsError, setOfferingsError] = useState(false);
  const [reload, setReload] = useState(0);
  const [familyMatches, setFamilyMatches] = useState<AdmissionDirectFamilyMatch[] | null>(null);
  const [familyLookupKey, setFamilyLookupKey] = useState('');
  const [requestError, setRequestError] = useState('');
  const [loadOfferings] = useLazyGetAdmissionOfferingsQuery();
  const [findFamilies, familyLookup] = useLazyFindAdmissionDirectFamiliesQuery();
  const [start, startState] = useStartAdmissionDirectRegistrationMutation();
  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      const lookupKey = `${values.offeringId}:${values.guardianMobile}`;
      if (familyLookupKey !== lookupKey) {
        setRequestError('Check existing families using this guardian mobile before continuing.');
        return;
      }
      if (familyMatches?.length && !values.existingFamilyId && !values.createSeparateFamily) {
        setRequestError('Link an existing family or choose to create a separate family.');
        return;
      }
      if (values.createSeparateFamily && !values.separateFamilyReason.trim()) {
        setRequestError('Record why this family must remain separate.');
        return;
      }
      setRequestError('');
      try {
        const application = await start({
          requestId,
          admissionOfferingId: values.offeringId,
          counsellorId: values.counsellorId || null,
          existingFamilyId: values.existingFamilyId || null,
          createSeparateFamily: values.createSeparateFamily,
          separateFamilyReason: values.createSeparateFamily
            ? values.separateFamilyReason.trim()
            : null,
          applicantFirstName: values.applicantFirstName.trim(),
          applicantMiddleName: values.applicantMiddleName.trim() || null,
          applicantLastName: values.applicantLastName.trim() || null,
          applicantDateOfBirth: values.applicantDateOfBirth || null,
          applicantGender: values.applicantGender || null,
          guardianFirstName: values.guardianFirstName.trim(),
          guardianLastName: values.guardianLastName.trim() || null,
          guardianMobile: values.guardianMobile,
          guardianEmail: values.guardianEmail.trim() || null,
          guardianRelationship: values.guardianRelationship,
        }).unwrap();
        formik.resetForm();
        shikshaMitraToast.success({ message: 'Registration started.' });
        onClose();
        router.push(`${studentPaths.enrollment.applications}/${application.id}`);
      } catch (error) {
        setRequestError(
          parseApiProblemDetail(error).detail || 'Registration could not be started.'
        );
      }
    },
  });
  useAdmissionUnsavedChanges(true, formik.dirty);
  const { data: capacity } = useGetAdmissionClassCapacityQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId,
    refetchOnMountOrArgChange: true,
  });
  const counsellors = useGetAdmissionApplicationCounsellorsQuery(
    { offeringId: formik.values.offeringId },
    { skip: !formik.values.offeringId }
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      setOfferingsLoading(true);
      setOfferingsError(false);
      try {
        const results: AdmissionOfferingListItem[] = [];
        let total = Number.MAX_SAFE_INTEGER;
        while (active && results.length < total) {
          // Offerings are paged so large schools do not silently lose classes.
          // eslint-disable-next-line no-await-in-loop
          const page = await loadOfferings({
            availabilityStatus: 2,
            skipCount: results.length,
            maxResultCount: 100,
            sorting: 'BoardName, MediumName, StandardName, Code',
          }).unwrap();
          if (!active) return;
          total = page.totalCount;
          if (!page.items.length) break;
          results.push(...page.items);
        }
        if (active) setOfferings(results.filter((offering) => offering.entryMode !== 0));
      } catch {
        if (active) setOfferingsError(true);
      } finally {
        if (active) setOfferingsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [loadOfferings, reload]);

  const changeIdentity = (field: 'offeringId' | 'guardianMobile', value: string) => {
    formik.setFieldValue(field, value);
    if (field === 'offeringId') formik.setFieldValue('counsellorId', '');
    formik.setFieldValue('existingFamilyId', '');
    formik.setFieldValue('createSeparateFamily', false);
    formik.setFieldValue('separateFamilyReason', '');
    setFamilyMatches(null);
    setFamilyLookupKey('');
    setRequestError('');
  };
  const checkFamilies = async () => {
    const { offeringId, guardianMobile } = formik.values;
    if (!offeringId || !/^[6-9]\d{9}$/.test(guardianMobile)) {
      setRequestError('Select an offering and enter a valid mobile number first.');
      return;
    }
    setRequestError('');
    try {
      const matches = await findFamilies({ offeringId, guardianMobile }).unwrap();
      setFamilyMatches(matches);
      setFamilyLookupKey(`${offeringId}:${guardianMobile}`);
    } catch (error) {
      setRequestError(parseApiProblemDetail(error).detail || 'Family check failed. Please retry.');
    }
  };
  const field = (name: keyof FormValues, label: string, required = false) => (
    <ShakingTextField error={Boolean(formik.touched[name] && formik.errors[name])}>
      <TextField
        fullWidth
        size="small"
        name={name}
        label={label}
        required={required}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={
          formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined
        }
      />
    </ShakingTextField>
  );

  return (
    <Drawer
      anchor="right"
      open
      onClose={startState.isLoading ? undefined : onClose}
      PaperProps={{
        component: 'form',
        onSubmit: formik.handleSubmit,
        sx: {
          width: { xs: 1, sm: 680 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
        },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">Direct registration</Typography>
          <Typography variant="body2" color="text.secondary">
            Start from Registration without an inquiry.
          </Typography>
        </Box>
        <IconButton
          type="button"
          aria-label="Close direct registration"
          onClick={onClose}
          disabled={startState.isLoading}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      {offeringsLoading && <LinearProgress />}
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
        {offeringsError && (
          <Alert
            severity="error"
            action={
              <Button type="button" onClick={() => setReload((value) => value + 1)}>
                Retry
              </Button>
            }
          >
            Open direct-registration offerings could not be loaded.
          </Alert>
        )}
        {!offeringsLoading && !offeringsError && !offerings.length && (
          <Alert severity="warning">
            No open direct-registration offering is available. Configure and activate one in
            Admission Offering settings.
          </Alert>
        )}
        <Typography variant="subtitle1">Offering</Typography>
        <TextField
          select
          fullWidth
          required
          size="small"
          label="Direct-registration offering"
          value={formik.values.offeringId}
          disabled={offeringsLoading || offeringsError || !offerings.length}
          onChange={(event) => changeIdentity('offeringId', event.target.value)}
          error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
          helperText={formik.touched.offeringId && formik.errors.offeringId}
        >
          {offerings.map((offering) => (
            <MenuItem key={offering.id} value={offering.id}>
              {[
                offering.name || offering.code,
                offering.standardName,
                offering.track === 1
                  ? 'RTE'
                  : offering.track === 2
                    ? 'Management'
                    : offering.track === 3
                      ? 'Staff'
                      : 'General',
                offering.admissionCycleName,
              ].join(' · ')}
            </MenuItem>
          ))}
        </TextField>
        {capacity && (
          <Alert severity={capacity.isFull ? 'warning' : 'info'}>
            {capacity.capacity == null
              ? 'Admission room capacity is not set. Division seats are checked during onboarding.'
              : `${capacity.remainingSeats} of ${capacity.capacity} admission room seats available.`}
            {capacity.isFull && ' Admission room capacity is full; you can still register.'}
          </Alert>
        )}
        <TextField
          select
          fullWidth
          size="small"
          label="Journey counsellor (optional)"
          value={formik.values.counsellorId}
          disabled={!formik.values.offeringId || counsellors.isLoading || counsellors.isError}
          onChange={(event) => formik.setFieldValue('counsellorId', event.target.value)}
          helperText="Leave blank for automatic assignment. This counsellor owns the application across admission stages and starts as the onboarding owner."
        >
          <MenuItem value="">Assign automatically</MenuItem>
          {(counsellors.data ?? []).map((counsellor) => (
            <MenuItem key={counsellor.id} value={counsellor.id}>
              {counsellor.name || counsellor.userName}
            </MenuItem>
          ))}
        </TextField>
        {counsellors.isError && (
          <Alert severity="warning">Counsellor choices could not be loaded. Automatic assignment still uses the offering settings.</Alert>
        )}
        <Divider />
        <Typography variant="subtitle1">Applicant</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {field('applicantFirstName', 'First name', true)}
          {field('applicantMiddleName', 'Middle name')}
          {field('applicantLastName', 'Last name')}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <DatePicker
            label="Date of birth"
            format={ADMISSION_DATE_FORMAT}
            value={
              formik.values.applicantDateOfBirth ? dayjs(formik.values.applicantDateOfBirth) : null
            }
            maxDate={dayjs()}
            onChange={(value) =>
              formik.setFieldValue(
                'applicantDateOfBirth',
                value?.isValid() ? value.format('YYYY-MM-DD') : ''
              )
            }
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                error: Boolean(formik.submitCount && formik.errors.applicantDateOfBirth),
                helperText: formik.submitCount ? formik.errors.applicantDateOfBirth : undefined,
              },
            }}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Gender"
            required
            value={formik.values.applicantGender}
            onChange={(event) => formik.setFieldValue('applicantGender', event.target.value)}
            error={Boolean(formik.submitCount && formik.errors.applicantGender)}
            helperText={formik.submitCount ? formik.errors.applicantGender : undefined}
          >
            <MenuItem value="" disabled>
              Select gender
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </TextField>
        </Stack>
        <Divider />
        <Typography variant="subtitle1">Primary guardian</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {field('guardianFirstName', 'First name', true)}
          {field('guardianLastName', 'Last name')}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            required
            size="small"
            label="Mobile"
            name="guardianMobile"
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            value={formik.values.guardianMobile}
            onChange={(event) => changeIdentity('guardianMobile', event.target.value)}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.guardianMobile && formik.errors.guardianMobile)}
            helperText={formik.touched.guardianMobile && formik.errors.guardianMobile}
          />
          {field('guardianEmail', 'Email')}
        </Stack>
        <TextField
          select
          fullWidth
          size="small"
          label="Relationship"
          value={formik.values.guardianRelationship}
          onChange={(event) =>
            formik.setFieldValue('guardianRelationship', Number(event.target.value))
          }
        >
          <MenuItem value={0}>Parent</MenuItem>
          <MenuItem value={1}>Guardian</MenuItem>
          <MenuItem value={2}>Relative</MenuItem>
          <MenuItem value={3}>Other</MenuItem>
        </TextField>
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={familyLookup.isFetching || !formik.values.offeringId}
          onClick={checkFamilies}
          sx={{ alignSelf: 'flex-start' }}
        >
          {familyLookup.isFetching ? 'Checking families…' : 'Check existing families'}
        </Button>
        {familyMatches && (
          <Alert severity={familyMatches.length ? 'warning' : 'success'}>
            {familyMatches.length
              ? 'Existing family found. Link it or explain why this is a separate family.'
              : 'No family is available to link in your scope. You can continue with a new family.'}
          </Alert>
        )}
        {familyMatches?.map((family) => (
          <Button
            key={family.familyId}
            type="button"
            size="small"
            variant={formik.values.existingFamilyId === family.familyId ? 'contained' : 'outlined'}
            onClick={() => {
              formik.setFieldValue('existingFamilyId', family.familyId);
              formik.setFieldValue('createSeparateFamily', false);
            }}
            sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
          >
            Link {family.familyNumber} · {family.primaryGuardianName}
            {family.applicants.length ? ` · ${family.applicants.join(', ')}` : ''}
          </Button>
        ))}
        {formik.values.existingFamilyId && (
          <Alert severity="info">
            The selected family’s saved primary guardian details will be reused. This registration
            will not overwrite that guardian record.
          </Alert>
        )}
        {familyMatches !== null && (
          <Button
            type="button"
            size="small"
            color="inherit"
            variant={formik.values.createSeparateFamily ? 'contained' : 'outlined'}
            onClick={() => {
              formik.setFieldValue('existingFamilyId', '');
              formik.setFieldValue('createSeparateFamily', true);
            }}
          >
            Create a separate family
          </Button>
        )}
        {formik.values.createSeparateFamily &&
          field('separateFamilyReason', 'Reason for separate family', true)}
        {requestError && <Alert severity="error">{requestError}</Alert>}
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={onClose}
          disabled={startState.isLoading}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          loading={startState.isLoading}
          disabled={offeringsLoading || offeringsError || !offerings.length}
        >
          Start registration
        </LoadingButton>
      </Stack>
    </Drawer>
  );
}
