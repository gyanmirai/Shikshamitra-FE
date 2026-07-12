'use client';

import type {
  AdmissionCrmDocumentRequirementDto,
  AdmissionCrmDocumentChecklistTemplateDto,
  AdmissionCrmDocumentChecklistTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { Add, Edit, Archive, Publish, ContentCopy, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Chip,
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
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmDocumentRequirementLevel,
  AdmissionCrmDocumentChecklistTemplateStatus,
  useGetAdmissionCrmDocumentChecklistTemplatesQuery,
  useCreateAdmissionCrmDocumentChecklistTemplateMutation,
  useUpdateAdmissionCrmDocumentChecklistTemplateMutation,
  useRetireAdmissionCrmDocumentChecklistTemplateMutation,
  usePublishAdmissionCrmDocumentChecklistTemplateMutation,
  useCreateAdmissionCrmDocumentChecklistTemplateVersionMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  createDocumentRequirement,
  createDocumentChecklistTemplate,
  validateDocumentChecklistTemplate,
  normalizeDocumentChecklistTemplate,
} from './admissions-document-configuration-utils';

type Props = { academicYearId?: string };

const levelLabel: Record<AdmissionCrmDocumentRequirementLevel, string> = {
  [AdmissionCrmDocumentRequirementLevel.Required]: 'Required',
  [AdmissionCrmDocumentRequirementLevel.Optional]: 'Optional',
  [AdmissionCrmDocumentRequirementLevel.Conditional]: 'Conditional',
  [AdmissionCrmDocumentRequirementLevel.RequiredLater]: 'Required later',
};

const statusLabel: Record<AdmissionCrmDocumentChecklistTemplateStatus, string> = {
  [AdmissionCrmDocumentChecklistTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmDocumentChecklistTemplateStatus.Published]: 'Published',
  [AdmissionCrmDocumentChecklistTemplateStatus.Retired]: 'Retired',
};

const toForm = (
  template: AdmissionCrmDocumentChecklistTemplateDto
): AdmissionCrmDocumentChecklistTemplateUpsertDto => {
  const {
    id: _id,
    academicYearId: _year,
    version: _version,
    status: _status,
    publishedAt: _published,
    retiredAt: _retired,
    ...form
  } = template;
  return form;
};

export default function AdmissionsDocumentConfiguration({ academicYearId }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionCrmDocumentChecklistTemplateDto | null>(null);
  const [form, setForm] = useState<AdmissionCrmDocumentChecklistTemplateUpsertDto>(() =>
    createDocumentChecklistTemplate()
  );
  const query = useGetAdmissionCrmDocumentChecklistTemplatesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId }
  );
  const [createTemplate, createState] = useCreateAdmissionCrmDocumentChecklistTemplateMutation();
  const [updateTemplate, updateState] = useUpdateAdmissionCrmDocumentChecklistTemplateMutation();
  const [publishTemplate, publishState] = usePublishAdmissionCrmDocumentChecklistTemplateMutation();
  const [newVersion, versionState] =
    useCreateAdmissionCrmDocumentChecklistTemplateVersionMutation();
  const [retireTemplate, retireState] = useRetireAdmissionCrmDocumentChecklistTemplateMutation();
  const readOnly =
    editing?.status !== undefined &&
    editing.status !== AdmissionCrmDocumentChecklistTemplateStatus.Draft;

  const updateRequirement = (index: number, patch: Partial<AdmissionCrmDocumentRequirementDto>) =>
    setForm((current) => ({
      ...current,
      requirements: current.requirements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));

  const save = async () => {
    if (!academicYearId) return;
    const errors = validateDocumentChecklistTemplate(form);
    if (errors.length) {
      shikshaMitraToast.error({ message: errors[0] });
      return;
    }
    const body = normalizeDocumentChecklistTemplate(form);
    try {
      if (editing) await updateTemplate({ templateId: editing.id, body }).unwrap();
      else await createTemplate({ academicYearId, body }).unwrap();
      setOpen(false);
    } catch (error) {
      shikshaMitraToast.error({ message: 'Unable to save document checklist.' });
    }
  };

  const lifecycle = async (
    action: 'publish' | 'version' | 'retire',
    template: AdmissionCrmDocumentChecklistTemplateDto
  ) => {
    try {
      if (action === 'publish') await publishTemplate({ templateId: template.id }).unwrap();
      if (action === 'retire') await retireTemplate({ templateId: template.id }).unwrap();
      if (action === 'version') {
        const draft = await newVersion({ templateId: template.id }).unwrap();
        setEditing(draft);
        setForm(toForm(draft));
        setOpen(true);
      }
    } catch (error) {
      shikshaMitraToast.error({ message: 'Unable to change checklist lifecycle.' });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle1">Document Checklists</Typography>
            <Typography variant="caption" color="text.secondary">
              Versioned requirements, formats, originals, and readiness controls
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            disabled={!academicYearId}
            onClick={() => {
              setEditing(null);
              setForm(createDocumentChecklistTemplate());
              setOpen(true);
            }}
          >
            New Checklist
          </Button>
        </Stack>
        {query.isFetching ? <LinearProgress /> : <Divider />}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {(query.data?.items || []).map((template) => (
            <Paper key={template.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography variant="subtitle2">{template.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Version {template.version} - {template.requirements.length} requirements
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={statusLabel[template.status]}
                    color={
                      template.status === AdmissionCrmDocumentChecklistTemplateStatus.Published
                        ? 'success'
                        : template.status === AdmissionCrmDocumentChecklistTemplateStatus.Draft
                          ? 'warning'
                          : 'default'
                    }
                  />
                </Stack>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${template.requirements.filter((item) => item.blocksAdmissionReadiness).length} blocking`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${template.requirements.filter((item) => item.requiresOriginal).length} originals`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${template.readinessApprovalCount} readiness ${template.readinessApprovalCount === 1 ? 'approval' : 'approvals'}`}
                  />
                </Stack>
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton
                    size="small"
                    aria-label="Open document checklist"
                    onClick={() => {
                      setEditing(template);
                      setForm(toForm(template));
                      setOpen(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  {template.status === AdmissionCrmDocumentChecklistTemplateStatus.Draft ? (
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="Publish document checklist"
                      disabled={publishState.isLoading}
                      onClick={() => lifecycle('publish', template)}
                    >
                      <Publish fontSize="small" />
                    </IconButton>
                  ) : null}
                  {template.status !== AdmissionCrmDocumentChecklistTemplateStatus.Draft ? (
                    <IconButton
                      size="small"
                      aria-label="Create document checklist version"
                      disabled={versionState.isLoading}
                      onClick={() => lifecycle('version', template)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  ) : null}
                  {template.status === AdmissionCrmDocumentChecklistTemplateStatus.Published ? (
                    <IconButton
                      size="small"
                      aria-label="Retire document checklist"
                      disabled={retireState.isLoading}
                      onClick={() => lifecycle('retire', template)}
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          {editing ? `${editing.name} - Version ${editing.version}` : 'New Document Checklist'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              size="small"
              label="Checklist name"
              value={form.name}
              disabled={readOnly}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <TextField
              select
              size="small"
              label="Admission readiness approvals"
              value={form.readinessApprovalCount}
              disabled={readOnly}
              helperText="Two approvals must be completed by different authorized staff members."
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  readinessApprovalCount: Number(event.target.value),
                }))
              }
            >
              <MenuItem value={1}>One approver</MenuItem>
              <MenuItem value={2}>Two distinct approvers</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isFallback}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isFallback: event.target.checked }))
                  }
                />
              }
              label="Fallback checklist"
            />
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
                  ['admissionRoute', 'Admission route'],
                ] as const
              ).map(([key, label]) => (
                <TextField
                  key={key}
                  size="small"
                  label={label}
                  value={form.applicability[key] || ''}
                  disabled={readOnly || form.isFallback}
                  onChange={(event) =>
                    setForm((current) => ({
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
              <Typography variant="subtitle2">Requirements</Typography>
              <Button
                size="small"
                startIcon={<Add />}
                disabled={readOnly}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    requirements: [...current.requirements, createDocumentRequirement()],
                  }))
                }
              >
                Add Requirement
              </Button>
            </Stack>
            {form.requirements.map((requirement, index) => (
              <Box
                key={`${requirement.key}-${index}`}
                sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr 1fr auto' },
                      gap: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      label="Requirement key"
                      value={requirement.key}
                      disabled={readOnly}
                      onChange={(event) => updateRequirement(index, { key: event.target.value })}
                    />
                    <TextField
                      size="small"
                      label="Document name"
                      value={requirement.name}
                      disabled={readOnly}
                      onChange={(event) => updateRequirement(index, { name: event.target.value })}
                    />
                    <TextField
                      select
                      size="small"
                      label="Requirement"
                      value={requirement.requirementLevel}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateRequirement(index, {
                          requirementLevel: Number(
                            event.target.value
                          ) as AdmissionCrmDocumentRequirementLevel,
                        })
                      }
                    >
                      {Object.entries(levelLabel).map(([value, label]) => (
                        <MenuItem key={value} value={Number(value)}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton
                      aria-label="Remove document requirement"
                      disabled={readOnly || form.requirements.length === 1}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          requirements: current.requirements.filter(
                            (_item, itemIndex) => itemIndex !== index
                          ),
                        }))
                      }
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                      gap: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      label="Accepted extensions"
                      value={requirement.acceptedExtensions.join(', ')}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateRequirement(index, {
                          acceptedExtensions: event.target.value.split(','),
                        })
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Maximum MB"
                      value={requirement.maximumSizeMb}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateRequirement(index, { maximumSizeMb: Number(event.target.value) })
                      }
                    />
                    <TextField
                      size="small"
                      label="Conditional field"
                      value={requirement.conditionalFieldKey || ''}
                      disabled={
                        readOnly ||
                        requirement.requirementLevel !==
                          AdmissionCrmDocumentRequirementLevel.Conditional
                      }
                      onChange={(event) =>
                        updateRequirement(index, {
                          conditionalFieldKey: event.target.value || null,
                        })
                      }
                    />
                    <TextField
                      size="small"
                      label="Equals"
                      value={requirement.conditionalFieldValue || ''}
                      disabled={
                        readOnly ||
                        requirement.requirementLevel !==
                          AdmissionCrmDocumentRequirementLevel.Conditional
                      }
                      onChange={(event) =>
                        updateRequirement(index, {
                          conditionalFieldValue: event.target.value || null,
                        })
                      }
                    />
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={requirement.blocksAdmissionReadiness}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateRequirement(index, {
                              blocksAdmissionReadiness: event.target.checked,
                            })
                          }
                        />
                      }
                      label="Blocks readiness"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={requirement.requiresOriginal}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateRequirement(index, { requiresOriginal: event.target.checked })
                          }
                        />
                      }
                      label="Original required"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={requirement.validityDateRequired}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateRequirement(index, { validityDateRequired: event.target.checked })
                          }
                        />
                      }
                      label="Validity date required"
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          {!readOnly ? (
            <LoadingButton
              variant="contained"
              loading={createState.isLoading || updateState.isLoading}
              onClick={save}
            >
              Save Checklist
            </LoadingButton>
          ) : null}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
