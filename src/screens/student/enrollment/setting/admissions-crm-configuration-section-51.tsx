'use client';

import type { AdmissionCrmJourneyRuleDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { ContentCopy } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Switch,
  Select,
  Button,
  Tooltip,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmJourneyTrigger,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmMessageChannel } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
} from '../admissions-crm/admissions-crm-utils';

import { getCrmUserOptionLabel } from './admissions-crm-configuration-utils';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

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

const journeyTriggerLabel: Record<AdmissionCrmJourneyTrigger, string> = {
  [AdmissionCrmJourneyTrigger.LeadCreated]: 'Lead created',
  [AdmissionCrmJourneyTrigger.StageReached]: 'Stage reached',
  [AdmissionCrmJourneyTrigger.SlaMissed]: 'SLA missed',
  [AdmissionCrmJourneyTrigger.StaleMarked]: 'Marked stale',
  [AdmissionCrmJourneyTrigger.ExamScheduled]: 'Exam scheduled',
  [AdmissionCrmJourneyTrigger.ExamCompleted]: 'Exam completed',
  [AdmissionCrmJourneyTrigger.EligibilityDecided]: 'Eligibility decided',
  [AdmissionCrmJourneyTrigger.RegistrationIssued]: 'Registration issued',
  [AdmissionCrmJourneyTrigger.RegistrationIncomplete]: 'Registration incomplete',
  [AdmissionCrmJourneyTrigger.RegistrationExpiring]: 'Registration expiring',
  [AdmissionCrmJourneyTrigger.RegistrationSubmitted]: 'Registration submitted',
  [AdmissionCrmJourneyTrigger.RegistrationCorrectionRequested]: 'Registration correction requested',
  [AdmissionCrmJourneyTrigger.RegistrationVerified]: 'Registration verified',
  [AdmissionCrmJourneyTrigger.DocumentUploaded]: 'Document uploaded',
  [AdmissionCrmJourneyTrigger.DocumentRejected]: 'Document rejected',
  [AdmissionCrmJourneyTrigger.DocumentPending]: 'Document review pending',
  [AdmissionCrmJourneyTrigger.ExamNoShow]: 'Exam no-show',
  [AdmissionCrmJourneyTrigger.AdmissionReady]: 'Admission ready',
  [AdmissionCrmJourneyTrigger.DocumentExpiring]: 'Document expiring',
  [AdmissionCrmJourneyTrigger.FeeFollowUp]: 'Fee follow-up',
  [AdmissionCrmJourneyTrigger.OfferIssued]: 'Offer issued',
  [AdmissionCrmJourneyTrigger.OfferAccepted]: 'Offer accepted',
  [AdmissionCrmJourneyTrigger.ActivationWelcome]: 'Activation welcome',
};

const leadPriorityLabel: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'No priority',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const leadPriorityOptions = [
  AdmissionCrmLeadPriority.None,
  AdmissionCrmLeadPriority.Hot,
  AdmissionCrmLeadPriority.Warm,
  AdmissionCrmLeadPriority.Cold,
  AdmissionCrmLeadPriority.Low,
];

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

type Props = {
  rule: AdmissionCrmJourneyRuleDto;
  index: number;
};

export function AdmissionsCrmAutomationRulesPanel({ rule, index }: Props) {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    approvedMessageTemplates,
    getJourneyRuleSummary,
    handleDuplicateJourneyRule,
    handleJourneyRuleChange,
    handleRemoveJourneyRule,
    inquirySourceOptions,
    isUpdatingCycle,
    ownerOptions,
    stages,
  } = { ...controllerState, ...actions, ...meta };

  return (
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
        <TextField
          fullWidth
          size="small"
          label="Rule name"
          value={rule.ruleName}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) => handleJourneyRuleChange(index, 'ruleName', event.target.value)}
        />
        <TextField
          size="small"
          type="number"
          label="Priority"
          value={rule.priority}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'priority', Number(event.target.value))
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={rule.isEnabled}
              disabled={!academicYearId || isUpdatingCycle}
              onChange={(event) =>
                handleJourneyRuleChange(index, 'isEnabled', event.target.checked)
              }
            />
          }
          label="Enabled"
        />
        <Tooltip title="Duplicate this journey rule" arrow>
          <span>
            <IconButton
              size="small"
              disabled={!academicYearId || isUpdatingCycle}
              onClick={() => handleDuplicateJourneyRule(index)}
              aria-label={`Duplicate journey rule ${rule.ruleName || index + 1}`}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
        <FormControl fullWidth size="small">
          <InputLabel>Trigger</InputLabel>
          <Select
            label="Trigger"
            value={rule.trigger}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(
                index,
                'trigger',
                Number(event.target.value) as AdmissionCrmJourneyTrigger
              )
            }
          >
            {Object.entries(journeyTriggerLabel).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {rule.trigger === AdmissionCrmJourneyTrigger.StageReached && (
          <FormControl fullWidth size="small">
            <InputLabel>Pipeline stage</InputLabel>
            <Select
              label="Pipeline stage"
              value={rule.stage ?? ''}
              disabled={!academicYearId || isUpdatingCycle}
              onChange={(event) =>
                handleJourneyRuleChange(
                  index,
                  'stage',
                  String(event.target.value) === ''
                    ? null
                    : (Number(event.target.value) as AdmissionInquiryStage)
                )
              }
            >
              <MenuItem value="">Select stage</MenuItem>
              {stages.map((stage) => (
                <MenuItem key={stage.id} value={stage.systemStage}>
                  {stage.stageName || getAdmissionCrmStageLabel(stage.systemStage)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          size="small"
          color="error"
          disabled={!academicYearId || isUpdatingCycle}
          onClick={() => handleRemoveJourneyRule(index)}
          sx={{ alignSelf: { md: 'center' } }}
        >
          Remove
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
        <FormControl fullWidth size="small">
          <InputLabel>Channel condition</InputLabel>
          <Select
            label="Channel condition"
            value={rule.channel ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(
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
          <InputLabel>Inquiry Source condition</InputLabel>
          <Select
            label="Inquiry Source condition"
            value={rule.inquirySourceId ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(index, 'inquirySourceId', event.target.value || null)
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
        <FormControl fullWidth size="small">
          <InputLabel>Current stage condition</InputLabel>
          <Select
            label="Current stage condition"
            value={rule.leadStage ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(
                index,
                'leadStage',
                String(event.target.value) === ''
                  ? null
                  : (Number(event.target.value) as AdmissionInquiryStage)
              )
            }
          >
            <MenuItem value="">Any current stage</MenuItem>
            {stages.map((stage) => (
              <MenuItem key={stage.id} value={stage.systemStage}>
                {stage.stageName || getAdmissionCrmStageLabel(stage.systemStage)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Owner condition</InputLabel>
          <Select
            label="Owner condition"
            value={rule.ownerUserId ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(index, 'ownerUserId', event.target.value || null)
            }
          >
            <MenuItem value="">Any owner</MenuItem>
            {ownerOptions.map((owner) => (
              <MenuItem key={owner.id} value={owner.id}>
                {getCrmUserOptionLabel(owner)}
                {owner.isActive === false ? ' (Inactive)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
        <TextField
          fullWidth
          size="small"
          label="Campaign contains"
          value={rule.campaignContains ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'campaignContains', event.target.value)
          }
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Min lead score"
          value={rule.minimumLeadScore ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(
              index,
              'minimumLeadScore',
              event.target.value === '' ? null : Number(event.target.value)
            )
          }
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Max lead score"
          value={rule.maximumLeadScore ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(
              index,
              'maximumLeadScore',
              event.target.value === '' ? null : Number(event.target.value)
            )
          }
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Idle days"
          value={rule.daysSinceLastActivity ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(
              index,
              'daysSinceLastActivity',
              event.target.value === '' ? null : Number(event.target.value)
            )
          }
        />
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Lead age days"
          value={rule.daysSinceCreation ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(
              index,
              'daysSinceCreation',
              event.target.value === '' ? null : Number(event.target.value)
            )
          }
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
        <FormControl fullWidth size="small">
          <InputLabel>Priority condition</InputLabel>
          <Select
            label="Priority condition"
            value={rule.leadPriority ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(
                index,
                'leadPriority',
                String(event.target.value) === ''
                  ? null
                  : (Number(event.target.value) as AdmissionCrmLeadPriority)
              )
            }
          >
            <MenuItem value="">Any priority</MenuItem>
            {leadPriorityOptions.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {leadPriorityLabel[priority]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          size="small"
          label="Target standard ID"
          value={rule.targetStandardId ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'targetStandardId', event.target.value)
          }
        />
        <TextField
          fullWidth
          size="small"
          label="Desired class contains"
          value={rule.desiredClassContains ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'desiredClassContains', event.target.value)
          }
        />
        <TextField
          fullWidth
          size="small"
          label="Branch contains"
          value={rule.campusBranchContains ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'campusBranchContains', event.target.value)
          }
        />
        <TextField
          fullWidth
          size="small"
          label="Language contains"
          value={rule.preferredLanguageContains ?? ''}
          disabled={!academicYearId || isUpdatingCycle}
          onChange={(event) =>
            handleJourneyRuleChange(index, 'preferredLanguageContains', event.target.value)
          }
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={rule.createTask}
              disabled={!academicYearId || isUpdatingCycle}
              onChange={(event) =>
                handleJourneyRuleChange(index, 'createTask', event.target.checked)
              }
            />
          }
          label="Create task"
        />
        <FormControlLabel
          control={
            <Switch
              checked={rule.sendMessage}
              disabled={!academicYearId || isUpdatingCycle}
              onChange={(event) =>
                handleJourneyRuleChange(index, 'sendMessage', event.target.checked)
              }
            />
          }
          label="Send message"
        />
      </Stack>
      <Alert severity="info" variant="outlined">
        {getJourneyRuleSummary(rule)}
      </Alert>
      {rule.createTask && (
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            fullWidth
            size="small"
            label="Task title"
            value={rule.taskTitle ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) => handleJourneyRuleChange(index, 'taskTitle', event.target.value)}
          />
          <TextField
            size="small"
            type="number"
            label="Due offset hours"
            value={rule.taskDueOffsetHours}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(index, 'taskDueOffsetHours', Number(event.target.value))
            }
          />
          <TextField
            fullWidth
            size="small"
            label="Task notes"
            value={rule.taskNotes ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) => handleJourneyRuleChange(index, 'taskNotes', event.target.value)}
          />
        </Stack>
      )}
      {rule.sendMessage && (
        <FormControl fullWidth size="small">
          <InputLabel>Message template</InputLabel>
          <Select
            label="Message template"
            value={rule.messageTemplateId ?? ''}
            disabled={!academicYearId || isUpdatingCycle}
            onChange={(event) =>
              handleJourneyRuleChange(
                index,
                'messageTemplateId',
                String(event.target.value) || null
              )
            }
          >
            <MenuItem value="">Select approved template</MenuItem>
            {approvedMessageTemplates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.templateName} - {messageChannelLabel[template.channel]}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Use an approved template so parent communication stays consistent by channel.
          </Typography>
        </FormControl>
      )}
    </Box>
  );
}
