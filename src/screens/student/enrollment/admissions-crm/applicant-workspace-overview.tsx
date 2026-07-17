'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmStaffLookupDto,
  AdmissionCrmFollowUpTaskDto,
  AdmissionCrmPipelineStageDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import {
  Box,
  Stack,
  Alert,
  Button,
  Dialog,
  Divider,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmLeadPriority,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmTasksQuery,
  useGetAdmissionCrmTimelineQuery,
  useCreateAdmissionCrmTaskMutation,
  useReopenAdmissionCrmLeadMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useArchiveAdmissionCrmLeadMutation,
  useCompleteAdmissionCrmTaskMutation,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import { getAdmissionCrmStageLabel, getAdmissionCrmChannelLabel } from './admissions-crm-utils';
import {
  formatEnrollmentDate,
  formatApplicantContact,
  joinEnrollmentMetadata,
  getApplicantUpdateError,
} from './enrollment-display';
import {
  ApplicantSection,
  ApplicantEmptyState,
  ApplicantActionPanel,
  ApplicantSummaryGrid,
  ApplicantSummaryItem,
  ApplicantInlineNotice,
} from './applicant-workspace-primitives';

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

const getStaffLabel = (staff: AdmissionCrmStaffLookupDto) =>
  joinEnrollmentMetadata(staff.displayName, staff.employeeCode, staff.email || undefined);

type GovernedAction = 'archive' | 'merge' | 'stage' | null;

type Props = {
  lead: AdmissionCrmLeadDto;
  academicYearId?: string;
  stages: AdmissionCrmPipelineStageDto[];
  slaDueAt: dayjs.Dayjs | null;
  refetchLead: () => Promise<unknown>;
};

export function ApplicantWorkspaceOverview({
  lead,
  academicYearId,
  stages,
  slaDueAt,
  refetchLead,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [ownerEditorOpen, setOwnerEditorOpen] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState('');
  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [priority, setPriority] = useState(lead.priority);
  const [announcement, setAnnouncement] = useState('');
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [note, setNote] = useState('');
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueAt, setTaskDueAt] = useState(() =>
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [taskNotes, setTaskNotes] = useState('');
  const [taskAssignee, setTaskAssignee] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [debouncedTaskSearch, setDebouncedTaskSearch] = useState('');
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [governedAction, setGovernedAction] = useState<GovernedAction>(null);
  const [stage, setStage] = useState<AdmissionInquiryStage>(lead.stage);
  const [stageReason, setStageReason] = useState('');
  const [archiveReason, setArchiveReason] = useState('');
  const [duplicateLeadId, setDuplicateLeadId] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [completionTask, setCompletionTask] = useState<AdmissionCrmFollowUpTaskDto | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const can = (permission: string) => hasGrantedPermission(permissions, permission);
  const allowedStages = useMemo(
    () => stages.find((item) => item.systemStage === lead.stage)?.allowedNextStages ?? [],
    [lead.stage, stages]
  );

  const tasksQuery = useGetAdmissionCrmTasksQuery({ leadId: lead.id, maxResultCount: 50 });
  const timelineQuery = useGetAdmissionCrmTimelineQuery({
    leadId: lead.id,
    maxResultCount: 50,
    sorting: 'OccurredAt DESC',
  });
  const ownerStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedOwnerSearch || undefined,
      ids: lead.ownerUserId || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !ownerEditorOpen && !lead.ownerUserId }
  );
  const taskStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedTaskSearch || undefined,
      ids: taskAssignee?.id || undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !taskFormOpen }
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

  useEffect(() => setPriority(lead.priority), [lead.id, lead.priority]);
  useEffect(() => {
    const nextStage = allowedStages[0] ?? lead.stage;
    setStage(nextStage);
  }, [allowedStages, lead.stage]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedOwnerSearch(ownerSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [ownerSearch]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTaskSearch(taskSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [taskSearch]);
  useEffect(() => {
    const selectedOwner = ownerStaffQuery.data?.find((staff) => staff.id === lead.ownerUserId);
    if (selectedOwner) setOwner(selectedOwner);
    else if (!lead.ownerUserId) setOwner(null);
  }, [lead.ownerUserId, ownerStaffQuery.data]);

  const hasUnsavedOverviewInput = Boolean(
    (noteFormOpen && note.trim()) ||
    (taskFormOpen && (taskTitle.trim() || taskNotes.trim() || taskAssignee)) ||
    stageReason.trim() ||
    archiveReason.trim() ||
    mergeReason.trim() ||
    completionNotes.trim()
  );
  useApplicantWorkspaceDirtyState(`applicant-overview-${lead.id}`, hasUnsavedOverviewInput);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      setAnnouncement(success);
      shikshaMitraToast.success({ message: success });
      await refetchLead();
      return true;
    } catch {
      shikshaMitraToast.error({ message: getApplicantUpdateError('The change was not saved.') });
      return false;
    }
  };

  const saveOwner = async (nextOwner: AdmissionCrmStaffLookupDto | null) => {
    const previousOwner = owner;
    setOwner(nextOwner);
    const saved = await run(
      () => assignOwner({ leadId: lead.id, body: { ownerUserId: nextOwner?.id || null } }).unwrap(),
      'Lead owner updated.'
    );
    if (!saved) setOwner(previousOwner);
  };

  const savePriority = async (nextPriority: AdmissionCrmLeadPriority) => {
    const previousPriority = priority;
    setPriority(nextPriority);
    const saved = await run(
      () => changePriority({ leadId: lead.id, body: { priority: nextPriority } }).unwrap(),
      'Lead priority updated.'
    );
    if (!saved) setPriority(previousPriority);
  };

  const openTasks = useMemo(
    () =>
      [...(tasksQuery.data?.items || [])]
        .filter((task) => task.status === 1)
        .sort((first, second) => dayjs(first.dueAt).valueOf() - dayjs(second.dueAt).valueOf()),
    [tasksQuery.data?.items]
  );
  const visibleTasks = showAllTasks ? openTasks : openTasks.slice(0, 3);
  const timelineEvents = timelineQuery.data?.items || [];
  const visibleTimeline = showAllTimeline ? timelineEvents : timelineEvents.slice(0, 5);

  const closeActionDialog = () => {
    setGovernedAction(null);
    setStageReason('');
    setArchiveReason('');
    setMergeReason('');
    setDuplicateLeadId('');
  };

  return (
    <Stack spacing={2.25}>
      <Box
        aria-live="polite"
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      >
        {announcement}
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        gap={1}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            Next action
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {getNextAction(lead.stage)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Current stage: {getAdmissionCrmStageLabel(lead.stage)}
          </Typography>
        </Box>
        <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
          {lead.likelyDuplicates.length > 0 && can(permissionsByAction.mergeDuplicate) ? (
            <Button
              size="small"
              color="warning"
              variant="outlined"
              startIcon={<Iconify icon="solar:copy-bold-duotone" />}
              onClick={() => setGovernedAction('merge')}
            >
              Review {lead.likelyDuplicates.length} duplicate
              {lead.likelyDuplicates.length === 1 ? '' : 's'}
            </Button>
          ) : null}
          <ThreeDotsActions
            placement="bottom-right"
            moreLabel="More applicant actions"
            actions={({ popover }) => (
              <MenuList dense>
                {can(permissionsByAction.changeStage) && allowedStages.length > 0 ? (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setGovernedAction('stage');
                    }}
                  >
                    <Iconify icon="solar:transfer-horizontal-bold-duotone" />
                    Move stage
                  </MenuItem>
                ) : null}
                <MenuItem
                  onClick={async () => {
                    popover.onClose();
                    await run(
                      () => recalculateScore({ leadId: lead.id }).unwrap(),
                      'Lead score recalculated.'
                    );
                  }}
                >
                  <Iconify icon="solar:refresh-circle-bold-duotone" />
                  Recalculate score
                </MenuItem>
                {can(permissionsByAction.archiveReopen) ? (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setGovernedAction('archive');
                    }}
                  >
                    <Iconify
                      icon={lead.archivedAt ? 'solar:restart-bold' : 'solar:archive-bold-duotone'}
                    />
                    {lead.archivedAt ? 'Reopen inquiry' : 'Archive inquiry'}
                  </MenuItem>
                ) : null}
              </MenuList>
            )}
          />
        </Stack>
      </Stack>

      {slaDueAt?.isBefore(dayjs()) ? (
        <Alert severity="warning" variant="outlined">
          Follow-up SLA was due {formatEnrollmentDate(slaDueAt.toDate(), true)}.
        </Alert>
      ) : null}

      <ApplicantSection title="Applicant summary">
        <ApplicantSummaryGrid>
          <ApplicantSummaryItem label="Admission intent" value={lead.admissionIntent} />
          <ApplicantSummaryItem label="Class" value={lead.desiredClassName || 'Not captured'} />
          <ApplicantSummaryItem
            label="Contact"
            value={formatApplicantContact(lead.primaryContactNo, lead.email)}
            secondary={lead.parentGuardianName || undefined}
          />
          <ApplicantSummaryItem
            label="Source"
            value={lead.inquirySourceSnapshot || getAdmissionCrmChannelLabel(lead.channel)}
            secondary={lead.campaignName || undefined}
          />
          <ApplicantSummaryItem
            label="Owner"
            value={lead.ownerUserId ? owner?.displayName || 'Assigned' : 'Unassigned'}
          />
          <ApplicantSummaryItem label="Lead score" value={lead.leadScore.toString()} />
          <ApplicantSummaryItem
            label="SLA"
            value={
              slaDueAt
                ? `${slaDueAt.isBefore(dayjs()) ? 'Overdue' : 'Due'} ${formatEnrollmentDate(
                    slaDueAt.toDate(),
                    true
                  )}`
                : 'No SLA configured'
            }
          />
          <ApplicantSummaryItem label="Priority" value={priorityLabels[priority]} />
        </ApplicantSummaryGrid>
      </ApplicantSection>

      {(can(permissionsByAction.assignOwner) || can(permissionsByAction.setPriority)) && (
        <ApplicantSection
          title="Ownership"
          description="Changes save as soon as a value is selected."
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 1.25,
            }}
          >
            {can(permissionsByAction.assignOwner) ? (
              <Autocomplete
                fullWidth
                open={ownerEditorOpen}
                onOpen={() => setOwnerEditorOpen(true)}
                onClose={() => setOwnerEditorOpen(false)}
                options={ownerStaffQuery.data || []}
                value={owner}
                loading={ownerStaffQuery.isFetching || assignOwnerState.isLoading}
                inputValue={ownerSearch}
                onInputChange={(_, value, reason) => {
                  if (reason !== 'reset') setOwnerSearch(value);
                }}
                onChange={(_, value) => {
                  saveOwner(value);
                }}
                getOptionLabel={getStaffLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Lead owner"
                    placeholder={lead.ownerUserId ? 'Assigned owner' : 'Search staff'}
                  />
                )}
              />
            ) : null}
            {can(permissionsByAction.setPriority) ? (
              <TextField
                select
                size="small"
                fullWidth
                label="Priority"
                value={priority}
                disabled={changePriorityState.isLoading}
                onChange={(event) => {
                  savePriority(Number(event.target.value));
                }}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
          </Box>
        </ApplicantSection>
      )}

      <Divider />
      <ApplicantSection
        title="Follow-up"
        description={`${openTasks.length} open task${openTasks.length === 1 ? '' : 's'}`}
        action={
          <Stack direction="row" gap={0.75}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:notes-bold-duotone" />}
              onClick={() => {
                setTaskFormOpen(false);
                setNoteFormOpen((open) => !open);
              }}
            >
              Add note
            </Button>
            {can(permissionsByAction.manageTasks) ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="solar:checklist-minimalistic-bold-duotone" />}
                onClick={() => {
                  setNoteFormOpen(false);
                  setTaskFormOpen((open) => !open);
                }}
              >
                New task
              </Button>
            ) : null}
          </Stack>
        }
      >
        {noteFormOpen ? (
          <ApplicantActionPanel>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Add a timeline note</Typography>
              <TextField
                autoFocus
                label="Note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                multiline
                minRows={2}
              />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  onClick={() => {
                    setNote('');
                    setNoteFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={addNoteState.isLoading}
                  disabled={!note.trim()}
                  onClick={async () => {
                    const saved = await run(
                      () => addNote({ leadId: lead.id, body: { note: note.trim() } }).unwrap(),
                      'Note added.'
                    );
                    if (saved) {
                      setNote('');
                      setNoteFormOpen(false);
                      await timelineQuery.refetch();
                    }
                  }}
                >
                  Add note
                </LoadingButton>
              </Stack>
            </Stack>
          </ApplicantActionPanel>
        ) : null}

        {taskFormOpen ? (
          <ApplicantActionPanel>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Create follow-up task</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(180px, 0.7fr)' },
                  gap: 1,
                }}
              >
                <TextField
                  autoFocus
                  size="small"
                  label="Task title"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                />
                <TextField
                  size="small"
                  label="Due date"
                  type="datetime-local"
                  value={taskDueAt}
                  onChange={(event) => setTaskDueAt(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Autocomplete
                options={taskStaffQuery.data || []}
                value={taskAssignee}
                loading={taskStaffQuery.isFetching}
                inputValue={taskSearch}
                onInputChange={(_, value, reason) => {
                  if (reason !== 'reset') setTaskSearch(value);
                }}
                onChange={(_, value) => setTaskAssignee(value)}
                getOptionLabel={getStaffLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} size="small" label="Assignee" placeholder="Search staff" />
                )}
              />
              <TextField
                size="small"
                label="Task notes"
                value={taskNotes}
                onChange={(event) => setTaskNotes(event.target.value)}
                multiline
                minRows={2}
              />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  onClick={() => {
                    setTaskTitle('');
                    setTaskNotes('');
                    setTaskAssignee(null);
                    setTaskFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="small"
                  variant="contained"
                  loading={createTaskState.isLoading}
                  disabled={!taskTitle.trim() || !taskDueAt}
                  onClick={async () => {
                    const saved = await run(
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
                    );
                    if (saved) {
                      setTaskTitle('');
                      setTaskNotes('');
                      setTaskAssignee(null);
                      setTaskFormOpen(false);
                      await tasksQuery.refetch();
                    }
                  }}
                >
                  Create task
                </LoadingButton>
              </Stack>
            </Stack>
          </ApplicantActionPanel>
        ) : null}

        {tasksQuery.isFetching ? <LinearProgress aria-label="Loading follow-up tasks" /> : null}
        <Stack divider={<Divider flexItem />}>
          {visibleTasks.map((task) => (
            <Stack
              key={task.id}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
              gap={1}
              py={1}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due {formatEnrollmentDate(task.dueAt, true)}
                  {task.notes ? ` | ${task.notes}` : ''}
                </Typography>
              </Box>
              {can(permissionsByAction.manageTasks) ? (
                <Button size="small" variant="text" onClick={() => setCompletionTask(task)}>
                  Complete
                </Button>
              ) : null}
            </Stack>
          ))}
        </Stack>
        {!tasksQuery.isFetching && openTasks.length === 0 ? (
          <ApplicantEmptyState
            title="No open follow-up tasks"
            description="Create a task when this applicant needs a timed follow-up."
          />
        ) : null}
        {openTasks.length > 3 ? (
          <Button size="small" onClick={() => setShowAllTasks((current) => !current)}>
            {showAllTasks ? 'Show fewer tasks' : `Show ${openTasks.length - 3} more tasks`}
          </Button>
        ) : null}
      </ApplicantSection>

      <Divider />
      <ApplicantSection title="Recent activity">
        {timelineQuery.isFetching ? (
          <LinearProgress aria-label="Loading applicant timeline" />
        ) : null}
        <Stack divider={<Divider flexItem />}>
          {visibleTimeline.map((event) => (
            <Box key={event.id} py={1}>
              <Typography variant="body2" fontWeight={600}>
                {event.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatEnrollmentDate(event.occurredAt, true)}
              </Typography>
              {event.details ? <Typography variant="body2">{event.details}</Typography> : null}
            </Box>
          ))}
        </Stack>
        {!timelineQuery.isFetching && timelineEvents.length === 0 ? (
          <ApplicantInlineNotice>
            No applicant activity has been recorded yet.
          </ApplicantInlineNotice>
        ) : null}
        {timelineEvents.length > 5 ? (
          <Button size="small" onClick={() => setShowAllTimeline((current) => !current)}>
            {showAllTimeline ? 'Show recent activity only' : 'Show all loaded activity'}
          </Button>
        ) : null}
      </ApplicantSection>

      <Dialog open={governedAction === 'stage'} onClose={closeActionDialog} fullWidth maxWidth="xs">
        <DialogTitle>Move pipeline stage</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={0.5}>
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
              autoFocus
              required
              label="Reason"
              value={stageReason}
              onChange={(event) => setStageReason(event.target.value)}
              multiline
              minRows={2}
              helperText="This reason is added to the applicant audit history."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={changeStageState.isLoading}
            disabled={!allowedStages.includes(stage) || !stageReason.trim()}
            onClick={async () => {
              const saved = await run(
                () =>
                  changeStage({
                    leadId: lead.id,
                    body: { stage, reason: stageReason.trim() },
                  }).unwrap(),
                'Pipeline stage updated.'
              );
              if (saved) closeActionDialog();
            }}
          >
            Move stage
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={governedAction === 'merge'} onClose={closeActionDialog} fullWidth maxWidth="xs">
        <DialogTitle>Review duplicate inquiries</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={0.5}>
            <ApplicantInlineNotice tone="warning">
              Merging combines this inquiry with another record and cannot be undone here.
            </ApplicantInlineNotice>
            <TextField
              select
              fullWidth
              label="Duplicate inquiry"
              value={duplicateLeadId}
              onChange={(event) => setDuplicateLeadId(event.target.value)}
            >
              {lead.likelyDuplicates.map((duplicate) => (
                <MenuItem key={duplicate.leadId} value={duplicate.leadId}>
                  {joinEnrollmentMetadata(
                    [duplicate.firstName, duplicate.lastName].filter(Boolean).join(' ') ||
                      'Unnamed inquiry',
                    duplicate.matchReason
                  )}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              label="Merge reason"
              value={mergeReason}
              onChange={(event) => setMergeReason(event.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <LoadingButton
            color="warning"
            variant="contained"
            loading={mergeState.isLoading}
            disabled={!duplicateLeadId || !mergeReason.trim()}
            onClick={async () => {
              const saved = await run(
                () =>
                  mergeDuplicate({
                    leadId: lead.id,
                    body: { duplicateLeadId, reason: mergeReason.trim() },
                  }).unwrap(),
                'Duplicate inquiry merged.'
              );
              if (saved) closeActionDialog();
            }}
          >
            Merge inquiries
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={governedAction === 'archive'}
        onClose={closeActionDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{lead.archivedAt ? 'Reopen inquiry' : 'Archive inquiry'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={0.5}>
            <ApplicantInlineNotice tone={lead.archivedAt ? 'neutral' : 'warning'}>
              {lead.archivedAt
                ? 'Reopening returns this inquiry to active admissions work.'
                : 'Archived inquiries leave active queues but retain their full history.'}
            </ApplicantInlineNotice>
            <TextField
              autoFocus
              required
              label={lead.archivedAt ? 'Reopen reason' : 'Archive reason'}
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <LoadingButton
            color={lead.archivedAt ? 'primary' : 'warning'}
            variant="contained"
            loading={archiveState.isLoading || reopenState.isLoading}
            disabled={!archiveReason.trim()}
            onClick={async () => {
              const saved = await run(
                () =>
                  lead.archivedAt
                    ? reopenLead({
                        leadId: lead.id,
                        body: { reason: archiveReason.trim() },
                      }).unwrap()
                    : archiveLead({
                        leadId: lead.id,
                        body: { reason: archiveReason.trim() },
                      }).unwrap(),
                lead.archivedAt ? 'Inquiry reopened.' : 'Inquiry archived.'
              );
              if (saved) closeActionDialog();
            }}
          >
            {lead.archivedAt ? 'Reopen inquiry' : 'Archive inquiry'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(completionTask)}
        onClose={() => {
          setCompletionTask(null);
          setCompletionNotes('');
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Complete follow-up task</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={0.5}>
            <Typography variant="body2">{completionTask?.title}</Typography>
            <TextField
              autoFocus
              label="Completion note (optional)"
              value={completionNotes}
              onChange={(event) => setCompletionNotes(event.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCompletionTask(null);
              setCompletionNotes('');
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            loading={completeTaskState.isLoading}
            onClick={async () => {
              if (!completionTask) return;
              const saved = await run(
                () =>
                  completeTask({
                    taskId: completionTask.id,
                    body: { completionNotes: completionNotes.trim() || undefined },
                  }).unwrap(),
                'Task completed.'
              );
              if (saved) {
                setCompletionTask(null);
                setCompletionNotes('');
                await tasksQuery.refetch();
              }
            }}
          >
            Complete task
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
