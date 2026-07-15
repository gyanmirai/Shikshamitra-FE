'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionCrmStaffLookupDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmLeadPriority,
  useGetAdmissionCrmLeadQuery,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmTasksQuery,
  useGetAdmissionCrmTimelineQuery,
  useCreateAdmissionCrmTaskMutation,
  useReopenAdmissionCrmLeadMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useArchiveAdmissionCrmLeadMutation,
  useCompleteAdmissionCrmTaskMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import {
  getAdmissionCrmLeadName,
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
} from './admissions-crm-utils';

const ApplicantRegistrationOperations = dynamic(() =>
  import('./applicant-registration-operations').then(
    (module) => module.ApplicantRegistrationOperations
  )
);
const ApplicantFinalAdmissionOperations = dynamic(() =>
  import('./applicant-final-admission-operations').then(
    (module) => module.ApplicantFinalAdmissionOperations
  )
);
const ApplicantActivationOperations = dynamic(() =>
  import('./applicant-activation-operations').then((module) => module.ApplicantActivationOperations)
);
const ApplicantFinancialReadiness = dynamic(() =>
  import('./applicant-financial-readiness').then((module) => module.ApplicantFinancialReadiness)
);
const ApplicantRouteOperations = dynamic(() =>
  import('./applicant-route-operations').then((module) => module.ApplicantRouteOperations)
);
const ApplicantPolicyReadiness = dynamic(() =>
  import('./applicant-policy-readiness').then((module) => module.ApplicantPolicyReadiness)
);
const ApplicantHouseholdIdentityOperations = dynamic(() =>
  import('./applicant-household-identity-operations').then(
    (module) => module.ApplicantHouseholdIdentityOperations
  )
);
const GeneratedDocumentOperations = dynamic(() =>
  import('./generated-document-operations').then((module) => module.GeneratedDocumentOperations)
);
const ApplicantExamSummary = dynamic(() =>
  import('./applicant-exam-summary').then((module) => module.ApplicantExamSummary)
);

export type ApplicantDrawerTab =
  | 'overview'
  | 'exam'
  | 'registration'
  | 'offer'
  | 'activation'
  | 'governance';

type Props = {
  leadId?: string;
  academicYearId?: string;
  initialTab?: ApplicantDrawerTab;
  onTabChange?: (tab: ApplicantDrawerTab) => void;
  onClose: () => void;
};

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';
const permissionsByAction = {
  assignOwner: `${permissionRoot}.AssignOwner`,
  setPriority: `${permissionRoot}.SetPriority`,
  changeStage: `${permissionRoot}.ChangeStage`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  mergeDuplicate: `${permissionRoot}.MergeDuplicate`,
};

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const taskStatusLabel = (status: number) => (status === 1 ? 'Open' : 'Completed');

const journeySteps = [
  'Inquiry',
  'Entrance Exam',
  'Eligibility',
  'Registration',
  'Offer',
  'Activation',
];

const getJourneyStep = (stage: AdmissionInquiryStage) => {
  if (stage === AdmissionInquiryStage.ExamReady || stage === AdmissionInquiryStage.ExamScheduled)
    return 1;
  if (
    stage === AdmissionInquiryStage.ExamCompleted ||
    stage === AdmissionInquiryStage.Waitlisted ||
    stage === AdmissionInquiryStage.Rejected
  )
    return 2;
  if (stage === AdmissionInquiryStage.Eligible) return 3;
  return 0;
};

const getNextAction = (stage: AdmissionInquiryStage) => {
  if (stage === AdmissionInquiryStage.NewInquiry) return 'Qualify the inquiry and plan follow-up.';
  if (stage === AdmissionInquiryStage.FollowUp) return 'Complete the next follow-up action.';
  if (stage === AdmissionInquiryStage.ExamReady) return 'Schedule an entrance exam slot.';
  if (stage === AdmissionInquiryStage.ExamScheduled) return 'Record attendance and exam result.';
  if (stage === AdmissionInquiryStage.ExamCompleted) return 'Record the eligibility decision.';
  if (stage === AdmissionInquiryStage.Eligible) return 'Issue or review the registration form.';
  if (stage === AdmissionInquiryStage.Waitlisted)
    return 'Review waitlist priority and seat movement.';
  if (stage === AdmissionInquiryStage.Rejected) return 'No action unless the decision is reviewed.';
  if (stage === AdmissionInquiryStage.Stale) return 'Re-engage the family or archive the inquiry.';
  return 'Review the archived inquiry before reopening it.';
};

export function ApplicantWorkspaceDrawer({
  leadId,
  academicYearId,
  initialTab = 'overview',
  onTabChange,
  onClose,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [tab, setTab] = useState<ApplicantDrawerTab>(initialTab);
  const [staffSearch, setStaffSearch] = useState('');
  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [priority, setPriority] = useState<AdmissionCrmLeadPriority>(AdmissionCrmLeadPriority.None);
  const [stage, setStage] = useState<AdmissionInquiryStage>(AdmissionInquiryStage.FollowUp);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueAt, setTaskDueAt] = useState(() =>
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [taskAssignee, setTaskAssignee] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [duplicateLeadId, setDuplicateLeadId] = useState('');

  const leadQuery = useGetAdmissionCrmLeadQuery({ leadId: leadId || '' }, { skip: !leadId });
  const lead = leadQuery.data;
  const stagesQuery = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !leadId }
  );
  const tasksQuery = useGetAdmissionCrmTasksQuery(
    { leadId: leadId || '', maxResultCount: 50 },
    { skip: !leadId || tab !== 'overview' }
  );
  const timelineQuery = useGetAdmissionCrmTimelineQuery(
    { leadId: leadId || '', maxResultCount: 50, sorting: 'OccurredAt DESC' },
    { skip: !leadId || tab !== 'overview' }
  );
  const ownerStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: lead?.ownerUserId || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !leadId || tab !== 'overview' }
  );
  const taskStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: taskAssignee?.id || undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !leadId || tab !== 'overview' }
  );

  const [assignOwner, assignOwnerState] = useAssignAdmissionCrmLeadOwnerMutation();
  const [changePriority, changePriorityState] = useChangeAdmissionCrmLeadPriorityMutation();
  const [changeStage, changeStageState] = useChangeAdmissionCrmLeadStageMutation();
  const [addNote, addNoteState] = useAddAdmissionCrmLeadNoteMutation();
  const [createTask, createTaskState] = useCreateAdmissionCrmTaskMutation();
  const [completeTask, completeTaskState] = useCompleteAdmissionCrmTaskMutation();
  const [archiveLead, archiveState] = useArchiveAdmissionCrmLeadMutation();
  const [reopenLead, reopenState] = useReopenAdmissionCrmLeadMutation();
  const [recalculateScore, recalculateState] = useRecalculateAdmissionCrmLeadScoreMutation();
  const [mergeDuplicate, mergeState] = useMergeAdmissionCrmDuplicateLeadMutation();

  useEffect(() => setTab(initialTab), [initialTab, leadId]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedStaffSearch(staffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [staffSearch]);
  useEffect(() => {
    if (!lead) return;
    setPriority(lead.priority);
    const currentOwner =
      ownerStaffQuery.data?.find((staff) => staff.id === lead.ownerUserId) ?? null;
    setOwner(currentOwner);
    const currentStage = stagesQuery.data?.find((item) => item.systemStage === lead.stage);
    setStage(currentStage?.allowedNextStages[0] ?? lead.stage);
  }, [lead, ownerStaffQuery.data, stagesQuery.data]);

  const allowedStages = useMemo(() => {
    if (!lead) return [];
    const configured = stagesQuery.data?.find((item) => item.systemStage === lead.stage);
    return configured?.allowedNextStages ?? [];
  }, [lead, stagesQuery.data]);
  const currentStageConfiguration = useMemo(
    () => stagesQuery.data?.find((item) => item.systemStage === lead?.stage),
    [lead?.stage, stagesQuery.data]
  );
  const journeyStep = lead ? getJourneyStep(lead.stage) : 0;
  const slaDueAt =
    lead && currentStageConfiguration?.slaTargetHours
      ? dayjs(lead.lastActivityTime).add(currentStageConfiguration.slaTargetHours, 'hour')
      : null;

  const can = (permission: string) => hasGrantedPermission(permissions, permission);
  const requireReason = () => {
    if (reason.trim()) return true;
    shikshaMitraToast.error({ message: 'Enter a reason before applying this change.' });
    return false;
  };
  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
      setReason('');
      await leadQuery.refetch();
    } catch {
      shikshaMitraToast.error({
        message: 'The applicant could not be updated. Review the fields and retry.',
      });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(leadId)}
      onClose={onClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Applicant Workspace',
        sx: {
          width: { xs: '100%', md: 760 },
          maxWidth: '100%',
          overscrollBehavior: 'contain',
        },
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} p={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Applicant Workspace
            </Typography>
            <Typography variant="h6" component="h2" noWrap>
              {lead ? getAdmissionCrmLeadName(lead) : 'Loading applicant…'}
            </Typography>
            {lead && (
              <Stack direction="row" gap={0.75} flexWrap="wrap" mt={0.75}>
                <AdmissionCrmStageChip stage={lead.stage} />
                <Chip size="small" variant="outlined" label={`Score ${lead.leadScore}`} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={getAdmissionCrmChannelLabel(lead.channel)}
                />
              </Stack>
            )}
          </Box>
          <IconButton aria-label="Close applicant workspace" onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Stack>
        <Divider />
        <Tabs
          value={tab}
          onChange={(_, value: ApplicantDrawerTab) => {
            setTab(value);
            onTabChange?.(value);
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Applicant workspace sections"
          sx={{ px: 1 }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="exam" label="Entrance Exam" />
          <Tab value="registration" label="Registration" />
          <Tab value="offer" label="Offer & Seat" />
          <Tab value="activation" label="Activation" />
          <Tab value="governance" label="Governance" />
        </Tabs>
        <Divider />

        {lead ? (
          <Stack spacing={1} px={{ xs: 1.5, sm: 2 }} py={1.25} bgcolor="background.neutral">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              gap={0.75}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Next required action
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {getNextAction(lead.stage)}
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
                <Chip
                  size="small"
                  variant="outlined"
                  label={lead.ownerUserId ? 'Owner assigned' : 'Owner required'}
                  color={lead.ownerUserId ? 'default' : 'warning'}
                />
                {slaDueAt ? (
                  <Chip
                    size="small"
                    color={slaDueAt.isBefore(dayjs()) ? 'warning' : 'default'}
                    label={`${slaDueAt.isBefore(dayjs()) ? 'SLA overdue' : 'SLA due'} ${slaDueAt.format('DD MMM, HH:mm')}`}
                  />
                ) : null}
              </Stack>
            </Stack>
            <Box
              aria-label={`Admission journey: ${journeySteps[journeyStep]}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${journeySteps.length}, minmax(72px, 1fr))`,
                gap: 0.5,
                overflowX: 'auto',
                pb: 0.25,
              }}
            >
              {journeySteps.map((label, index) => (
                <Stack key={label} spacing={0.5} minWidth={72}>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 1,
                      bgcolor: index <= journeyStep ? 'primary.main' : 'divider',
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={index === journeyStep ? 'text.primary' : 'text.secondary'}
                    fontWeight={index === journeyStep ? 600 : 400}
                  >
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Stack>
        ) : null}
        <Divider />

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: { xs: 1.5, sm: 2 } }}>
          {leadQuery.isFetching && !lead && <LinearProgress aria-label="Loading applicant" />}
          {leadQuery.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => leadQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Applicant details are unavailable.
            </Alert>
          )}

          {lead && tab === 'overview' && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Admission Intent
                </Typography>
                <Typography variant="body2">{lead.admissionIntent}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead.desiredClassName || 'Class not captured'} ·{' '}
                  {lead.primaryContactNo || lead.email || 'Contact not captured'}
                </Typography>
              </Box>

              {(can(permissionsByAction.assignOwner) || can(permissionsByAction.setPriority)) && (
                <>
                  <Divider />
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                    {can(permissionsByAction.assignOwner) && (
                      <Autocomplete
                        fullWidth
                        options={ownerStaffQuery.data || []}
                        value={owner}
                        loading={ownerStaffQuery.isFetching}
                        inputValue={staffSearch}
                        onInputChange={(_, value) => setStaffSearch(value)}
                        onChange={(_, value) => setOwner(value)}
                        getOptionLabel={(option) =>
                          `${option.displayName} (${option.employeeCode})`
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Lead owner" />}
                      />
                    )}
                    {can(permissionsByAction.setPriority) && (
                      <TextField
                        select
                        fullWidth
                        label="Priority"
                        value={priority}
                        onChange={(event) => setPriority(Number(event.target.value))}
                      >
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <MenuItem key={value} value={Number(value)}>
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Stack>
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {can(permissionsByAction.assignOwner) && (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={assignOwnerState.isLoading}
                        onClick={() =>
                          run(
                            () =>
                              assignOwner({
                                leadId: lead.id,
                                body: { ownerUserId: owner?.id || null },
                              }).unwrap(),
                            'Lead owner updated.'
                          )
                        }
                      >
                        Save Owner
                      </LoadingButton>
                    )}
                    {can(permissionsByAction.setPriority) && (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={changePriorityState.isLoading}
                        onClick={() =>
                          run(
                            () =>
                              changePriority({
                                leadId: lead.id,
                                body: { priority, reason: reason.trim() || undefined },
                              }).unwrap(),
                            'Lead priority updated.'
                          )
                        }
                      >
                        Save Priority
                      </LoadingButton>
                    )}
                    <LoadingButton
                      size="small"
                      variant="text"
                      startIcon={<RefreshRounded />}
                      loading={recalculateState.isLoading}
                      onClick={() =>
                        run(
                          () => recalculateScore({ leadId: lead.id }).unwrap(),
                          'Lead score recalculated.'
                        )
                      }
                    >
                      Recalculate Score
                    </LoadingButton>
                  </Stack>
                </>
              )}

              {can(permissionsByAction.changeStage) && allowedStages.length > 0 && (
                <>
                  <Divider />
                  <Typography variant="subtitle2">Move Pipeline Stage</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                    <TextField
                      select
                      fullWidth
                      label="Next stage"
                      value={stage}
                      onChange={(event) => setStage(Number(event.target.value))}
                    >
                      {allowedStages.map((value) => (
                        <MenuItem key={value} value={value}>
                          {getAdmissionCrmStageLabel(value)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      required
                      label="Reason"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </Stack>
                  <LoadingButton
                    variant="outlined"
                    loading={changeStageState.isLoading}
                    disabled={!allowedStages.includes(stage)}
                    onClick={() => {
                      if (!requireReason()) return;
                      run(
                        () =>
                          changeStage({
                            leadId: lead.id,
                            body: { stage, reason: reason.trim() },
                          }).unwrap(),
                        'Pipeline stage updated.'
                      );
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Move Stage
                  </LoadingButton>
                </>
              )}

              <Divider />
              <Typography variant="subtitle2">Notes & Follow-up</Typography>
              <TextField
                label="Add note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                multiline
                minRows={2}
              />
              <LoadingButton
                variant="outlined"
                loading={addNoteState.isLoading}
                disabled={!note.trim()}
                onClick={() =>
                  run(
                    () => addNote({ leadId: lead.id, body: { note: note.trim() } }).unwrap(),
                    'Note added.'
                  ).then(() => setNote(''))
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Note
              </LoadingButton>

              {can(permissionsByAction.manageTasks) && (
                <Stack spacing={1.25}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                    <TextField
                      fullWidth
                      label="Task title"
                      value={taskTitle}
                      onChange={(event) => setTaskTitle(event.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Due date"
                      type="datetime-local"
                      value={taskDueAt}
                      onChange={(event) => setTaskDueAt(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                  <Autocomplete
                    options={taskStaffQuery.data || []}
                    value={taskAssignee}
                    onChange={(_, value) => setTaskAssignee(value)}
                    getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} label="Task assignee" />}
                  />
                  <TextField
                    label="Task notes"
                    value={taskNotes}
                    onChange={(event) => setTaskNotes(event.target.value)}
                    multiline
                    minRows={2}
                  />
                  <LoadingButton
                    variant="contained"
                    loading={createTaskState.isLoading}
                    disabled={!taskTitle.trim() || !taskDueAt}
                    onClick={() =>
                      run(
                        () =>
                          createTask({
                            leadId: lead.id,
                            body: {
                              title: taskTitle.trim(),
                              dueAt: dayjs(taskDueAt).toISOString(),
                              assignedUserId: taskAssignee?.id,
                              notes: taskNotes.trim() || undefined,
                            },
                          }).unwrap(),
                        'Follow-up task created.'
                      ).then(() => {
                        setTaskTitle('');
                        setTaskNotes('');
                      })
                    }
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Create Task
                  </LoadingButton>
                </Stack>
              )}

              <Stack spacing={1}>
                {(tasksQuery.data?.items || []).map((task) => (
                  <Box key={task.id} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(task.dueAt).format('DD MMM YYYY, HH:mm')} ·{' '}
                          {taskStatusLabel(task.status)}
                        </Typography>
                      </Box>
                      {task.status === 1 && can(permissionsByAction.manageTasks) && (
                        <Stack direction="row" gap={1} alignItems="center">
                          <TextField
                            size="small"
                            label="Completion note"
                            value={completionNotes[task.id] || ''}
                            onChange={(event) =>
                              setCompletionNotes((current) => ({
                                ...current,
                                [task.id]: event.target.value,
                              }))
                            }
                          />
                          <LoadingButton
                            size="small"
                            loading={completeTaskState.isLoading}
                            onClick={() =>
                              run(
                                () =>
                                  completeTask({
                                    taskId: task.id,
                                    body: {
                                      completionNotes: completionNotes[task.id] || undefined,
                                    },
                                  }).unwrap(),
                                'Task completed.'
                              )
                            }
                          >
                            Complete
                          </LoadingButton>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                ))}
                {!tasksQuery.isFetching && !tasksQuery.data?.items.length && (
                  <Typography variant="body2" color="text.secondary">
                    No follow-up tasks recorded.
                  </Typography>
                )}
              </Stack>

              {lead.likelyDuplicates.length > 0 && can(permissionsByAction.mergeDuplicate) && (
                <>
                  <Divider />
                  <Alert severity="warning">This inquiry has likely duplicate records.</Alert>
                  <TextField
                    select
                    label="Duplicate inquiry"
                    value={duplicateLeadId}
                    onChange={(event) => setDuplicateLeadId(event.target.value)}
                  >
                    {lead.likelyDuplicates.map((duplicate) => (
                      <MenuItem key={duplicate.leadId} value={duplicate.leadId}>
                        {[duplicate.firstName, duplicate.lastName].filter(Boolean).join(' ') ||
                          'Unnamed inquiry'}{' '}
                        · {duplicate.matchReason}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    required
                    label="Merge reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                  <LoadingButton
                    variant="outlined"
                    color="warning"
                    loading={mergeState.isLoading}
                    disabled={!duplicateLeadId}
                    onClick={() => {
                      if (!requireReason()) return;
                      run(
                        () =>
                          mergeDuplicate({
                            leadId: lead.id,
                            body: { duplicateLeadId, reason: reason.trim() },
                          }).unwrap(),
                        'Duplicate inquiry merged.'
                      );
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Merge Duplicate
                  </LoadingButton>
                </>
              )}

              {can(permissionsByAction.archiveReopen) && (
                <>
                  <Divider />
                  <Typography variant="subtitle2">Archive Control</Typography>
                  <TextField
                    required
                    label={lead.archivedAt ? 'Reopen reason' : 'Archive reason'}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    multiline
                    minRows={2}
                  />
                  <LoadingButton
                    color={lead.archivedAt ? 'primary' : 'warning'}
                    variant="outlined"
                    loading={archiveState.isLoading || reopenState.isLoading}
                    onClick={() => {
                      if (!requireReason()) return;
                      run(
                        () =>
                          lead.archivedAt
                            ? reopenLead({
                                leadId: lead.id,
                                body: { reason: reason.trim() },
                              }).unwrap()
                            : archiveLead({
                                leadId: lead.id,
                                body: { reason: reason.trim() },
                              }).unwrap(),
                        lead.archivedAt ? 'Inquiry reopened.' : 'Inquiry archived.'
                      );
                    }}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {lead.archivedAt ? 'Reopen Inquiry' : 'Archive Inquiry'}
                  </LoadingButton>
                </>
              )}

              <Divider />
              <Typography variant="subtitle2">Timeline</Typography>
              {timelineQuery.isFetching && (
                <LinearProgress aria-label="Loading applicant timeline" />
              )}
              <Stack spacing={1.25}>
                {(timelineQuery.data?.items || []).map((event) => (
                  <Box key={event.id} sx={{ borderLeft: 2, borderColor: 'divider', pl: 1.5 }}>
                    <Typography variant="subtitle2">{event.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(event.occurredAt).format('DD MMM YYYY, HH:mm')}
                    </Typography>
                    {event.details && <Typography variant="body2">{event.details}</Typography>}
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}

          {leadId && academicYearId && tab === 'registration' && (
            <Stack spacing={2}>
              <ApplicantRegistrationOperations leadId={leadId} academicYearId={academicYearId} />
              <GeneratedDocumentOperations leadId={leadId} />
            </Stack>
          )}
          {leadId && academicYearId && tab === 'exam' && (
            <ApplicantExamSummary leadId={leadId} academicYearId={academicYearId} />
          )}
          {leadId && academicYearId && tab === 'offer' && (
            <Stack spacing={2}>
              <ApplicantFinalAdmissionOperations leadId={leadId} academicYearId={academicYearId} />
              <ApplicantFinancialReadiness leadId={leadId} academicYearId={academicYearId} />
            </Stack>
          )}
          {leadId && academicYearId && tab === 'activation' && (
            <ApplicantActivationOperations leadId={leadId} academicYearId={academicYearId} />
          )}
          {leadId && academicYearId && tab === 'governance' && (
            <Stack spacing={2}>
              <ApplicantRouteOperations leadId={leadId} academicYearId={academicYearId} />
              <ApplicantPolicyReadiness leadId={leadId} academicYearId={academicYearId} />
              <ApplicantHouseholdIdentityOperations leadId={leadId} />
            </Stack>
          )}
        </Box>
      </Stack>
    </Drawer>
  );
}
