'use client';

import { LoadingButton } from 'src/components/loading-button';

import { InfoOutlined } from '@mui/icons-material';

import { Box, Stack, Paper, Button, Divider, Tooltip, Typography } from '@mui/material';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

import { AdmissionsCrmAutomationRulesPanel } from './admissions-crm-configuration-section-51';

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

export function AdmissionsCrmConfigurationSection5() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    approvedMessageTemplates,
    cycleForm,
    focusSection,
    getJourneyRuleSummary,
    handleAddJourneyRule,
    handleDuplicateJourneyRule,
    handleJourneyRuleChange,
    handleRemoveJourneyRule,
    handleSaveCycle,
    inquirySourceOptions,
    isPreviewingCycleImpact,
    isUpdatingCycle,
    ownerOptions,
    stages,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {focusSection === 'automation' && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                <SettingsHelpLabel
                  label="Journey Automation"
                  help="Runs follow-up tasks or parent messages when an applicant reaches a stage or matches configured conditions."
                />
              </Typography>
              <Button size="small" variant="outlined" onClick={handleAddJourneyRule}>
                Add Rule
              </Button>
            </Stack>
            <Divider />
            <Box sx={{ display: 'grid', gap: 1 }}>
              {cycleForm.journeyRules.map((rule, index) => (
                <AdmissionsCrmAutomationRulesPanel
                  key={`${rule.ruleName}-${index}`}
                  rule={rule}
                  index={index}
                />
              ))}
              {!cycleForm.journeyRules.length && (
                <Typography variant="body2" color="text.secondary">
                  No journey rules configured
                </Typography>
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
              Save Journeys
            </LoadingButton>
          </Stack>
        </Paper>
      )}
    </>
  );
}
