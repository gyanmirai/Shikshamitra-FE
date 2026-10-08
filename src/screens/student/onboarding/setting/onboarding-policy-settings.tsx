'use client';

import type { TooltipProps } from '@mui/material';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { SettingsDrawer, SettingsSectionCard } from './onboarding-number-settings';
import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';
import {
  getOnboardingSchoolLevelName,
  useOnboardingAcademicStructure,
} from './use-onboarding-academic-structure';
import {
  academicTargetsOverlap,
  getAcademicApplicabilityScore,
  createAllAcademicApplicability,
} from '../onboarding-settings-model';
import {
  AcademicApplicabilityFields,
  getAcademicApplicabilitySummary,
  getSingleAcademicPathValidationError,
  createEmptySingleAcademicApplicability,
} from './onboarding-academic-applicability';

import type {
  ApprovalMode,
  OnboardingProfile,
  ReadinessCheckKey,
  ReadinessAccessRules,
  ConditionalApprovalTrigger,
} from '../onboarding-settings-model';

const readinessOwnerOptions = [
  'Admission team',
  'Records team',
  'Student administrator',
  'Academic coordinator',
  'IT administrator',
];

const approvalTriggerOptions: Array<{
  value: ConditionalApprovalTrigger;
  label: string;
}> = [
    { value: 'manual-identifier', label: 'Manual GR entry' },
    { value: 'division-change', label: 'Division change after initial placement' },
    { value: 'mid-year-admission', label: 'Mid-year admission' },
    { value: 'incomplete-optional-check', label: 'Optional document check is incomplete' },
  ];

export function ReadinessAccessSettingsScreen() {
  const router = useRouter();
  const { settings, scope, applyOnboardingProfile, setAvailableSchoolLevels } = useOnboardingSettings();
  const filters = useOnboardingAcademicStructure();
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [availableLevelsDraft, setAvailableLevelsDraft] = useState<string[] | null>(
    settings.academicAvailability?.schoolLevelNames ?? null
  );
  const configuredLevels = Array.from(new Set(filters.allBoards.flatMap((board) =>
    (board.educationMediums ?? []).flatMap((medium) =>
      (medium.educationMediumStages ?? []).map((stage) =>
        getOnboardingSchoolLevelName(board.name, medium.name, stage.name)
      )
    )
  ))).sort((first, second) => first.localeCompare(second));
  const usedLevelIds = [
    ...settings.onboardingProfiles.map((profile) => profile.applicability),
    ...settings.grNumber.configurations,
    ...settings.rollNumber.configurations,
    ...settings.divisionChange.configurations,
  ].filter((rule) => rule.stageMode === 'selected').flatMap((rule) => rule.academicMediumStageIds);
  const usedLevelNames = new Set(filters.allBoards.flatMap((board) =>
    (board.educationMediums ?? []).flatMap((medium) =>
      (medium.educationMediumStages ?? [])
        .filter((stage) => usedLevelIds.includes(stage.id))
        .map((stage) => getOnboardingSchoolLevelName(board.name, medium.name, stage.name))
    )
  ));
  const excludedUsedLevels = availableLevelsDraft === null ? [] :
    [...usedLevelNames].filter((name) => !availableLevelsDraft.includes(name));
  const availabilityDirty = JSON.stringify(availableLevelsDraft) !==
    JSON.stringify(settings.academicAvailability?.schoolLevelNames ?? null);
  const availabilityInvalid = !configuredLevels.length ||
    (availableLevelsDraft !== null && (!availableLevelsDraft.length || excludedUsedLevels.length > 0));
  const availabilitySaveDisabled = availabilitySaving || !availabilityDirty || availabilityInvalid;
  const closeAvailability = () => {
    if (availabilitySaving) return;
    if (availabilityDirty && !window.confirm('Discard unsaved school-level changes?')) return;
    setAvailabilityOpen(false);
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<OnboardingProfile | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState(
    settings.onboardingProfiles[0]?.id ?? ''
  );
  const selectedProfile =
    pendingProfile ??
    settings.onboardingProfiles.find((profile) => profile.id === selectedProfileId) ??
    settings.onboardingProfiles[0];
  const saved = selectedProfile?.rules ?? settings.readinessAccess;
  const savedApplicability = selectedProfile?.applicability ?? createAllAcademicApplicability();
  const [profileNameDraft, setProfileNameDraft] = useState(selectedProfile?.name ?? '');
  const [nameTouched, setNameTouched] = useState(false);
  const [routeTouched, setRouteTouched] = useState(false);
  const [admissionRouteDraft, setAdmissionRouteDraft] = useState(
    selectedProfile?.admissionRoutes[0] ?? ''
  );
  const [creationMode, setCreationMode] = useState<'rule' | 'override' | null>(null);
  const [draft, setDraft] = useState(saved);
  const [applicabilityDraft, setApplicabilityDraft] = useState(savedApplicability);
  const isNewProfile = Boolean(pendingProfile);
  const routeMatchesDraft = (routes: string[]) => routes.some((route) =>
    route.toLocaleLowerCase() === admissionRouteDraft.trim().toLocaleLowerCase()
  );
  const isDirty =
    isNewProfile ||
    profileNameDraft.trim() !== selectedProfile?.name ||
    admissionRouteDraft !== selectedProfile?.admissionRoutes[0] ||
    JSON.stringify(saved) !== JSON.stringify(draft) ||
    JSON.stringify(savedApplicability) !== JSON.stringify(applicabilityDraft);
  const { requestNavigation, confirmation } = useUnsavedNavigation(
    drawerOpen && isDirty && !reviewSaving,
    {
      push: router.push,
      title: 'Discard Unsaved Rule Changes?',
      description: 'Your changes to this readiness rule have not been saved. Keep editing, or discard them to leave this form.',
    }
  );
  const applicabilityError = getSingleAcademicPathValidationError(applicabilityDraft);
  const hasApplicabilityConflict = settings.onboardingProfiles.some(
    (profile) =>
      profile.id !== selectedProfile?.id &&
      routeMatchesDraft(profile.admissionRoutes) &&
      getAcademicApplicabilityScore(profile.applicability) ===
      getAcademicApplicabilityScore(applicabilityDraft) &&
      academicTargetsOverlap(profile.applicability, applicabilityDraft)
  );
  const broaderRules = settings.onboardingProfiles.filter((profile) =>
    profile.id !== selectedProfile?.id &&
    routeMatchesDraft(profile.admissionRoutes) &&
    getAcademicApplicabilityScore(profile.applicability) <
    getAcademicApplicabilityScore(applicabilityDraft) &&
    academicTargetsOverlap(profile.applicability, applicabilityDraft)
  );
  const credentialValidationError =
    draft.sendStudentCredentialEmail && !draft.studentAccount
      ? 'Enable student account preparation before sending student emails.'
      : draft.sendGuardianCredentialEmail && !draft.guardianAccount
        ? 'Enable guardian account preparation before sending guardian emails.'
        : null;
  const nameError = !profileNameDraft.trim()
    ? 'Rule name is required.'
    : profileNameDraft.trim().length > 100
      ? 'Rule name must be 100 characters or fewer.'
      : settings.onboardingProfiles.some((profile) =>
        profile.id !== selectedProfile?.id &&
        profile.name.trim().toLocaleLowerCase() === profileNameDraft.trim().toLocaleLowerCase()
      ) ? 'A readiness rule with this name already exists.' : null;
  const routeError = !admissionRouteDraft.trim()
    ? 'Admission route is required.'
    : admissionRouteDraft.trim().length > 100
      ? 'Admission route must be 100 characters or fewer.' : null;
  const approvalError = draft.approvalMode === 'conditional' && !draft.approvalTriggers.length
    ? 'Select at least one condition for approval.' : null;
  const ownerError = draft.checks.find((check) => !check.owner.trim());
  const profileValidationError = nameError || routeError || applicabilityError ||
    (hasApplicabilityConflict
      ? 'Another rule for this admission route already covers this academic path.' : null) ||
    (ownerError ? `Choose an owner for ${ownerError.label}.` : null) ||
    approvalError || credentialValidationError;
  const setBooleanRule =
    (
      key:
        | 'requireDocuments'
        | 'requireIdentifiers'
        | 'requireApproval'
        | 'blockActivation'
        | 'studentAccount'
        | 'guardianAccount'
        | 'verifiedGuardianContact'
        | 'sendStudentCredentialEmail'
        | 'sendGuardianCredentialEmail'
    ) =>
      (value: boolean) =>
        setDraft((current) => ({ ...current, [key]: value }));

  const updateCheckRule = (
    key: ReadinessCheckKey,
    patch: Partial<ReadinessAccessRules['checks'][number]>
  ) => {
    setDraft((current) => ({
      ...current,
      requireDocuments:
        key === 'documents' && patch.required !== undefined
          ? patch.required
          : current.requireDocuments,
      requireIdentifiers:
        key === 'identifier' && patch.required !== undefined
          ? patch.required
          : current.requireIdentifiers,
      checks: current.checks.map((check) => (check.key === key ? { ...check, ...patch } : check)),
    }));
  };

  const updateApprovalMode = (approvalMode: ApprovalMode) => {
    setDraft((current) => ({
      ...current,
      approvalMode,
      requireApproval: approvalMode !== 'none',
    }));
  };

  const toggleApprovalTrigger = (trigger: ConditionalApprovalTrigger) => {
    setDraft((current) => ({
      ...current,
      approvalTriggers: current.approvalTriggers.includes(trigger)
        ? current.approvalTriggers.filter((item) => item !== trigger)
        : [...current.approvalTriggers, trigger],
    }));
  };

  useEffect(() => {
    setProfileNameDraft(selectedProfile?.name ?? '');
    setAdmissionRouteDraft(selectedProfile?.admissionRoutes[0] ?? '');
    setDraft(saved);
    setApplicabilityDraft(savedApplicability);
  }, [saved, savedApplicability, selectedProfile?.admissionRoutes, selectedProfile?.name]);

  useEffect(() => {
    if (selectedProfile) return;
    setSelectedProfileId(settings.onboardingProfiles[0]?.id ?? '');
  }, [selectedProfile, settings.onboardingProfiles]);

  const openProfileRules = (profileId: string) => {
    const profile = settings.onboardingProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    setPendingProfile(null);
    setNameTouched(false);
    setRouteTouched(false);
    setCreationMode(null);
    setSelectedProfileId(profileId);
    setProfileNameDraft(profile.name);
    setAdmissionRouteDraft(profile.admissionRoutes[0] ?? '');
    setDraft(profile.rules);
    setApplicabilityDraft(profile.applicability);
    setDrawerOpen(true);
  };

  const openNewRule = () => {
    const source = settings.onboardingProfiles[0];
    if (!source) return;

    const rule: OnboardingProfile = {
      ...source,
      id: `custom-readiness-rule-${Date.now()}`,
      name: 'New readiness rule',
      description: 'School-defined readiness and access rule.',
      admissionRoutes: [source.admissionRoutes[0] ?? 'Fresh admission'],
      applicability: createEmptySingleAcademicApplicability(),
      rules: {
        ...source.rules,
        approvalTriggers: source.rules.approvalTriggers.filter((trigger) => trigger !== 'capacity-override'),
        checks: source.rules.checks.map((check) => ({ ...check })),
      },
    };

    setPendingProfile(rule);
    setNameTouched(false);
    setRouteTouched(false);
    setCreationMode('rule');
    setSelectedProfileId(rule.id);
    setProfileNameDraft(rule.name);
    setAdmissionRouteDraft(rule.admissionRoutes[0]);
    setDraft(rule.rules);
    setApplicabilityDraft(rule.applicability);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (reviewSaving) return;
    requestNavigation(() => {
      setReviewOpen(false);
      setReviewError(false);
      setPendingProfile(null);
      setCreationMode(null);
      setDraft(saved);
      setApplicabilityDraft(savedApplicability);
      setDrawerOpen(false);
    });
  };

  const approvalLabel = (mode: ApprovalMode) => {
    if (mode === 'none') return 'No approval';
    if (mode === 'always') return 'Every student';
    return 'Exceptions only';
  };

  const accountSummary = (rules: ReadinessAccessRules) => {
    if (rules.studentAccount && rules.guardianAccount) return 'Student + guardian';
    if (rules.studentAccount) return 'Student only';
    if (rules.guardianAccount) return 'Guardian only';
    return 'Not prepared';
  };

  const admissionRoutes = Array.from(
    new Set(settings.onboardingProfiles.flatMap((profile) => profile.admissionRoutes))
  );
  const admissionRouteOptions = Array.from(
    new Set(settings.onboardingProfiles.map((profile) => profile.admissionRoutes.join(', ')))
  ).sort((first, second) => first.localeCompare(second));
  const ruleRows = settings.onboardingProfiles.map((profile) => {
    const requiredCount = profile.rules.checks.filter((check) => check.required).length;
    const blockingCount = profile.rules.checks.filter(
      (check) => check.required && check.blocking
    ).length;
    const credentialEmailRecipients = profile.rules.sendStudentCredentialEmail
      ? profile.rules.sendGuardianCredentialEmail ? 'Student + guardian' : 'Student'
      : profile.rules.sendGuardianCredentialEmail ? 'Guardian' : '';

    return {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      admissionRoute: profile.admissionRoutes.join(', '),
      academicCoverage: getAcademicApplicabilitySummary(
        profile.applicability, filters.allBoards, filters.campuses
      ),
      requiredChecks: requiredCount,
      requiredChecksLabel: `${requiredCount} of ${profile.rules.checks.length}`,
      blockingCount,
      approval: approvalLabel(profile.rules.approvalMode),
      approvalMode: profile.rules.approvalMode,
      accounts: accountSummary(profile.rules),
      credentialEmails: credentialEmailRecipients
        ? [
          credentialEmailRecipients,
          profile.rules.credentialSendingTime === 'completion'
            ? 'After onboarding' : 'After activation',
          profile.rules.credentialProvisioningMode === 'automatic'
            ? 'Automatic' : 'Staff sends',
        ].join(' · ')
        : 'Off',
      profile,
    };
  });
  const accountOptions = Array.from(new Set(ruleRows.map((row) => row.accounts))).sort();
  const credentialEmailOptions = Array.from(
    new Set(ruleRows.map((row) => row.credentialEmails))
  ).sort();
  const ruleColumns: IColumn[] = [
    {
      id: 'name',
      label: 'Rule',
      minWidth: 250,
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string',
      render: (value, row) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2">{value}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            {row.description}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'admissionRoute',
      label: 'Admission route',
      minWidth: 170,
      filterType: 'enum',
      enumOptions: admissionRouteOptions.map((route) => ({ label: route, value: route })),
    },
    {
      id: 'academicCoverage',
      label: 'Academic coverage',
      minWidth: 300,
      filterType: 'string',
      cellSx: { whiteSpace: 'normal', overflowWrap: 'anywhere' },
    },
    {
      id: 'requiredChecks',
      label: 'Required checks',
      minWidth: 145,
      align: 'center',
      filterType: 'number',
      render: (_value, row) => (
        <Stack spacing={0.25} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {row.requiredChecksLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.blockingCount} {row.blockingCount === 1 ? 'check blocks' : 'checks block'}
            {' '}activation
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'approval',
      label: 'Approval',
      minWidth: 135,
      filterType: 'enum',
      enumOptions: [
        { label: 'No approval', value: 'No approval' },
        { label: 'Every student', value: 'Every student' },
        { label: 'Exceptions only', value: 'Exceptions only' },
      ],
      render: (value, row) => (
        <Label color={row.approvalMode === 'none' ? 'default' : 'info'} variant="soft">
          {value}
        </Label>
      ),
    },
    {
      id: 'accounts',
      label: 'Portal accounts',
      minWidth: 160,
      filterType: 'enum',
      enumOptions: accountOptions.map((account) => ({ label: account, value: account })),
    },
    {
      id: 'credentialEmails',
      label: 'Credential emails',
      minWidth: 220,
      filterType: 'enum',
      enumOptions: credentialEmailOptions.map((delivery) => ({
        label: delivery, value: delivery,
      })),
      cellSx: { whiteSpace: 'normal' },
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 72,
      width: 72,
      align: 'right',
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_value, row: IData) => {
        const profile = row.profile as OnboardingProfile;
        return (
          <ThreeDotsActions
            sx={{ justifyContent: 'flex-end' }}
            showEditIcon
            showThreeDots={false}
            editLabel={`Edit ${profile.name} rule`}
            handleEditClick={() => openProfileRules(profile.id)}
          />
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        minWidth: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CustomBreadcrumbs
        heading="Readiness & Access"
        description="Create and manage the readiness, approval, and portal-access rules used during Student Setup."
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title="Readiness & Access settings"
                description="Configure activation requirements, approval controls, and portal access release."
                items={[
                  'Compare readiness rules across admission profiles.',
                  'Add a rule for a specific academic scope.',
                  'Edit checks, approvals, and student or guardian access release.',
                ]}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Readiness & Access' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:school-outline" width={18} />}
              onClick={() => {
                setAvailableLevelsDraft(settings.academicAvailability?.schoolLevelNames ?? null);
                setAvailabilityError(false);
                setAvailabilityOpen(true);
              }}
            >
              School levels
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" width={18} />}
              onClick={openNewRule}
            >
              Add Readiness Rule
            </Button>
          </Stack>
        }
      />


      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CustomizableTable
          tableId="student-onboarding-readiness-access-rules"
          tableTitle="Readiness & access rules"
          columns={ruleColumns}
          data={ruleRows}
          isFilter
          isSearch
          searchFieldProps={{ placeholder: 'Search...' }}
          defaultRowsPerPage={10}
          noDataText={<>No readiness rules have been added yet.</>}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
        />
      </Box>


      <CustomDialog
        open={availabilityOpen}
        title="Choose Onboarding School Levels"
        maxWidth="sm"
        handleClose={closeAvailability}
        disableClose={availabilitySaving}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {availabilityError ? <Alert severity="error">School levels could not be saved. Review the selection and retry.</Alert> : null}
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2">Show all configured school levels</Typography>
                  </Stack>
                  <Switch
                    disabled={availabilitySaving || !configuredLevels.length}
                    checked={availableLevelsDraft === null}
                    onChange={(event) => {
                      setAvailabilityError(false);
                      setAvailableLevelsDraft(event.target.checked ? null : []);
                    }}
                    slotProps={{ input: { 'aria-label': 'Show all configured school levels' } }}
                  />
                </Stack>
                {availableLevelsDraft !== null ? (
                  <CustomSelect
                    size="small"
                    label="School levels"
                    multiple
                    required
                    disabled={availabilitySaving}
                    value={availableLevelsDraft}
                    options={configuredLevels.map((name) => ({ value: name, label: name }))}
                    onChange={(ids) => {
                      setAvailabilityError(false);
                      setAvailableLevelsDraft(ids.map(String));
                    }}
                    error={!availableLevelsDraft.length || excludedUsedLevels.length > 0}
                    helperText={excludedUsedLevels.length
                      ? `Existing rules use ${excludedUsedLevels.join(', ')}. Update those rules before hiding these levels.`
                      : !availableLevelsDraft.length ? 'Select at least one school level.' : undefined}
                  />
                ) : null}
              </Stack>
            </Paper>
            {!configuredLevels.length ? <Alert severity="warning">No school levels are configured for the selected academic year.</Alert> : null}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" width={16} />}
            disabled={availabilitySaving}
            onClick={closeAvailability}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
            disabled={availabilitySaveDisabled}
            onClick={async () => {
              if (availabilitySaveDisabled) return;
              setAvailabilitySaving(true);
              setAvailabilityError(false);
              try {
                await setAvailableSchoolLevels(availableLevelsDraft);
                setAvailabilityOpen(false);
              } catch {
                setAvailabilityError(true);
              } finally {
                setAvailabilitySaving(false);
              }
            }}
          >
            {availabilitySaving ? 'Saving…' : 'Save school levels'}
          </Button>
        </DialogActions>
      </CustomDialog>

      <SettingsDrawer
        open={drawerOpen && Boolean(selectedProfile)}
        title={
          creationMode === 'rule'
            ? 'Add Readiness Rule'
            : isNewProfile
              ? `Add ${selectedProfile?.admissionRoutes[0] ?? 'Readiness'} Academic Override`
              : `Edit ${selectedProfile?.name ?? 'Readiness'} Rule`
        }
        description={
          creationMode === 'rule'
            ? 'Write a school-defined readiness rule, choose its admission route, and narrow where it applies.'
            : isNewProfile
              ? 'Start from the selected profile, then narrow its academic coverage and adjust only the rules that differ.'
              : 'Control activation readiness and safe portal access for this admission route.'
        }
        descriptionDisplay="tooltip"
        icon="mdi:clipboard-check-outline"
        statusLabel={
          creationMode === 'rule'
            ? ''
            : isNewProfile
              ? 'New override'
              : isDirty
                ? 'Unsaved changes'
                : 'Applied rule'
        }
        onClose={closeDrawer}
        onReset={() => {
          setProfileNameDraft(selectedProfile?.name ?? '');
          setAdmissionRouteDraft(selectedProfile?.admissionRoutes[0] ?? '');
          setDraft(saved);
          setApplicabilityDraft(savedApplicability);
          setNameTouched(false);
          setRouteTouched(false);
        }}
        resetDisabled={!isDirty}
        onSubmit={() => {
          if (!selectedProfile || profileValidationError) return;
          setReviewError(false);
          setReviewOpen(true);
        }}
        submitLabel="Review rule"
        submitIcon="mdi:eye-outline"
        submitDisabled={!isDirty || Boolean(profileValidationError)}
      >
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Rule name"
                  value={profileNameDraft}
                  onChange={(event) => setProfileNameDraft(event.target.value)}
                  onBlur={() => setNameTouched(true)}
                  error={nameTouched && Boolean(nameError)}
                  helperText={nameTouched ? nameError : undefined}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Box>
              {creationMode === 'rule' ? (
                <Autocomplete
                  freeSolo
                  options={admissionRoutes}
                  value={admissionRouteDraft}
                  onChange={(_event, value) => setAdmissionRouteDraft(value ?? '')}
                  onInputChange={(_event, value) => setAdmissionRouteDraft(value)}
                  sx={{ minWidth: 0, flex: 1 }}
                  renderInput={(params) => <TextField
                    {...params}
                    size="small"
                    required
                    label="Admission route"
                    onBlur={() => setRouteTouched(true)}
                    error={routeTouched && Boolean(routeError)}
                    helperText={routeTouched ? routeError : undefined}
                    slotProps={{ htmlInput: { ...params.inputProps, maxLength: 100 } }}
                  />}
                />
              ) : (
                <Label color="default" sx={{ alignSelf: { sm: 'flex-start' } }}>
                  {selectedProfile?.admissionRoutes.join(', ')}
                </Label>
              )}
            </Stack>
          </Paper>

          <SettingsSectionCard
            icon="mdi:school-outline"
            title="Academic Applicability"
            description="Choose a board and its medium, then select the school levels and standards where this rule applies."
            descriptionDisplay="tooltip"
          >
            {!filters.boards.length ? <Alert severity="warning">No eligible school levels are available. Check School levels or the selected academic year.</Alert> : null}
            <AcademicApplicabilityFields
              value={applicabilityDraft}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              onChange={setApplicabilityDraft}
              compactHelp
              showErrors={Boolean(applicabilityDraft.boardIds.length)}
            />
            {hasApplicabilityConflict && !applicabilityError ? (
              <Alert severity="error">An equally specific rule already covers this academic path. Narrow the selection before saving.</Alert>
            ) : null}
          </SettingsSectionCard>

          <SettingsSectionCard
            icon="mdi:clipboard-list-outline"
            title="Readiness Checks"
            description="Admission, placement and identifiers are mandatory. Documents are configurable. Accounts are checked after enrollment; owner labels are guidance, not automatic task assignment."
            descriptionDisplay="tooltip"
          >
            <Box
              sx={{
                display: { xs: 'none', sm: 'grid' },
                gridTemplateColumns: 'minmax(160px, 1fr) 72px 82px minmax(180px, 1fr)',
                gap: 1,
                px: 1,
              }}
            >
              {['Check', 'Required', 'Blocks', 'Owner'].map((label) => (
                <Typography key={label} variant="caption" color="text.secondary" fontWeight={700}>
                  {label}
                </Typography>
              ))}
            </Box>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              {draft.checks.map((check, index) => (
                <Box
                  key={check.key}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr) auto auto',
                      sm: 'minmax(160px, 1fr) 72px 82px minmax(180px, 1fr)',
                    },
                    gap: 1,
                    alignItems: 'center',
                    px: 1,
                    py: 1,
                    borderBottom: index < draft.checks.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2">{check.label}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>Required</Typography>
                    {check.key === 'documents' ? (
                      <Switch
                        size="small"
                        checked={check.required}
                        onChange={(event) =>
                          updateCheckRule(check.key, { required: event.target.checked, blocking: event.target.checked })
                        }
                        slotProps={{ input: { 'aria-label': `${check.label} required` } }}
                      />
                    ) : (
                      <Typography variant="body2" aria-label={`${check.label} required: ${check.key === 'accounts' && !draft.studentAccount && !draft.guardianAccount ? 'No' : 'Yes'}`}>
                        {check.key === 'accounts' && !draft.studentAccount && !draft.guardianAccount ? 'No' : 'Yes'}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'none' } }}>Blocks</Typography>
                    <Typography variant="body2" aria-label={`${check.label} blocks activation: ${check.key === 'accounts' || check.key === 'documents' && !check.required ? 'No' : 'Yes'}`}>
                      {check.key === 'accounts' || check.key === 'documents' && !check.required ? 'No' : 'Yes'}
                    </Typography>
                  </Box>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    required
                    label={`${check.label} owner`}
                    value={check.owner}
                    onChange={(event) => updateCheckRule(check.key, { owner: event.target.value })}
                    error={!check.owner.trim()}
                    helperText={!check.owner.trim() ? `Choose an owner for ${check.label}.` : undefined}
                    sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
                  >
                    {readinessOwnerOptions.map((owner) => (
                      <MenuItem key={owner} value={owner}>
                        {owner}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              ))}
            </Paper>
          </SettingsSectionCard>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <SettingsSectionCard
              icon="mdi:account-check-outline"
              title="Approval And Activation"
              description="Approval can apply to everyone or only selected exceptions. Failed required checks, fees, and the first installment must be confirmed before onboarding completes."
              descriptionDisplay="tooltip"
            >
              <TextField
                select
                fullWidth
                size="small"
                required
                label="Approval requirement"
                value={draft.approvalMode}
                onChange={(event) => updateApprovalMode(event.target.value as ApprovalMode)}
              >
                <MenuItem value="none">No approval</MenuItem>
                <MenuItem value="always">Approval for every student</MenuItem>
                <MenuItem value="conditional">Approval only for exceptions</MenuItem>
              </TextField>
              {draft.approvalMode === 'conditional' ? (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    REQUIRE APPROVAL WHEN
                  </Typography>
                  {approvalTriggerOptions.map((trigger) => (
                    <FormControlLabel
                      key={trigger.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.approvalTriggers.includes(trigger.value)}
                          onChange={() => toggleApprovalTrigger(trigger.value)}
                        />
                      }
                      label={trigger.label}
                      sx={{ display: 'flex', mt: 0.25, mr: 0 }}
                    />
                  ))}
                  {approvalError && <Typography variant="caption" color="error.main" role="alert">{approvalError}</Typography>}
                </Box>
              ) : null}
            </SettingsSectionCard>

            <SettingsSectionCard
              icon="mdi:account-key-outline"
              title="Student And Guardian Access"
              description="Choose portal accounts and credential delivery. Emails require saved identifiers, division, and verified documents or an authorized override. One guardian login may access multiple children."
              descriptionDisplay="tooltip"
            >
              {[
                {
                  key: 'studentAccount' as const,
                  label: 'Prepare student account',
                },
                {
                  key: 'guardianAccount' as const,
                  label: 'Prepare guardian account',
                },
              ].map((rule) => (
                <FormControlLabel
                  key={rule.key}
                  control={
                    <Switch
                      checked={draft[rule.key]}
                      onChange={(event) => setBooleanRule(rule.key)(event.target.checked)}
                      inputProps={{ 'aria-label': rule.label }}
                    />
                  }
                  label={rule.label}
                  sx={{ m: 0, justifyContent: 'space-between' }}
                  labelPlacement="start"
                />
              ))}
              {[
                { key: 'sendStudentCredentialEmail' as const, label: 'Send student credential email' },
                { key: 'sendGuardianCredentialEmail' as const, label: 'Send parent/guardian credential email' },
              ].map((rule) => (
                <Box key={rule.key}>
                  <FormControlLabel label={rule.label} labelPlacement="start"
                    sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                    control={<Switch checked={draft[rule.key]} onChange={(event) => setBooleanRule(rule.key)(event.target.checked)}
                      inputProps={{ 'aria-label': rule.label }} />} />
                  {draft[rule.key] && !(rule.key === 'sendStudentCredentialEmail' ? draft.studentAccount : draft.guardianAccount) && (
                    <Typography variant="caption" color="error.main" role="alert">
                      {rule.key === 'sendStudentCredentialEmail'
                        ? 'Enable student account preparation before sending student emails.'
                        : 'Enable guardian account preparation before sending guardian emails.'}
                    </Typography>
                  )}
                </Box>
              ))}
              <CustomSelect label="Send credentials when" size="small" required value={draft.credentialSendingTime}
                options={[{ value: 'activation', label: 'After enrollment activation' }, { value: 'completion', label: 'After full onboarding completion' }]}
                onChange={(value) => setDraft((current) => ({ ...current, credentialSendingTime: value as ReadinessAccessRules['credentialSendingTime'] }))} />
              <CustomSelect label="Account creation and sending" size="small" required value={draft.credentialProvisioningMode}
                options={[{ value: 'manual', label: 'Staff creates accounts and sends emails' }, { value: 'automatic', label: 'Automatically when ready' }]}
                onChange={(value) => setDraft((current) => ({ ...current, credentialProvisioningMode: value as ReadinessAccessRules['credentialProvisioningMode'] }))} />
              {draft.guardianAccount && draft.credentialProvisioningMode === 'automatic' && <CustomSelect label="Parent/guardian account owner" size="small" required value={draft.guardianAccountRelationship}
                options={[{ value: 'father', label: 'Father' }, { value: 'mother', label: 'Mother' }, { value: 'guardian', label: 'Guardian' }]}
                onChange={(value) => setDraft((current) => ({ ...current, guardianAccountRelationship: value as ReadinessAccessRules['guardianAccountRelationship'] }))} />}
            </SettingsSectionCard>
          </Box>
        </Stack>
      </SettingsDrawer>

      <CustomDialog
        open={reviewOpen}
        title="Review Readiness Rule"
        maxWidth="sm"
        hasForm={false}
        disableClose={reviewSaving}
        handleClose={() => {
          if (!reviewSaving) setReviewOpen(false);
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {profileNameDraft.trim()}
                </Typography>
                <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.25 }}>
                  {[
                    ['Scope', scope.label],
                    ['Admission route', admissionRouteDraft],
                    ['Students covered', getAcademicApplicabilitySummary(
                      applicabilityDraft, filters.allBoards, filters.campuses
                    )],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: { xs: 0.25, sm: 1 } }}>
                      <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
                      <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0, overflowWrap: 'anywhere' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Divider />
                <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.25 }}>
                  {[
                    ['Approval', approvalLabel(draft.approvalMode)],
                    ['Portal accounts', accountSummary(draft)],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, gap: { xs: 0.25, sm: 1 } }}>
                      <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
                      <Typography component="dd" variant="body2" fontWeight={600} sx={{ m: 0 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Paper>
            {broaderRules.length ? (
              <Alert severity="info">
                Overrides {broaderRules.map((rule) => rule.name).join(', ')} where coverage overlaps.
              </Alert>
            ) : null}
            {reviewError ? (
              <Alert severity="error">The rule could not be applied. Review the saved settings and retry.</Alert>
            ) : null}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:arrow-left" width={16} />}
            disabled={reviewSaving}
            onClick={() => setReviewOpen(false)}
          >
            Back to rule
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:check" width={16} />}
            disabled={reviewSaving || Boolean(profileValidationError) || !selectedProfile}
            onClick={async () => {
              if (!selectedProfile || profileValidationError || reviewSaving) return;
              setReviewSaving(true);
              setReviewError(false);
              try {
                await applyOnboardingProfile({
                  ...selectedProfile,
                  name: profileNameDraft.trim(),
                  admissionRoutes: [admissionRoutes.find((route) =>
                    route.toLocaleLowerCase() === admissionRouteDraft.trim().toLocaleLowerCase()
                  ) ?? admissionRouteDraft.trim()],
                  applicability: applicabilityDraft,
                  rules: draft,
                });
                setReviewOpen(false);
                setPendingProfile(null);
                setCreationMode(null);
                setDrawerOpen(false);
              } catch {
                setReviewError(true);
              } finally {
                setReviewSaving(false);
              }
            }}
          >
            {reviewSaving ? 'Applying…' : 'Save and apply'}
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </Box>
  );
}
