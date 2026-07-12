'use client';

import type {
  AdmissionCrmPlaybookDto,
  AdmissionCrmSeatPlanDto,
  AdmissionCrmSlotTemplateDto,
  AdmissionCrmPlaybookStageDto,
  AdmissionCrmPlaybookUpsertDto,
  AdmissionCrmAdmissionRoundDto,
  AdmissionCrmExamDefinitionDto,
  AdmissionCrmSlotAssignmentRuleDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Add,
  Edit,
  Archive,
  Publish,
  ContentCopy,
  DeleteOutline,
  EventAvailable,
} from '@mui/icons-material';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Stack,
  Paper,
  Switch,
  Select,
  Dialog,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogActions,
  DialogContent,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmPlaybookStatus,
  AdmissionCrmRegistrationPath,
  useGetAdmissionCrmPlaybooksQuery,
  AdmissionCrmSlotAssignmentStrategy,
  AdmissionCrmAssessmentComponentType,
  useCreateAdmissionCrmPlaybookMutation,
  useUpdateAdmissionCrmPlaybookMutation,
  useRetireAdmissionCrmPlaybookMutation,
  usePublishAdmissionCrmPlaybookMutation,
  useCreateAdmissionCrmPlaybookVersionMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionsPlaybookOperations } from './admissions-playbook-operations';
import {
  validateAdmissionPlaybook,
  createDefaultAdmissionPlaybook,
  prepareAdmissionPlaybookPayload,
} from './admissions-playbook-configuration-utils';

type Props = {
  academicYearId?: string;
};

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

const assessmentTypeLabel: Record<AdmissionCrmAssessmentComponentType, string> = {
  [AdmissionCrmAssessmentComponentType.WrittenTest]: 'Written test',
  [AdmissionCrmAssessmentComponentType.Interview]: 'Interview',
  [AdmissionCrmAssessmentComponentType.Interaction]: 'Interaction',
  [AdmissionCrmAssessmentComponentType.Observation]: 'Observation',
  [AdmissionCrmAssessmentComponentType.ReadinessAssessment]: 'Readiness assessment',
};

const assignmentStrategyLabel: Record<AdmissionCrmSlotAssignmentStrategy, string> = {
  [AdmissionCrmSlotAssignmentStrategy.Manual]: 'Manual',
  [AdmissionCrmSlotAssignmentStrategy.EarliestAvailable]: 'Earliest available',
  [AdmissionCrmSlotAssignmentStrategy.RoundRobin]: 'Round robin',
  [AdmissionCrmSlotAssignmentStrategy.ClassMatch]: 'Class match',
  [AdmissionCrmSlotAssignmentStrategy.CampusMatch]: 'Campus match',
  [AdmissionCrmSlotAssignmentStrategy.PreferredDate]: 'Preferred date',
  [AdmissionCrmSlotAssignmentStrategy.LanguageMatch]: 'Language match',
  [AdmissionCrmSlotAssignmentStrategy.SiblingGrouping]: 'Sibling grouping',
  [AdmissionCrmSlotAssignmentStrategy.BalancedCapacity]: 'Balanced capacity',
};

const stageOptions = Object.values(AdmissionInquiryStage).filter(
  (value): value is AdmissionInquiryStage => typeof value === 'number'
);

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

const createRound = (): AdmissionCrmAdmissionRoundDto => ({
  code: '',
  name: '',
  openingDate: '',
  closingDate: '',
  examWindowStart: null,
  examWindowEnd: null,
  registrationDeadline: null,
  decisionDeadline: null,
  isActive: true,
});

const createSeatPlan = (): AdmissionCrmSeatPlanDto => ({
  code: '',
  roundCode: null,
  plannedSeats: 0,
  approvedCapacity: 0,
  offeredSeats: 0,
  acceptedSeats: 0,
  waitlistedApplicants: 0,
  withdrawnApplicants: 0,
  remainingCapacity: 0,
  isOverAllocated: false,
});

const createExam = (): AdmissionCrmExamDefinitionDto => ({
  code: '',
  name: '',
  durationMinutes: 60,
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

const createSlot = (): AdmissionCrmSlotTemplateDto => ({
  code: '',
  name: '',
  examDefinitionCode: '',
  roomNo: 1,
  capacity: 30,
  reportingTime: '08:30',
  startTime: '09:00',
  endTime: '10:00',
  validFrom: null,
  validTo: null,
  daysOfWeek: [],
  blackoutDates: [],
  isActive: true,
});

const createAssignmentRule = (): AdmissionCrmSlotAssignmentRuleDto => ({
  code: '',
  name: '',
  trigger: 'ExamReady',
  strategy: AdmissionCrmSlotAssignmentStrategy.EarliestAvailable,
  priority: 10,
  slotTemplateCode: null,
  isActive: true,
});

const errorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { detail?: string; errorCode?: string } };
    return data?.detail || data?.errorCode || 'The playbook action failed.';
  }
  return 'The playbook action failed.';
};

const AdmissionsPlaybookConfiguration = ({ academicYearId }: Props) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTab, setEditorTab] = useState(0);
  const [editing, setEditing] = useState<AdmissionCrmPlaybookDto | null>(null);
  const [operationsPlaybook, setOperationsPlaybook] = useState<AdmissionCrmPlaybookDto | null>(
    null
  );
  const [form, setForm] = useState<AdmissionCrmPlaybookUpsertDto>(() =>
    createDefaultAdmissionPlaybook()
  );

  const { data, isFetching } = useGetAdmissionCrmPlaybooksQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId }
  );
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

  const openEditor = (playbook: AdmissionCrmPlaybookDto) => {
    setEditing(playbook);
    setForm(toPlaybookForm(playbook));
    setEditorTab(0);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!academicYearId) return;
    const errors = validateAdmissionPlaybook(form);
    if (errors.length) {
      shikshaMitraToast.error({ message: errors[0] });
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

  const runLifecycle = async (
    action: 'publish' | 'retire' | 'version',
    playbook: AdmissionCrmPlaybookDto
  ) => {
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
  };

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

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle1">Admissions Playbooks</Typography>
            <Typography variant="caption" color="text.secondary">
              {data?.totalCount || 0} policy versions
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            disabled={!academicYearId}
            onClick={openNew}
          >
            New Playbook
          </Button>
        </Stack>
        {isFetching ? <LinearProgress /> : <Divider />}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {(data?.items || []).map((playbook) => (
            <Paper key={playbook.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                      {playbook.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Version {playbook.version} -{' '}
                      {registrationPathLabel[playbook.registrationPath]}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={statusLabel[playbook.status]}
                    color={
                      playbook.status === AdmissionCrmPlaybookStatus.Published
                        ? 'success'
                        : playbook.status === AdmissionCrmPlaybookStatus.Draft
                          ? 'warning'
                          : 'default'
                    }
                  />
                </Stack>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${playbook.rounds.length} rounds`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${playbook.seatPlans.length} seat plans`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${playbook.examDefinitions.length} exams`}
                  />
                  {playbook.isFallback ? <Chip size="small" label="Fallback" /> : null}
                </Stack>
                <Stack direction="row" gap={0.5} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    aria-label="Open playbook"
                    onClick={() => openEditor(playbook)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  {playbook.status === AdmissionCrmPlaybookStatus.Draft ? (
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="Publish playbook"
                      disabled={isLifecycleBusy}
                      onClick={() => runLifecycle('publish', playbook)}
                    >
                      <Publish fontSize="small" />
                    </IconButton>
                  ) : null}
                  {playbook.status !== AdmissionCrmPlaybookStatus.Draft ? (
                    <IconButton
                      size="small"
                      aria-label="Create new playbook version"
                      disabled={isLifecycleBusy}
                      onClick={() => runLifecycle('version', playbook)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  ) : null}
                  {playbook.status === AdmissionCrmPlaybookStatus.Published ? (
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label="Open playbook operations"
                      onClick={() => setOperationsPlaybook(playbook)}
                    >
                      <EventAvailable fontSize="small" />
                    </IconButton>
                  ) : null}
                  {playbook.status === AdmissionCrmPlaybookStatus.Published ? (
                    <IconButton
                      size="small"
                      aria-label="Retire playbook"
                      disabled={isLifecycleBusy}
                      onClick={() => runLifecycle('retire', playbook)}
                    >
                      <Archive fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          ))}
          {!data?.items?.length ? (
            <Typography variant="body2" color="text.secondary">
              No admissions playbooks configured
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          {editing ? `${editing.name} - Version ${editing.version}` : 'New Admissions Playbook'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs
            value={editorTab}
            onChange={(_event, value: number) => setEditorTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="General" />
            <Tab label={`Stages (${form.stages.length})`} />
            <Tab label={`Rounds & Seats (${form.rounds.length}/${form.seatPlans.length})`} />
            <Tab label={`Exams (${form.examDefinitions.length})`} />
            <Tab
              label={`Slots & Rules (${form.slotTemplates.length}/${form.assignmentRules.length})`}
            />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {editorTab === 0 ? (
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Playbook name"
                    value={form.name}
                    disabled={readOnly}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <FormControl fullWidth size="small" disabled={readOnly}>
                    <InputLabel>Registration path</InputLabel>
                    <Select
                      label="Registration path"
                      value={form.registrationPath}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          registrationPath: Number(
                            event.target.value
                          ) as AdmissionCrmRegistrationPath,
                        }))
                      }
                    >
                      {Object.entries(registrationPathLabel).map(([value, label]) => (
                        <MenuItem key={value} value={Number(value)}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isFallback}
                      disabled={readOnly}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isFallback: event.target.checked,
                          applicability: event.target.checked ? {} : current.applicability,
                        }))
                      }
                    />
                  }
                  label="Fallback playbook"
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    gap: 1,
                  }}
                >
                  {(
                    [
                      ['campus', 'Campus'],
                      ['desiredClass', 'Class'],
                      ['board', 'Board'],
                      ['medium', 'Medium'],
                      ['applicantCategory', 'Applicant category'],
                      ['admissionRound', 'Admission round'],
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
                          applicability: { ...current.applicability, [key]: event.target.value },
                        }))
                      }
                    />
                  ))}
                </Box>
                <TextField
                  size="small"
                  label="Notes"
                  multiline
                  minRows={2}
                  value={form.notes || ''}
                  disabled={readOnly}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </Stack>
            ) : null}

            {editorTab === 1 ? (
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Pipeline stages</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        stages: [
                          ...current.stages,
                          {
                            code: '',
                            displayName: '',
                            reportingMilestone: AdmissionInquiryStage.FollowUp,
                            order: current.stages.length * 10 + 10,
                            isRequired: true,
                            isParentVisible: false,
                            slaHours: null,
                            allowedNextStageCodes: [],
                          },
                        ],
                      }))
                    }
                  >
                    Add Stage
                  </Button>
                </Stack>
                {form.stages.map((stage, index) => (
                  <Paper
                    key={`${stage.code}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems="center"
                      >
                        <TextField
                          size="small"
                          label="Code"
                          value={stage.code}
                          disabled={readOnly}
                          onChange={(event) => updateStage(index, { code: event.target.value })}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Display name"
                          value={stage.displayName}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateStage(index, { displayName: event.target.value })
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Order"
                          value={stage.order}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateStage(index, { order: Number(event.target.value) })
                          }
                        />
                        <FormControl size="small" sx={{ minWidth: 170 }} disabled={readOnly}>
                          <InputLabel>Milestone</InputLabel>
                          <Select
                            label="Milestone"
                            value={stage.reportingMilestone}
                            onChange={(event) =>
                              updateStage(index, {
                                reportingMilestone: Number(
                                  event.target.value
                                ) as AdmissionInquiryStage,
                              })
                            }
                          >
                            {stageOptions.map((value) => (
                              <MenuItem key={value} value={value}>
                                {AdmissionInquiryStage[value]}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton
                          aria-label="Remove stage"
                          disabled={readOnly}
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              stages: current.stages.filter(
                                (_item, itemIndex) => itemIndex !== index
                              ),
                            }))
                          }
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Allowed next stage codes"
                          value={stage.allowedNextStageCodes.join(', ')}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateStage(index, {
                              allowedNextStageCodes: event.target.value
                                .split(',')
                                .map((value) => value.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="SLA hours"
                          value={stage.slaHours ?? ''}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateStage(index, {
                              slaHours: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={stage.isRequired}
                              disabled={readOnly}
                              onChange={(event) =>
                                updateStage(index, { isRequired: event.target.checked })
                              }
                            />
                          }
                          label="Required"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={stage.isParentVisible}
                              disabled={readOnly}
                              onChange={(event) =>
                                updateStage(index, { isParentVisible: event.target.checked })
                              }
                            />
                          }
                          label="Parent visible"
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : null}

            {editorTab === 2 ? (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Admission rounds</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        rounds: [...current.rounds, createRound()],
                      }))
                    }
                  >
                    Add Round
                  </Button>
                </Stack>
                {form.rounds.map((round, index) => (
                  <Paper
                    key={`${round.code}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr)) auto' },
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Code"
                        value={round.code}
                        disabled={readOnly}
                        onChange={(event) => updateRound(index, { code: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Name"
                        value={round.name}
                        disabled={readOnly}
                        onChange={(event) => updateRound(index, { name: event.target.value })}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Opens"
                        InputLabelProps={{ shrink: true }}
                        value={round.openingDate?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { openingDate: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Closes"
                        InputLabelProps={{ shrink: true }}
                        value={round.closingDate?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { closingDate: event.target.value })
                        }
                      />
                      <IconButton
                        aria-label="Remove round"
                        disabled={readOnly}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            rounds: current.rounds.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                      <TextField
                        size="small"
                        type="date"
                        label="Exam starts"
                        InputLabelProps={{ shrink: true }}
                        value={round.examWindowStart?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { examWindowStart: event.target.value || null })
                        }
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Exam ends"
                        InputLabelProps={{ shrink: true }}
                        value={round.examWindowEnd?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { examWindowEnd: event.target.value || null })
                        }
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Registration deadline"
                        InputLabelProps={{ shrink: true }}
                        value={round.registrationDeadline?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { registrationDeadline: event.target.value || null })
                        }
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Decision deadline"
                        InputLabelProps={{ shrink: true }}
                        value={round.decisionDeadline?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRound(index, { decisionDeadline: event.target.value || null })
                        }
                      />
                    </Box>
                  </Paper>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Seat plans</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        seatPlans: [...current.seatPlans, createSeatPlan()],
                      }))
                    }
                  >
                    Add Seat Plan
                  </Button>
                </Stack>
                {form.seatPlans.map((plan, index) => (
                  <Paper
                    key={`${plan.code}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr)) auto' },
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Code"
                        value={plan.code}
                        disabled={readOnly}
                        onChange={(event) => updateSeatPlan(index, { code: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Round code"
                        value={plan.roundCode || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSeatPlan(index, { roundCode: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        label="Campus"
                        value={plan.campus || ''}
                        disabled={readOnly}
                        onChange={(event) => updateSeatPlan(index, { campus: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Class"
                        value={plan.desiredClass || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSeatPlan(index, { desiredClass: event.target.value })
                        }
                      />
                      <IconButton
                        aria-label="Remove seat plan"
                        disabled={readOnly}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            seatPlans: current.seatPlans.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                      {(
                        [
                          'plannedSeats',
                          'approvedCapacity',
                          'offeredSeats',
                          'acceptedSeats',
                          'waitlistedApplicants',
                          'withdrawnApplicants',
                        ] as const
                      ).map((key) => (
                        <TextField
                          key={key}
                          size="small"
                          type="number"
                          label={key.replace(/([A-Z])/g, ' $1')}
                          value={plan[key]}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateSeatPlan(index, { [key]: Number(event.target.value) })
                          }
                        />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : null}

            {editorTab === 3 ? (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Entrance exam definitions</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        examDefinitions: [...current.examDefinitions, createExam()],
                      }))
                    }
                  >
                    Add Exam
                  </Button>
                </Stack>
                {form.examDefinitions.map((exam, examIndex) => (
                  <Box key={`${exam.code}-${examIndex}`} sx={{ display: 'grid', gap: 1.25 }}>
                    {examIndex > 0 ? <Divider /> : null}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        label="Code"
                        value={exam.code}
                        disabled={readOnly}
                        onChange={(event) => updateExam(examIndex, { code: event.target.value })}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Exam name"
                        value={exam.name}
                        disabled={readOnly}
                        onChange={(event) => updateExam(examIndex, { name: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Round code"
                        value={exam.roundCode || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, { roundCode: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        label="Class"
                        value={exam.desiredClass || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, { desiredClass: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Duration minutes"
                        value={exam.durationMinutes}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, { durationMinutes: Number(event.target.value) })
                        }
                      />
                      <IconButton
                        aria-label="Remove exam"
                        disabled={readOnly}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            examDefinitions: current.examDefinitions.filter(
                              (_item, itemIndex) => itemIndex !== examIndex
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Assessment components
                    </Typography>
                    {exam.components.map((component, componentIndex) => (
                      <Box
                        key={`${component.code}-${componentIndex}`}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr)) auto' },
                          gap: 1,
                          alignItems: 'center',
                        }}
                      >
                        <TextField
                          size="small"
                          label="Code"
                          value={component.code}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateExam(examIndex, {
                              components: updateAt(exam.components, componentIndex, {
                                code: event.target.value,
                              }),
                            })
                          }
                        />
                        <TextField
                          size="small"
                          label="Name"
                          value={component.name}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateExam(examIndex, {
                              components: updateAt(exam.components, componentIndex, {
                                name: event.target.value,
                              }),
                            })
                          }
                        />
                        <FormControl size="small" disabled={readOnly}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            label="Type"
                            value={component.componentType}
                            onChange={(event) =>
                              updateExam(examIndex, {
                                components: updateAt(exam.components, componentIndex, {
                                  componentType: Number(
                                    event.target.value
                                  ) as AdmissionCrmAssessmentComponentType,
                                }),
                              })
                            }
                          >
                            {Object.entries(assessmentTypeLabel).map(([value, label]) => (
                              <MenuItem key={value} value={Number(value)}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          type="number"
                          label="Maximum"
                          value={component.maximumMarks}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateExam(examIndex, {
                              components: updateAt(exam.components, componentIndex, {
                                maximumMarks: Number(event.target.value),
                              }),
                            })
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Minimum"
                          value={component.minimumMarks ?? ''}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateExam(examIndex, {
                              components: updateAt(exam.components, componentIndex, {
                                minimumMarks: event.target.value
                                  ? Number(event.target.value)
                                  : null,
                              }),
                            })
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Weight %"
                          value={component.weightPercentage}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateExam(examIndex, {
                              components: updateAt(exam.components, componentIndex, {
                                weightPercentage: Number(event.target.value),
                              }),
                            })
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={component.isMandatory}
                              disabled={readOnly}
                              onChange={(event) =>
                                updateExam(examIndex, {
                                  components: updateAt(exam.components, componentIndex, {
                                    isMandatory: event.target.checked,
                                  }),
                                })
                              }
                            />
                          }
                          label="Required"
                        />
                        <IconButton
                          aria-label="Remove component"
                          disabled={readOnly || exam.components.length === 1}
                          onClick={() =>
                            updateExam(examIndex, {
                              components: exam.components.filter(
                                (_item, itemIndex) => itemIndex !== componentIndex
                              ),
                            })
                          }
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<Add />}
                      disabled={readOnly}
                      onClick={() =>
                        updateExam(examIndex, {
                          components: [
                            ...exam.components,
                            {
                              ...createExam().components[0],
                              code: '',
                              name: '',
                              weightPercentage: 0,
                            },
                          ],
                        })
                      }
                      sx={{ justifySelf: 'start' }}
                    >
                      Add Component
                    </Button>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                      <TextField
                        size="small"
                        type="number"
                        label="Pass %"
                        value={exam.resultRule.aggregatePassingPercentage}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, {
                            resultRule: {
                              ...exam.resultRule,
                              aggregatePassingPercentage: Number(event.target.value),
                            },
                          })
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Merit capacity"
                        value={exam.resultRule.meritCapacity ?? ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, {
                            resultRule: {
                              ...exam.resultRule,
                              meritCapacity: event.target.value ? Number(event.target.value) : null,
                            },
                          })
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Waitlist capacity"
                        value={exam.resultRule.waitlistCapacity ?? ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, {
                            resultRule: {
                              ...exam.resultRule,
                              waitlistCapacity: event.target.value
                                ? Number(event.target.value)
                                : null,
                            },
                          })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Tie breakers"
                        value={exam.resultRule.tieBreakerCodes.join(', ')}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateExam(examIndex, {
                            resultRule: {
                              ...exam.resultRule,
                              tieBreakerCodes: event.target.value
                                .split(',')
                                .map((value) => value.trim())
                                .filter(Boolean),
                            },
                          })
                        }
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : null}

            {editorTab === 4 ? (
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Slot templates</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        slotTemplates: [...current.slotTemplates, createSlot()],
                      }))
                    }
                  >
                    Add Slot Template
                  </Button>
                </Stack>
                {form.slotTemplates.map((slot, index) => (
                  <Paper
                    key={`${slot.code}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr)) auto' },
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Code"
                        value={slot.code}
                        disabled={readOnly}
                        onChange={(event) => updateSlot(index, { code: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Name"
                        value={slot.name}
                        disabled={readOnly}
                        onChange={(event) => updateSlot(index, { name: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Exam code"
                        value={slot.examDefinitionCode}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { examDefinitionCode: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        label="Room or hall"
                        value={slot.roomOrHall || ''}
                        disabled={readOnly}
                        onChange={(event) => updateSlot(index, { roomOrHall: event.target.value })}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Room number"
                        value={slot.roomNo}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { roomNo: Number(event.target.value) })
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Capacity"
                        value={slot.capacity}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { capacity: Number(event.target.value) })
                        }
                      />
                      <IconButton
                        aria-label="Remove slot template"
                        disabled={readOnly}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            slotTemplates: current.slotTemplates.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                      <TextField
                        size="small"
                        type="time"
                        label="Reporting"
                        InputLabelProps={{ shrink: true }}
                        value={slot.reportingTime.slice(0, 5)}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { reportingTime: event.target.value })
                        }
                      />
                      <TextField
                        size="small"
                        type="time"
                        label="Starts"
                        InputLabelProps={{ shrink: true }}
                        value={slot.startTime.slice(0, 5)}
                        disabled={readOnly}
                        onChange={(event) => updateSlot(index, { startTime: event.target.value })}
                      />
                      <TextField
                        size="small"
                        type="time"
                        label="Ends"
                        InputLabelProps={{ shrink: true }}
                        value={slot.endTime.slice(0, 5)}
                        disabled={readOnly}
                        onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Valid from"
                        InputLabelProps={{ shrink: true }}
                        value={slot.validFrom?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { validFrom: event.target.value || null })
                        }
                      />
                      <TextField
                        size="small"
                        type="date"
                        label="Valid to"
                        InputLabelProps={{ shrink: true }}
                        value={slot.validTo?.slice(0, 10) || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateSlot(index, { validTo: event.target.value || null })
                        }
                      />
                    </Box>
                  </Paper>
                ))}
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Auto-assignment rules</Typography>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    disabled={readOnly}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        assignmentRules: [...current.assignmentRules, createAssignmentRule()],
                      }))
                    }
                  >
                    Add Rule
                  </Button>
                </Stack>
                {form.assignmentRules.map((rule, index) => (
                  <Paper
                    key={`${rule.code}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 1 }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr)) auto' },
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Code"
                        value={rule.code}
                        disabled={readOnly}
                        onChange={(event) => updateRule(index, { code: event.target.value })}
                      />
                      <TextField
                        size="small"
                        label="Name"
                        value={rule.name}
                        disabled={readOnly}
                        onChange={(event) => updateRule(index, { name: event.target.value })}
                      />
                      <TextField
                        select
                        size="small"
                        label="Trigger"
                        value={rule.trigger}
                        disabled={readOnly}
                        onChange={(event) => updateRule(index, { trigger: event.target.value })}
                      >
                        <MenuItem value="ExamReady">Exam ready</MenuItem>
                        <MenuItem value="Interested">Interested</MenuItem>
                        <MenuItem value="ApplicantSelfSchedule">Applicant self-scheduling</MenuItem>
                      </TextField>
                      <FormControl size="small" disabled={readOnly}>
                        <InputLabel>Strategy</InputLabel>
                        <Select
                          label="Strategy"
                          value={rule.strategy}
                          onChange={(event) =>
                            updateRule(index, {
                              strategy: Number(
                                event.target.value
                              ) as AdmissionCrmSlotAssignmentStrategy,
                            })
                          }
                        >
                          {Object.entries(assignmentStrategyLabel).map(([value, label]) => (
                            <MenuItem key={value} value={Number(value)}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        type="number"
                        label="Priority"
                        value={rule.priority}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRule(index, { priority: Number(event.target.value) })
                        }
                      />
                      <TextField
                        size="small"
                        label="Slot template code"
                        value={rule.slotTemplateCode || ''}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateRule(index, { slotTemplateCode: event.target.value })
                        }
                      />
                      <IconButton
                        aria-label="Remove assignment rule"
                        disabled={readOnly}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            assignmentRules: current.assignmentRules.filter(
                              (_item, itemIndex) => itemIndex !== index
                            ),
                          }))
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)}>Close</Button>
          {!readOnly ? (
            <LoadingButton variant="contained" loading={isSaving} onClick={handleSave}>
              Save Draft
            </LoadingButton>
          ) : null}
        </DialogActions>
      </Dialog>
      {operationsPlaybook ? (
        <AdmissionsPlaybookOperations
          key={operationsPlaybook.id}
          playbook={operationsPlaybook}
          open
          onClose={() => setOperationsPlaybook(null)}
        />
      ) : null}
    </Paper>
  );
};

export default AdmissionsPlaybookConfiguration;
