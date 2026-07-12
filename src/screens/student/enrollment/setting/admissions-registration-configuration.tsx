'use client';

import type {
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmFormNumberSeriesDto,
  AdmissionCrmFormNumberSeriesUpsertDto,
  AdmissionCrmRegistrationTemplateDto,
  AdmissionCrmRegistrationTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Add,
  Edit,
  Archive,
  Publish,
  DeleteOutline,
  ContentCopy,
  FormatListNumbered,
} from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import {
  AdmissionInquiryStage,
  AdmissionCrmFormFieldType,
  AdmissionCrmRegistrationTemplateStatus,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useCreateAdmissionCrmRegistrationTemplateMutation,
  useUpdateAdmissionCrmRegistrationTemplateMutation,
  usePublishAdmissionCrmRegistrationTemplateMutation,
  useRetireAdmissionCrmRegistrationTemplateMutation,
  useCreateAdmissionCrmRegistrationTemplateVersionMutation,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useCreateAdmissionCrmFormNumberSeriesMutation,
  useUpdateAdmissionCrmFormNumberSeriesMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Paper,
  Switch,
  Dialog,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';

import {
  createRegistrationField,
  createRegistrationSection,
  createRegistrationTemplate,
  normalizeRegistrationTemplate,
  validateRegistrationTemplate,
} from './admissions-registration-configuration-utils';

type Props = { academicYearId?: string };

const statusLabel: Record<AdmissionCrmRegistrationTemplateStatus, string> = {
  [AdmissionCrmRegistrationTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmRegistrationTemplateStatus.Published]: 'Published',
  [AdmissionCrmRegistrationTemplateStatus.Retired]: 'Retired',
};

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

const systemFields = [
  'firstName',
  'middleName',
  'lastName',
  'dateOfBirth',
  'parentGuardianName',
  'primaryContactNo',
  'email',
  'desiredClassName',
  'campus',
  'board',
  'medium',
  'admissionRound',
  'applicantCategory',
  'admissionRoute',
];

const blankSeries = (): AdmissionCrmFormNumberSeriesUpsertDto => ({
  name: '',
  prefix: 'REG-',
  suffix: '',
  padding: 5,
  nextNumber: 1,
  applicability: {},
  isActive: true,
});

const toTemplateForm = (
  template: AdmissionCrmRegistrationTemplateDto
): AdmissionCrmRegistrationTemplateUpsertDto => {
  const {
    id: _id,
    academicYearId: _academicYearId,
    version: _version,
    status: _status,
    publishedAt: _publishedAt,
    retiredAt: _retiredAt,
    ...form
  } = template;
  return form;
};

const toSeriesForm = (
  series: AdmissionCrmFormNumberSeriesDto
): AdmissionCrmFormNumberSeriesUpsertDto => {
  const { id: _id, academicYearId: _academicYearId, nextPreview: _nextPreview, ...form } = series;
  return form;
};

const messageFromError = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { detail?: string; errorCode?: string } }).data;
    return data?.detail || data?.errorCode || 'The configuration action failed.';
  }
  return 'The configuration action failed.';
};

export default function AdmissionsRegistrationConfiguration({ academicYearId }: Props) {
  const [tab, setTab] = useState(0);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<AdmissionCrmRegistrationTemplateDto | null>(null);
  const [templateForm, setTemplateForm] = useState<AdmissionCrmRegistrationTemplateUpsertDto>(() =>
    createRegistrationTemplate()
  );
  const [seriesOpen, setSeriesOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<AdmissionCrmFormNumberSeriesDto | null>(null);
  const [seriesForm, setSeriesForm] = useState<AdmissionCrmFormNumberSeriesUpsertDto>(() =>
    blankSeries()
  );

  const templatesQuery = useGetAdmissionCrmRegistrationTemplatesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId }
  );
  const seriesQuery = useGetAdmissionCrmFormNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const [createTemplate, createTemplateState] = useCreateAdmissionCrmRegistrationTemplateMutation();
  const [updateTemplate, updateTemplateState] = useUpdateAdmissionCrmRegistrationTemplateMutation();
  const [publishTemplate, publishState] = usePublishAdmissionCrmRegistrationTemplateMutation();
  const [retireTemplate, retireState] = useRetireAdmissionCrmRegistrationTemplateMutation();
  const [createTemplateVersion, versionState] =
    useCreateAdmissionCrmRegistrationTemplateVersionMutation();
  const [createSeries, createSeriesState] = useCreateAdmissionCrmFormNumberSeriesMutation();
  const [updateSeries, updateSeriesState] = useUpdateAdmissionCrmFormNumberSeriesMutation();

  const openNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(createRegistrationTemplate());
    setTemplateOpen(true);
  };

  const openTemplate = (template: AdmissionCrmRegistrationTemplateDto) => {
    setEditingTemplate(template);
    setTemplateForm(toTemplateForm(template));
    setTemplateOpen(true);
  };

  const saveTemplate = async () => {
    if (!academicYearId) return;
    const errors = validateRegistrationTemplate(templateForm);
    if (errors.length) {
      shikshaMitraToast.error({ message: errors[0] });
      return;
    }
    const body = normalizeRegistrationTemplate(templateForm);
    try {
      if (editingTemplate) await updateTemplate({ templateId: editingTemplate.id, body }).unwrap();
      else await createTemplate({ academicYearId, body }).unwrap();
      setTemplateOpen(false);
      shikshaMitraToast.success({
        message: editingTemplate
          ? 'Registration template updated.'
          : 'Registration template created.',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: messageFromError(error) });
    }
  };

  const runTemplateLifecycle = async (
    action: 'publish' | 'retire' | 'version',
    template: AdmissionCrmRegistrationTemplateDto
  ) => {
    try {
      if (action === 'publish') await publishTemplate({ templateId: template.id }).unwrap();
      if (action === 'retire') await retireTemplate({ templateId: template.id }).unwrap();
      if (action === 'version') {
        const draft = await createTemplateVersion({ templateId: template.id }).unwrap();
        openTemplate(draft);
      }
    } catch (error) {
      shikshaMitraToast.error({ message: messageFromError(error) });
    }
  };

  const updateField = (
    sectionIndex: number,
    fieldIndex: number,
    patch: Partial<AdmissionCrmRegistrationFieldDto>
  ) => {
    setTemplateForm((current) => ({
      ...current,
      sections: current.sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field, itemIndex) =>
                itemIndex === fieldIndex ? { ...field, ...patch } : field
              ),
            }
          : section
      ),
    }));
  };

  const openNewSeries = () => {
    setEditingSeries(null);
    setSeriesForm(blankSeries());
    setSeriesOpen(true);
  };

  const openSeries = (series: AdmissionCrmFormNumberSeriesDto) => {
    setEditingSeries(series);
    setSeriesForm(toSeriesForm(series));
    setSeriesOpen(true);
  };

  const saveSeries = async () => {
    if (!academicYearId || !seriesForm.name.trim()) return;
    try {
      if (editingSeries)
        await updateSeries({ seriesId: editingSeries.id, body: seriesForm }).unwrap();
      else await createSeries({ academicYearId, body: seriesForm }).unwrap();
      setSeriesOpen(false);
    } catch (error) {
      shikshaMitraToast.error({ message: messageFromError(error) });
    }
  };

  const templateReadOnly =
    editingTemplate?.status !== undefined &&
    editingTemplate.status !== AdmissionCrmRegistrationTemplateStatus.Draft;
  const lifecycleBusy = publishState.isLoading || retireState.isLoading || versionState.isLoading;

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle1">Registration Orchestration</Typography>
          <Typography variant="caption" color="text.secondary">
            Versioned forms and controlled form numbering
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_event, value: number) => setTab(value)}>
          <Tab label="Form Templates" />
          <Tab label="Number Series" />
        </Tabs>

        {tab === 0 ? (
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                disabled={!academicYearId}
                onClick={openNewTemplate}
              >
                New Template
              </Button>
            </Stack>
            {templatesQuery.isFetching ? <LinearProgress /> : null}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(templatesQuery.data?.items || []).map((template) => (
                <Paper key={template.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Version {template.version} - {template.sections.length} sections
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={statusLabel[template.status]}
                        color={
                          template.status === AdmissionCrmRegistrationTemplateStatus.Published
                            ? 'success'
                            : template.status === AdmissionCrmRegistrationTemplateStatus.Draft
                              ? 'warning'
                              : 'default'
                        }
                      />
                    </Stack>
                    <Stack direction="row" gap={0.5} flexWrap="wrap">
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${template.linkExpiryDays} day expiry`}
                      />
                      {template.allowPartialSave ? (
                        <Chip size="small" variant="outlined" label="Partial save" />
                      ) : null}
                      {template.feeRequired ? (
                        <Chip size="small" variant="outlined" label={`Fee ${template.feeAmount}`} />
                      ) : null}
                      {template.autoIssueAtStage !== null &&
                      template.autoIssueAtStage !== undefined ? (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`Auto issue: ${AdmissionInquiryStage[template.autoIssueAtStage]}`}
                        />
                      ) : null}
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end">
                      <IconButton
                        size="small"
                        aria-label="Open registration template"
                        onClick={() => openTemplate(template)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      {template.status === AdmissionCrmRegistrationTemplateStatus.Draft ? (
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="Publish registration template"
                          disabled={lifecycleBusy}
                          onClick={() => runTemplateLifecycle('publish', template)}
                        >
                          <Publish fontSize="small" />
                        </IconButton>
                      ) : null}
                      {template.status !== AdmissionCrmRegistrationTemplateStatus.Draft ? (
                        <IconButton
                          size="small"
                          aria-label="Create registration template version"
                          disabled={lifecycleBusy}
                          onClick={() => runTemplateLifecycle('version', template)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      ) : null}
                      {template.status === AdmissionCrmRegistrationTemplateStatus.Published ? (
                        <IconButton
                          size="small"
                          aria-label="Retire registration template"
                          disabled={lifecycleBusy}
                          onClick={() => runTemplateLifecycle('retire', template)}
                        >
                          <Archive fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        ) : null}

        {tab === 1 ? (
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                startIcon={<FormatListNumbered />}
                disabled={!academicYearId}
                onClick={openNewSeries}
              >
                New Series
              </Button>
            </Stack>
            {seriesQuery.isFetching ? <LinearProgress /> : null}
            {(seriesQuery.data?.items || []).map((series) => (
              <Stack
                key={series.id}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={1}
                sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="subtitle2">{series.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Next: {series.nextPreview}
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Chip
                    size="small"
                    label={series.isActive ? 'Active' : 'Inactive'}
                    color={series.isActive ? 'success' : 'default'}
                  />
                  <IconButton
                    size="small"
                    aria-label="Edit form number series"
                    onClick={() => openSeries(series)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>

      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          {editingTemplate
            ? `${editingTemplate.name} - Version ${editingTemplate.version}`
            : 'New Registration Template'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1.5fr' },
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
              <TextField
                size="small"
                type="number"
                label="Registration fee"
                value={templateForm.feeAmount}
                disabled={templateReadOnly || !templateForm.feeRequired}
                onChange={(event) =>
                  setTemplateForm((current) => ({
                    ...current,
                    feeAmount: Number(event.target.value),
                  }))
                }
              />
              <TextField
                select
                size="small"
                label="Automatic issue milestone"
                value={templateForm.autoIssueAtStage ?? ''}
                disabled={templateReadOnly}
                onChange={(event) =>
                  setTemplateForm((current) => ({
                    ...current,
                    autoIssueAtStage:
                      event.target.value === ''
                        ? null
                        : (Number(event.target.value) as AdmissionInquiryStage),
                  }))
                }
              >
                <MenuItem value="">Manual issue only</MenuItem>
                <MenuItem value={AdmissionInquiryStage.ExamReady}>Exam ready</MenuItem>
                <MenuItem value={AdmissionInquiryStage.ExamCompleted}>Exam completed</MenuItem>
                <MenuItem value={AdmissionInquiryStage.Eligible}>Eligible</MenuItem>
              </TextField>
            </Box>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.feeRequired}
                    disabled={templateReadOnly}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        feeRequired: event.target.checked,
                      }))
                    }
                  />
                }
                label="Fee required"
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
                          updateField(sectionIndex, fieldIndex, {
                            fieldType: Number(event.target.value) as AdmissionCrmFormFieldType,
                          })
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
                          updateField(sectionIndex, fieldIndex, {
                            systemField: event.target.value || null,
                          })
                        }
                      >
                        <MenuItem value="">Custom field</MenuItem>
                        {systemFields.map((item) => (
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)}>Close</Button>
          {!templateReadOnly ? (
            <LoadingButton
              variant="contained"
              loading={createTemplateState.isLoading || updateTemplateState.isLoading}
              onClick={saveTemplate}
            >
              Save Template
            </LoadingButton>
          ) : null}
        </DialogActions>
      </Dialog>

      <Dialog open={seriesOpen} onClose={() => setSeriesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingSeries ? 'Edit Form Number Series' : 'New Form Number Series'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Series name"
              value={seriesForm.name}
              onChange={(event) =>
                setSeriesForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                size="small"
                label="Prefix"
                value={seriesForm.prefix}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    prefix: event.target.value.toUpperCase(),
                  }))
                }
              />
              <TextField
                size="small"
                label="Suffix"
                value={seriesForm.suffix}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    suffix: event.target.value.toUpperCase(),
                  }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="Padding"
                value={seriesForm.padding}
                onChange={(event) =>
                  setSeriesForm((current) => ({ ...current, padding: Number(event.target.value) }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="Next number"
                value={seriesForm.nextNumber}
                onChange={(event) =>
                  setSeriesForm((current) => ({
                    ...current,
                    nextNumber: Number(event.target.value),
                  }))
                }
              />
            </Box>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}
            >
              {(
                [
                  ['campus', 'Campus'],
                  ['desiredClass', 'Class'],
                  ['admissionRound', 'Admission round'],
                  ['admissionRoute', 'Admission route'],
                ] as const
              ).map(([key, label]) => (
                <TextField
                  key={key}
                  size="small"
                  label={label}
                  value={seriesForm.applicability[key] || ''}
                  onChange={(event) =>
                    setSeriesForm((current) => ({
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
            <FormControlLabel
              control={
                <Switch
                  checked={seriesForm.isActive}
                  onChange={(event) =>
                    setSeriesForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSeriesOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={createSeriesState.isLoading || updateSeriesState.isLoading}
            disabled={!seriesForm.name.trim()}
            onClick={saveSeries}
          >
            Save Series
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
