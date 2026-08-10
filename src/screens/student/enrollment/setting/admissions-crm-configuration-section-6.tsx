'use client';

import { Visibility, ContentCopy } from '@mui/icons-material';

import {
  Box,
  Chip,
  Stack,
  Paper,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

import { AdmissionInquiryChannel } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmMessageChannel,
  AdmissionCrmMessageTemplateStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { getAdmissionCrmChannelLabel } from '../admissions-crm/admissions-crm-utils';

import { getCrmUserOptionLabel } from './admissions-crm-configuration-utils';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

const messageStatusLabel: Record<AdmissionCrmMessageTemplateStatus, string> = {
  [AdmissionCrmMessageTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmMessageTemplateStatus.Approved]: 'Approved',
  [AdmissionCrmMessageTemplateStatus.Retired]: 'Retired',
};

export function AdmissionsCrmConfigurationSection6() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    campaignLinkNames,
    downloadingQrTemplateId,
    focusPanel,
    focusSection,
    handleCampaignLinkNameChange,
    handleCopyCampaignFormLink,
    handleCopyPublicFormLink,
    handleCopyStaffSharedFormLink,
    handleDownloadPublicFormQr,
    handleOpenCreateTemplate,
    handleOpenEditTemplate,
    handleOpenMessageTemplatePreview,
    handleStaffLinkOwnerChange,
    handleToggleMessageTemplateApproval,
    handleToggleTemplateStatus,
    isCreatingTemplate,
    isPreviewingMessageTemplate,
    isUpdatingMessageTemplateStatus,
    isUpdatingTemplate,
    isUpdatingTemplateStatus,
    messageTemplates,
    ownerOptions,
    setDuplicateInquiryFormTemplate,
    setInquiryFormPreviewTemplate,
    setMessageDialogOpen,
    staffLinkOwnerIds,
    templates,
    tenantId,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {focusSection === 'capture' && (!focusPanel || focusPanel === 'forms') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Form Templates
              </Typography>
              <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  {templates?.totalCount || 0} templates
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  disabled={isCreatingTemplate || isUpdatingTemplate}
                  onClick={handleOpenCreateTemplate}
                >
                  Create Custom Inquiry Form
                </Button>
              </Stack>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(templates?.items || []).map((template) => (
                <Paper
                  key={template.id}
                  component="article"
                  aria-label={`Inquiry form ${template.templateName}`}
                  variant="outlined"
                  sx={{ p: 1.25, borderRadius: 1 }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                        {template.templateName}
                      </Typography>
                      <Chip
                        size="small"
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {getAdmissionCrmChannelLabel(template.channel)}
                      {template.isPublic ? ' - Public' : ' - Internal'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.fields.length} fields
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isCreatingTemplate || isUpdatingTemplate}
                        onClick={() => handleOpenEditTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isCreatingTemplate || isUpdatingTemplate}
                        onClick={() => setDuplicateInquiryFormTemplate(template)}
                      >
                        Duplicate Form
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setInquiryFormPreviewTemplate(template)}
                      >
                        Language Preview
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={
                          !template.isPublic ||
                          !template.isActive ||
                          !tenantId ||
                          downloadingQrTemplateId === template.id
                        }
                        onClick={() => handleDownloadPublicFormQr(template)}
                      >
                        Download QR
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isUpdatingTemplateStatus}
                        onClick={() => handleToggleTemplateStatus(template.id, template.isActive)}
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {template.isPublic && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={!template.isActive || !tenantId}
                          onClick={() => handleCopyPublicFormLink(template)}
                        >
                          Copy Link
                        </Button>
                      )}
                    </Stack>
                    {template.isPublic && (
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        gap={1}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                      >
                        <TextField
                          size="small"
                          label="Campaign name"
                          value={campaignLinkNames[template.id] || ''}
                          disabled={!template.isActive || !tenantId}
                          onChange={(event) =>
                            handleCampaignLinkNameChange(template.id, event.target.value)
                          }
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={
                            !template.isActive ||
                            !tenantId ||
                            !campaignLinkNames[template.id]?.trim()
                          }
                          onClick={() => handleCopyCampaignFormLink(template)}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Copy Campaign Link
                        </Button>
                      </Stack>
                    )}
                    {template.isPublic &&
                      template.channel === AdmissionInquiryChannel.StaffSharedLink && (
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          gap={1}
                          alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                          <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                            <InputLabel>Staff owner</InputLabel>
                            <Select
                              label="Staff owner"
                              value={staffLinkOwnerIds[template.id] || ''}
                              disabled={!template.isActive || !tenantId}
                              onChange={(event) =>
                                handleStaffLinkOwnerChange(template.id, event.target.value)
                              }
                            >
                              <MenuItem value="">Select owner</MenuItem>
                              {ownerOptions.map((owner) => (
                                <MenuItem key={owner.id} value={owner.id}>
                                  {getCrmUserOptionLabel(owner)}
                                  {owner.isActive === false ? ' (Inactive)' : ''}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopy />}
                            disabled={
                              !template.isActive ||
                              !tenantId ||
                              !staffLinkOwnerIds[template.id]?.trim()
                            }
                            onClick={() => handleCopyStaffSharedFormLink(template)}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            Copy Staff Link
                          </Button>
                        </Stack>
                      )}
                  </Stack>
                </Paper>
              ))}
              {!templates?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No form templates configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}
      {focusSection === 'communications' && (!focusPanel || focusPanel === 'templates') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Message Templates
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messageTemplates?.totalCount || 0} templates
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => setMessageDialogOpen(true)}>
                New Template
              </Button>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(messageTemplates?.items || []).map((template) => (
                <Paper key={template.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                        {template.templateName}
                      </Typography>
                      <Chip
                        size="small"
                        label={messageStatusLabel[template.status]}
                        color={
                          template.status === AdmissionCrmMessageTemplateStatus.Approved
                            ? 'success'
                            : template.status === AdmissionCrmMessageTemplateStatus.Retired
                              ? 'default'
                              : 'warning'
                        }
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {messageChannelLabel[template.channel]} - {template.purpose}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {template.body}
                    </Typography>
                    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                      <Chip
                        size="small"
                        label={template.isActive ? 'Active' : 'Inactive'}
                        variant="outlined"
                      />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        disabled={isPreviewingMessageTemplate}
                        onClick={() => handleOpenMessageTemplatePreview(template)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        disabled={isUpdatingMessageTemplateStatus}
                        onClick={() =>
                          handleToggleMessageTemplateApproval(
                            template.id,
                            template.status,
                            template.isActive
                          )
                        }
                      >
                        {template.status === AdmissionCrmMessageTemplateStatus.Approved
                          ? 'Retire'
                          : 'Approve'}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
              {!messageTemplates?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No message templates configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}
    </>
  );
}
