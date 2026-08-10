'use client';

import { LoadingButton } from 'src/components/loading-button';

import { ContentCopy } from '@mui/icons-material';

import {
  Alert,
  Stack,
  Paper,
  Switch,
  Select,
  Dialog,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmMessageChannel } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
} from '../admissions-crm/admissions-crm-utils';

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

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

export function AdmissionsCrmConfigurationSection10() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    customStageForm,
    customStageOpen,
    editingInquirySourceId,
    handleCloseMessageDialog,
    handleCloseMessagePreview,
    handleCopyPreviewText,
    handleCreateCustomStage,
    handleCreateMessageTemplate,
    handleMessageTemplateChange,
    handleRefreshMessagePreview,
    handleSaveInquirySource,
    inquirySourceForm,
    inquirySourceOpen,
    isCreatingInquirySource,
    isCreatingMessageTemplate,
    isCreatingPipelineStage,
    isPreviewingMessageTemplate,
    isUpdatingInquirySource,
    messageDialogOpen,
    messagePreviewVariablesText,
    messageTemplateForm,
    messageTemplatePreview,
    previewTemplate,
    setCustomStageForm,
    setCustomStageOpen,
    setInquirySourceForm,
    setInquirySourceOpen,
    setMessagePreviewVariablesText,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Message Template</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              required
              label="Template name"
              value={messageTemplateForm.templateName}
              onChange={(event) => handleMessageTemplateChange('templateName', event.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="crm-message-channel-label">Channel</InputLabel>
              <Select
                labelId="crm-message-channel-label"
                label="Channel"
                value={messageTemplateForm.channel}
                onChange={(event) =>
                  handleMessageTemplateChange(
                    'channel',
                    Number(event.target.value) as AdmissionCrmMessageChannel
                  )
                }
              >
                {Object.values(AdmissionCrmMessageChannel)
                  .filter((value) => typeof value === 'number')
                  .map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {messageChannelLabel[channel as AdmissionCrmMessageChannel]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              required
              label="Purpose"
              value={messageTemplateForm.purpose}
              onChange={(event) => handleMessageTemplateChange('purpose', event.target.value)}
              fullWidth
            />
            {messageTemplateForm.channel === AdmissionCrmMessageChannel.Email && (
              <TextField
                required
                label="Subject"
                value={messageTemplateForm.subject}
                onChange={(event) => handleMessageTemplateChange('subject', event.target.value)}
                fullWidth
              />
            )}
            <TextField
              required
              label="Body"
              value={messageTemplateForm.body}
              onChange={(event) => handleMessageTemplateChange('body', event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Variables"
              value={messageTemplateForm.variables}
              onChange={(event) => handleMessageTemplateChange('variables', event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingMessageTemplate}
            onClick={handleCreateMessageTemplate}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(previewTemplate)}
        onClose={handleCloseMessagePreview}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Message Template Preview</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {previewTemplate && (
              <Alert severity="info">
                {previewTemplate.templateName} - {messageChannelLabel[previewTemplate.channel]}
              </Alert>
            )}
            <TextField
              label="Preview variables"
              value={messagePreviewVariablesText}
              onChange={(event) => setMessagePreviewVariablesText(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              placeholder="examDate=15 July"
            />
            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton
                variant="outlined"
                loading={isPreviewingMessageTemplate}
                onClick={handleRefreshMessagePreview}
              >
                Refresh Preview
              </LoadingButton>
            </Stack>
            {messageTemplatePreview?.unresolvedVariables.length ? (
              <Alert severity="warning">
                Unresolved: {messageTemplatePreview.unresolvedVariables.join(', ')}
              </Alert>
            ) : null}
            {messageTemplatePreview?.renderedSubject && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2">Subject</Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopyPreviewText(messageTemplatePreview.renderedSubject)}
                    >
                      Copy
                    </Button>
                  </Stack>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {messageTemplatePreview.renderedSubject}
                  </Typography>
                </Stack>
              </Paper>
            )}
            {messageTemplatePreview && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2">Body</Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopyPreviewText(messageTemplatePreview.renderedBody)}
                    >
                      Copy
                    </Button>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {messageTemplatePreview.renderedBody}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessagePreview}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={customStageOpen}
        onClose={() => setCustomStageOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Custom Stage</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <TextField
              required
              label="Stage key"
              value={customStageForm.stageKey}
              onChange={(event) =>
                setCustomStageForm((prev) => ({ ...prev, stageKey: event.target.value }))
              }
              helperText="Stable code used by workflow automation, for example DOCUMENT_REVIEW."
            />
            <TextField
              required
              label="Stage name"
              value={customStageForm.stageName}
              onChange={(event) =>
                setCustomStageForm((prev) => ({ ...prev, stageName: event.target.value }))
              }
            />
            <FormControl size="small">
              <InputLabel>Reporting category</InputLabel>
              <Select
                label="Reporting category"
                value={customStageForm.baseSystemStage}
                onChange={(event) =>
                  setCustomStageForm((prev) => ({
                    ...prev,
                    baseSystemStage: Number(event.target.value) as AdmissionInquiryStage,
                  }))
                }
              >
                {pipelineStageOptions.map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {getAdmissionCrmStageLabel(stage)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                size="small"
                type="number"
                label="Display order"
                value={customStageForm.displayOrder}
                onChange={(event) =>
                  setCustomStageForm((prev) => ({
                    ...prev,
                    displayOrder: Number(event.target.value),
                  }))
                }
              />
              <TextField
                size="small"
                label="Color hex"
                value={customStageForm.colorHex}
                onChange={(event) =>
                  setCustomStageForm((prev) => ({ ...prev, colorHex: event.target.value }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="SLA hours"
                value={customStageForm.slaTargetHours}
                onChange={(event) =>
                  setCustomStageForm((prev) => ({ ...prev, slaTargetHours: event.target.value }))
                }
              />
            </Stack>
            <TextField
              label="Typical owner and responsibility"
              value={customStageForm.ownerResponsibility}
              onChange={(event) =>
                setCustomStageForm((prev) => ({
                  ...prev,
                  ownerResponsibility: event.target.value,
                }))
              }
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomStageOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingPipelineStage}
            onClick={handleCreateCustomStage}
          >
            Add Stage
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={inquirySourceOpen}
        onClose={() => setInquirySourceOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingInquirySourceId ? 'Edit Inquiry Source' : 'Add Custom Inquiry Source'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <TextField
              required
              label="Code"
              value={inquirySourceForm.code}
              onChange={(event) =>
                setInquirySourceForm((prev) => ({ ...prev, code: event.target.value }))
              }
            />
            <TextField
              required
              label="Display name"
              value={inquirySourceForm.displayName}
              onChange={(event) =>
                setInquirySourceForm((prev) => ({ ...prev, displayName: event.target.value }))
              }
            />
            <TextField
              label="Description"
              value={inquirySourceForm.description}
              onChange={(event) =>
                setInquirySourceForm((prev) => ({ ...prev, description: event.target.value }))
              }
              multiline
              minRows={2}
            />
            <FormControl size="small">
              <InputLabel>Allowed channels</InputLabel>
              <Select
                multiple
                label="Allowed channels"
                value={inquirySourceForm.allowedChannels}
                renderValue={(selected) =>
                  selected.map((channel) => getAdmissionCrmChannelLabel(channel)).join(', ')
                }
                onChange={(event) => {
                  const { value } = event.target;
                  setInquirySourceForm((prev) => ({
                    ...prev,
                    allowedChannels: Array.isArray(value)
                      ? (value.map(Number) as AdmissionInquiryChannel[])
                      : (String(value)
                          .split(',')
                          .filter(Boolean)
                          .map(Number) as AdmissionInquiryChannel[]),
                  }));
                }}
              >
                {inquiryChannelOptions.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    <Checkbox checked={inquirySourceForm.allowedChannels.includes(channel)} />
                    {getAdmissionCrmChannelLabel(channel)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
              <TextField
                size="small"
                type="number"
                label="Display order"
                value={inquirySourceForm.displayOrder}
                onChange={(event) =>
                  setInquirySourceForm((prev) => ({
                    ...prev,
                    displayOrder: Number(event.target.value),
                  }))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={inquirySourceForm.isRoutingEligible}
                    onChange={(event) =>
                      setInquirySourceForm((prev) => ({
                        ...prev,
                        isRoutingEligible: event.target.checked,
                      }))
                    }
                  />
                }
                label="Routing eligible"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquirySourceOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingInquirySource || isUpdatingInquirySource}
            onClick={handleSaveInquirySource}
          >
            Save Source
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
