'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add, Delete, ExpandMore, ContentCopy, InfoOutlined } from '@mui/icons-material';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Switch,
  Select,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  Autocomplete,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

import {
  AdmissionInquiryChannel,
  AdmissionCrmLeadRoutingStrategy,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { EnrollmentSettingsDecisionCards } from './enrollment-settings-decision-cards';

import { getAdmissionCrmChannelLabel } from '../admissions-crm/admissions-crm-utils';

import { getCrmUserOptionLabel } from './admissions-crm-configuration-utils';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

function SettingsHelpLabel({ label, help }: { label: string; help: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        verticalAlign: 'middle',
      }}
    >
      <Typography component="span" variant="inherit">
        {label}
      </Typography>
      <Tooltip title={help} arrow>
        <Box
          component="span"
          role="img"
          aria-label={help}
          sx={{ display: 'inline-flex', color: 'action.active' }}
        >
          <InfoOutlined sx={{ fontSize: 16 }} />
        </Box>
      </Tooltip>
    </Box>
  );
}

const inquiryChannelOptions = [
  AdmissionInquiryChannel.ManualBackOffice,
  AdmissionInquiryChannel.QuickCallEntry,
  AdmissionInquiryChannel.WalkInReception,
  AdmissionInquiryChannel.SchoolWebsiteForm,
  AdmissionInquiryChannel.WhatsAppInquiry,
  AdmissionInquiryChannel.StaffSharedLink,
  AdmissionInquiryChannel.QrCodeScan,
  AdmissionInquiryChannel.CampaignLink,
];

const routingStrategyLabel: Record<AdmissionCrmLeadRoutingStrategy, string> = {
  [AdmissionCrmLeadRoutingStrategy.FirstMatchingRule]: 'Rule/default owner',
  [AdmissionCrmLeadRoutingStrategy.RoundRobin]: 'Round robin owner pool',
  [AdmissionCrmLeadRoutingStrategy.LeastOpenLeads]: 'Least open leads',
};

export function AdmissionsCrmConfigurationSection4() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    cycleForm,
    focusPanel,
    focusSection,
    handleAddRoutingRule,
    handleDuplicateRoutingRule,
    handleRemoveRoutingRule,
    handleRoutingRuleChange,
    handleRoutingSettingsChange,
    handleSaveCycle,
    inquirySourceOptions,
    isPreviewingCycleImpact,
    isUpdatingCycle,
    isUsersFetching,
    ownerOptions,
    setStaffSearch,
    staffSearch,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {focusSection === 'routing' && (!focusPanel || focusPanel === 'routing') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                <SettingsHelpLabel
                  label="Ownership & Routing"
                  help="Assigns inquiries to the right admissions owner using the first matching configured rule."
                />
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddRoutingRule}
              >
                Add Routing Rule
              </Button>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                color={cycleForm.leadRoutingSettings.isEnabled ? 'success' : 'default'}
                label={
                  cycleForm.leadRoutingSettings.isEnabled
                    ? 'Automatic routing on'
                    : 'Manual assignment'
                }
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${cycleForm.leadRoutingSettings.ownerPoolUserIds.length} pool owners`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${cycleForm.leadRoutingSettings.rules.filter((rule) => rule.isEnabled).length} active rules`}
              />
            </Stack>
            <Alert severity="info">
              Test the broadest ownership behavior first. Add match rules only for exceptions such
              as a dedicated campus, source, language, or campaign owner.
            </Alert>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cycleForm.leadRoutingSettings.isEnabled}
                    disabled={!academicYearId || isUpdatingCycle}
                    onChange={(event) =>
                      handleRoutingSettingsChange('isEnabled', event.target.checked)
                    }
                  />
                }
                label="Route new inquiries automatically"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Default owner</InputLabel>
                <Select
                  label="Default owner"
                  value={cycleForm.leadRoutingSettings.defaultOwnerUserId ?? ''}
                  disabled={!academicYearId || isUpdatingCycle}
                  onChange={(event) =>
                    handleRoutingSettingsChange('defaultOwnerUserId', event.target.value || null)
                  }
                >
                  <MenuItem value="">No default owner</MenuItem>
                  {ownerOptions.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {getCrmUserOptionLabel(owner)}
                      {owner.isActive === false ? ' (Inactive)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Box>
              <Typography component="h3" variant="subtitle2" sx={{ mb: 0.75 }}>
                Assignment Strategy
              </Typography>
              <EnrollmentSettingsDecisionCards
                label="Lead routing strategy"
                value={cycleForm.leadRoutingSettings.routingStrategy}
                onChange={(value) => handleRoutingSettingsChange('routingStrategy', value)}
                disabled={!academicYearId || isUpdatingCycle}
                columns={3}
                options={[
                  {
                    value: AdmissionCrmLeadRoutingStrategy.FirstMatchingRule,
                    title: routingStrategyLabel[AdmissionCrmLeadRoutingStrategy.FirstMatchingRule],
                    description:
                      'Apply the first enabled rule that matches, then fall back to the default owner.',
                    icon: 'mdi:filter-check-outline',
                    recommended: true,
                  },
                  {
                    value: AdmissionCrmLeadRoutingStrategy.RoundRobin,
                    title: routingStrategyLabel[AdmissionCrmLeadRoutingStrategy.RoundRobin],
                    description: 'Rotate new inquiries evenly across the active owner pool.',
                    icon: 'mdi:account-sync-outline',
                  },
                  {
                    value: AdmissionCrmLeadRoutingStrategy.LeastOpenLeads,
                    title: routingStrategyLabel[AdmissionCrmLeadRoutingStrategy.LeastOpenLeads],
                    description:
                      'Send each inquiry to the eligible owner with the lightest open workload.',
                    icon: 'mdi:scale-balance',
                  },
                ]}
              />
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <Autocomplete
                multiple
                fullWidth
                size="small"
                limitTags={2}
                options={ownerOptions.filter((owner) => owner.isActive !== false)}
                value={(cycleForm.leadRoutingSettings.ownerPoolUserIds ?? [])
                  .map((id) => ownerOptions.find((owner) => owner.id === id))
                  .filter((owner): owner is (typeof ownerOptions)[number] => Boolean(owner))}
                inputValue={staffSearch}
                onInputChange={(_, value) => setStaffSearch(value)}
                onChange={(_, selected) =>
                  handleRoutingSettingsChange(
                    'ownerPoolUserIds',
                    selected.map((owner) => owner.id)
                  )
                }
                disabled={!academicYearId || isUpdatingCycle}
                loading={isUsersFetching}
                getOptionLabel={getCrmUserOptionLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pipeline owners"
                    helperText="Only active HR employees with Enrollment CRM access are available."
                  />
                )}
              />
            </Stack>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {cycleForm.leadRoutingSettings.rules.map((rule, index) => (
                <Box
                  key={`${rule.ruleName}-${index}`}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    display: 'grid',
                    gap: 1,
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`Rule ${index + 1}`}
                      sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Rule name"
                      value={rule.ruleName}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'ruleName', event.target.value)
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Priority"
                      value={rule.priority}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'priority', Number(event.target.value))
                      }
                      sx={{ width: { xs: '100%', md: 120 } }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.isEnabled}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(index, 'isEnabled', event.target.checked)
                          }
                        />
                      }
                      label="Enabled"
                    />
                    <Tooltip title="Duplicate this routing rule" arrow>
                      <span>
                        <IconButton
                          size="small"
                          disabled={!academicYearId || isUpdatingCycle}
                          onClick={() => handleDuplicateRoutingRule(index)}
                          aria-label={`Duplicate routing rule ${rule.ruleName || index + 1}`}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Remove this routing rule" arrow>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!academicYearId || isUpdatingCycle}
                          onClick={() => handleRemoveRoutingRule(index)}
                          aria-label={`Remove routing rule ${rule.ruleName || index + 1}`}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Channel</InputLabel>
                      <Select
                        label="Channel"
                        value={rule.channel ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(
                            index,
                            'channel',
                            String(event.target.value) === ''
                              ? null
                              : (Number(event.target.value) as AdmissionInquiryChannel)
                          )
                        }
                      >
                        <MenuItem value="">Any channel</MenuItem>
                        {inquiryChannelOptions.map((channel) => (
                          <MenuItem key={channel} value={channel}>
                            {getAdmissionCrmChannelLabel(channel)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Owner</InputLabel>
                      <Select
                        label="Owner"
                        value={rule.ownerUserId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(index, 'ownerUserId', event.target.value || null)
                        }
                      >
                        <MenuItem value="">No owner</MenuItem>
                        {ownerOptions.map((owner) => (
                          <MenuItem key={owner.id} value={owner.id}>
                            {getCrmUserOptionLabel(owner)}
                            {owner.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Inquiry Source</InputLabel>
                      <Select
                        label="Inquiry Source"
                        value={rule.inquirySourceId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(
                            index,
                            'inquirySourceId',
                            event.target.value || null
                          )
                        }
                      >
                        <MenuItem value="">Any source</MenuItem>
                        {inquirySourceOptions.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.displayName || source.preferenceName}
                            {source.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Accordion variant="outlined" disableGutters>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box>
                        <Typography variant="subtitle2">Advanced Match Conditions</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Narrow this exception by standard, campaign, class, branch, or language.
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Target standard ID"
                          value={rule.targetStandardId ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(index, 'targetStandardId', event.target.value)
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Campaign contains"
                          value={rule.campaignContains ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(index, 'campaignContains', event.target.value)
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Class contains"
                          value={rule.desiredClassContains ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(
                              index,
                              'desiredClassContains',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Branch contains"
                          value={rule.campusBranchContains ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(
                              index,
                              'campusBranchContains',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Language contains"
                          value={rule.preferredLanguageContains ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(
                              index,
                              'preferredLanguageContains',
                              event.target.value
                            )
                          }
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ))}
              {!cycleForm.leadRoutingSettings.rules.length && (
                <Alert severity="info">
                  No exception rules are configured. New inquiries use the selected strategy, owner
                  pool, and default owner.
                </Alert>
              )}
            </Box>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdatingCycle || isPreviewingCycleImpact}
              disabled={!academicYearId}
              onClick={handleSaveCycle}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Ownership Rules
            </LoadingButton>
          </Stack>
        </Paper>
      )}
    </>
  );
}
