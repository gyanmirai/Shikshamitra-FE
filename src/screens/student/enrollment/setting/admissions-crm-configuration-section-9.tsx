'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Chip,
  Stack,
  Paper,
  Switch,
  Select,
  Dialog,
  Button,
  Divider,
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
  AdmissionInquiryChannel,
  AdmissionCrmFormFieldType,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { getAdmissionCrmChannelLabel } from '../admissions-crm/admissions-crm-utils';

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

const formFieldTypeLabel: Record<AdmissionCrmFormFieldType, string> = {
  [AdmissionCrmFormFieldType.Text]: 'Text',
  [AdmissionCrmFormFieldType.TextArea]: 'Long text',
  [AdmissionCrmFormFieldType.Number]: 'Number',
  [AdmissionCrmFormFieldType.Date]: 'Date',
  [AdmissionCrmFormFieldType.Email]: 'Email',
  [AdmissionCrmFormFieldType.Phone]: 'Phone',
  [AdmissionCrmFormFieldType.Select]: 'Select',
  [AdmissionCrmFormFieldType.MultiSelect]: 'Multi-select',
  [AdmissionCrmFormFieldType.Checkbox]: 'Checkbox',
};

const formFieldTypeOptions = Object.values(AdmissionCrmFormFieldType).filter(
  (value): value is AdmissionCrmFormFieldType => typeof value === 'number'
);

const templateSystemFieldOptions = [
  { value: 'FirstName', label: 'Student first name' },
  { value: 'MiddleName', label: 'Student middle name' },
  { value: 'LastName', label: 'Student last name' },
  { value: 'DateOfBirth', label: 'Student date of birth' },
  { value: 'ParentGuardianName', label: 'Parent or guardian name' },
  { value: 'PrimaryContactNo', label: 'Primary contact number' },
  { value: 'Email', label: 'Email' },
  { value: 'AdmissionIntent', label: 'Admission intent' },
  { value: 'TargetStandardId', label: 'Target class' },
  { value: 'DesiredClassName', label: 'Desired class text' },
  { value: 'CampaignName', label: 'Campaign name' },
  { value: 'CampusBranchName', label: 'Campus branch' },
  { value: 'PreferredCommunicationLanguage', label: 'Preferred language' },
];

const fieldNeedsOptions = (fieldType: AdmissionCrmFormFieldType) =>
  fieldType === AdmissionCrmFormFieldType.Select ||
  fieldType === AdmissionCrmFormFieldType.MultiSelect;

export function AdmissionsCrmConfigurationSection9() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const {
    admissionsCrmConfigurationDialog,
    editingTemplateId,
    handleAddTemplateField,
    handleCloseTemplateDialog,
    handleRemoveTemplateField,
    handleSaveTemplate,
    handleTemplateChange,
    handleTemplateFieldChange,
    handleTemplateFieldOptionsChange,
    handleTemplateFieldTypeChange,
    isCreatingTemplate,
    isUpdatingTemplate,
    setTemplateForm,
    templateForm,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Dialog
        open={admissionsCrmConfigurationDialog.value}
        onClose={handleCloseTemplateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingTemplateId ? 'Edit Form Template' : 'Create Form Template'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              required
              label="Template name"
              value={templateForm.templateName}
              onChange={(event) => handleTemplateChange('templateName', event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={templateForm.description}
              onChange={(event) => handleTemplateChange('description', event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel id="crm-template-channel-label">Channel</InputLabel>
              <Select
                labelId="crm-template-channel-label"
                label="Channel"
                value={templateForm.channel}
                onChange={(event) =>
                  handleTemplateChange(
                    'channel',
                    Number(event.target.value) as AdmissionInquiryChannel
                  )
                }
              >
                {inquiryChannelOptions.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {getAdmissionCrmChannelLabel(channel)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={templateForm.isPublic}
                  onChange={(event) => handleTemplateChange('isPublic', event.target.checked)}
                />
              }
              label="Public website form"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={templateForm.isActive}
                  onChange={(event) => handleTemplateChange('isActive', event.target.checked)}
                />
              }
              label="Active"
            />
            {templateForm.isPublic && (
              <>
                <TextField
                  required
                  label="Consent text"
                  value={templateForm.consentText}
                  onChange={(event) => handleTemplateChange('consentText', event.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <TextField
                  required
                  label="Privacy notice URL"
                  value={templateForm.privacyNoticeUrl}
                  onChange={(event) => handleTemplateChange('privacyNoticeUrl', event.target.value)}
                  fullWidth
                />
              </>
            )}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Parent-facing translations</Typography>
                {[
                  { code: 'gu' as const, label: 'Gujarati' },
                  { code: 'hi' as const, label: 'Hindi' },
                ].map((language) => (
                  <Box
                    key={language.code}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                      gap: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      label={`${language.label} template name`}
                      value={templateForm.localizations[language.code].templateName}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          localizations: {
                            ...current.localizations,
                            [language.code]: {
                              ...current.localizations[language.code],
                              templateName: event.target.value,
                            },
                          },
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label={`${language.label} description`}
                      value={templateForm.localizations[language.code].description}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          localizations: {
                            ...current.localizations,
                            [language.code]: {
                              ...current.localizations[language.code],
                              description: event.target.value,
                            },
                          },
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label={`${language.label} consent text`}
                      value={templateForm.localizations[language.code].consentText}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          localizations: {
                            ...current.localizations,
                            [language.code]: {
                              ...current.localizations[language.code],
                              consentText: event.target.value,
                            },
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
            <Divider />
            <Stack spacing={1}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={1}
                alignItems={{ sm: 'center' }}
              >
                <Box>
                  <Typography variant="subtitle2">Fields</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Map known fields to CRM lead data and keep custom fields on the submission.
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={handleAddTemplateField}>
                  Add Field
                </Button>
              </Stack>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {templateForm.fields.map((field, index) => (
                  <Box
                    key={`${field.key}-${index}`}
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
                        label="Label"
                        value={field.label}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { label: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Key"
                        value={field.key}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { key: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Gujarati label"
                        value={field.localizedLabels?.gu || ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            localizedLabels: {
                              ...(field.localizedLabels || {}),
                              gu: event.target.value,
                            },
                          })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Hindi label"
                        value={field.localizedLabels?.hi || ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            localizedLabels: {
                              ...(field.localizedLabels || {}),
                              hi: event.target.value,
                            },
                          })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`crm-template-field-type-${index}`}>Type</InputLabel>
                        <Select
                          labelId={`crm-template-field-type-${index}`}
                          label="Type"
                          value={field.fieldType}
                          onChange={(event) =>
                            handleTemplateFieldTypeChange(
                              index,
                              Number(event.target.value) as AdmissionCrmFormFieldType
                            )
                          }
                        >
                          {formFieldTypeOptions.map((fieldType) => (
                            <MenuItem key={fieldType} value={fieldType}>
                              {formFieldTypeLabel[fieldType]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`crm-template-system-field-${index}`}>
                          CRM mapping
                        </InputLabel>
                        <Select
                          labelId={`crm-template-system-field-${index}`}
                          label="CRM mapping"
                          value={field.systemField ?? ''}
                          onChange={(event) =>
                            handleTemplateFieldChange(index, {
                              systemField: String(event.target.value) || null,
                            })
                          }
                        >
                          <MenuItem value="">Custom submission field</MenuItem>
                          {templateSystemFieldOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Section"
                        value={field.sectionName ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { sectionName: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Placeholder"
                        value={field.placeholder ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { placeholder: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Helper text"
                        value={field.helperText ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { helperText: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Default value"
                        value={field.defaultValue ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { defaultValue: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Visible when field key"
                        value={field.visibleWhenFieldKey ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            visibleWhenFieldKey: event.target.value,
                          })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Visible when value"
                        value={field.visibleWhenValue ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            visibleWhenValue: event.target.value,
                          })
                        }
                      />
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      gap={1}
                      alignItems={{ md: 'center' }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        label="Order"
                        value={field.displayOrder}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            displayOrder: Number(event.target.value),
                          })
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.required}
                            onChange={(event) =>
                              handleTemplateFieldChange(index, { required: event.target.checked })
                            }
                          />
                        }
                        label="Required"
                      />
                      <Button
                        size="small"
                        color="error"
                        disabled={templateForm.fields.length <= 1}
                        onClick={() => handleRemoveTemplateField(index)}
                      >
                        Remove
                      </Button>
                    </Stack>
                    {fieldNeedsOptions(field.fieldType) && (
                      <TextField
                        size="small"
                        label="Options"
                        value={(field.options ?? []).join('\n')}
                        onChange={(event) =>
                          handleTemplateFieldOptionsChange(index, event.target.value)
                        }
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2">Preview</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {[...templateForm.fields]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <Chip
                      key={`${field.key}-${field.displayOrder}`}
                      size="small"
                      label={`${field.label || 'Untitled'}${
                        field.required ? ' *' : ''
                      } - ${formFieldTypeLabel[field.fieldType]}`}
                      variant="outlined"
                    />
                  ))}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingTemplate || isUpdatingTemplate}
            onClick={handleSaveTemplate}
          >
            {editingTemplateId ? 'Save' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
