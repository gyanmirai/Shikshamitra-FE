'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import type {
  AdmissionCrmPlaybookDto,
  AdmissionCrmPlaybookStageDto,
  AdmissionCrmPlaybookUpsertDto,
  AdmissionCrmSlotAssignmentRuleDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import type { AdmissionCrmSeatPlanDto } from 'src/redux/student/admissions-crm/final-admission-contracts';

import type {
  AdmissionCrmSlotTemplateDto,
  AdmissionCrmAdmissionRoundDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import type { AdmissionCrmExamDefinitionDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { useMemo, useState, useCallback } from 'react';

import { shikshaMitraToast } from 'src/components/toast';

import ThreeDotsActions from 'src/components/three-dots-actions';

import { Archive, Publish, ContentCopy, EventAvailable } from '@mui/icons-material';

import { Chip, Stack, MenuItem, MenuList, Typography } from '@mui/material';

import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmPlaybookStatus,
  AdmissionCrmAssessmentComponentType,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { AdmissionCrmRegistrationPath } from 'src/redux/student/admissions-crm/registration-documents-contracts';

import {
  useGetAdmissionCrmPlaybooksQuery,
  useCreateAdmissionCrmPlaybookMutation,
  useUpdateAdmissionCrmPlaybookMutation,
  useRetireAdmissionCrmPlaybookMutation,
  usePublishAdmissionCrmPlaybookMutation,
  useCreateAdmissionCrmPlaybookVersionMutation,
} from 'src/redux/student/admissions-crm/setup-playbooks-api';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';

import {
  validateAdmissionPlaybookStep,
  createDefaultAdmissionPlaybook,
  prepareAdmissionPlaybookPayload,
  findAdmissionPlaybookValidationIssue,
} from './admissions-playbook-configuration-utils';

type Props = {
  academicYearId?: string;
  mode?: 'full' | 'entrance-exam';
};

type QuickSetupKind = 'exam' | 'interaction' | 'no-exam';

const statusLabel: Record<AdmissionCrmPlaybookStatus, string> = {
  [AdmissionCrmPlaybookStatus.Draft]: 'Draft',
  [AdmissionCrmPlaybookStatus.Published]: 'Published',
  [AdmissionCrmPlaybookStatus.Retired]: 'Retired',
};

const registrationPathLabel: Record<AdmissionCrmRegistrationPath, string> = {
  [AdmissionCrmRegistrationPath.RegistrationAfterExam]: 'Registration after exam',
  [AdmissionCrmRegistrationPath.RegistrationBeforeExam]: 'Registration before exam',
  [AdmissionCrmRegistrationPath.ExamWaived]: 'Exam waived',
  [AdmissionCrmRegistrationPath.DirectRegistration]: 'Direct registration',
};

const toPlaybookForm = (playbook: AdmissionCrmPlaybookDto): AdmissionCrmPlaybookUpsertDto => {
  const {
    id: _id,
    academicYearId: _academicYearId,
    version: _version,
    status: _status,
    publishedAt: _publishedAt,
    retiredAt: _retiredAt,
    ...form
  } = playbook;
  return form;
};

const updateAt = <T,>(items: T[], index: number, patch: Partial<T>): T[] =>
  items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));

const createExam = (): AdmissionCrmExamDefinitionDto => ({
  code: '',
  name: '',
  durationMinutes: 60,
  hallTicketEnabled: false,
  components: [
    {
      code: '',
      name: '',
      componentType: AdmissionCrmAssessmentComponentType.WrittenTest,
      maximumMarks: 100,
      minimumMarks: 40,
      weightPercentage: 100,
      isMandatory: true,
      scorePrecision: 0,
    },
  ],
  resultRule: {
    aggregatePassingPercentage: 40,
    requireMandatoryComponentPass: true,
    meritCapacity: null,
    waitlistCapacity: null,
    tieBreakerCodes: [],
  },
});

const createQuickSetup = (
  name: string,
  kind: QuickSetupKind,
  hallTicketEnabled: boolean
): AdmissionCrmPlaybookUpsertDto => {
  const setup = createDefaultAdmissionPlaybook();
  setup.name = name;
  setup.isFallback = true;
  if (kind === 'no-exam') {
    setup.registrationPath = AdmissionCrmRegistrationPath.ExamWaived;
    setup.stages = [
      {
        code: 'APPLICATION_REVIEW',
        displayName: 'Application review',
        reportingMilestone: AdmissionInquiryStage.FollowUp,
        order: 10,
        isRequired: true,
        isParentVisible: true,
        slaHours: 24,
        allowedNextStageCodes: ['ADMISSION_READY'],
      },
      {
        code: 'ADMISSION_READY',
        displayName: 'Admission ready',
        reportingMilestone: AdmissionInquiryStage.Eligible,
        order: 20,
        isRequired: true,
        isParentVisible: true,
        slaHours: null,
        allowedNextStageCodes: [],
      },
    ];
    return setup;
  }

  const exam = createExam();
  exam.code = kind === 'interaction' ? 'STUDENT_INTERACTION' : 'ENTRANCE_EXAM';
  exam.name = kind === 'interaction' ? 'Student interaction' : 'Entrance exam';
  exam.hallTicketEnabled = kind === 'exam' && hallTicketEnabled;
  exam.components = [
    {
      ...exam.components[0],
      code: kind === 'interaction' ? 'INTERACTION' : 'ASSESSMENT',
      name: kind === 'interaction' ? 'Student interaction' : 'Assessment',
      componentType:
        kind === 'interaction'
          ? AdmissionCrmAssessmentComponentType.Interaction
          : AdmissionCrmAssessmentComponentType.WrittenTest,
    },
  ];
  setup.examDefinitions = [exam];
  return setup;
};

const errorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The playbook action failed.';
  }
  return 'The playbook action failed.';
};

const fullEditorSteps = [
  { value: 0, label: 'General' },
  { value: 1, label: 'Stages' },
  { value: 2, label: 'Rounds & Seats' },
  { value: 3, label: 'Assessments' },
  { value: 4, label: 'Slots & Rules' },
] as const;

const entranceExamEditorSteps = [
  { value: 0, label: 'Applicability' },
  { value: 3, label: 'Assessment Process' },
  { value: 4, label: 'Scheduling & Assignment' },
] as const;

export function useAdmissionsPlaybookController({ academicYearId, mode = 'full' }: Props) {
  const entranceExamMode = mode === 'entrance-exam';

  const editorSteps = entranceExamMode ? entranceExamEditorSteps : fullEditorSteps;

  const [editorOpen, setEditorOpen] = useState(false);

  const [quickSetupOpen, setQuickSetupOpen] = useState(false);

  const [quickSetupKind, setQuickSetupKind] = useState<QuickSetupKind>('exam');

  const [quickSetupName, setQuickSetupName] = useState('Standard admissions');

  const [quickSetupHallTicket, setQuickSetupHallTicket] = useState(false);

  const [editorTab, setEditorTab] = useState(0);

  const [editing, setEditing] = useState<AdmissionCrmPlaybookDto | null>(null);

  const [operationsPlaybook, setOperationsPlaybook] = useState<AdmissionCrmPlaybookDto | null>(
    null
  );

  const [form, setForm] = useState<AdmissionCrmPlaybookUpsertDto>(() =>
    createDefaultAdmissionPlaybook()
  );

  const playbooksQuery = useGetAdmissionCrmPlaybooksQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId }
  );

  const { data, isFetching } = playbooksQuery;

  const [createPlaybook, createState] = useCreateAdmissionCrmPlaybookMutation();

  const [updatePlaybook, updateState] = useUpdateAdmissionCrmPlaybookMutation();

  const [publishPlaybook, publishState] = usePublishAdmissionCrmPlaybookMutation();

  const [retirePlaybook, retireState] = useRetireAdmissionCrmPlaybookMutation();

  const [createVersion, versionState] = useCreateAdmissionCrmPlaybookVersionMutation();

  const isSaving = createState.isLoading || updateState.isLoading;

  const isLifecycleBusy = publishState.isLoading || retireState.isLoading || versionState.isLoading;

  const openNew = () => {
    setEditing(null);
    setForm(createDefaultAdmissionPlaybook());
    setEditorTab(0);
    setEditorOpen(true);
  };

  const handleQuickSetup = async () => {
    if (!academicYearId || !quickSetupName.trim()) return;
    try {
      const draft = await createPlaybook({
        academicYearId,
        body: prepareAdmissionPlaybookPayload(
          createQuickSetup(quickSetupName.trim(), quickSetupKind, quickSetupHallTicket)
        ),
      }).unwrap();
      setQuickSetupOpen(false);
      shikshaMitraToast.success({
        message: entranceExamMode
          ? 'Entrance exam policy draft created. Review and publish it when ready.'
          : 'Admission setup draft created. Review and publish it when ready.',
      });
      if (entranceExamMode) {
        setEditing(draft);
        setForm(toPlaybookForm(draft));
        setEditorTab(0);
        setEditorOpen(true);
      }
    } catch (error) {
      shikshaMitraToast.error({ message: errorMessage(error) });
    }
  };

  const openEditor = useCallback((playbook: AdmissionCrmPlaybookDto) => {
    setEditing(playbook);
    setForm(toPlaybookForm(playbook));
    setEditorTab(0);
    setEditorOpen(true);
  }, []);

  const handleSave = async () => {
    if (!academicYearId) return;
    const issue = findAdmissionPlaybookValidationIssue(form);
    if (issue) {
      setEditorTab(issue.step);
      shikshaMitraToast.error({ message: issue.message });
      return;
    }

    const body = prepareAdmissionPlaybookPayload(form);
    try {
      if (editing) {
        await updatePlaybook({ playbookId: editing.id, body }).unwrap();
      } else {
        await createPlaybook({ academicYearId, body }).unwrap();
      }
      shikshaMitraToast.success({ message: editing ? 'Playbook updated.' : 'Playbook created.' });
      setEditorOpen(false);
    } catch (error) {
      shikshaMitraToast.error({ message: errorMessage(error) });
    }
  };

  const runLifecycle = useCallback(
    async (action: 'publish' | 'retire' | 'version', playbook: AdmissionCrmPlaybookDto) => {
      try {
        if (action === 'publish') await publishPlaybook({ playbookId: playbook.id }).unwrap();
        if (action === 'retire') await retirePlaybook({ playbookId: playbook.id }).unwrap();
        if (action === 'version') {
          const draft = await createVersion({ playbookId: playbook.id }).unwrap();
          openEditor(draft);
        }
        if (action !== 'version') {
          shikshaMitraToast.success({
            message: action === 'publish' ? 'Playbook published.' : 'Playbook retired.',
          });
        }
      } catch (error) {
        shikshaMitraToast.error({ message: errorMessage(error) });
      }
    },
    [createVersion, openEditor, publishPlaybook, retirePlaybook]
  );

  const updateStage = (index: number, patch: Partial<AdmissionCrmPlaybookStageDto>) =>
    setForm((current) => ({ ...current, stages: updateAt(current.stages, index, patch) }));

  const updateRound = (index: number, patch: Partial<AdmissionCrmAdmissionRoundDto>) =>
    setForm((current) => ({ ...current, rounds: updateAt(current.rounds, index, patch) }));

  const updateSeatPlan = (index: number, patch: Partial<AdmissionCrmSeatPlanDto>) =>
    setForm((current) => ({ ...current, seatPlans: updateAt(current.seatPlans, index, patch) }));

  const updateExam = (index: number, patch: Partial<AdmissionCrmExamDefinitionDto>) =>
    setForm((current) => ({
      ...current,
      examDefinitions: updateAt(current.examDefinitions, index, patch),
    }));

  const updateSlot = (index: number, patch: Partial<AdmissionCrmSlotTemplateDto>) =>
    setForm((current) => ({
      ...current,
      slotTemplates: updateAt(current.slotTemplates, index, patch),
    }));

  const updateRule = (index: number, patch: Partial<AdmissionCrmSlotAssignmentRuleDto>) =>
    setForm((current) => ({
      ...current,
      assignmentRules: updateAt(current.assignmentRules, index, patch),
    }));

  const readOnly =
    editing?.status !== undefined && editing.status !== AdmissionCrmPlaybookStatus.Draft;

  const editorBaseline = useMemo(
    () => (editing ? toPlaybookForm(editing) : createDefaultAdmissionPlaybook()),
    [editing]
  );

  const editorDirty =
    editorOpen && !readOnly && JSON.stringify(form) !== JSON.stringify(editorBaseline);

  useEnrollmentSettingsDirtyState({
    source: 'admissions-playbook-editor',
    dirty: editorDirty,
    onDiscard: () => {
      setEditorOpen(false);
      setEditing(null);
      setForm(createDefaultAdmissionPlaybook());
      setEditorTab(0);
    },
  });

  const handleEditorStepChange = (nextStep: number) => {
    const currentIndex = editorSteps.findIndex((step) => step.value === editorTab);
    const nextIndex = editorSteps.findIndex((step) => step.value === nextStep);
    if (nextIndex > currentIndex) {
      const [message] = validateAdmissionPlaybookStep(form, editorTab as 0 | 1 | 2 | 3 | 4);
      if (message) {
        shikshaMitraToast.error({ message });
        return;
      }
    }
    setEditorTab(nextStep);
  };

  const handleNextEditorStep = () => {
    const [message] = validateAdmissionPlaybookStep(form, editorTab as 0 | 1 | 2 | 3 | 4);
    if (message) {
      shikshaMitraToast.error({ message });
      return;
    }
    const currentIndex = editorSteps.findIndex((step) => step.value === editorTab);
    const next = editorSteps[Math.min(currentIndex + 1, editorSteps.length - 1)];
    setEditorTab(next.value);
  };

  const editorStepIndex = Math.max(
    0,
    editorSteps.findIndex((step) => step.value === editorTab)
  );

  const columns: IColumn[] = useMemo(() => {
    const result: IColumn[] = [
      {
        id: 'name',
        label: entranceExamMode ? 'Exam policy' : 'Playbook',
        minWidth: 220,
        render: (value, row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Version {(row as AdmissionCrmPlaybookDto).version}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'isFallback',
        label: entranceExamMode ? 'Applicability' : 'Scope',
        width: 120,
        filterType: 'enum',
        enumOptions: [
          { value: true, label: 'Fallback' },
          { value: false, label: 'Rule based' },
        ],
        render: (value) => (value ? 'Fallback' : 'Rule based'),
      },
      {
        id: 'examDefinitions',
        label: 'Exams',
        width: 90,
        align: 'right',
        isFilter: false,
        render: (value) => value.length,
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
            label={statusLabel[value as AdmissionCrmPlaybookStatus]}
            color={
              value === AdmissionCrmPlaybookStatus.Published
                ? 'success'
                : value === AdmissionCrmPlaybookStatus.Draft
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
          const playbook = row as AdmissionCrmPlaybookDto;
          return (
            <ThreeDotsActions
              placement="right-top"
              showEditIcon
              editLabel={entranceExamMode ? 'Open Exam Policy' : 'Open Playbook'}
              handleEditClick={() => openEditor(playbook)}
              actions={({ popover }) => (
                <MenuList>
                  {playbook.status === AdmissionCrmPlaybookStatus.Draft ? (
                    <MenuItem
                      disabled={isLifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runLifecycle('publish', playbook);
                      }}
                    >
                      <Publish fontSize="small" />
                      Publish
                    </MenuItem>
                  ) : (
                    <MenuItem
                      disabled={isLifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runLifecycle('version', playbook);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                      Create New Version
                    </MenuItem>
                  )}
                  {playbook.status === AdmissionCrmPlaybookStatus.Published ? (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        setOperationsPlaybook(playbook);
                      }}
                    >
                      <EventAvailable fontSize="small" />
                      Open Slot Operations
                    </MenuItem>
                  ) : null}
                  {playbook.status === AdmissionCrmPlaybookStatus.Published ? (
                    <MenuItem
                      disabled={isLifecycleBusy}
                      onClick={() => {
                        popover.onClose();
                        runLifecycle('retire', playbook);
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
    ];

    if (!entranceExamMode) {
      result.splice(
        1,
        0,
        {
          id: 'registrationPath',
          label: 'Registration Path',
          minWidth: 160,
          filterType: 'enum',
          enumOptions: Object.entries(registrationPathLabel).map(([value, label]) => ({
            value: Number(value),
            label,
          })),
          render: (value) => registrationPathLabel[value as AdmissionCrmRegistrationPath],
        },
        {
          id: 'rounds',
          label: 'Rounds',
          width: 90,
          align: 'right',
          isFilter: false,
          render: (value) => value.length,
        },
        {
          id: 'seatPlans',
          label: 'Seat Plans',
          width: 105,
          align: 'right',
          isFilter: false,
          render: (value) => value.length,
        }
      );
    }

    return result;
  }, [entranceExamMode, isLifecycleBusy, openEditor, runLifecycle]);

  return {
    state: {
      academicYearId,
      columns,
      data,
      editing,
      editorOpen,
      editorStepIndex,
      editorSteps,
      editorTab,
      entranceExamMode,
      form,
      operationsPlaybook,
      quickSetupHallTicket,
      quickSetupKind,
      quickSetupName,
      quickSetupOpen,
    },
    actions: {
      createState,
      handleEditorStepChange,
      handleNextEditorStep,
      handleQuickSetup,
      handleSave,
      openNew,
      readOnly,
      setEditorOpen,
      setEditorTab,
      setForm,
      setOperationsPlaybook,
      setQuickSetupHallTicket,
      setQuickSetupKind,
      setQuickSetupName,
      setQuickSetupOpen,
      updateExam,
      updateRound,
      updateRule,
      updateSeatPlan,
      updateSlot,
      updateStage,
    },
    meta: { isFetching, isSaving, playbooksQuery },
  };
}

export type AdmissionsPlaybookController = ReturnType<typeof useAdmissionsPlaybookController>;
