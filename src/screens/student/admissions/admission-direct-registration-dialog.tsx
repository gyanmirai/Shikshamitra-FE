'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { AdmissionDirectFamilyMatch } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  useGetAdmissionClassCapacityQuery,
  useLazyGetAdmissionOfferingsQuery,
} from 'src/redux/student/admissions/admission-offerings-api';
import {
  useLazyFindAdmissionDirectFamiliesQuery,
  useGetAdmissionApplicationCounsellorsQuery,
  useStartAdmissionDirectRegistrationMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';

type Props = { open: boolean; academicYearId: string; onClose: () => void };
type FormValues = {
  admissionCycle: AdmissionCycle | null;
  track: 1 | 2 | 3;
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
  admissionCycle: null,
  track: 1,
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
  admissionCycle: Yup.mixed<AdmissionCycle>().nullable().required('Admission cycle is required.'),
  track: Yup.number().oneOf([1, 2, 3]).required('Admission type is required.'),
  offeringId: Yup.string().required('Select a direct-registration offering.'),
  applicantFirstName: Yup.string().trim().required('Applicant first name is required.').max(128),
  applicantMiddleName: Yup.string().trim().max(128),
  applicantLastName: Yup.string().trim().max(128),
  applicantDateOfBirth: Yup.string()
    .required('Date of birth is required.')
    .test(
      'valid-date',
      'Enter a valid date of birth that is not in the future.',
      (value) => !value || (dayjs(value).isValid() && !dayjs(value).isAfter(dayjs(), 'day'))
    ),
  applicantGender: Yup.string().oneOf(['Male', 'Female']).required('Gender is required.'),
  guardianFirstName: Yup.string().trim().required('Guardian first name is required.').max(128),
  guardianLastName: Yup.string().trim().max(128),
  guardianMobile: Yup.string()
    .required('Guardian mobile is required.')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  guardianEmail: Yup.string().email('Enter a valid email address.').max(256),
  guardianRelationship: Yup.number().oneOf([0, 1, 2, 3]).required('Relationship is required.'),
  separateFamilyReason: Yup.string()
    .max(512)
    .when('createSeparateFamily', {
      is: true,
      then: (value) => value.trim().required('Reason for separate family is required.'),
    }),
});

export default function AdmissionDirectRegistrationDialog({ open, ...props }: Props) {
  if (!open) return null;
  return <DirectRegistrationDrawer {...props} />;
}

function DirectRegistrationDrawer({ academicYearId, onClose }: Omit<Props, 'open'>) {
  const router = useRouter();
  const [requestId] = useState(() => crypto.randomUUID());
  const discard = useBoolean();
  const [selectedOffering, setSelectedOffering] = useState<AdmissionOfferingListItem | null>(null);
  const [reload, setReload] = useState(0);
  const [familyMatches, setFamilyMatches] = useState<AdmissionDirectFamilyMatch[] | null>(null);
  const [familyLookupKey, setFamilyLookupKey] = useState('');
  const [requestError, setRequestError] = useState('');
  const identityRef = useRef('');
  const [loadOfferings, offeringsQuery] = useLazyGetAdmissionOfferingsQuery();
  const [loadCycles, cyclesQuery] = useLazyGetAdmissionCyclesQuery();
  const [findFamilies, familyLookup] = useLazyFindAdmissionDirectFamiliesQuery();
  const [start, startState] = useStartAdmissionDirectRegistrationMutation();
  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: schema,
    onSubmit: async (values) => {
      if (
        startState.isLoading ||
        familyLookup.isFetching ||
        !selectedOffering ||
        selectedOffering.id !== values.offeringId ||
        selectedOffering.track !== values.track ||
        selectedOffering.admissionCycleId !== values.admissionCycle?.id
      )
        return;
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
        if (!application.id)
          throw new Error('Registration response did not include an application.');
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
  const busy = startState.isLoading || formik.isSubmitting || familyLookup.isFetching;
  const requestClose = () => {
    if (busy) return;
    if (formik.dirty) discard.onTrue();
    else onClose();
  };
  useAdmissionUnsavedChanges(true, formik.dirty);
  const { currentData: capacity } = useGetAdmissionClassCapacityQuery(formik.values.offeringId, {
    skip: !formik.values.offeringId,
    refetchOnMountOrArgChange: true,
  });
  const counsellors = useGetAdmissionApplicationCounsellorsQuery(
    { offeringId: formik.values.offeringId },
    { skip: !formik.values.offeringId }
  );

  const fetchCycles = useCallback(
    async (search: string, page: number) => {
      const skipCount = (page - 1) * 25;
      const result = await loadCycles({
        academicYearId,
        status: 1,
        windowStatus: 1,
        search: search === formik.values.admissionCycle?.name ? undefined : search || undefined,
        skipCount,
        maxResultCount: 25,
      }).unwrap();
      return {
        data: result.items.filter(
          (cycle) =>
            cycle.academicYearId === academicYearId &&
            cycle.status === 1 &&
            cycle.windowStatus === 1
        ),
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [academicYearId, loadCycles, formik.values.admissionCycle?.name]
  );
  const fetchOfferings = useCallback(
    async (search: string, page: number) => {
      if (!formik.values.admissionCycle) return { data: [], hasMore: false };
      const skipCount = (page - 1) * 25;
      const result = await loadOfferings({
        admissionCycleId: formik.values.admissionCycle.id,
        track: formik.values.track,
        // RTE is direct-only. Existing Management/Staff Both offerings also allow registration.
        entryMode: formik.values.track === 1 ? 1 : undefined,
        isActive: true,
        availabilityStatus: 2,
        search: search === selectedOffering?.name ? undefined : search || undefined,
        skipCount,
        maxResultCount: 25,
        sorting: 'BoardName, MediumName, StandardName, Code',
      }).unwrap();
      return {
        data: result.items.filter(
          (offering) =>
            offering.track === formik.values.track &&
            (offering.entryMode === 1 || (offering.track !== 1 && offering.entryMode === 2)) &&
            offering.isActive &&
            offering.availabilityStatus === 2 &&
            offering.admissionCycleId === formik.values.admissionCycle?.id
        ),
        hasMore: skipCount + result.items.length < result.totalCount,
      };
    },
    [loadOfferings, formik.values.admissionCycle, formik.values.track, selectedOffering?.name]
  );

  const changeIdentity = (field: 'offeringId' | 'guardianMobile', value: string) => {
    formik.setFieldValue(field, value);
    if (field === 'offeringId') formik.setFieldValue('counsellorId', '');
    formik.setFieldValue('existingFamilyId', '');
    formik.setFieldValue('createSeparateFamily', false);
    formik.setFieldValue('separateFamilyReason', '');
    setFamilyMatches(null);
    setFamilyLookupKey('');
    setRequestError('');
    identityRef.current = '';
  };
  const checkFamilies = async () => {
    const { offeringId, guardianMobile } = formik.values;
    if (!offeringId || !/^[6-9]\d{9}$/.test(guardianMobile)) {
      setRequestError('Select an offering and enter a valid mobile number first.');
      return;
    }
    setRequestError('');
    const lookupKey = `${offeringId}:${guardianMobile}`;
    identityRef.current = lookupKey;
    try {
      const matches = await findFamilies({ offeringId, guardianMobile }).unwrap();
      if (identityRef.current !== lookupKey) return;
      setFamilyMatches(matches);
      setFamilyLookupKey(`${offeringId}:${guardianMobile}`);
    } catch (error) {
      if (identityRef.current !== lookupKey) return;
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
    <>
      <Drawer
        anchor="right"
        open
        onClose={requestClose}
        PaperProps={{
          component: 'form',
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': 'special-registration-title',
          noValidate: true,
          onSubmit: formik.handleSubmit,
          sx: {
            width: { xs: 1, sm: 680 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography id="special-registration-title" variant="h6" component="h2">
              <AdmissionDialogTitle
                title="Start Special Registration"
                helpText="Register RTE, Management or Staff applicants without an inquiry. The selected offering's published workflow continues from its Registration Form stage."
              />
            </Typography>
          </Box>
          <IconButton
            type="button"
            aria-label="Close direct registration"
            size="small"
            onClick={requestClose}
            disabled={busy}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          <FormBusyRegion
            busy={busy}
            label={familyLookup.isFetching ? 'Checking families…' : 'Starting registration…'}
          >
            <Stack spacing={2}>
              {(cyclesQuery.isError || offeringsQuery.isError) && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      type="button"
                      startIcon={<Iconify icon="mdi:refresh" />}
                      onClick={() => setReload((value) => value + 1)}
                    >
                      Retry
                    </Button>
                  }
                >
                  Admission choices could not be loaded. Retry before selecting an offering.
                </Alert>
              )}
              <Typography variant="subtitle1">Offering</Typography>
              <ShakingTextField
                error={Boolean(formik.touched.admissionCycle && formik.errors.admissionCycle)}
              >
                <PaginatedSearchSelect<AdmissionCycle>
                  key={`cycles-${academicYearId}-${reload}`}
                  fullWidth
                  size="small"
                  label="Admission cycle"
                  required
                  value={formik.values.admissionCycle}
                  fetchOptions={fetchCycles}
                  minChars={0}
                  getOptionLabel={(cycle) => cycle.name}
                  getOptionKey={(cycle) => cycle.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, cycle) => {
                    formik.setFieldValue('admissionCycle', cycle);
                    setSelectedOffering(null);
                    changeIdentity('offeringId', '');
                  }}
                  onBlur={() => formik.setFieldTouched('admissionCycle', true)}
                  error={Boolean(formik.touched.admissionCycle && formik.errors.admissionCycle)}
                  helperText={
                    formik.touched.admissionCycle
                      ? String(formik.errors.admissionCycle || '')
                      : undefined
                  }
                  noOptionsText={
                    cyclesQuery.isError
                      ? 'Admission cycles could not be loaded.'
                      : 'No published, open admission cycle is available for this academic year.'
                  }
                />
              </ShakingTextField>
              <CustomSelect
                fullWidth
                size="small"
                label="Admission type"
                required
                options={[
                  { value: 1, label: 'RTE' },
                  { value: 2, label: 'Management' },
                  { value: 3, label: 'Staff' },
                ]}
                value={formik.values.track}
                onChange={(value) => {
                  formik.setFieldValue('track', Number(value));
                  setSelectedOffering(null);
                  changeIdentity('offeringId', '');
                }}
              />
              <ShakingTextField
                error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
              >
                <PaginatedSearchSelect<AdmissionOfferingListItem>
                  key={`offerings-${formik.values.admissionCycle?.id}-${formik.values.track}-${reload}`}
                  fullWidth
                  required
                  size="small"
                  label="Admission offering"
                  value={selectedOffering}
                  disabled={!formik.values.admissionCycle}
                  fetchOptions={fetchOfferings}
                  minChars={0}
                  getOptionLabel={(offering) => offering.name}
                  getOptionKey={(offering) => offering.id}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={({ key, ...props }, offering) => (
                    <li key={key} {...props}>
                      <Stack>
                        <Typography variant="body2">{offering.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {[offering.boardName, offering.mediumName, offering.standardName].join(
                            ' · '
                          )}
                        </Typography>
                      </Stack>
                    </li>
                  )}
                  onChange={(_, offering) => {
                    setSelectedOffering(offering);
                    changeIdentity('offeringId', offering?.id ?? '');
                  }}
                  onBlur={() => formik.setFieldTouched('offeringId', true)}
                  error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
                  helperText={formik.touched.offeringId && formik.errors.offeringId}
                  noOptionsText={
                    offeringsQuery.isError
                      ? 'Admission offerings could not be loaded.'
                      : !formik.values.admissionCycle
                        ? 'Select an admission cycle first.'
                        : 'No active, open registration-first offering is available for this admission type.'
                  }
                />
              </ShakingTextField>
              {capacity && (
                <Alert severity={capacity.isFull ? 'warning' : 'info'}>
                  {capacity.capacity == null
                    ? 'Admission room capacity is not set. Division seats are checked during onboarding.'
                    : `${capacity.remainingSeats} of ${capacity.capacity} admission room seats available.`}
                  {capacity.isFull && ' Admission room capacity is full; you can still register.'}
                </Alert>
              )}
              <CustomSelect
                fullWidth
                size="small"
                label="Journey counsellor (optional)"
                value={formik.values.counsellorId}
                disabled={!formik.values.offeringId || counsellors.isLoading || counsellors.isError}
                onChange={(value) => formik.setFieldValue('counsellorId', String(value))}
                helperText="Leave blank to use the offering's counsellor assignment settings."
                options={[
                  { value: '', label: 'Use offering settings' },
                  ...(counsellors.currentData ?? []).map((counsellor) => ({
                    value: counsellor.id,
                    label: counsellor.name || counsellor.userName,
                  })),
                ]}
              />
              {counsellors.isError && (
                <Alert severity="warning">
                  Counsellor choices could not be loaded. Automatic assignment still uses the
                  offering settings.
                </Alert>
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
                    formik.values.applicantDateOfBirth
                      ? dayjs(formik.values.applicantDateOfBirth)
                      : null
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
                      helperText: formik.submitCount
                        ? formik.errors.applicantDateOfBirth
                        : undefined,
                    },
                  }}
                />
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Gender"
                  required
                  value={formik.values.applicantGender}
                  onChange={(value) => formik.setFieldValue('applicantGender', String(value))}
                  error={Boolean(formik.submitCount && formik.errors.applicantGender)}
                  helperText={formik.submitCount ? formik.errors.applicantGender : undefined}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
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
              <CustomSelect
                fullWidth
                size="small"
                label="Relationship"
                required
                value={formik.values.guardianRelationship}
                onChange={(value) => formik.setFieldValue('guardianRelationship', Number(value))}
                options={[
                  { value: 0, label: 'Parent' },
                  { value: 1, label: 'Guardian' },
                  { value: 2, label: 'Relative' },
                  { value: 3, label: 'Other' },
                ]}
              />
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={familyLookup.isFetching || !formik.values.offeringId}
                onClick={checkFamilies}
                startIcon={<Iconify icon="mdi:account-search-outline" />}
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
                  variant={
                    formik.values.existingFamilyId === family.familyId ? 'contained' : 'outlined'
                  }
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
                  The selected family’s saved primary guardian details will be reused. This
                  registration will not overwrite that guardian record.
                </Alert>
              )}
              {Boolean(familyMatches?.length) && (
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
          </FormBusyRegion>
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
            onClick={requestClose}
            disabled={busy}
            startIcon={<Iconify icon="mdi:close" />}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            loading={startState.isLoading || formik.isSubmitting}
            disabled={familyLookup.isFetching || !selectedOffering}
            startIcon={<Iconify icon="mdi:account-plus-outline" />}
          >
            Start registration
          </LoadingButton>
        </Stack>
      </Drawer>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Unsaved Registration?"
        content="The applicant and guardian details entered here will be lost."
        icon="warning"
        disableBackdropClick
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon="mdi:delete-outline" />}
            onClick={onClose}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
