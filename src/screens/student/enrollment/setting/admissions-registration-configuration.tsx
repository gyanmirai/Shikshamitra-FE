'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmFormNumberSeriesDto,
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationTemplateDto,
  AdmissionCrmFormNumberSeriesUpsertDto,
  AdmissionCrmRegistrationTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Add,
  Edit,
  Archive,
  Publish,
  Visibility,
  ContentCopy,
  DeleteOutline,
  FormatListNumbered,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Step,
  Alert,
  Stack,
  Switch,
  Dialog,
  Button,
  Divider,
  Stepper,
  MenuItem,
  MenuList,
  TextField,
  StepLabel,
  Typography,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmFormFieldType,
  AdmissionCrmRegistrationTemplateStatus,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useCreateAdmissionCrmFormNumberSeriesMutation,
  useUpdateAdmissionCrmFormNumberSeriesMutation,
  useCreateAdmissionCrmRegistrationTemplateMutation,
  useUpdateAdmissionCrmRegistrationTemplateMutation,
  useRetireAdmissionCrmRegistrationTemplateMutation,
  usePublishAdmissionCrmRegistrationTemplateMutation,
  useCreateAdmissionCrmRegistrationTemplateVersionMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { RegistrationTemplatePreview } from './registration-template-preview';
import { getAdmissionCrmStageLabel } from '../admissions-crm/admissions-crm-utils';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import {
  createRegistrationField,
  createRegistrationSection,
  createRegistrationTemplate,
  normalizeRegistrationTemplate,
  createBlankRegistrationTemplate,
  validateRegistrationTemplateStep,
  normalizeRegistrationFieldForType,
  findRegistrationTemplateValidationIssue,
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
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The configuration action failed.';
  }
  return 'The configuration action failed.';
};

export default function AdmissionsRegistrationConfiguration({ academicYearId }: Props) {
  const [tab, setTab] = useState(0);
  const [templateStep, setTemplateStep] = useState(0);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<AdmissionCrmRegistrationTemplateUpsertDto | null>(null);
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
    { skip: !academicYearId || tab !== 0 }
  );
  const seriesQuery = useGetAdmissionCrmFormNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || tab !== 1 }
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
    setTemplateStep(0);
    setTemplateOpen(true);
  };

  const openBlankTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm(createBlankRegistrationTemplate());
    setTemplateStep(0);
    setTemplateOpen(true);
  };

  const openTemplate = useCallback((template: AdmissionCrmRegistrationTemplateDto) => {
    setEditingTemplate(template);
    setTemplateForm(toTemplateForm(template));
    setTemplateStep(0);
    setTemplateOpen(true);
  }, []);

  const saveTemplate = async () => {
    if (!academicYearId) return;
    const issue = findRegistrationTemplateValidationIssue(templateForm);
    if (issue) {
      setTemplateStep(issue.step);
      shikshaMitraToast.error({ message: issue.message });
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

  const runTemplateLifecycle = useCallback(
    async (
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
    },
    [createTemplateVersion, openTemplate, publishTemplate, retireTemplate]
  );

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
  const templateBaseline = useMemo(
    () => (editingTemplate ? toTemplateForm(editingTemplate) : createRegistrationTemplate()),
    [editingTemplate]
  );
  const seriesBaseline = useMemo(
    () => (editingSeries ? toSeriesForm(editingSeries) : blankSeries()),
    [editingSeries]
  );
  const templateDirty =
    templateOpen &&
    !templateReadOnly &&
    JSON.stringify(templateForm) !== JSON.stringify(templateBaseline);
  const seriesDirty = seriesOpen && JSON.stringify(seriesForm) !== JSON.stringify(seriesBaseline);

  useEnrollmentSettingsDirtyState({
    source: 'admissions-registration-editor',
    dirty: templateDirty || seriesDirty,
    onDiscard: () => {
      setTemplateOpen(false);
      setEditingTemplate(null);
      setTemplateForm(createRegistrationTemplate());
      setTemplateStep(0);
      setSeriesOpen(false);
      setEditingSeries(null);
      setSeriesForm(blankSeries());
    },
  });

  const handleNextTemplateStep = () => {
    const [message] = validateRegistrationTemplateStep(templateForm, 0);
    if (message) {
      shikshaMitraToast.error({ message });
      return;
    }
    setTemplateStep(1);
  };

  const templateColumns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Template',
        minWidth: 220,
        render: (value, row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version {(row as AdmissionCrmRegistrationTemplateDto).version}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'sections',
        label: 'Sections',
        width: 100,
        align: 'right',
        isFilter: false,
        render: (value) => value.length,
      },
      {
        id: 'linkExpiryDays',
        label: 'Link Expiry',
        width: 120,
        align: 'right',
        filterType: 'number',
        render: (value) => `${value} days`,
      },
      {
        id: 'allowPartialSave',
        label: 'Partial Save',
        width: 120,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Allowed' },
          { value: false, label: 'Not allowed' },
        ],
        render: (value) => (value ? 'Allowed' : 'Not allowed'),
      },
      {
        id: 'feeRequired',
        label: 'Registration Fee',
        width: 140,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Required' },
          { value: false, label: 'Not required' },
        ],
        render: (value, row) =>
          value ? `${(row as AdmissionCrmRegistrationTemplateDto).feeAmount}` : 'Not required',
      },
      {
        id: 'autoIssueAtStage',
        label: 'Issue Method',
        minWidth: 145,
        filterType: 'enum',
        enumOptions: [
          { value: null, label: 'Manual' },
          { value: AdmissionInquiryStage.ExamReady, label: 'Exam ready' },
          { value: AdmissionInquiryStage.ExamCompleted, label: 'Exam completed' },
          { value: AdmissionInquiryStage.Eligible, label: 'Eligible' },
        ],
        render: (value) =>
          value === null || value === undefined
            ? 'Staff issues manually'
            : `Automatic at ${getAdmissionCrmStageLabel(value as AdmissionInquiryStage)}`,
      },
      {
        id: 'status',
        label: 'Status',
        width: 115,
        filterType: 'enum',
        enumOptions: Object.entries(statusLabel).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Chip
            size="small"
            label={statusLabel[value as AdmissionCrmRegistrationTemplateStatus]}
            color={
              value === AdmissionCrmRegistrationTemplateStatus.Published
                ? 'success'
                : value === AdmissionCrmRegistrationTemplateStatus.Draft
                  ? 'warning'
                  : 'default'
            }
          />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        width: 88,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => {
          const template = row as AdmissionCrmRegistrationTemplateDto;
          return (
            <ThreeDotsActions
              placement="right-top"
              showEditIcon
              editLabel="Open Registration Template"
              handleEditClick={() => openTemplate(template)}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setPreviewTemplate(toTemplateForm(template));
                    }}
                  >
                    <Visibility fontSize="small" />
                    Preview online and print
                  </MenuItem>
                  {template.status === AdmissionCrmRegistrationTemplateStatus.Draft ? (
                    <MenuItem
                      disabled={lifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runTemplateLifecycle('publish', template);
                      }}
                    >
                      <Publish fontSize="small" />
                      Publish
                    </MenuItem>
                  ) : (
                    <MenuItem
                      disabled={lifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runTemplateLifecycle('version', template);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                      Create New Version
                    </MenuItem>
                  )}
                  {template.status === AdmissionCrmRegistrationTemplateStatus.Published ? (
                    <MenuItem
                      disabled={lifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runTemplateLifecycle('retire', template);
                      }}
                    >
                      <Archive fontSize="small" />
                      Retire
                    </MenuItem>
                  ) : null}
                </MenuList>
              )}
            />
          );
        },
      },
    ],
    [lifecycleBusy, openTemplate, runTemplateLifecycle]
  );

  return (
    <Box>
      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle1">Registration Forms</Typography>
          <Typography variant="caption" color="text.secondary">
            Published templates control the form, secure link, issue method, and numbering.
          </Typography>
        </Box>
        <Tabs value={tab} onChange={(_event, value: number) => setTab(value)}>
          <Tab label="Templates" />
          <Tab label="Form Numbering" />
        </Tabs>

        {(tab === 0 && templatesQuery.isError) || (tab === 1 && seriesQuery.isError) ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (tab === 0) templatesQuery.refetch();
                  else seriesQuery.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            Registration configuration could not be loaded.
          </Alert>
        ) : null}

        {tab === 0 && !templatesQuery.isError ? (
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button
                size="small"
                startIcon={<Add />}
                disabled={!academicYearId}
                onClick={openBlankTemplate}
              >
                Blank Template
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<Add />}
                disabled={!academicYearId}
                onClick={openNewTemplate}
              >
                Use Starter Template
              </Button>
            </Stack>
            {templatesQuery.isFetching ? <LinearProgress /> : null}
            <CustomizableTable
              tableId="student-enrollment-registration-templates"
              tableTitle="Registration Templates"
              columns={templateColumns}
              data={templatesQuery.data?.items || []}
              isLoading={templatesQuery.isFetching}
              defaultRowsPerPage={10}
              noDataText="No registration templates configured. Create one to issue secure registration links."
              tableContainerProps={{ sx: { minHeight: 320 } }}
            />
          </Stack>
        ) : null}

        {tab === 1 && !seriesQuery.isError ? (
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
                <Stack direction="row" alignItems="center" gap={1}>
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
          {!editingTemplate ? (
            <Stepper activeStep={templateStep} sx={{ mb: 2 }}>
              <Step>
                <StepLabel>Template Rules</StepLabel>
              </Step>
              <Step>
                <StepLabel>Sections & Fields</StepLabel>
              </Step>
            </Stepper>
          ) : null}
          <Stack spacing={2}>
            {editingTemplate || templateStep === 0 ? (
              <>
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
                    label="Issue registration form"
                    value={templateForm.autoIssueAtStage ?? ''}
                    disabled={templateReadOnly}
                    helperText="Manual sends eligible applicants to Ready to Invite. Automatic issues this template when the selected stage is reached."
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
                    <MenuItem value="">Staff issues manually</MenuItem>
                    <MenuItem value={AdmissionInquiryStage.ExamReady}>
                      Automatically when exam ready
                    </MenuItem>
                    <MenuItem value={AdmissionInquiryStage.ExamCompleted}>
                      Automatically when exam completed
                    </MenuItem>
                    <MenuItem value={AdmissionInquiryStage.Eligible}>
                      Automatically when eligible
                    </MenuItem>
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
              </>
            ) : null}
            {editingTemplate || templateStep === 1 ? (
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
                                index === sectionIndex
                                  ? { ...item, title: event.target.value }
                                  : item
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
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)}>Close</Button>
          <Button startIcon={<Visibility />} onClick={() => setPreviewTemplate(templateForm)}>
            Preview
          </Button>
          {!editingTemplate && templateStep > 0 ? (
            <Button onClick={() => setTemplateStep(0)}>Back</Button>
          ) : null}
          {!editingTemplate && templateStep === 0 ? (
            <Button variant="contained" onClick={handleNextTemplateStep}>
              Next
            </Button>
          ) : null}
          {!templateReadOnly && (Boolean(editingTemplate) || templateStep === 1) ? (
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

      {previewTemplate ? (
        <RegistrationTemplatePreview
          open
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      ) : null}

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
    </Box>
  );
}
