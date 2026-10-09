'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { OnboardingAvailableOffering } from 'src/redux/student/onboarding/student-onboarding-api';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { useGetAvailableOnboardingOfferingsQuery } from 'src/redux/student/onboarding/student-onboarding-api';
import {
  Box,
  Alert,
  Stack,
  Button,
  Switch,
  Accordion,
  TextField,
  Typography,
  Autocomplete,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { SettingsDrawer, SettingsSectionCard } from './onboarding-settings-drawer';
import {
  hasOfferingReadinessConflict,
  buildOfferingReadinessProfile,
} from './offering-readiness-model';
import {
  defaultOnboardingProfiles,
  defaultReadinessAccessRules,
  createAllAcademicApplicability,
} from '../onboarding-settings-model';

import type {
  ApprovalMode,
  OnboardingProfile,
  ReadinessAccessRules,
  ConditionalApprovalTrigger,
} from '../onboarding-settings-model';

const approvalOptions = [
  { value: 'none', label: 'No approval' },
  { value: 'always', label: 'Approval for every student' },
  { value: 'conditional', label: 'Approval for selected exceptions' },
];
const approvalConditions: Array<{ value: ConditionalApprovalTrigger; label: string }> = [
  { value: 'manual-identifier', label: 'Manual GR entry' },
  { value: 'division-change', label: 'Division change' },
  { value: 'mid-year-admission', label: 'Mid-year admission' },
];
const activationChecks = [
  'Admission confirmed',
  'Required documents verified',
  'Division assigned',
  'GR and Roll numbers assigned',
  'Fee structure confirmed',
];
const offeringLabel = (offering: OnboardingAvailableOffering) =>
  offering.boardName
    ? `${offering.name} · ${offering.admissionCycleName} · ${offering.boardName} / ${offering.mediumName} / ${offering.standardName}`
    : offering.name;

export function ReadinessAccessSettingsScreen() {
  const router = useRouter();
  const { settings, scope, applyOnboardingProfile } = useOnboardingSettings();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canConfigure = hasGrantedPermission(permissions, studentPermissions.onboarding.settings);
  const canViewWorkflow = hasGrantedPermission(
    permissions,
    studentPermissions.enrollment.settings.workflows
  );
  const [openedProfile, setOpenedProfile] = useState<OnboardingProfile | null>(null);
  const [saveError, setSaveError] = useState(false);
  const offeringsQuery = useGetAvailableOnboardingOfferingsQuery(scope.academicYearId, {
    skip: !canConfigure,
  });
  const offerings = offeringsQuery.data ?? [];
  const templateIds = new Set(defaultOnboardingProfiles.map((profile) => profile.id));
  const profiles = settings.onboardingProfiles.filter(
    (profile) => Boolean(profile.offeringIds?.length) || !templateIds.has(profile.id)
  );
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: openedProfile?.name ?? '',
      offeringIds: openedProfile?.offeringIds ?? ([] as string[]),
      rules: openedProfile?.rules ?? defaultReadinessAccessRules,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required('Rule name is required.')
        .max(100)
        .test(
          'unique',
          'A readiness rule with this name already exists.',
          (name) =>
            !profiles.some(
              (profile) =>
                profile.id !== openedProfile?.id &&
                profile.name.trim().toLocaleLowerCase() === name?.trim().toLocaleLowerCase()
            )
        ),
      offeringIds: Yup.array()
        .of(Yup.string().required())
        .min(1, 'Select at least one Admission Offering.')
        .test(
          'conflict',
          'An Offering already has a readiness rule. Edit that rule or choose another Offering.',
          (ids) =>
            !hasOfferingReadinessConflict(
              settings.onboardingProfiles,
              openedProfile?.id ?? '',
              ids ?? []
            )
        )
        .test(
          'available',
          'Some Offerings could not be loaded. Refresh the list before saving.',
          (ids) => (ids ?? []).every((id) => offerings.some((offering) => offering.id === id))
        ),
      rules: Yup.object({
        approvalMode: Yup.string().oneOf(['none', 'always', 'conditional']).required(),
        approvalTriggers: Yup.array().when('approvalMode', {
          is: 'conditional',
          then: (schema) => schema.min(1, 'Select at least one approval condition.'),
        }),
      }),
    }),
    onSubmit: async (values) => {
      if (!openedProfile || !canConfigure || offeringsQuery.isError) return;
      setSaveError(false);
      try {
        await applyOnboardingProfile(
          buildOfferingReadinessProfile(
            openedProfile,
            values.name,
            offerings.filter((offering) => values.offeringIds.includes(offering.id)),
            values.rules
          )
        );
        setOpenedProfile(null);
      } catch {
        setSaveError(true);
      }
    },
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(
    Boolean(openedProfile && form.dirty && !form.isSubmitting),
    {
      push: router.push,
      title: 'Discard Unsaved Rule Changes?',
      description:
        'Your readiness rule changes have not been saved. Keep editing, or discard them.',
    }
  );
  const close = () => {
    if (!form.isSubmitting) requestNavigation(() => setOpenedProfile(null));
  };
  const open = (profile?: OnboardingProfile) => {
    setSaveError(false);
    setOpenedProfile(
      profile ?? {
        id: crypto.randomUUID(),
        name: '',
        description: 'Offering-based admission readiness and app access.',
        offeringIds: [],
        admissionRoutes: [],
        applicability: createAllAcademicApplicability(),
        rules: {
          ...defaultReadinessAccessRules,
          approvalTriggers: [...defaultReadinessAccessRules.approvalTriggers],
          checks: defaultReadinessAccessRules.checks.map((check) => ({ ...check })),
          credentialProvisioningMode: 'automatic',
        },
      }
    );
  };
  const setRule = <K extends keyof ReadinessAccessRules>(key: K, value: ReadinessAccessRules[K]) =>
    form.setFieldValue('rules', { ...form.values.rules, [key]: value });
  const rows = profiles.map((profile) => {
    const linked = offerings.filter((offering) => profile.offeringIds?.includes(offering.id));
    return {
      id: profile.id,
      name: profile.name,
      offerings: linked.map((offering) => offering.name).join(', ') || 'Link an Admission Offering',
      academicContext:
        [
          ...new Set(
            linked.map(
              (offering) =>
                `${offering.boardName} / ${offering.mediumName} / ${offering.standardName}`
            )
          ),
        ].join(', ') || 'Review required',
      approval:
        approvalOptions.find((option) => option.value === profile.rules.approvalMode)?.label ??
        'Approval for every student',
      loginEmails:
        [
          profile.rules.sendStudentCredentialEmail ? 'Student' : '',
          profile.rules.sendGuardianCredentialEmail ? 'Parent/guardian' : '',
        ]
          .filter(Boolean)
          .join(', ') || 'Off',
      profile,
    };
  });
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Rule',
      minWidth: 200,
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string',
    },
    {
      id: 'offerings',
      label: 'Admission Offerings',
      minWidth: 230,
      filterType: 'string',
      cellSx: { whiteSpace: 'normal' },
    },
    {
      id: 'academicContext',
      label: 'Board / Medium / Class',
      minWidth: 240,
      filterType: 'string',
      cellSx: { whiteSpace: 'normal' },
    },
    {
      id: 'approval',
      label: 'Approval',
      minWidth: 180,
      filterType: 'enum',
      enumOptions: approvalOptions.map(({ label }) => ({ value: label, label })),
    },
    { id: 'loginEmails', label: 'Login emails', minWidth: 150, filterType: 'string' },
    {
      id: 'actions',
      label: 'Action',
      width: 80,
      align: 'center',
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      render: (_value, row) => (
        <ThreeDotsActions
          showEditIcon={canConfigure}
          showViewIcon={!canConfigure}
          showThreeDots={false}
          editLabel="Edit rule"
          viewLabel="View rule"
          handleEditClick={() => open(row.profile as OnboardingProfile)}
          handleViewClick={() => open(row.profile as OnboardingProfile)}
        />
      ),
    },
  ];
  const selectedOfferings = form.values.offeringIds.map((id) =>
    offerings.find((offering) => offering.id === id)
  );
  const approvalError = form.touched.rules?.approvalTriggers && form.errors.rules?.approvalTriggers;
  return (
    <Box sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Readiness & Access"
        description="Connect Admission Offerings to activation requirements and app login emails."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Readiness & Access' },
        ]}
        action={
          canConfigure ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              onClick={() => open()}
            >
              Add Readiness Rule
            </Button>
          ) : undefined
        }
      />
      {!canConfigure && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Onboarding settings access is required to select and review linked Offerings.
        </Alert>
      )}
      {offeringsQuery.isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => offeringsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Admission Offerings could not be loaded.
        </Alert>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CustomizableTable
          tableId="student-onboarding-readiness-access-rules"
          tableTitle="Readiness & access rules"
          columns={columns}
          data={rows}
          isLoading={canConfigure && offeringsQuery.isLoading}
          isFilter
          isSearch
          searchFieldProps={{ placeholder: 'Search...' }}
          noDataText="No Offering-based readiness rules yet. Add a readiness rule to configure activation."
          wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
          tableContainerProps={{ sx: { flex: 1, minHeight: 0, height: '100%' } }}
        />
      </Box>
      <SettingsDrawer
        open={Boolean(openedProfile)}
        title={
          profiles.some((profile) => profile.id === openedProfile?.id)
            ? 'Edit Readiness Rule'
            : 'Add Readiness Rule'
        }
        description="Select an Admission Offering. Its workflow supplies the requirements used before student activation."
        descriptionDisplay="tooltip"
        icon="mdi:clipboard-check-outline"
        statusLabel=""
        onClose={close}
        onSubmit={() => form.submitForm()}
        submitLabel="Submit"
        submitDisabled={!canConfigure || offeringsQuery.isFetching || offeringsQuery.isError}
        busy={form.isSubmitting}
      >
        <Box
          component="fieldset"
          disabled={!canConfigure}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <Stack spacing={2}>
            <SettingsSectionCard
              title="Rule & Admission Offerings"
              icon="mdi:clipboard-text-outline"
              description="Connect one or more Admission Offerings. Each Offering can use one readiness rule."
              descriptionDisplay="tooltip"
            >
              <Stack spacing={2}>
                <TextField
                  size="small"
                  fullWidth
                  label="Rule name"
                  name="name"
                  required
                  value={form.values.name}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={Boolean(form.touched.name && form.errors.name)}
                  helperText={form.touched.name && form.errors.name}
                />
                <Autocomplete
                  multiple
                  size="small"
                  disableCloseOnSelect
                  options={offerings}
                  value={selectedOfferings.map(
                    (offering, index) =>
                      offering ??
                      ({
                        id: form.values.offeringIds[index],
                        name: 'Unavailable Offering',
                      } as OnboardingAvailableOffering)
                  )}
                  getOptionLabel={offeringLabel}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={offeringsQuery.isFetching}
                  disabled={!canConfigure || offeringsQuery.isLoading}
                  onChange={(_event, values) =>
                    form.setFieldValue(
                      'offeringIds',
                      values.map((offering) => offering.id)
                    )
                  }
                  onBlur={() => form.setFieldTouched('offeringIds', true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Admission Offerings"
                      error={Boolean(form.touched.offeringIds && form.errors.offeringIds)}
                      helperText={form.touched.offeringIds ? form.errors.offeringIds : undefined}
                    />
                  )}
                />
                {offeringsQuery.isError && (
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={() => offeringsQuery.refetch()}>
                        Retry
                      </Button>
                    }
                  >
                    Could not load Offerings. Your selected values are retained.
                  </Alert>
                )}
                {!offeringsQuery.isFetching &&
                  !offeringsQuery.isError &&
                  canConfigure &&
                  !offerings.length && (
                    <Alert severity="info">
                      No Admission Offerings are available. Configure an Offering in Admissions
                      first.
                    </Alert>
                  )}
                {selectedOfferings
                  .filter((offering): offering is OnboardingAvailableOffering => Boolean(offering))
                  .map((offering) => (
                    <Box
                      key={offering.id}
                      sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}
                    >
                      <Typography variant="subtitle2">{offering.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {offering.boardName} · {offering.mediumName} · {offering.standardName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Workflow: {offering.workflowName ?? 'Not configured'}
                        {offering.workflowVersion ? ` · Version ${offering.workflowVersion}` : ''}
                      </Typography>
                      {canViewWorkflow && offering.workflowDefinitionId && (
                        <Button
                          component="a"
                          href={`${studentPaths.enrollment.settings.workflows}/${offering.workflowDefinitionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          endIcon={<Iconify icon="mdi:open-in-new" />}
                          aria-label={`View requirements for ${offering.name}`}
                        >
                          View requirements
                        </Button>
                      )}
                    </Box>
                  ))}
              </Stack>
            </SettingsSectionCard>
            <SettingsSectionCard
              title="Required Before Activation"
              icon="mdi:clipboard-check-outline"
              description="Document requirements come from the student's admission workflow. All required checks must be complete."
              descriptionDisplay="tooltip"
            >
              <Stack spacing={1}>
                {activationChecks.map((check) => (
                  <Stack key={check} direction="row" spacing={1} alignItems="center">
                    <Iconify
                      icon="mdi:check-circle-outline"
                      width={18}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body2">{check}</Typography>
                  </Stack>
                ))}
                <CustomSelect
                  fullWidth
                  size="small"
                  label="Approval requirement"
                  value={form.values.rules.approvalMode}
                  options={approvalOptions}
                  onChange={(value) => setRule('approvalMode', value as ApprovalMode)}
                />
                {form.values.rules.approvalMode === 'conditional' && (
                  <Autocomplete
                    multiple
                    size="small"
                    options={approvalConditions}
                    value={approvalConditions.filter((option) =>
                      form.values.rules.approvalTriggers.includes(option.value)
                    )}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    onChange={(_event, values) =>
                      setRule(
                        'approvalTriggers',
                        values.map((option) => option.value)
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Approval conditions"
                        required
                        error={Boolean(approvalError)}
                        helperText={approvalError}
                      />
                    )}
                  />
                )}
              </Stack>
            </SettingsSectionCard>
            <SettingsSectionCard
              title="App Login Emails"
              icon="mdi:email-outline"
              description="Accounts are created or linked for the selected recipients after activation."
              descriptionDisplay="tooltip"
            >
              <Stack spacing={1.5}>
                <FormControlLabel
                  sx={{ m: 0, justifyContent: 'space-between' }}
                  labelPlacement="start"
                  label="Email login details to student"
                  control={
                    <Switch
                      checked={form.values.rules.sendStudentCredentialEmail}
                      onChange={(_event, checked) => setRule('sendStudentCredentialEmail', checked)}
                    />
                  }
                />
                <FormControlLabel
                  sx={{ m: 0, justifyContent: 'space-between' }}
                  labelPlacement="start"
                  label="Email login details to parent/guardian"
                  control={
                    <Switch
                      checked={form.values.rules.sendGuardianCredentialEmail}
                      onChange={(_event, checked) =>
                        setRule('sendGuardianCredentialEmail', checked)
                      }
                    />
                  }
                />
                {(form.values.rules.sendStudentCredentialEmail ||
                  form.values.rules.sendGuardianCredentialEmail) && (
                  <CustomSelect
                    fullWidth
                    size="small"
                    label="Send emails"
                    value={form.values.rules.credentialProvisioningMode}
                    options={[
                      { value: 'automatic', label: 'Automatically after activation' },
                      { value: 'manual', label: 'Staff sends after activation' },
                    ]}
                    onChange={(value) =>
                      setRule('credentialProvisioningMode', value as 'automatic' | 'manual')
                    }
                  />
                )}
              </Stack>
            </SettingsSectionCard>
            <Accordion disableGutters elevation={0}>
              <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={20} />}>
                <Typography variant="subtitle2">Advanced settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {form.values.rules.sendGuardianCredentialEmail && (
                    <CustomSelect
                      fullWidth
                      size="small"
                      label="Parent/guardian account contact"
                      value={form.values.rules.guardianAccountRelationship}
                      options={[
                        { value: 'guardian', label: 'Guardian' },
                        { value: 'father', label: 'Father' },
                        { value: 'mother', label: 'Mother' },
                      ]}
                      onChange={(value) =>
                        setRule(
                          'guardianAccountRelationship',
                          value as 'guardian' | 'father' | 'mother'
                        )
                      }
                    />
                  )}
                  {form.values.rules.checks.map((check) => (
                    <TextField
                      key={check.key}
                      size="small"
                      fullWidth
                      label={`${check.label} owner`}
                      value={check.owner}
                      onChange={(event) =>
                        setRule(
                          'checks',
                          form.values.rules.checks.map((item) =>
                            item.key === check.key ? { ...item, owner: event.target.value } : item
                          )
                        )
                      }
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
            {saveError && (
              <Alert severity="error">
                The readiness rule could not be saved. Your changes are retained; review the values
                and retry.
              </Alert>
            )}
          </Stack>
        </Box>
      </SettingsDrawer>
      {confirmation}
    </Box>
  );
}
