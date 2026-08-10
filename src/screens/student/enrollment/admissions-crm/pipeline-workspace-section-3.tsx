'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Alert,
  Stack,
  Button,
  Dialog,
  Select,
  Checkbox,
  MenuItem,
  TextField,
  InputLabel,
  DialogTitle,
  FormControl,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { ApplicantExamSchedulingDialog } from './applicant-exam-scheduling-dialog';

import { usePipelineWorkspaceWorkspace } from './pipeline-workspace-context';

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';

const actionPermissions = {
  add: `${permissionRoot}.Add`,
  assignOwner: `${permissionRoot}.AssignOwner`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  changeStage: `${permissionRoot}.ChangeStage`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  scheduleExam: `${permissionRoot}.ScheduleExam`,
  issueRegistrationForm: `${permissionRoot}.IssueRegistrationForm`,
  overrideExamCapacity: `${permissionRoot}.OverrideExamCapacity`,
  manageConfiguration: `${permissionRoot}.ManageConfiguration`,
};

export function PipelineWorkspaceSection3() {
  const { state: controllerState, actions, meta } = usePipelineWorkspaceWorkspace();
  const {
    academicYearId,
    bulkAction,
    bulkArchiveLeadsState,
    bulkAssignOwnersState,
    bulkChangeStagesState,
    bulkCreateTasksState,
    bulkDueAt,
    bulkOwner,
    bulkReason,
    bulkStage,
    bulkTitle,
    can,
    handleBulkAction,
    overrideProtectedStages,
    ownerStaffQuery,
    protectedSelectedLeads,
    refreshBoardData,
    scheduleLead,
    selectedLeadIds,
    setBulkAction,
    setBulkDueAt,
    setBulkOwner,
    setBulkReason,
    setBulkStage,
    setBulkTitle,
    setOverrideProtectedStages,
    setScheduleLead,
    setStaffSearch,
    staffSearch,
    stages,
    taskStaffQuery,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <ApplicantExamSchedulingDialog
        lead={scheduleLead}
        academicYearId={academicYearId}
        canOverrideCapacity={can(actionPermissions.overrideExamCapacity)}
        onClose={() => setScheduleLead(null)}
        onScheduled={refreshBoardData}
      />
      <Dialog
        open={Boolean(bulkAction)}
        onClose={() => setBulkAction(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Bulk{' '}
          {bulkAction === 'owner'
            ? 'Owner Assignment'
            : bulkAction === 'task'
              ? 'Task Creation'
              : bulkAction === 'stage'
                ? 'Stage Change'
                : 'Archive'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">{selectedLeadIds.length} selected inquiries</Alert>
            {(bulkAction === 'owner' || bulkAction === 'task') && (
              <Autocomplete
                options={
                  bulkAction === 'owner' ? ownerStaffQuery.data || [] : taskStaffQuery.data || []
                }
                value={bulkOwner}
                inputValue={staffSearch}
                onInputChange={(_, value) => setStaffSearch(value)}
                onChange={(_, value) => setBulkOwner(value)}
                getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={
                  bulkAction === 'owner' ? ownerStaffQuery.isFetching : taskStaffQuery.isFetching
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={bulkAction === 'owner' ? 'New owner' : 'Task assignee'}
                  />
                )}
              />
            )}
            {bulkAction === 'task' && (
              <>
                <TextField
                  required
                  label="Task title"
                  value={bulkTitle}
                  onChange={(event) => setBulkTitle(event.target.value)}
                />
                <TextField
                  label="Due date"
                  type="datetime-local"
                  value={bulkDueAt}
                  onChange={(event) => setBulkDueAt(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
            {bulkAction === 'stage' && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="pipeline-bulk-stage-label">Stage</InputLabel>
                  <Select
                    labelId="pipeline-bulk-stage-label"
                    label="Stage"
                    value={bulkStage}
                    onChange={(event) => setBulkStage(Number(event.target.value))}
                  >
                    {stages.map((stageItem) => (
                      <MenuItem key={stageItem.id} value={stageItem.systemStage}>
                        {stageItem.stageName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {protectedSelectedLeads.length ? (
                  <Alert severity={overrideProtectedStages ? 'warning' : 'error'}>
                    {protectedSelectedLeads.length} selected applicant
                    {protectedSelectedLeads.length === 1 ? '' : 's'} are in protected workflow
                    stages. Remove them before applying, or choose override with an audit reason.
                  </Alert>
                ) : null}
                {protectedSelectedLeads.length ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={overrideProtectedStages}
                        onChange={(event) => setOverrideProtectedStages(event.target.checked)}
                      />
                    }
                    label="Override protected stage guardrails"
                  />
                ) : null}
              </>
            )}
            {(bulkAction === 'stage' || bulkAction === 'archive') && (
              <TextField
                required
                label="Reason"
                value={bulkReason}
                onChange={(event) => setBulkReason(event.target.value)}
                multiline
                minRows={2}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAction(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            disabled={
              bulkAction === 'stage' &&
              protectedSelectedLeads.length > 0 &&
              !overrideProtectedStages
            }
            loading={
              bulkAssignOwnersState.isLoading ||
              bulkCreateTasksState.isLoading ||
              bulkChangeStagesState.isLoading ||
              bulkArchiveLeadsState.isLoading
            }
            onClick={handleBulkAction}
          >
            Apply
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
