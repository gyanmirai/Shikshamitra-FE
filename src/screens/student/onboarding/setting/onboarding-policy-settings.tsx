'use client';

import type { TooltipProps } from '@mui/material';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
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
  const profileValidationError = !profileNameDraft.trim()
    ? 'Enter a profile name.'
    : !admissionRouteDraft.trim()
      ? 'Choose or enter an admission route.'
      : admissionRouteDraft.trim().length > 100
        ? 'Keep the admission route within 100 characters.'
      : applicabilityError ||
        (hasApplicabilityConflict
          ? 'Another profile for this admission route already targets the same academic coverage.'
          : null);
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
    setCreationMode(null);
    setSelectedProfileId(profileId);
    setProfileNameDraft(profile.name);
    setAdmissionRouteDraft(profile.admissionRoutes[0] ?? '');
    setDraft(profile.rules);
    setApplicabilityDraft(profile.applicability);
    setDrawerOpen(true);
  };

  const openProfileOverride = (profileId: string) => {
    const source = settings.onboardingProfiles.find((item) => item.id === profileId);
    if (!source) return;
    const override: OnboardingProfile = {
      ...source,
      id: `${source.id}-${Date.now()}`,
      name: `${source.name} academic override`,
      applicability: createEmptySingleAcademicApplicability(),
      rules: {
        ...source.rules,
        approvalTriggers: source.rules.approvalTriggers.filter((trigger) => trigger !== 'capacity-override'),
        checks: source.rules.checks.map((check) => ({ ...check })),
      },
    };
    setPendingProfile(override);
    setCreationMode('override');
    setSelectedProfileId(override.id);
    setProfileNameDraft(override.name);
    setAdmissionRouteDraft(override.admissionRoutes[0] ?? '');
    setDraft(override.rules);
    setApplicabilityDraft(override.applicability);
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
    if (isDirty && !window.confirm('Discard unsaved readiness-rule changes?')) return;
    setReviewOpen(false);
    setReviewError(false);
    setPendingProfile(null);
    setCreationMode(null);
    setDraft(saved);
    setApplicabilityDraft(savedApplicability);
    setDrawerOpen(false);
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
  const ruleRows = settings.onboardingProfiles.map((profile) => {
    const requiredCount = profile.rules.checks.filter((check) => check.required).length;
    const blockingCount = profile.rules.checks.filter(
      (check) => check.required && check.blocking
    ).length;

    return {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      admissionRoute: profile.admissionRoutes.join(', '),
      academicCoverage: getAcademicApplicabilitySummary(profile.applicability, filters.allBoards, filters.campuses),
      requiredChecks: requiredCount,
      requiredChecksLabel: `${requiredCount} of ${profile.rules.checks.length}`,
      blockingCount,
      approval: approvalLabel(profile.rules.approvalMode),
      approvalMode: profile.rules.approvalMode,
      accounts: accountSummary(profile.rules),
      accessRelease: 'Owner password setup',
      statusLabel: 'Applied',
      profile,
    };
  });
  const ruleColumns: IColumn[] = [
    {
      id: 'name',
      label: 'Rule',
      minWidth: 220,
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string',
      render: (value, row) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2">{value}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.description}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'admissionRoute',
      label: 'Admission route',
      minWidth: 160,
      filterType: 'enum',
    },
    {
      id: 'academicCoverage',
      label: 'Academic coverage',
      minWidth: 240,
      filterType: 'string',
    },
    {
      id: 'requiredChecks',
      label: 'Required checks',
      minWidth: 150,
      filterType: 'number',
      render: (_value, row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {row.requiredChecksLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.blockingCount} block activation
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'approval',
      label: 'Approval',
      minWidth: 135,
      filterType: 'enum',
      render: (value, row) => (
        <Label color={row.approvalMode === 'none' ? 'default' : 'warning'} variant="outlined">
          {value}
        </Label>
      ),
    },
    { id: 'accounts', label: 'Accounts', minWidth: 160, filterType: 'enum' },
    { id: 'accessRelease', label: 'Access release', minWidth: 150, filterType: 'enum' },
    {
      id: 'statusLabel',
      label: 'Status',
      minWidth: 100,
      filterType: 'enum',
      sticky: true,
      stickyPosition: 'right',
      render: (value) => <Label color="default">{value}</Label>,
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 110,
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
            showEditIcon
            showThreeDots={false}
            editLabel={`Edit ${profile.name} rules`}
            handleEditClick={() => openProfileRules(profile.id)}
            directActions={[
              {
                id: 'add-override',
                label: `Add ${profile.name} academic override`,
                icon: 'mdi:source-branch-plus',
                onClick: () => openProfileOverride(profile.id),
              },
            ]}
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
                  'Add academic overrides without changing the broader route fallback.',
                  'Edit checks, approvals, and student or guardian access release.',
                ]}
              />
            ),
            sx: { textAlign: 'left' },
          } as TooltipProps
        }
        links={[
          { name: 'Student Management', href: studentPaths.dashboard },
          { name: 'Student Onboarding', href: studentPaths.onboarding.setup },
          { name: 'Settings', href: studentPaths.onboarding.settings },
          { name: 'Readiness & Access' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
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
              Add readiness rule
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
          defaultRowsPerPage={10}
          noDataText={<>No readiness rules are configured.</>}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0 } }}
          tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
        />
      </Box>


      <CustomDialog
        open={availabilityOpen}
        title="Choose onboarding school levels"
        maxWidth="sm"
        handleClose={closeAvailability}
        disableClose={availabilitySaving}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Choose which configured levels appear when staff create readiness and numbering rules.
            </Typography>
            {availabilityError ? <Alert severity="error">School levels could not be saved. Review the selection and retry.</Alert> : null}
            <FormControlLabel
              control={<Switch disabled={availabilitySaving} checked={availableLevelsDraft === null} onChange={(event) =>
                setAvailableLevelsDraft(event.target.checked ? null : [])
              } />}
              label="Show all configured school levels"
            />
            {availableLevelsDraft !== null ? (
              <CustomSelect
                size="small"
                label="School levels"
                multiple
                required
                disabled={availabilitySaving}
                value={availableLevelsDraft}
                options={configuredLevels.map((name) => ({ value: name, label: name }))}
                onChange={(ids) => setAvailableLevelsDraft(ids.map(String))}
                error={!availableLevelsDraft.length || excludedUsedLevels.length > 0}
                helperText={excludedUsedLevels.length
                  ? `Existing rules use ${excludedUsedLevels.join(', ')}. Update those rules before hiding these levels.`
                  : !availableLevelsDraft.length ? 'Select at least one school level.' : undefined}
              />
            ) : null}
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
            disabled={availabilitySaving || !configuredLevels.length || availableLevelsDraft !== null &&
              (!availableLevelsDraft.length || excludedUsedLevels.length > 0)}
            onClick={async () => {
              if (availabilitySaving || !configuredLevels.length ||
                availableLevelsDraft !== null && (!availableLevelsDraft.length || excludedUsedLevels.length)) return;
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
            ? 'Add readiness rule'
            : isNewProfile
              ? `Add ${selectedProfile?.admissionRoutes[0] ?? 'Readiness'} Academic Override`
              : `Edit ${selectedProfile?.name ?? 'Readiness'} Rules`
        }
        description={
          creationMode === 'rule'
            ? 'Write a school-defined readiness rule, choose its admission route, and narrow where it applies.'
            : isNewProfile
              ? 'Start from the selected profile, then narrow its academic coverage and adjust only the rules that differ.'
              : 'Control activation readiness and safe portal access for this admission route.'
        }
        icon="mdi:clipboard-check-outline"
        statusLabel={
          creationMode === 'rule'
            ? 'New rule'
            : isNewProfile
              ? 'New override'
              : isDirty
                ? 'Unsaved changes'
                : 'Applied rules'
        }
        footerNote="Saved rules apply to Student Setup for the selected scope."
        onClose={closeDrawer}
        onReset={() => {
          setProfileNameDraft(selectedProfile?.name ?? '');
          setAdmissionRouteDraft(selectedProfile?.admissionRoutes[0] ?? '');
          setDraft(saved);
          setApplicabilityDraft(savedApplicability);
        }}
        resetDisabled={!isDirty}
        onSubmit={() => {
          if (!selectedProfile || profileValidationError) return;
          setReviewError(false);
          setReviewOpen(true);
        }}
        submitLabel="Review rule"
        submitDisabled={!isDirty || Boolean(profileValidationError)}
      >
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Rule name"
                  value={profileNameDraft}
                  onChange={(event) => setProfileNameDraft(event.target.value)}
                  error={!profileNameDraft.trim()}
                  helperText={!profileNameDraft.trim() ? 'Rule name is required.' : undefined}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedProfile?.description}
                </Typography>
              </Box>
              {creationMode === 'rule' ? (
                <Autocomplete
                  freeSolo
                  options={admissionRoutes}
                  value={admissionRouteDraft}
                  onChange={(_event, value) => setAdmissionRouteDraft(value ?? '')}
                  onInputChange={(_event, value) => setAdmissionRouteDraft(value)}
                  sx={{ minWidth: { sm: 220 } }}
                  renderInput={(params) => <TextField
                    {...params}
                    size="small"
                    label="Admission route"
                    helperText="Choose an existing route or enter a school-defined route."
                    inputProps={{ ...params.inputProps, maxLength: 100 }}
                  />}
                />
              ) : (
                <Label color="default" sx={{ alignSelf: { sm: 'flex-start' } }}>
                  {selectedProfile?.admissionRoutes.join(', ')}
                </Label>
              )}
            </Stack>
          </Paper>

          {profileValidationError && !applicabilityError && !hasApplicabilityConflict
            ? <Alert severity="error">{profileValidationError}</Alert> : null}

          <SettingsSectionCard
            icon="mdi:school-outline"
            title="Academic applicability"
            description="Choose a board and its medium, then select the school levels and standards where this rule applies."
          >
            {!filters.boards.length ? <Alert severity="warning">No eligible school levels are available. Check School levels or the selected academic year.</Alert> : null}
            <AcademicApplicabilityFields
              value={applicabilityDraft}
              boards={filters.boards}
              campuses={filters.campuses}
              campusesLoading={filters.campusesLoading}
              campusesError={filters.campusesError}
              onChange={setApplicabilityDraft}
            />
          </SettingsSectionCard>

          {!applicabilityError && admissionRouteDraft ? (
            <Alert severity={hasApplicabilityConflict ? 'error' : 'info'}>
              {hasApplicabilityConflict
                ? 'An equally specific rule already covers part of this academic path. Narrow the selection before saving.'
                : `${admissionRouteDraft}: ${getAcademicApplicabilitySummary(applicabilityDraft, filters.allBoards, filters.campuses)}.${
                  broaderRules.length ? ` This rule takes priority over ${broaderRules.map((rule) => rule.name).join(', ')} where they overlap.` : ''
                }`}
            </Alert>
          ) : null}

          <SettingsSectionCard
            icon="mdi:clipboard-list-outline"
            title="Readiness checks"
            description="Admission, placement and identifiers are mandatory. Documents are configurable. Accounts are checked after enrollment; owner labels are guidance, not automatic task assignment."
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { sm: 'none' } }}
                    >
                      {check.owner}
                    </Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={check.key === 'documents' ? check.required : check.key === 'accounts' ? draft.studentAccount || draft.guardianAccount : true}
                    disabled={check.key !== 'documents'}
                    onChange={(event) =>
                      updateCheckRule(check.key, { required: event.target.checked, blocking: event.target.checked })
                    }
                    slotProps={{ input: { 'aria-label': `${check.label} required` } }}
                  />
                  <Switch
                    size="small"
                    checked={check.key === 'accounts' ? false : check.key === 'documents' ? check.required : true}
                    disabled
                    onChange={(event) =>
                      updateCheckRule(check.key, { blocking: event.target.checked })
                    }
                    slotProps={{ input: { 'aria-label': `${check.label} blocks activation` } }}
                  />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Owner"
                    value={check.owner}
                    onChange={(event) => updateCheckRule(check.key, { owner: event.target.value })}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
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
              title="Approval and activation"
              description="Route only the right cases for review and control failed checks."
            >
              <TextField
                select
                fullWidth
                size="small"
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
                </Box>
              ) : null}
              <Alert severity="info">Failed required checks always block activation. Fee assignment and the first installment must be confirmed before onboarding completes.</Alert>
            </SettingsSectionCard>

            <SettingsSectionCard
              icon="mdi:account-key-outline"
              title="Student and guardian access"
              description="Choose the portal links required before onboarding can complete."
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
              <Alert severity="info">After enrollment, authorized staff verify the saved contact and create or link each required account. The owner sets a password through Forgot password. This screen does not send credentials automatically.</Alert>
            </SettingsSectionCard>
          </Box>
        </Stack>
      </SettingsDrawer>

      <CustomDialog
        open={reviewOpen}
        title="Review readiness rule"
        maxWidth="sm"
        hasForm={false}
        disableClose={reviewSaving}
        handleClose={() => {
          if (!reviewSaving) setReviewOpen(false);
        }}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Check who this rule covers before applying it. Saving makes it effective in Student Setup immediately.
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">{profileNameDraft.trim()}</Typography>
                <Typography variant="body2">Scope: {scope.label}</Typography>
                <Typography variant="body2">Admission route: {admissionRouteDraft}</Typography>
                <Typography variant="body2">
                  Students covered: {getAcademicApplicabilitySummary(applicabilityDraft, filters.allBoards, filters.campuses)}
                </Typography>
                <Typography variant="body2">Approval: {approvalLabel(draft.approvalMode)}</Typography>
                <Typography variant="body2">Portal accounts: {accountSummary(draft)}</Typography>
              </Stack>
            </Paper>
            {broaderRules.length ? (
              <Alert severity="info">
                This rule takes priority over {broaderRules.map((rule) => rule.name).join(', ')} where they overlap.
              </Alert>
            ) : null}
            <Alert severity="info">
              Fee assignment and the first installment are required before onboarding completes.
            </Alert>
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
    </Box>
  );
}
