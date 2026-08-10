'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Add, Visibility, DeleteOutline } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Switch,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import {
  AdmissionInquiryStage,
  AdmissionCrmFormFieldType,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { EnrollmentSettingsEditorDrawer } from './enrollment-settings-editor-drawer';

import { EnrollmentSettingsDecisionCards } from './enrollment-settings-decision-cards';

import { RegistrationTemplateLocalizationEditor } from './registration-template-localization-editor';

import {
  createRegistrationField,
  registrationSystemFields,
  createRegistrationSection,
  normalizeRegistrationFieldForType,
} from './admissions-registration-configuration-utils';

import type { RegistrationTemplateEditorStep } from './admissions-registration-configuration-utils';

import { useAdmissionsRegistrationWorkspace } from './admissions-registration-configuration-context';

const registrationEditorSteps = [
  { value: 0, label: 'Template Rules' },
  { value: 1, label: 'Sections & Fields' },
  { value: 2, label: 'Languages & Preview' },
] as const;

const fieldTypeLabel: Record<AdmissionCrmFormFieldType, string> = {
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

export function AdmissionsRegistrationSection2() {
  const { state: controllerState, actions, meta } = useAdmissionsRegistrationWorkspace();
  const {
    createTemplateState,
    editingTemplate,
    handleNextTemplateStep,
    handleTemplateStepChange,
    saveTemplate,
    setPreviewTemplate,
    setTemplateForm,
    setTemplateOpen,
    setTemplateStep,
    templateForm,
    templateOpen,
    templateReadOnly,
    templateStep,
    updateField,
    updateTemplateState,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <EnrollmentSettingsEditorDrawer
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title={
          editingTemplate
            ? `${editingTemplate.name} - Version ${editingTemplate.version}`
            : 'New Registration Template'
        }
        description="Build the issue rules, family-facing sections, translations, and preview in one guided workspace."
        steps={[...registrationEditorSteps]}
        activeStep={templateStep}
        onStepChange={handleTemplateStepChange}
        busy={createTemplateState.isLoading || updateTemplateState.isLoading}
        width={1040}
        actions={
          <>
            <Button
              disabled={createTemplateState.isLoading || updateTemplateState.isLoading}
              onClick={() => setTemplateOpen(false)}
            >
              Close
            </Button>
            <Button startIcon={<Visibility />} onClick={() => setPreviewTemplate(templateForm)}>
              Preview
            </Button>
            {templateStep > 0 ? (
              <Button
                onClick={() =>
                  setTemplateStep((current) =>
                    current > 0 ? ((current - 1) as RegistrationTemplateEditorStep) : current
                  )
                }
              >
                Back
              </Button>
            ) : null}
            {templateStep < 2 ? (
              <Button variant="contained" onClick={handleNextTemplateStep}>
                Continue
              </Button>
            ) : null}
            {!templateReadOnly && templateStep === 2 ? (
              <LoadingButton
                variant="contained"
                loading={createTemplateState.isLoading || updateTemplateState.isLoading}
                onClick={saveTemplate}
              >
                Save Template
              </LoadingButton>
            ) : null}
          </>
        }
      >
        <Stack spacing={2}>
          {templateStep === 0 ? (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  gap: 1.5,
                }}
              >
                <TextField
                  size="small"
                  label="Template name"
                  value={templateForm.name}
                  disabled={templateReadOnly}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
                <TextField
                  size="small"
                  type="number"
                  label="Link expiry days"
                  value={templateForm.linkExpiryDays}
                  disabled={templateReadOnly}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      linkExpiryDays: Number(event.target.value),
                    }))
                  }
                />
              </Box>
              <Box>
                <Typography component="h3" variant="subtitle2" sx={{ mb: 0.75 }}>
                  How Should Families Receive This Form?
                </Typography>
                <EnrollmentSettingsDecisionCards
                  label="Registration form issue method"
                  value={templateForm.autoIssueAtStage == null ? 'manual' : 'automatic'}
                  disabled={templateReadOnly}
                  onChange={(value) =>
                    setTemplateForm((current) => ({
                      ...current,
                      autoIssueAtStage:
                        value === 'manual'
                          ? null
                          : (current.autoIssueAtStage ?? AdmissionInquiryStage.Eligible),
                    }))
                  }
                  options={[
                    {
                      value: 'manual',
                      title: 'Staff Sends When Ready',
                      description:
                        'Eligible applicants appear in Ready to Invite and staff choose when to issue the secure link.',
                      icon: 'mdi:account-arrow-right-outline',
                      recommended: true,
                    },
                    {
                      value: 'automatic',
                      title: 'Issue at a Journey Stage',
                      description:
                        'The system issues this template automatically when an applicant reaches the selected stage.',
                      icon: 'mdi:robot-outline',
                    },
                  ]}
                />
              </Box>
              {templateForm.autoIssueAtStage != null ? (
                <TextField
                  select
                  size="small"
                  label="Automatic issue stage"
                  value={templateForm.autoIssueAtStage}
                  disabled={templateReadOnly}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      autoIssueAtStage: Number(event.target.value) as AdmissionInquiryStage,
                    }))
                  }
                  sx={{ maxWidth: 420 }}
                >
                  <MenuItem value={AdmissionInquiryStage.ExamReady}>When exam ready</MenuItem>
                  <MenuItem value={AdmissionInquiryStage.ExamCompleted}>
                    When exam completed
                  </MenuItem>
                  <MenuItem value={AdmissionInquiryStage.Eligible}>When eligible</MenuItem>
                </TextField>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={templateForm.isFallback}
                      disabled={templateReadOnly}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          isFallback: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="Fallback template"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={templateForm.allowPartialSave}
                      disabled={templateReadOnly}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          allowPartialSave: event.target.checked,
                        }))
                      }
                    />
                  }
                  label="Allow partial save"
                />
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1,
                }}
              >
                {(
                  [
                    ['campus', 'Campus'],
                    ['desiredClass', 'Class'],
                    ['board', 'Board'],
                    ['medium', 'Medium'],
                    ['applicantCategory', 'Category'],
                    ['admissionRound', 'Admission round'],
                    ['admissionRoute', 'Admission route'],
                  ] as const
                ).map(([key, label]) => (
                  <TextField
                    key={key}
                    size="small"
                    label={label}
                    value={templateForm.applicability[key] || ''}
                    disabled={templateReadOnly || templateForm.isFallback}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        applicability: {
                          ...current.applicability,
                          [key]: event.target.value || null,
                        },
                      }))
                    }
                  />
                ))}
              </Box>
            </>
          ) : null}
          {templateStep === 1 ? (
            <>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Sections and fields</Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  disabled={templateReadOnly}
                  onClick={() =>
                    setTemplateForm((current) => ({
                      ...current,
                      sections: [...current.sections, createRegistrationSection()],
                    }))
                  }
                >
                  Add Section
                </Button>
              </Stack>
              {templateForm.sections.map((section, sectionIndex) => (
                <Box
                  key={`${section.key}-${sectionIndex}`}
                  sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}
                >
                  <Stack spacing={1.25}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 2fr auto' },
                        gap: 1,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Section key"
                        value={section.key}
                        disabled={templateReadOnly}
                        onChange={(event) =>
                          setTemplateForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, index) =>
                              index === sectionIndex ? { ...item, key: event.target.value } : item
                            ),
                          }))
                        }
                      />
                      <TextField
                        size="small"
                        label="Section title"
                        value={section.title}
                        disabled={templateReadOnly}
                        onChange={(event) =>
                          setTemplateForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, index) =>
                              index === sectionIndex ? { ...item, title: event.target.value } : item
                            ),
                          }))
                        }
                      />
                      <IconButton
                        aria-label="Remove registration section"
                        disabled={templateReadOnly || templateForm.sections.length === 1}
                        onClick={() =>
                          setTemplateForm((current) => ({
                            ...current,
                            sections: current.sections.filter(
                              (_item, index) => index !== sectionIndex
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                    {section.fields.map((field, fieldIndex) => (
                      <Box
                        key={`${field.key}-${fieldIndex}`}
                        sx={{
                          pl: { xs: 0, md: 2 },
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr 1fr 1fr auto' },
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          size="small"
                          label="Field key"
                          value={field.key}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(sectionIndex, fieldIndex, { key: event.target.value })
                          }
                        />
                        <TextField
                          size="small"
                          label="Label"
                          value={field.label}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(sectionIndex, fieldIndex, { label: event.target.value })
                          }
                        />
                        <TextField
                          select
                          size="small"
                          label="Type"
                          value={field.fieldType}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(
                              sectionIndex,
                              fieldIndex,
                              normalizeRegistrationFieldForType(
                                field,
                                Number(event.target.value) as AdmissionCrmFormFieldType
                              )
                            )
                          }
                        >
                          {Object.entries(fieldTypeLabel).map(([value, label]) => (
                            <MenuItem key={value} value={Number(value)}>
                              {label}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          size="small"
                          label="System mapping"
                          value={field.systemField || ''}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(
                              sectionIndex,
                              fieldIndex,
                              normalizeRegistrationFieldForType(
                                { ...field, systemField: event.target.value || null },
                                field.fieldType
                              )
                            )
                          }
                        >
                          <MenuItem value="">Custom field</MenuItem>
                          {registrationSystemFields.map((item) => (
                            <MenuItem key={item} value={item}>
                              {item}
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton
                          aria-label="Remove registration field"
                          disabled={templateReadOnly || section.fields.length === 1}
                          onClick={() =>
                            setTemplateForm((current) => ({
                              ...current,
                              sections: current.sections.map((item, index) =>
                                index === sectionIndex
                                  ? {
                                      ...item,
                                      fields: item.fields.filter(
                                        (_field, itemIndex) => itemIndex !== fieldIndex
                                      ),
                                    }
                                  : item
                              ),
                            }))
                          }
                        >
                          <DeleteOutline />
                        </IconButton>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={field.required}
                              disabled={templateReadOnly}
                              onChange={(event) =>
                                updateField(sectionIndex, fieldIndex, {
                                  required: event.target.checked,
                                })
                              }
                            />
                          }
                          label="Required"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={field.parentEditable}
                              disabled={templateReadOnly}
                              onChange={(event) =>
                                updateField(sectionIndex, fieldIndex, {
                                  parentEditable: event.target.checked,
                                })
                              }
                            />
                          }
                          label="Parent editable"
                        />
                        <TextField
                          size="small"
                          label="Visible when field"
                          value={field.visibleWhenFieldKey || ''}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(sectionIndex, fieldIndex, {
                              visibleWhenFieldKey: event.target.value || null,
                            })
                          }
                        />
                        <TextField
                          size="small"
                          label="Equals"
                          value={field.visibleWhenValue || ''}
                          disabled={templateReadOnly}
                          onChange={(event) =>
                            updateField(sectionIndex, fieldIndex, {
                              visibleWhenValue: event.target.value || null,
                            })
                          }
                        />
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<Add />}
                      disabled={templateReadOnly}
                      onClick={() =>
                        setTemplateForm((current) => ({
                          ...current,
                          sections: current.sections.map((item, index) =>
                            index === sectionIndex
                              ? { ...item, fields: [...item.fields, createRegistrationField()] }
                              : item
                          ),
                        }))
                      }
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Field
                    </Button>
                  </Stack>
                </Box>
              ))}
            </>
          ) : null}
          {templateStep === 2 ? (
            <>
              <Alert severity="info">
                Add parent-facing Gujarati and Hindi content, then use Preview to check the desktop,
                mobile, online, and print experiences before saving.
              </Alert>
              <RegistrationTemplateLocalizationEditor
                value={templateForm}
                readOnly={templateReadOnly}
                onChange={setTemplateForm}
              />
            </>
          ) : null}
        </Stack>
      </EnrollmentSettingsEditorDrawer>
    </>
  );
}
