'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add } from '@mui/icons-material';

import {
  Box,
  Chip,
  Stack,
  Paper,
  Switch,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { getAdmissionCrmChannelLabel } from '../admissions-crm/admissions-crm-utils';

import { getCrmUserOptionLabel } from './admissions-crm-configuration-utils';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

export function AdmissionsCrmConfigurationCapturePanel() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    approvedMessageTemplates,
    channelSettings,
    formTemplates,
    handleChannelSettingChange,
    handleSaveCycle,
    inquirySourceOptions,
    inquirySources,
    isPreviewingCycleImpact,
    isUpdatingCycle,
    isUpdatingSchoolDefaultCycle,
    openInquirySourceDialog,
    ownerOptions,
    setInquirySourceStatus,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Box>
          <Typography component="h2" variant="subtitle1">
            Inquiry Channels
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enable intake channels and set cycle defaults for source, owner, form, and
            acknowledgement.
          </Typography>
        </Box>
        <Divider />
        <Stack spacing={1}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={1}
          >
            <Box>
              <Typography variant="subtitle2">Inquiry Sources</Typography>
              <Typography variant="caption" color="text.secondary">
                Maintain school-specific sources used by channel defaults and lead routing.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add />}
              disabled={!academicYearId}
              onClick={() => openInquirySourceDialog()}
            >
              Add Custom Inquiry Source
            </Button>
          </Stack>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {(inquirySources?.items ?? []).map((source) => (
              <Chip
                key={source.id}
                size="small"
                label={`${source.displayName}${source.isActive ? '' : ' (inactive)'}`}
                color={source.isActive ? 'default' : 'warning'}
                variant="outlined"
                onClick={() => openInquirySourceDialog(source.id)}
                onDelete={() =>
                  setInquirySourceStatus({
                    sourceId: source.id,
                    body: {
                      isActive: !source.isActive,
                      reason: source.isActive ? 'Disabled from admissions settings.' : undefined,
                    },
                  })
                }
                deleteIcon={
                  <Typography component="span" variant="caption">
                    {source.isActive ? 'Disable' : 'Enable'}
                  </Typography>
                }
              />
            ))}
            {!inquirySources?.items?.length && (
              <Typography variant="body2" color="text.secondary">
                No inquiry sources configured.
              </Typography>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1 }}>
          {channelSettings.map((setting) => {
            const templatesForChannel = formTemplates.filter(
              (template) => template.channel === setting.channel
            );
            const channelFieldId = `inquiry-channel-${setting.channel}`;

            return (
              <Box
                key={setting.channel}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                  display: 'grid',
                  gap: 1,
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  gap={1}
                  alignItems={{ md: 'center' }}
                  justifyContent="space-between"
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={setting.isEnabled}
                        disabled={
                          !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                        }
                        onChange={(event) =>
                          handleChannelSettingChange(
                            setting.channel,
                            'isEnabled',
                            event.target.checked
                          )
                        }
                      />
                    }
                    label={getAdmissionCrmChannelLabel(setting.channel)}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Display order"
                    value={setting.displayOrder}
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onChange={(event) =>
                      handleChannelSettingChange(
                        setting.channel,
                        'displayOrder',
                        Number(event.target.value)
                      )
                    }
                    sx={{ width: { xs: '100%', md: 140 } }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`${channelFieldId}-source-label`}>
                      Default Inquiry Source
                    </InputLabel>
                    <Select
                      id={`${channelFieldId}-source`}
                      labelId={`${channelFieldId}-source-label`}
                      label="Default Inquiry Source"
                      value={setting.defaultInquirySourceId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) =>
                        handleChannelSettingChange(
                          setting.channel,
                          'defaultInquirySourceId',
                          event.target.value || null
                        )
                      }
                    >
                      <MenuItem value="">No default source</MenuItem>
                      {inquirySourceOptions.map((source) => (
                        <MenuItem key={source.id} value={source.id}>
                          {source.displayName || source.preferenceName}
                          {source.isActive === false ? ' (Inactive)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`${channelFieldId}-owner-label`}>Default owner</InputLabel>
                    <Select
                      id={`${channelFieldId}-owner`}
                      labelId={`${channelFieldId}-owner-label`}
                      label="Default owner"
                      value={setting.defaultOwnerUserId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) =>
                        handleChannelSettingChange(
                          setting.channel,
                          'defaultOwnerUserId',
                          event.target.value || null
                        )
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
                <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`${channelFieldId}-form-label`}>
                      Default form template
                    </InputLabel>
                    <Select
                      id={`${channelFieldId}-form`}
                      labelId={`${channelFieldId}-form-label`}
                      label="Default form template"
                      value={setting.defaultFormTemplateId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) =>
                        handleChannelSettingChange(
                          setting.channel,
                          'defaultFormTemplateId',
                          event.target.value || null
                        )
                      }
                    >
                      <MenuItem value="">No default form</MenuItem>
                      {templatesForChannel.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.templateName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel id={`${channelFieldId}-acknowledgement-label`}>
                      Acknowledgement template
                    </InputLabel>
                    <Select
                      id={`${channelFieldId}-acknowledgement`}
                      labelId={`${channelFieldId}-acknowledgement-label`}
                      label="Acknowledgement template"
                      value={setting.defaultAcknowledgementTemplateId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) =>
                        handleChannelSettingChange(
                          setting.channel,
                          'defaultAcknowledgementTemplateId',
                          event.target.value || null
                        )
                      }
                    >
                      <MenuItem value="">No acknowledgement template</MenuItem>
                      {approvedMessageTemplates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.templateName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            );
          })}
        </Box>
        <LoadingButton
          size="small"
          variant="contained"
          loading={isUpdatingCycle || isPreviewingCycleImpact}
          disabled={!academicYearId || isUpdatingSchoolDefaultCycle}
          onClick={handleSaveCycle}
          sx={{ alignSelf: 'flex-start' }}
        >
          Save Channels
        </LoadingButton>
      </Stack>
    </Paper>
  );
}
