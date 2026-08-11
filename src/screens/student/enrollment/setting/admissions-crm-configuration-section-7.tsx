'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add, Delete, ContentCopy } from '@mui/icons-material';

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
  IconButton,
  InputLabel,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { AdmissionCrmMessageChannel } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  getAdmissionCrmProviderAdapter,
  getAdmissionCrmProviderPayloadMode,
  getAdmissionCrmProviderCallbackSecret,
  getAdmissionCrmProviderKeyValueSettings,
  getAdmissionCrmProviderCallbackMappingPath,
  buildAdmissionCrmProviderDeliveryCallbackUrl,
  getAdmissionCrmProviderResponseMessageIdPath,
} from './admissions-crm-configuration-utils';

import type { AdmissionCrmCommunicationProviderForm as CommunicationProviderForm } from './admissions-crm-configuration-model';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

const providerAdapterOptions = [
  { value: 'webhook', label: 'Webhook' },
  { value: 'custom-webhook', label: 'Custom webhook' },
  { value: 'manual', label: 'Manual queue' },
];

const defaultProviderForm: CommunicationProviderForm = {
  isEnabled: false,
  providerName: '',
  senderId: '',
  settingsJson: '',
  webhookUrl: '',
};

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

export function AdmissionsCrmConfigurationSection7() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    academicYearId,
    communicationProviders,
    focusPanel,
    focusSection,
    handleCopyProviderCallbackUrl,
    handleProviderAdapterChange,
    handleProviderCallbackMappingPathChange,
    handleProviderCallbackSecretChange,
    handleProviderChange,
    handleProviderKeyValueChange,
    handleProviderPayloadModeChange,
    handleProviderResponseMessageIdPathChange,
    handleSaveCommunicationProvider,
    isUpdatingCommunicationProvider,
    providerForms,
    tenantId,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      {focusSection === 'communications' && (!focusPanel || focusPanel === 'providers') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Communication Providers
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {communicationProviders?.totalCount || 0} channels
              </Typography>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(communicationProviders?.items || []).map((provider) => {
                const providerForm = providerForms[provider.channel] || defaultProviderForm;
                const providerAdapter = getAdmissionCrmProviderAdapter(providerForm.settingsJson);
                const providerPayloadMode = getAdmissionCrmProviderPayloadMode(
                  providerForm.settingsJson
                );
                const providerHeaders = Object.entries(
                  getAdmissionCrmProviderKeyValueSettings(providerForm.settingsJson, 'headers')
                );
                const providerParameters = Object.entries(
                  getAdmissionCrmProviderKeyValueSettings(providerForm.settingsJson, 'parameters')
                );
                const providerCallbackUrl = buildAdmissionCrmProviderDeliveryCallbackUrl({
                  apiOrigin: process.env.NEXT_PUBLIC_API_URL,
                  tenantId,
                  academicYearId,
                  channel: provider.channel,
                });

                return (
                  <Paper key={provider.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">
                          {messageChannelLabel[provider.channel]}
                        </Typography>
                        <Chip
                          size="small"
                          label={provider.status}
                          color={provider.isEnabled ? 'success' : 'default'}
                        />
                      </Stack>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={providerForm.isEnabled}
                            onChange={(event) =>
                              handleProviderChange(
                                provider.channel,
                                'isEnabled',
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Enabled"
                      />
                      <TextField
                        size="small"
                        label="Provider"
                        value={providerForm.providerName}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'providerName', event.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Sender"
                        value={providerForm.senderId}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'senderId', event.target.value)
                        }
                      />
                      <FormControl size="small">
                        <InputLabel>Adapter</InputLabel>
                        <Select
                          label="Adapter"
                          value={providerAdapter}
                          onChange={(event) =>
                            handleProviderAdapterChange(provider.channel, event.target.value)
                          }
                        >
                          {providerAdapterOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" disabled={providerAdapter === 'manual'}>
                        <InputLabel>Payload</InputLabel>
                        <Select
                          label="Payload"
                          value={providerPayloadMode}
                          onChange={(event) =>
                            handleProviderPayloadModeChange(provider.channel, event.target.value)
                          }
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="envelope">Envelope</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Webhook URL"
                        value={providerForm.webhookUrl}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'webhookUrl', event.target.value)
                        }
                      />
                      {providerAdapter !== 'manual' && (
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Request headers
                          </Typography>
                          {provider.settings.hasStoredHeaderValues && (
                            <Typography variant="caption" color="text.secondary">
                              Stored header values are hidden. Leave a value blank to keep it, or
                              remove the row to delete it.
                            </Typography>
                          )}
                          {providerHeaders.map(([key, value]) => (
                            <Stack key={key} direction="row" spacing={0.75} alignItems="center">
                              <TextField
                                size="small"
                                label="Header"
                                value={key}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    event.target.value,
                                    value
                                  )
                                }
                              />
                              <TextField
                                size="small"
                                label="Value"
                                value={value}
                                type={
                                  key.toLowerCase().includes('authorization') ? 'password' : 'text'
                                }
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    key,
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                              <IconButton
                                size="small"
                                aria-label={`Remove ${key} header`}
                                onClick={() =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    '',
                                    ''
                                  )
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() =>
                              handleProviderKeyValueChange(
                                provider.channel,
                                'headers',
                                '',
                                `Header-${providerHeaders.length + 1}`,
                                ''
                              )
                            }
                          >
                            Add header
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            Payload parameters
                          </Typography>
                          {provider.settings.hasStoredParameterValues && (
                            <Typography variant="caption" color="text.secondary">
                              Stored parameter values are hidden. Leave a value blank to keep it, or
                              remove the row to delete it.
                            </Typography>
                          )}
                          {providerParameters.map(([key, value]) => (
                            <Stack key={key} direction="row" spacing={0.75} alignItems="center">
                              <TextField
                                size="small"
                                label="Parameter"
                                value={key}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    event.target.value,
                                    value
                                  )
                                }
                              />
                              <TextField
                                size="small"
                                label="Value"
                                value={value}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    key,
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                              <IconButton
                                size="small"
                                aria-label={`Remove ${key} parameter`}
                                onClick={() =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    '',
                                    ''
                                  )
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() =>
                              handleProviderKeyValueChange(
                                provider.channel,
                                'parameters',
                                '',
                                `parameter${providerParameters.length + 1}`,
                                ''
                              )
                            }
                          >
                            Add parameter
                          </Button>
                        </Stack>
                      )}
                      <TextField
                        size="small"
                        label="Response message ID path"
                        value={getAdmissionCrmProviderResponseMessageIdPath(
                          providerForm.settingsJson
                        )}
                        disabled={providerAdapter === 'manual'}
                        onChange={(event) =>
                          handleProviderResponseMessageIdPathChange(
                            provider.channel,
                            event.target.value
                          )
                        }
                      />
                      <TextField
                        size="small"
                        label="Callback secret"
                        type="password"
                        autoComplete="new-password"
                        value={getAdmissionCrmProviderCallbackSecret(providerForm.settingsJson)}
                        helperText={
                          provider.settings.hasCallbackSecret
                            ? 'A callback secret is stored. Leave blank to keep it, or enter a value to replace it.'
                            : 'Enter a secret to verify provider callbacks.'
                        }
                        onChange={(event) =>
                          handleProviderCallbackSecretChange(provider.channel, event.target.value)
                        }
                      />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          size="small"
                          label="Provider callback URL"
                          value={providerCallbackUrl || ''}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={!providerCallbackUrl}
                          onClick={() => handleCopyProviderCallbackUrl(provider.channel)}
                        >
                          Copy
                        </Button>
                      </Stack>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1,
                        }}
                      >
                        <TextField
                          size="small"
                          label="Callback status path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'statusPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'statusPath',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Callback detail path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'statusDetailsPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'statusDetailsPath',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Callback message ID path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'providerMessageIdPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'providerMessageIdPath',
                              event.target.value
                            )
                          }
                        />
                      </Box>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={isUpdatingCommunicationProvider}
                        disabled={!academicYearId}
                        onClick={() => handleSaveCommunicationProvider(provider.channel)}
                      >
                        Save Provider
                      </LoadingButton>
                    </Stack>
                  </Paper>
                );
              })}
              {!communicationProviders?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No communication providers configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}
    </>
  );
}
