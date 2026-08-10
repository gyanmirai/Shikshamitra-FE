'use client';

import type { RootState } from 'src/redux/store';

import type { IColumn } from 'src/components/customizabaleTable/types';

import type {
  AdmissionCrmFormNumberSeriesDto,
  AdmissionCrmRegistrationFieldDto,
  AdmissionCrmRegistrationTemplateDto,
  AdmissionCrmFormNumberSeriesUpsertDto,
  AdmissionCrmRegistrationTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { useSelector } from 'react-redux';

import { useMemo, useState, useCallback } from 'react';

import { shikshaMitraToast } from 'src/components/toast';

import ThreeDotsActions from 'src/components/three-dots-actions';

import { Archive, Publish, Visibility, ContentCopy } from '@mui/icons-material';

import { Chip, Stack, MenuItem, MenuList, Typography } from '@mui/material';

import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { AdmissionCrmRegistrationTemplateStatus } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import {
  useGetAdmissionCrmFormNumberSeriesQuery,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useCreateAdmissionCrmFormNumberSeriesMutation,
  useUpdateAdmissionCrmFormNumberSeriesMutation,
  useCreateAdmissionCrmRegistrationTemplateMutation,
  useUpdateAdmissionCrmRegistrationTemplateMutation,
  useRetireAdmissionCrmRegistrationTemplateMutation,
  usePublishAdmissionCrmRegistrationTemplateMutation,
  useCreateAdmissionCrmRegistrationTemplateVersionMutation,
} from 'src/redux/student/admissions-crm/registration-documents-api';

import { getAdmissionCrmStageLabel } from '../admissions-crm/admissions-crm-utils';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';

import { resolveAdmissionCrmRegistrationSettingsPermissions } from '../admissions-crm/admission-action-permissions';

import {
  createRegistrationTemplate,
  normalizeRegistrationTemplate,
  createBlankRegistrationTemplate,
  validateRegistrationTemplateStep,
  findRegistrationTemplateValidationIssue,
  normalizeRegistrationTemplateSystemFields,
} from './admissions-registration-configuration-utils';

import type { RegistrationTemplateEditorStep } from './admissions-registration-configuration-utils';

type Props = {
  academicYearId?: string;
  view: 'templates' | 'numbering';
};

const statusLabel: Record<AdmissionCrmRegistrationTemplateStatus, string> = {
  [AdmissionCrmRegistrationTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmRegistrationTemplateStatus.Published]: 'Published',
  [AdmissionCrmRegistrationTemplateStatus.Retired]: 'Retired',
};

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
  return normalizeRegistrationTemplateSystemFields(form);
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

export function useAdmissionsRegistrationController({ academicYearId, view }: Props) {
  const permissions = useSelector((root: RootState) => root.auth.permissions);

  const {
    canManageRegistrationTemplates,
    canPublishRegistrationTemplates,
    canManageFormNumberSeries,
  } = resolveAdmissionCrmRegistrationSettingsPermissions(permissions);

  const [templateStep, setTemplateStep] = useState<RegistrationTemplateEditorStep>(0);

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
    { skip: !academicYearId || view !== 'templates' }
  );

  const seriesQuery = useGetAdmissionCrmFormNumberSeriesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || view !== 'numbering' }
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
    if (!canManageRegistrationTemplates) return;
    setEditingTemplate(null);
    setTemplateForm(createRegistrationTemplate());
    setTemplateStep(0);
    setTemplateOpen(true);
  };

  const openBlankTemplate = () => {
    if (!canManageRegistrationTemplates) return;
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
    if (!academicYearId || !canManageRegistrationTemplates) return;
    const issue = findRegistrationTemplateValidationIssue(templateForm);
    if (issue) {
      setTemplateStep(issue.step);
      shikshaMitraToast.error({ message: issue.message });
      return;
    }
    const body = normalizeRegistrationTemplate({
      ...templateForm,
      feeRequired: false,
      feeAmount: 0,
    });
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
      const requiresPublishPermission = action === 'publish' || action === 'retire';
      if (
        (requiresPublishPermission && !canPublishRegistrationTemplates) ||
        (!requiresPublishPermission && !canManageRegistrationTemplates)
      ) {
        return;
      }
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
    [
      canManageRegistrationTemplates,
      canPublishRegistrationTemplates,
      createTemplateVersion,
      openTemplate,
      publishTemplate,
      retireTemplate,
    ]
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
    if (!canManageFormNumberSeries) return;
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
    if (!academicYearId || !canManageFormNumberSeries || !seriesForm.name.trim()) return;
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
    !canManageRegistrationTemplates ||
    (editingTemplate?.status !== undefined &&
      editingTemplate.status !== AdmissionCrmRegistrationTemplateStatus.Draft);

  const seriesReadOnly = !canManageFormNumberSeries;

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

  const seriesDirty =
    seriesOpen && !seriesReadOnly && JSON.stringify(seriesForm) !== JSON.stringify(seriesBaseline);

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
    const [message] = validateRegistrationTemplateStep(templateForm, templateStep);
    if (message) {
      shikshaMitraToast.error({ message });
      return;
    }
    setTemplateStep((current) =>
      current < 2 ? ((current + 1) as RegistrationTemplateEditorStep) : current
    );
  };

  const handleTemplateStepChange = (value: number) => {
    const nextStep = value as RegistrationTemplateEditorStep;
    if (nextStep > templateStep) {
      const [message] = validateRegistrationTemplateStep(templateForm, templateStep);
      if (message) {
        shikshaMitraToast.error({ message });
        return;
      }
    }
    setTemplateStep(nextStep);
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
              editLabel={
                canManageRegistrationTemplates
                  ? 'Open Registration Template'
                  : 'View Registration Template'
              }
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
                  {template.status === AdmissionCrmRegistrationTemplateStatus.Draft &&
                  canPublishRegistrationTemplates ? (
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
                  ) : null}
                  {template.status !== AdmissionCrmRegistrationTemplateStatus.Draft &&
                  canManageRegistrationTemplates ? (
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
                  ) : null}
                  {template.status === AdmissionCrmRegistrationTemplateStatus.Published &&
                  canPublishRegistrationTemplates ? (
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
    [
      canManageRegistrationTemplates,
      canPublishRegistrationTemplates,
      lifecycleBusy,
      openTemplate,
      runTemplateLifecycle,
    ]
  );

  return {
    state: {
      academicYearId,
      editingSeries,
      editingTemplate,
      seriesForm,
      seriesOpen,
      seriesReadOnly,
      templateForm,
      templateOpen,
      templateReadOnly,
      templateStep,
      view,
    },
    actions: {
      createSeriesState,
      createTemplateState,
      handleNextTemplateStep,
      handleTemplateStepChange,
      openBlankTemplate,
      openNewSeries,
      openNewTemplate,
      openSeries,
      previewTemplate,
      saveSeries,
      saveTemplate,
      setPreviewTemplate,
      setSeriesForm,
      setSeriesOpen,
      setTemplateForm,
      setTemplateOpen,
      setTemplateStep,
      updateField,
      updateSeriesState,
      updateTemplateState,
    },
    meta: {
      canManageFormNumberSeries,
      canManageRegistrationTemplates,
      seriesQuery,
      templateColumns,
      templatesQuery,
    },
  };
}

export type AdmissionsRegistrationController = ReturnType<
  typeof useAdmissionsRegistrationController
>;
