'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';
import type { AdmissionDirectFamilyMatch } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { normalizeEmail } from 'src/utils/input-format';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { useRef, useState, useEffect, useCallback } from 'react';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import { useLazyGetAdmissionCyclesQuery } from 'src/redux/student/admissions/admission-cycles-api';
import {
  Box,
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
  useStartAdmissionDirectRegistrationMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { AdmissionFamilyContacts } from './admission-family-contacts';
import { GuardianResponsibilityConfirmation } from './use-inquiry-primary-contact';
import { useAdmissionUnsavedChanges } from './use-admission-unsaved-changes';
import { AdmissionSiblingFamilyMatch } from './admission-sibling-family-match';
import {
  buildAdmissionFamilyContacts,
  admissionFamilyContactsSchema,
  initialAdmissionFamilyContacts,
  getAdmissionSiblingParentReviewError,
  type AdmissionFamilyContactsFormValues,
} from './admission-family-contacts-model';

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
  guardianResponsibilityConfirmed: boolean;
  parentRelationship: '' | 'father' | 'mother';
  familyContacts: AdmissionFamilyContactsFormValues;
  existingFamilyId: string;
  existingParentApplicantId: string;
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
  guardianResponsibilityConfirmed: false,
  parentRelationship: '',
  familyContacts: initialAdmissionFamilyContacts,
  existingFamilyId: '',
  existingParentApplicantId: '',
  createSeparateFamily: false,
  separateFamilyReason: '',
};

const schema = Yup.object({
  familyContacts: admissionFamilyContactsSchema,
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
  guardianFirstName: Yup.string().trim().required('Parent first name is required.').max(128),
  guardianLastName: Yup.string().trim().max(128),
  guardianMobile: Yup.string()
    .required('Parent mobile is required.')
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  guardianEmail: Yup.string().email('Enter a valid email address.').max(256),
  guardianRelationship: Yup.number().oneOf([0, 1, 2, 3]).required('Relationship is required.'),
  parentRelationship: Yup.string()
    .oneOf(['father', 'mother'], 'Select Father or Mother.')
    .required('Select Father or Mother.'),
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
  const [pendingGuardian, setPendingGuardian] = useState<AdmissionFamilyContactsFormValues | null>(
    null
  );
  const identityRef = useRef('');
  const fieldsRef = useRef<HTMLDivElement>(null);
  const requestErrorRef = useRef<HTMLDivElement>(null);
  const lastFocusedSubmit = useRef(0);
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
      const mainGuardian =
        values.parentRelationship &&
        buildAdmissionFamilyContacts(values.familyContacts, values.parentRelationship)
          .mainContactRelationship === 'guardian';
      if (
        (mainGuardian || values.guardianRelationship !== 0) &&
        !values.guardianResponsibilityConfirmed
      ) {
        setPendingGuardian(values.familyContacts);
        return;
      }
      const lookupKey = `${values.offeringId}:${values.guardianMobile}:${normalizeEmail(values.guardianEmail)}`;
      if (familyLookupKey !== lookupKey) {
        setRequestError(
          'Check existing families using these parent contact details before continuing.'
        );
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
          counsellorId: null,
          existingFamilyId: values.existingFamilyId || null,
          existingParentApplicantId: values.existingParentApplicantId || null,
          parentRelationship: values.parentRelationship || undefined,
          familyContacts: buildAdmissionFamilyContacts(
            values.familyContacts,
            values.parentRelationship as 'father' | 'mother'
          ),
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
          guardianEmail: normalizeEmail(values.guardianEmail) || null,
          guardianRelationship: values.guardianRelationship,
          guardianResponsibilityConfirmed: Boolean(
            (mainGuardian || values.guardianRelationship !== 0) &&
            values.guardianResponsibilityConfirmed
          ),
        }).unwrap();
        if (!application.id)
          throw new Error('Registration response did not include an application.');
        formik.resetForm();
        shikshaMitraToast.success({ message: 'Registration started.' });
        onClose();
        router.push(`${studentPaths.enrollment.applications}/${application.id}`);
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Registration could not be started.',
        });
      }
    },
  });
  const busy = startState.isLoading || formik.isSubmitting || familyLookup.isFetching;
  useEffect(() => {
    if (
      !formik.submitCount ||
      formik.isValidating ||
      formik.isSubmitting ||
      lastFocusedSubmit.current === formik.submitCount ||
      !Object.keys(formik.errors).length
    )
      return;
    const invalidField = fieldsRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!invalidField) return;
    const focusTarget =
      invalidField.querySelector<HTMLElement>(
        'input:not([type="hidden"]), [contenteditable="true"], [tabindex="0"]'
      ) ?? invalidField;
    lastFocusedSubmit.current = formik.submitCount;
    focusTarget.focus();
    invalidField.scrollIntoView?.({ block: 'center' });
  }, [formik.submitCount, formik.isValidating, formik.isSubmitting, formik.errors]);
  useEffect(() => {
    if (!requestError || busy) return;
    requestErrorRef.current?.focus();
    requestErrorRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [requestError, busy]);
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
        forSpecialRegistration: true,
        // RTE is direct-only. Existing Management/Staff Both offerings also allow registration.
        entryMode: formik.values.track === 1 ? 1 : undefined,
        isActive: true,
        availabilityStatus: 2,
        search: search === selectedOffering?.name ? undefined : search || undefined,
        skipCount,
        maxResultCount: 25,
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

  const changeIdentity = (
    field: 'offeringId' | 'guardianMobile' | 'guardianEmail' | 'parentRelationship',
    value: string,
    changes: Partial<FormValues> = {}
  ) => {
    formik.setValues((values) => ({
      ...values,
      ...changes,
      ...((field === 'offeringId' || field === 'parentRelationship') && {
        guardianResponsibilityConfirmed: false,
      }),
      [field]: value,
      ...(field === 'offeringId' && { counsellorId: '' }),
      existingFamilyId: '',
      existingParentApplicantId: '',
      createSeparateFamily: false,
      separateFamilyReason: '',
    }));
    setFamilyMatches(null);
    setPendingGuardian(null);
    setFamilyLookupKey('');
    setRequestError('');
    identityRef.current = '';
  };
  const checkFamilies = async () => {
    const { offeringId, guardianMobile } = formik.values;
    const guardianEmail = normalizeEmail(formik.values.guardianEmail);
    if (!offeringId || !/^[6-9]\d{9}$/.test(guardianMobile)) {
      setRequestError('Select an offering and enter a valid mobile number first.');
      return;
    }
    setRequestError('');
    const lookupKey = `${offeringId}:${guardianMobile}:${guardianEmail}`;
    identityRef.current = lookupKey;
    try {
      const matches = await findFamilies({
        offeringId,
        guardianMobile,
        guardianEmail: guardianEmail || undefined,
      }).unwrap();
      if (identityRef.current !== lookupKey) return;
      setFamilyMatches(matches);
      setFamilyLookupKey(lookupKey);
    } catch (error) {
      if (identityRef.current !== lookupKey) return;
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Family check failed. Please retry.',
      });
    }
  };
  const field = (name: keyof FormValues, label: string, required = false) => (
    <ShakingTextField error={Boolean(formik.touched[name] && formik.errors[name])}>
      <TextField
        fullWidth
        size="small"
        name={name}
        type={name === 'guardianEmail' ? 'email' : 'text'}
        label={label}
        required={required}
        value={formik.values[name]}
        onChange={
          name === 'guardianEmail'
            ? (event) => changeIdentity('guardianEmail', normalizeEmail(event.target.value))
            : formik.handleChange
        }
        inputProps={
          name === 'guardianEmail'
            ? { autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false }
            : undefined
        }
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
            sx={{ width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } }}
            onClick={requestClose}
            disabled={busy}
          >
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />
        <Scrollbar sx={{ flex: 1, bgcolor: 'background.neutral' }}>
          <FormBusyRegion
            busy={busy}
            label={familyLookup.isFetching ? 'Checking families…' : 'Starting registration…'}
          >
            <FormFieldSpacing>
              <Stack ref={fieldsRef} spacing={2} sx={{ p: 2 }}>
                {(cyclesQuery.isError || offeringsQuery.isError) && (
                  <StudentFeedback
                    notificationKey="STU-0054"
                    presentation="toast"
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
                  </StudentFeedback>
                )}
                <FormSectionCard
                  icon={GlobalIcons.admissionInterest}
                  title="Offering"
                  descriptionTooltip="Choose an open admission cycle, then an active RTE, Management or Staff offering that starts with Registration. General offerings start from Inquiries."
                  action={
                    <Button
                      size="small"
                      type="button"
                      variant="outlined"
                      disabled={busy || cyclesQuery.isFetching || offeringsQuery.isFetching}
                      startIcon={<Iconify icon="mdi:refresh" />}
                      onClick={() => setReload((value) => value + 1)}
                    >
                      Refresh Choices
                    </Button>
                  }
                >
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
                        setSelectedOffering(null);
                        changeIdentity('offeringId', '', { admissionCycle: cycle });
                      }}
                      onBlur={() => formik.setFieldTouched('admissionCycle', true)}
                      error={Boolean(formik.touched.admissionCycle && formik.errors.admissionCycle)}
                      helperText={
                        formik.touched.admissionCycle && formik.errors.admissionCycle
                          ? String(formik.errors.admissionCycle)
                          : 'Published, open cycles for the selected academic year.'
                      }
                      noOptionsText={
                        cyclesQuery.isError
                          ? 'Admission cycles could not be loaded.'
                          : 'No matching published, open admission cycle. Clear the search or check Admission Settings → Admission Periods for the selected academic year.'
                      }
                    />
                  </ShakingTextField>
                  <ShakingTextField>
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
                        setSelectedOffering(null);
                        changeIdentity('offeringId', '', {
                          track: Number(value) as FormValues['track'],
                        });
                      }}
                    />
                  </ShakingTextField>
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
                      filterOptions={(options) => options}
                      minChars={0}
                      getOptionLabel={(offering) => offering.name}
                      getOptionKey={(offering) => offering.id}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderOption={({ key, ...props }, offering) => (
                        <li key={key} {...props}>
                          <Stack>
                            <Typography variant="body2">{offering.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[
                                offering.boardName,
                                offering.mediumName,
                                offering.standardName,
                              ].join(' · ')}
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
                      helperText={
                        formik.touched.offeringId && formik.errors.offeringId
                          ? formik.errors.offeringId
                          : !formik.values.admissionCycle
                            ? 'Select an admission cycle first to load offerings.'
                            : 'Only active, open offerings for this admission type are available.'
                      }
                      noOptionsText={
                        offeringsQuery.isError
                          ? 'Admission offerings could not be loaded.'
                          : !formik.values.admissionCycle
                            ? 'Select an admission cycle first.'
                            : `No matching active, open ${formik.values.track === 1 ? 'RTE' : formik.values.track === 2 ? 'Management' : 'Staff'} offering. Clear the search or check its type, published workflow and activation in Admission Settings → Admission Offering, then refresh choices.`
                      }
                    />
                  </ShakingTextField>
                  {capacity && (
                    <StudentFeedback
                      notificationKey="STU-0055"
                      presentation={capacity.isFull ? 'persistent' : 'inline'}
                      severity={capacity.isFull ? 'warning' : 'info'}
                    >
                      {capacity.capacity == null
                        ? 'Admission room capacity is not set. Division seats are checked during onboarding.'
                        : `${capacity.remainingSeats} of ${capacity.capacity} admission room seats available.`}
                      {capacity.isFull &&
                        ' Admission room capacity is full; you can still register.'}
                    </StudentFeedback>
                  )}
                </FormSectionCard>
                <FormSectionCard
                  icon={GlobalIcons.admissionStudent}
                  title="Applicant"
                  descriptionTooltip="Enter the student's basic identity. These details will be carried into the Registration Form."
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {field('applicantFirstName', 'First name', true)}
                    {field('applicantMiddleName', 'Middle name')}
                    {field('applicantLastName', 'Last name')}
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ShakingTextField
                      error={Boolean(formik.submitCount && formik.errors.applicantDateOfBirth)}
                    >
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
                            error: Boolean(
                              formik.submitCount && formik.errors.applicantDateOfBirth
                            ),
                            helperText: formik.submitCount
                              ? formik.errors.applicantDateOfBirth
                              : undefined,
                          },
                        }}
                      />
                    </ShakingTextField>
                    <ShakingTextField
                      error={Boolean(formik.submitCount && formik.errors.applicantGender)}
                    >
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
                    </ShakingTextField>
                  </Stack>
                </FormSectionCard>
                <FormSectionCard
                  icon={GlobalIcons.family}
                  title="Parent Details"
                  descriptionTooltip="Check the parent's email and mobile for an existing family. Confirm the parent before adding a sibling."
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {field('guardianFirstName', 'First name', true)}
                    {field('guardianLastName', 'Last name')}
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ShakingTextField
                      error={Boolean(formik.touched.guardianMobile && formik.errors.guardianMobile)}
                    >
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
                        error={Boolean(
                          formik.touched.guardianMobile && formik.errors.guardianMobile
                        )}
                        helperText={formik.touched.guardianMobile && formik.errors.guardianMobile}
                      />
                    </ShakingTextField>
                    {field('guardianEmail', 'Email')}
                  </Stack>
                  <ShakingTextField
                    error={Boolean(
                      (formik.touched.parentRelationship || formik.submitCount) &&
                      formik.errors.parentRelationship
                    )}
                  >
                    <CustomSelect
                      fullWidth
                      size="small"
                      label="Relationship"
                      required
                      name="parentRelationship"
                      value={formik.values.parentRelationship}
                      onChange={(value) => changeIdentity('parentRelationship', String(value))}
                      onBlur={() => formik.setFieldTouched('parentRelationship', true)}
                      error={Boolean(
                        (formik.touched.parentRelationship || formik.submitCount) &&
                        formik.errors.parentRelationship
                      )}
                      helperText={
                        formik.touched.parentRelationship || formik.submitCount
                          ? formik.errors.parentRelationship
                          : undefined
                      }
                      options={[
                        { value: 'father', label: 'Father' },
                        { value: 'mother', label: 'Mother' },
                      ]}
                    />
                  </ShakingTextField>
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
                    <StudentFeedback
                      notificationKey="STU-0056"
                      presentation={familyMatches.length ? 'persistent' : 'inline'}
                      severity={familyMatches.length ? 'warning' : 'success'}
                    >
                      {familyMatches.length
                        ? 'Existing family found. Link it or explain why this is a separate family.'
                        : 'No family is available to link in your scope. You can continue with a new family.'}
                    </StudentFeedback>
                  )}
                  {familyMatches?.map((family) => (
                    <AdmissionSiblingFamilyMatch
                      key={family.familyId}
                      parents={family.parents ?? []}
                      children={`${family.familyNumber}${family.applicants.length ? ` · ${family.applicants.join(', ')}` : ''}`}
                      busy={busy}
                      enteredMobile={formik.values.guardianMobile}
                      mobileDiffers={family.matchByEmail === true && family.matchByMobile !== true}
                      onConfirm={(parent) => {
                        const parentReviewError = getAdmissionSiblingParentReviewError(
                          formik.values.familyContacts,
                          formik.values.parentRelationship,
                          parent.relationship
                        );
                        if (parentReviewError) {
                          setRequestError(parentReviewError);
                          return;
                        }
                        setRequestError('');
                        const nextMobile = parent.mobile || formik.values.guardianMobile;
                        const nextEmail = normalizeEmail(parent.email || '');
                        formik.setValues((values) => ({
                          ...values,
                          existingFamilyId: family.familyId,
                          existingParentApplicantId: parent.sourceApplicantId,
                          parentRelationship: parent.relationship,
                          guardianResponsibilityConfirmed:
                            values.parentRelationship === parent.relationship &&
                            values.guardianResponsibilityConfirmed,
                          guardianFirstName: parent.firstName,
                          guardianLastName: parent.lastName || '',
                          guardianEmail: nextEmail,
                          guardianMobile: nextMobile,
                          createSeparateFamily: false,
                        }));
                        const key = `${formik.values.offeringId}:${nextMobile}:${nextEmail}`;
                        identityRef.current = key;
                        setFamilyLookupKey(key);
                      }}
                    />
                  ))}
                  {formik.values.existingFamilyId && (
                    <StudentFeedback
                      notificationKey="STU-0057"
                      presentation="inline"
                      severity="info"
                    >
                      Sibling family confirmed. Saved parent details will be reused.
                    </StudentFeedback>
                  )}
                  {Boolean(familyMatches?.length) && (
                    <Button
                      type="button"
                      size="small"
                      color="inherit"
                      variant={formik.values.createSeparateFamily ? 'contained' : 'outlined'}
                      onClick={() => {
                        formik.setFieldValue('existingFamilyId', '');
                        formik.setFieldValue('existingParentApplicantId', '');
                        formik.setFieldValue('createSeparateFamily', true);
                      }}
                    >
                      Create a separate family
                    </Button>
                  )}
                  {formik.values.createSeparateFamily &&
                    field('separateFamilyReason', 'Reason for separate family', true)}
                </FormSectionCard>
                <AdmissionFamilyContacts
                  parentRelationship={formik.values.parentRelationship}
                  value={formik.values.familyContacts}
                  errors={formik.errors.familyContacts}
                  touched={formik.touched.familyContacts}
                  submitted={formik.submitCount > 0}
                  disabled={busy}
                  onChange={(value) => {
                    const mainGuardian =
                      value.mainContactRelationship === 'guardian' && value.addGuardian;
                    if (
                      mainGuardian &&
                      formik.values.familyContacts.mainContactRelationship !== 'guardian'
                    ) {
                      setPendingGuardian(value);
                      return;
                    }
                    formik.setValues((current) => ({
                      ...current,
                      familyContacts: value,
                      guardianResponsibilityConfirmed: Boolean(
                        mainGuardian && current.guardianResponsibilityConfirmed
                      ),
                    }));
                  }}
                  onBlur={(name) => formik.setFieldTouched(`familyContacts.${name}`, true)}
                />
                {requestError && (
                  <StudentFeedback
                    notificationKey="STU-0058"
                    presentation="persistent"
                    ref={requestErrorRef}
                    tabIndex={-1}
                    severity="error"
                  >
                    {requestError}
                  </StudentFeedback>
                )}
              </Stack>
            </FormFieldSpacing>
          </FormBusyRegion>
        </Scrollbar>
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
      <GuardianResponsibilityConfirmation
        open={Boolean(pendingGuardian)}
        busy={busy}
        onClose={() => setPendingGuardian(null)}
        onConfirm={() => {
          if (!pendingGuardian) return;
          formik.setValues((current) => ({
            ...current,
            familyContacts: pendingGuardian,
            guardianResponsibilityConfirmed: true,
          }));
          setPendingGuardian(null);
        }}
      />
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Unsaved Registration?"
        content="The applicant and parent details entered here will be lost."
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
