'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionCrmPipelineStageDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmStaffLookupDto,
  AdmissionCrmFollowUpTaskDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { AdmissionInquiryStage } from 'src/redux/student/admissions-crm/core-leads-contracts';
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
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmTasksQuery,
  useCreateAdmissionCrmTaskMutation,
  useReopenAdmissionCrmLeadMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useArchiveAdmissionCrmLeadMutation,
  useCompleteAdmissionCrmTaskMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { getAdmissionCrmStageLabel } from './admissions-crm-utils';
import { useApplicantWorkspaceDirtyState } from './applicant-workspace-dirty-context';
import {
  formatEnrollmentDate,
  joinEnrollmentMetadata,
  getApplicantUpdateError,
} from './enrollment-display';
import {
  ApplicantSection,
  ApplicantEmptyState,
  ApplicantActionPanel,
  ApplicantInlineNotice,
} from './applicant-workspace-primitives';

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';
const permissionsByAction = {
  changeStage: `${permissionRoot}.ChangeStage`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  mergeDuplicate: `${permissionRoot}.MergeDuplicate`,
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
  const taskStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedTaskSearch || undefined,
      ids: taskAssignee?.id || undefined,
      maxResultCount: 25,
      academicYearId,
    },
    { skip: !taskFormOpen }
  );

  const [changeStage, changeStageState] = useChangeAdmissionCrmLeadStageMutation();
  const [addNote, addNoteState] = useAddAdmissionCrmLeadNoteMutation();
  const [createTask, createTaskState] = useCreateAdmissionCrmTaskMutation();
  const [completeTask, completeTaskState] = useCompleteAdmissionCrmTaskMutation();
  const [archiveLead, archiveState] = useArchiveAdmissionCrmLeadMutation();
  const [reopenLead, reopenState] = useReopenAdmissionCrmLeadMutation();
  const [recalculateScore, recalculateState] = useRecalculateAdmissionCrmLeadScoreMutation();
  const [mergeDuplicate, mergeState] = useMergeAdmissionCrmDuplicateLeadMutation();

  useEffect(() => {
    const nextStage = allowedStages[0] ?? lead.stage;
    setStage(nextStage);
  }, [allowedStages, lead.stage]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTaskSearch(taskSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [taskSearch]);

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

  const openTasks = useMemo(
    () =>
      [...(tasksQuery.data?.items || [])]
        .filter((task) => task.status === 1)
        .sort((first, second) => dayjs(first.dueAt).valueOf() - dayjs(second.dueAt).valueOf()),
    [tasksQuery.data?.items]
  );
  const visibleTasks = showAllTasks ? openTasks : openTasks.slice(0, 3);

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
          <Typography variant="h6">Inquiry & Follow-up</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inquiry communication, follow-ups, and governed lead actions.
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

      <Divider />
      <ApplicantSection
        title="Follow-up"
        description={`${openTasks.length} open task${openTasks.length === 1 ? '' : 's'}`}
        action={
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="solar:notes-bold-duotone" />}
              sx={{ minHeight: { xs: 44, md: 'unset' } }}
              onClick={() => {
                setTaskFormOpen(false);
                setNoteFormOpen((open) => !open);
              }}
            >
              Add Note
            </Button>
            {can(permissionsByAction.manageTasks) ? (
              <Button
                size="small"
                color="primary"
                variant="contained"
                startIcon={<Iconify icon="solar:checklist-minimalistic-bold-duotone" />}
                sx={{ minHeight: { xs: 44, md: 'unset' } }}
                onClick={() => {
                  setNoteFormOpen(false);
                  setTaskFormOpen((open) => !open);
                }}
              >
                Schedule Follow-Up
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
                    }
                  }}
                >
                  Add Note
                </LoadingButton>
              </Stack>
            </Stack>
          </ApplicantActionPanel>
        ) : null}

        {taskFormOpen ? (
          <ApplicantActionPanel>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Schedule a follow-up</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(180px, 0.7fr)' },
                  gap: 1,
                }}
              >
                <TextField
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
                  <TextField
                    {...params}
                    size="small"
                    label="Assignee"
                    placeholder="Search staff…"
                  />
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
