'use client';

import type { AdmissionCrmPipelineStageDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { LoadingButton } from 'src/components/loading-button';

import { Add, ExpandMore } from '@mui/icons-material';

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
  Checkbox,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';

import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { getAdmissionCrmStageLabel } from '../admissions-crm/admissions-crm-utils';

import type { AdmissionCrmPipelineStageForm as PipelineStageForm } from './admissions-crm-configuration-model';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

const pipelineStageOptions = [
  AdmissionInquiryStage.NewInquiry,
  AdmissionInquiryStage.FollowUp,
  AdmissionInquiryStage.ExamReady,
  AdmissionInquiryStage.ExamScheduled,
  AdmissionInquiryStage.ExamCompleted,
  AdmissionInquiryStage.Eligible,
  AdmissionInquiryStage.Waitlisted,
  AdmissionInquiryStage.Rejected,
  AdmissionInquiryStage.Stale,
  AdmissionInquiryStage.Archived,
];

const buildPipelineStageFormFromStage = (
  stage: AdmissionCrmPipelineStageDto
): PipelineStageForm => ({
  stageKey: stage.stageKey || stage.systemStage.toString(),
  baseSystemStage: stage.baseSystemStage ?? stage.systemStage,
  stageName: stage.stageName,
  displayOrder: stage.displayOrder,
  isEnabled: stage.isEnabled,
  colorHex: stage.colorHex || '',
  slaTargetHours: stage.slaTargetHours?.toString() || '',
  ownerResponsibility: stage.ownerResponsibility || '',
  allowedNextStages: stage.allowedNextStages || [],
});

export function AdmissionsCrmConfigurationPipelinePanel() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    cycleForm,
    handleSaveStage,
    handleStageChange,
    handleToggleJourneyLock,
    isLockingJourney,
    isUnlockingJourney,
    isUpdatingPipelineStage,
    journeyLockReason,
    setCustomStageOpen,
    setJourneyLockReason,
    stageForms,
    stages,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Box>
          <Typography component="h2" variant="subtitle1">
            Applicant Stages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep the standard journey recognizable while tailoring names, service targets,
            ownership, and the next steps staff can select.
          </Typography>
        </Box>
        <Alert severity="info">
          Exam scheduling, results, eligibility, and stale or archive actions update their related
          stages through the corresponding workflow. These stage settings control presentation and
          permitted staff transitions; they do not replace those operational actions.
        </Alert>
        {cycleForm.journeyLocked && (
          <Alert severity="warning">
            Journey structure is locked. Metadata such as owner responsibility and SLA can be
            maintained, but stage order, enabled state, and next-stage rules are protected.
            {cycleForm.journeyLockReason ? ` Reason: ${cycleForm.journeyLockReason}` : ''}
          </Alert>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            disabled={!academicYearId || cycleForm.journeyLocked}
            onClick={() => setCustomStageOpen(true)}
          >
            Add Custom Stage
          </Button>
          <TextField
            size="small"
            label={cycleForm.journeyLocked ? 'Unlock reason' : 'Lock reason'}
            value={journeyLockReason}
            onChange={(event) => setJourneyLockReason(event.target.value)}
            sx={{ minWidth: { sm: 280 } }}
          />
          <LoadingButton
            size="small"
            variant={cycleForm.journeyLocked ? 'contained' : 'outlined'}
            loading={isLockingJourney || isUnlockingJourney}
            disabled={!academicYearId}
            onClick={() => handleToggleJourneyLock(!cycleForm.journeyLocked)}
          >
            {cycleForm.journeyLocked ? 'Unlock Journey' : 'Lock Journey'}
          </LoadingButton>
        </Stack>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1 }}>
          {stages.map((stage) => {
            const stageForm = stageForms[stage.id] ?? buildPipelineStageFormFromStage(stage);
            const stageColor =
              stageForm.colorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(stageForm.colorHex)
                ? stageForm.colorHex
                : 'transparent';

            return (
              <Accordion
                key={stage.id}
                disableGutters
                elevation={0}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { m: 0 },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls={`applicant-stage-${stage.id}-content`}
                  id={`applicant-stage-${stage.id}-header`}
                  sx={{
                    px: 1.25,
                    minHeight: 56,
                    '& .MuiAccordionSummary-content': { my: 1 },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1}
                    sx={{ width: '100%', pr: 1 }}
                  >
                    <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: 0.5,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: stageColor,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                          {stageForm.stageName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Order {stageForm.displayOrder}
                          {stageForm.slaTargetHours
                            ? ` - ${stageForm.slaTargetHours} hour target`
                            : ' - No service target'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={stage.isSystem ? 'Core stage' : 'School stage'}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={stageForm.isEnabled ? 'Enabled' : 'Disabled'}
                        color={stageForm.isEnabled ? 'primary' : 'default'}
                        sx={
                          stageForm.isEnabled
                            ? { bgcolor: 'primary.darker', color: 'common.white' }
                            : undefined
                        }
                      />
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails
                  id={`applicant-stage-${stage.id}-content`}
                  sx={{ px: 1.25, pt: 0, pb: 1.25 }}
                >
                  <Stack spacing={1}>
                    <Divider />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Stage name"
                        value={stageForm.stageName}
                        disabled={isUpdatingPipelineStage}
                        onChange={(event) =>
                          handleStageChange(stage.id, 'stageName', event.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Display order"
                        value={stageForm.displayOrder}
                        disabled={isUpdatingPipelineStage || cycleForm.journeyLocked}
                        onChange={(event) =>
                          handleStageChange(stage.id, 'displayOrder', Number(event.target.value))
                        }
                      />
                      <TextField
                        size="small"
                        label="Color hex"
                        placeholder="#1976D2"
                        value={stageForm.colorHex}
                        disabled={isUpdatingPipelineStage}
                        inputProps={{ maxLength: 16 }}
                        onChange={(event) =>
                          handleStageChange(stage.id, 'colorHex', event.target.value)
                        }
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        label="Service target (hours)"
                        value={stageForm.slaTargetHours}
                        disabled={isUpdatingPipelineStage}
                        onChange={(event) =>
                          handleStageChange(stage.id, 'slaTargetHours', event.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Typical owner and responsibility"
                        value={stageForm.ownerResponsibility}
                        disabled={isUpdatingPipelineStage}
                        inputProps={{ maxLength: 500 }}
                        onChange={(event) =>
                          handleStageChange(stage.id, 'ownerResponsibility', event.target.value)
                        }
                      />
                    </Box>
                    <FormControl
                      size="small"
                      disabled={isUpdatingPipelineStage || cycleForm.journeyLocked}
                    >
                      <InputLabel id={`allowed-next-stages-${stage.id}`}>
                        Staff can move applicants to
                      </InputLabel>
                      <Select
                        multiple
                        displayEmpty
                        labelId={`allowed-next-stages-${stage.id}`}
                        label="Staff can move applicants to"
                        SelectDisplayProps={{
                          'aria-label': `Allowed next stages for ${stageForm.stageName}`,
                        }}
                        value={stageForm.allowedNextStages}
                        renderValue={(selected) =>
                          selected.length
                            ? selected
                                .map((value) =>
                                  getAdmissionCrmStageLabel(value as AdmissionInquiryStage)
                                )
                                .join(', ')
                            : 'No manual next stage'
                        }
                        onChange={(event) => {
                          const { value } = event.target;
                          const selectedValues = Array.isArray(value)
                            ? value.map(Number)
                            : String(value).split(',').filter(Boolean).map(Number);
                          handleStageChange(
                            stage.id,
                            'allowedNextStages',
                            selectedValues as AdmissionInquiryStage[]
                          );
                        }}
                      >
                        {pipelineStageOptions
                          .filter((option) => option !== stage.systemStage)
                          .map((option) => (
                            <MenuItem key={option} value={option}>
                              <Checkbox checked={stageForm.allowedNextStages.includes(option)} />
                              {getAdmissionCrmStageLabel(option)}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      gap={1}
                      alignItems={{ sm: 'center' }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={stageForm.isEnabled}
                            disabled={isUpdatingPipelineStage || cycleForm.journeyLocked}
                            onChange={(event) =>
                              handleStageChange(stage.id, 'isEnabled', event.target.checked)
                            }
                          />
                        }
                        label="Available in Enrollment"
                      />
                      <LoadingButton
                        size="small"
                        variant="contained"
                        loading={isUpdatingPipelineStage}
                        onClick={() => handleSaveStage(stage.id)}
                      >
                        Save Stage
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
          {!stages.length && (
            <Typography variant="body2" color="text.secondary">
              No stages configured
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
