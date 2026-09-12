'use client';

import type { ReactNode } from 'react';
import type { TooltipProps } from '@mui/material';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Paper,
  Stack,
  Table,
  Button,
  Switch,
  Divider,
  TableRow,
  Checkbox,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useOnboardingSettings } from '../onboarding-settings-context';
import { SettingsDrawer, SettingsSectionCard } from './onboarding-number-settings';
import { OnboardingConfigurationScopeBar } from '../onboarding-configuration-scope-bar';
import { OnboardingSettingsBreadcrumbInfo } from './onboarding-settings-breadcrumb-info';
import { defaultAccountRules, defaultOnboardingRules } from '../onboarding-settings-model';

import type {
  AccountRules,
  ApprovalMode,
  OnboardingRules,
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
  { value: 'manual-identifier', label: 'Manual GR or Roll number entry' },
  { value: 'division-change', label: 'Division change after initial placement' },
  { value: 'capacity-override', label: 'Division capacity override' },
  { value: 'mid-year-admission', label: 'Mid-year admission' },
  { value: 'incomplete-optional-check', label: 'Activation with an incomplete optional check' },
];

type RuleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
};

export function RuleRow({ title, description, checked, onChange, children }: RuleRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ py: 1.5 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {children ? <Box sx={{ mt: 1.25, maxWidth: 360 }}>{children}</Box> : null}
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            inputProps={{ 'aria-label': title }}
          />
        }
        label={checked ? 'Enabled' : 'Disabled'}
        labelPlacement="start"
        sx={{ m: 0, minHeight: 44, flexShrink: 0 }}
      />
    </Stack>
  );
}

export function SettingsScreen({
  title,
  description,
  icon,
  children,
  isDirty,
  onReset,
  onSave,
  scopeDescription = 'Only settings that directly affect onboarding readiness are shown here.',
}: {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
  isDirty: boolean;
  onReset: () => void;
  onSave: () => void;
  scopeDescription?: string;
}) {
  return (
    <Box
      sx={{ minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading={title}
        description=" "
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title={`${title} settings`}
                description={description}
                items={[
                  'Review the rules applied to the current configuration scope.',
                  'Reset the draft or apply changes to Student Setup.',
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
          { name: title },
        ]}
        action={
          <Label color={isDirty ? 'warning' : 'default'}>
            {isDirty ? 'Unsaved draft' : 'No changes'}
          </Label>
        }
        slotProps={{
          action: {},
          heading: { overflowWrap: 'normal', textWrap: 'wrap' },
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'block' } },
        }}
        sx={{
          mb: 2,
          flexShrink: 0,
          flexDirection: { xs: 'column !important', md: 'row !important' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 0.5, md: 2 },
          minHeight: { xs: 'auto', md: 56 },
          py: { xs: 0.75, md: 0 },
          '& .MuiBreadcrumbs-root': { display: { xs: 'none', md: 'block' } },
          '& .MuiTypography-h6': { overflowWrap: 'normal !important' },
        }}
      />
      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pr: { sm: 1 },
            pb: 2,
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#FFF9E6' : alpha(theme.palette.warning.main, 0.12),
            borderLeft: (theme) => `4px solid ${theme.palette.warning.main}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                theme.palette.mode === 'light' ? '#7A4F01' : theme.palette.warning.lighter,
              fontWeight: 500,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            Frontend session mode — applying these rules updates Student Setup immediately. A full
            reload restores defaults until the Onboarding Settings APIs are connected.
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.neutral',
                color: 'primary.main',
              }}
            >
              <Iconify icon={icon} width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scopeDescription}
              </Typography>
            </Box>
          </Stack>
          <Divider />
          <Box sx={{ px: 2 }}>{children}</Box>
        </Paper>
      </Scrollbar>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          flexShrink: 0,
          py: 1.5,
          px: { xs: 1, sm: 2 },
          bgcolor: (theme) =>
            theme.palette.mode === 'light'
              ? alpha(theme.palette.background.default, 0.95)
              : alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(8px)',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:refresh" width={16} />}
          disabled={!isDirty}
          onClick={onReset}
          sx={{ borderRadius: 1.5 }}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
          disabled={!isDirty}
          onClick={onSave}
          sx={{ borderRadius: 1.5 }}
        >
          Apply to Setup
        </Button>
      </Box>
    </Box>
  );
}

export function RuleSection({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <Box id={id} sx={{ scrollMarginTop: 96 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ pt: 2, pb: 0.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1,
            bgcolor: 'background.neutral',
            color: 'text.secondary',
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Stack>
      {children}
    </Box>
  );
}

export type SettingRuleCardProps = {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tagType: 'blocks-activation' | 'blocks-access' | 'optional';
  tagLabel?: string;
};

export function SettingRuleCard({
  icon,
  title,
  description,
  checked,
  onChange,
  tagType,
  tagLabel,
}: SettingRuleCardProps) {
  const isBlocking = tagType === 'blocks-activation' || tagType === 'blocks-access';
  const displayTag =
    tagLabel ??
    (tagType === 'blocks-activation'
      ? 'BLOCKS ACTIVATION'
      : tagType === 'blocks-access'
        ? 'BLOCKS ACCESS'
        : 'OPTIONAL');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        borderColor: (theme) =>
          theme.palette.mode === 'light' ? '#D6EDE2' : alpha(theme.palette.primary.main, 0.25),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 155,
        transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <Box>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={20} />
          </Box>

          <Switch
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            color="primary"
            slotProps={{
              input: {
                'aria-label': title,
                id: `switch-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              },
            }}
            inputProps={{
              'aria-label': title,
            }}
            sx={{ m: 0 }}
          />
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, mt: 1.75, mb: 0.5, fontSize: '0.9375rem' }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.8125rem', lineHeight: 1.45 }}
        >
          {description}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1,
            py: 0.35,
            borderRadius: 0.75,
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            bgcolor: (theme) =>
              isBlocking
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.grey[500], 0.12),
            color: (theme) =>
              isBlocking
                ? theme.palette.mode === 'light'
                  ? theme.palette.error.main
                  : theme.palette.error.light
                : theme.palette.text.secondary,
          }}
        >
          {displayTag}
        </Box>
      </Box>
    </Paper>
  );
}

export function OnboardingRulesSettingsScreen() {
  const [saved, setSaved] = useState(defaultOnboardingRules);
  const [draft, setDraft] = useState(defaultOnboardingRules);
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const setRule = (key: keyof OnboardingRules) => (value: boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <SettingsScreen
      title="Onboarding Rules"
      description="Define the minimum checks and approvals required before student activation."
      icon="mdi:clipboard-check-outline"
      isDirty={isDirty}
      onReset={() => setDraft(saved)}
      onSave={() => setSaved(draft)}
    >
      <RuleRow
        title="Admission documents required"
        description="Incomplete mandatory documents block activation."
        checked={draft.requireDocuments}
        onChange={setRule('requireDocuments')}
      />
      <Divider />
      <RuleRow
        title="GR & roll number required"
        description="Both identifiers must be committed first."
        checked={draft.requireIdentifiers}
        onChange={setRule('requireIdentifiers')}
      />
      <Divider />
      <RuleRow
        title="Staff approval before activation"
        description="Ready students wait for review instead of activating instantly."
        checked={draft.requireApproval}
        onChange={setRule('requireApproval')}
      />
      <Divider />
      <RuleRow
        title="Block activation on failed checks"
        description="One failed or incomplete check halts the whole activation."
        checked={draft.blockActivation}
        onChange={setRule('blockActivation')}
      />
    </SettingsScreen>
  );
}

export function AccountsAccessSettingsScreen() {
  const [saved, setSaved] = useState(defaultAccountRules);
  const [draft, setDraft] = useState(defaultAccountRules);
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const setRule = (key: keyof Omit<AccountRules, 'deliveryTiming'>) => (value: boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <SettingsScreen
      title="Accounts & Access"
      description="Control preparation and safe release of student and guardian portal access."
      icon="mdi:account-key-outline"
      isDirty={isDirty}
      onReset={() => setDraft(saved)}
      onSave={() => setSaved(draft)}
    >
      <RuleRow
        title="Prepare student account"
        description="Included in the onboarding checklist."
        checked={draft.studentAccount}
        onChange={setRule('studentAccount')}
      />
      <Divider />
      <RuleRow
        title="Prepare guardian account"
        description="Included for the linked guardian too."
        checked={draft.guardianAccount}
        onChange={setRule('guardianAccount')}
      />
      <Divider />
      <RuleRow
        title="Require verified guardian contact"
        description="Do not release access until the guardian email or mobile number is verified."
        checked={draft.verifiedGuardianContact}
        onChange={setRule('verifiedGuardianContact')}
      />
      <Divider />
      <Stack spacing={1.25} sx={{ py: 1.5 }}>
        <Box>
          <Typography variant="subtitle2">When login access is released</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose whether credentials go out automatically or need staff to release them.
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Credential release timing"
          value={draft.deliveryTiming}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              deliveryTiming: event.target.value as AccountRules['deliveryTiming'],
            }))
          }
        >
          <MenuItem value="after-activation">Automatically after activation</MenuItem>
          <MenuItem value="manual-release">Manual release by authorized staff</MenuItem>
        </TextField>
      </Stack>
    </SettingsScreen>
  );
}

export function ReadinessAccessSettingsScreen() {
  const { settings, applyOnboardingProfile } = useOnboardingSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(
    settings.onboardingProfiles[0]?.id ?? ''
  );
  const selectedProfile =
    settings.onboardingProfiles.find((profile) => profile.id === selectedProfileId) ??
    settings.onboardingProfiles[0];
  const saved = selectedProfile?.rules ?? settings.readinessAccess;
  const [draft, setDraft] = useState(saved);
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
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
    setDraft(saved);
  }, [saved]);

  useEffect(() => {
    if (selectedProfile) return;
    setSelectedProfileId(settings.onboardingProfiles[0]?.id ?? '');
  }, [selectedProfile, settings.onboardingProfiles]);

  const openProfileRules = (profileId: string) => {
    const profile = settings.onboardingProfiles.find((item) => item.id === profileId);
    if (!profile) return;
    setSelectedProfileId(profileId);
    setDraft(profile.rules);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDraft(saved);
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
        description=" "
        tooltipProps={
          {
            title: (
              <OnboardingSettingsBreadcrumbInfo
                title="Readiness & Access settings"
                description="Configure activation requirements, approval controls, and portal access release."
                items={[
                  'Compare readiness rules across admission profiles.',
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
        action={<Label color="default">{settings.onboardingProfiles.length} profiles</Label>}
        slotProps={{
          action: {},
          heading: { overflowWrap: 'normal', textWrap: 'wrap' },
          moreLink: {},
          breadcrumbs: { display: { xs: 'none', md: 'block' } },
        }}
        sx={{
          mb: 2,
          flexShrink: 0,
          flexDirection: { xs: 'column !important', md: 'row !important' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 0.5, md: 2 },
          minHeight: { xs: 'auto', md: 56 },
          py: { xs: 0.75, md: 0 },
          '& .MuiBreadcrumbs-root': { display: { xs: 'none', md: 'block' } },
          '& .MuiTypography-h6': { overflowWrap: 'normal !important' },
        }}
      />

      <Box sx={{ mb: 2 }}>
        <OnboardingConfigurationScopeBar />
      </Box>

      <Scrollbar
        sx={{
          flex: 1,
          minHeight: 0,
          '& .simplebar-content': {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pr: { sm: 1 },
            pb: 2,
          },
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#FFF9E6' : alpha(theme.palette.warning.main, 0.12),
            borderLeft: (theme) => `4px solid ${theme.palette.warning.main}`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                theme.palette.mode === 'light' ? '#7A4F01' : theme.palette.warning.lighter,
              fontWeight: 500,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            Frontend session mode — applying these rules updates Student Setup immediately. A full
            reload restores defaults until the Onboarding Settings APIs are connected.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  color: 'text.secondary',
                }}
              >
                <Iconify icon="mdi:clipboard-check-outline" width={21} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Readiness profiles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review the applied rules, then edit only the admission route that needs a change.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Label color="default">{settings.onboardingProfiles.length} profiles</Label>
              <Label color="default">{settings.readinessAccess.checks.length} checks</Label>
              <Label color="success" variant="outlined">
                Connected to Setup
              </Label>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ overflow: 'hidden', display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Profile</TableCell>
                  <TableCell>Required checks</TableCell>
                  <TableCell>Approval</TableCell>
                  <TableCell>Accounts</TableCell>
                  <TableCell>Access release</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.onboardingProfiles.map((profile) => {
                  const requiredCount = profile.rules.checks.filter(
                    (check) => check.required
                  ).length;
                  const blockingCount = profile.rules.checks.filter(
                    (check) => check.required && check.blocking
                  ).length;

                  return (
                    <TableRow key={profile.id} hover>
                      <TableCell sx={{ minWidth: 245 }}>
                        <Typography variant="subtitle2">{profile.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {profile.admissionRoutes.join(', ')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 145 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {requiredCount} of {profile.rules.checks.length} required
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {blockingCount} block activation
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 135 }}>
                        <Label
                          color={profile.rules.approvalMode === 'none' ? 'default' : 'warning'}
                          variant="outlined"
                        >
                          {approvalLabel(profile.rules.approvalMode)}
                        </Label>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Typography variant="body2">{accountSummary(profile.rules)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {profile.rules.verifiedGuardianContact
                            ? 'Verified contact required'
                            : 'Verification optional'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Typography variant="body2">
                          {profile.rules.deliveryTiming === 'after-activation'
                            ? 'After activation'
                            : 'Manual release'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          aria-label={`Edit ${profile.name} rules`}
                          startIcon={<Iconify icon="mdi:pencil-outline" width={17} />}
                          onClick={() => openProfileRules(profile.id)}
                          sx={{ borderRadius: 1.5 }}
                        >
                          Edit rules
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        <Stack spacing={1.25} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {settings.onboardingProfiles.map((profile) => {
            const requiredCount = profile.rules.checks.filter((check) => check.required).length;
            const blockingCount = profile.rules.checks.filter(
              (check) => check.required && check.blocking
            ).length;

            return (
              <Paper key={profile.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1.25}>
                  <Box>
                    <Typography variant="subtitle2">{profile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Label color="default">
                      {requiredCount}/{profile.rules.checks.length} required
                    </Label>
                    <Label color="default">{blockingCount} blocking</Label>
                    <Label
                      color={profile.rules.approvalMode === 'none' ? 'default' : 'warning'}
                      variant="outlined"
                    >
                      {approvalLabel(profile.rules.approvalMode)}
                    </Label>
                  </Stack>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    aria-label={`Edit ${profile.name} rules`}
                    startIcon={<Iconify icon="mdi:pencil-outline" width={17} />}
                    onClick={() => openProfileRules(profile.id)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Edit rules
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Scrollbar>

      <SettingsDrawer
        open={drawerOpen && Boolean(selectedProfile)}
        title={`Edit ${selectedProfile?.name ?? 'Readiness'} Rules`}
        description="Control activation readiness and safe portal access for this admission route."
        icon="mdi:clipboard-check-outline"
        statusLabel={isDirty ? 'Unsaved changes' : 'Applied rules'}
        footerNote="Applies to Student Setup in this frontend session."
        onClose={closeDrawer}
        onReset={() => setDraft(saved)}
        resetDisabled={!isDirty}
        onSubmit={() => {
          if (!selectedProfile) return;
          applyOnboardingProfile(selectedProfile.id, draft);
          setDrawerOpen(false);
        }}
        submitLabel="Apply to Setup"
        submitDisabled={!isDirty}
      >
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{selectedProfile?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedProfile?.description}
                </Typography>
              </Box>
              <Label color="default" sx={{ alignSelf: { sm: 'flex-start' } }}>
                {selectedProfile?.admissionRoutes.join(', ')}
              </Label>
            </Stack>
          </Paper>

          <SettingsSectionCard
            icon="mdi:clipboard-list-outline"
            title="Readiness checks"
            description="Choose what is required, what blocks activation, and who owns each check."
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
                    checked={check.required}
                    onChange={(event) =>
                      updateCheckRule(check.key, { required: event.target.checked })
                    }
                    slotProps={{ input: { 'aria-label': `${check.label} required` } }}
                  />
                  <Switch
                    size="small"
                    checked={check.blocking}
                    disabled={!check.required}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.blockActivation}
                    onChange={(event) => setBooleanRule('blockActivation')(event.target.checked)}
                    inputProps={{ 'aria-label': 'Block activation on failed checks' }}
                  />
                }
                label="Block activation on failed checks"
                sx={{ m: 0, justifyContent: 'space-between' }}
                labelPlacement="start"
              />
            </SettingsSectionCard>

            <SettingsSectionCard
              icon="mdi:account-key-outline"
              title="Student and guardian access"
              description="Prepare portal accounts and control when credentials are released."
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
                {
                  key: 'verifiedGuardianContact' as const,
                  label: 'Require verified guardian contact',
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
              <TextField
                select
                fullWidth
                size="small"
                label="Credential release timing"
                value={draft.deliveryTiming}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    deliveryTiming: event.target.value as AccountRules['deliveryTiming'],
                  }))
                }
              >
                <MenuItem value="after-activation">Automatically after activation</MenuItem>
                <MenuItem value="manual-release">Manual release by authorized staff</MenuItem>
              </TextField>
            </SettingsSectionCard>
          </Box>
        </Stack>
      </SettingsDrawer>
    </Box>
  );
}
