'use client';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Switch,
  Divider,
  MenuItem,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useRouter } from 'src/routes/hooks';
import { hrPaths } from 'src/constants/hr-menus';
import { PolicySetupAlert } from './PolicySetupAlert';

import {
  toLabel,
  formatRange,
  optionLabel,
  formatNumber,
  getErrorMessage,
} from '../hr-policy-workspace-utils';
import {
  DrawerField,
  DrawerHeader,
  SectionTable,
  DrawerFormGrid,
  DrawerSelectField,
} from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';
import type { PolicyAssignmentTargetType } from '../types/hr-policy-workspace.types';

function getLeavePolicyName(item: any): string {
  return item?.policyTitle || item?.name || item?.title || item?.id || '-';
}

// --- AssignmentPreviewPanel ----------------------------------------------------

function AssignmentPreviewPanel({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    assignmentForm,
    assignmentPreview,
    assignmentPreviewLoading,
    assignmentPreviewError,
    payroll = [],
    attendance = [],
    leavePolicies = [],
  } = ctx;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        p: 2,
        borderRadius: 1,
        bgcolor: (theme) => (theme.vars || theme).palette.background.neutral,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={700}>
            Assignment Preview
          </Typography>
          {assignmentPreviewLoading ? <Chip size="small" label="Resolving..." /> : null}
        </Stack>
        {assignmentPreviewError ? (
          <Alert severity="warning">
            {getErrorMessage(assignmentPreviewError, 'Could not resolve this assignment preview.')}
          </Alert>
        ) : null}
        <Box>
          <Typography variant="caption" color="text.secondary">
            This assignment applies to
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentForm.targetDisplayName || assignmentForm.targetKey || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {toLabel(assignmentForm.targetType)} -{' '}
            {formatRange(assignmentForm.effectiveFrom, assignmentForm.effectiveTo)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`Payroll: ${
              payroll.find((item) => item.id === assignmentForm.payrollPolicyId)?.name || '-'
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Attendance: ${
              attendance.find((item) => item.id === assignmentForm.attendancePolicyId)?.name || '-'
            }`}
            color="success"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Leave: ${
              getLeavePolicyName(
                leavePolicies.find((item: any) => item.id === assignmentForm.leavePolicyId)
              ) || '-'
            }`}
            color="info"
            variant="outlined"
          />
        </Stack>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Current effective policy
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentPreview?.policySource
              ? `${toLabel(assignmentPreview.policySource)} scope`
              : `${toLabel(assignmentForm.targetType)} scope`}
            {assignmentPreview?.matchedPriority != null
              ? ` - Priority ${assignmentPreview.matchedPriority}`
              : assignmentForm.priority
                ? ` - Priority ${assignmentForm.priority}`
                : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {assignmentPreview?.matchedTargetDisplayName ||
              assignmentPreview?.matchedTargetKey ||
              assignmentForm.targetDisplayName ||
              assignmentForm.targetKey ||
              'No matching scope selected yet'}
          </Typography>
        </Box>
        {assignmentPreview?.resolutionSteps?.length ? (
          <Box>
            <SectionTable columns={['Scope', 'Target', 'Status', 'Reason', 'Priority']}>
              {assignmentPreview.resolutionSteps.map((step, index) => (
                <TableRow key={`${step.source}-${step.targetKey || index}`} hover>
                  <TableCell>{toLabel(step.targetType || step.source)}</TableCell>
                  <TableCell>{step.targetDisplayName || step.targetKey || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={toLabel(step.status)}
                      color={step.status === 'matched' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{toLabel(step.skipReason)}</TableCell>
                  <TableCell>{step.priority ?? '-'}</TableCell>
                </TableRow>
              ))}
            </SectionTable>
          </Box>
        ) : null}
        <Divider />
        <Typography variant="caption" color="text.secondary">
          Precedence: Staff &gt; Group &gt; Default
        </Typography>
      </Stack>
    </Paper>
  );
}

// --- AssignmentTargetPicker ----------------------------------------------------

function AssignmentTargetPicker({
  ctx,
  disabled = false,
}: {
  ctx: HRPolicyWorkspaceContext;
  disabled?: boolean;
}) {
  const { assignmentForm, setAssignmentForm, employeeOptions, groupOptions } = ctx;

  const [getEmployees] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
  });

  const setTarget = (key: string, displayName?: string) => {
    setAssignmentForm((current) => ({
      ...current,
      targetKey: key,
      targetDisplayName: displayName || '',
    }));
  };

  const selectedEmployee = React.useMemo(() => {
    if (!assignmentForm.targetKey) return null;
    const found = employeeOptions.find((item) => item.id === assignmentForm.targetKey);
    if (found) return found;
    return {
      id: assignmentForm.targetKey,
      name: assignmentForm.targetDisplayName || assignmentForm.targetKey,
      label: assignmentForm.targetDisplayName || assignmentForm.targetKey,
    };
  }, [employeeOptions, assignmentForm.targetKey, assignmentForm.targetDisplayName]);

  if (assignmentForm.targetType === 'employee') {
    return (
      <DrawerField label="Staff *">
        <PaginatedSearchSelect
          label=""
          placeholder="Search staff..."
          fetchOptions={async (query, page) => {
            if (page > 1) return { data: [], hasMore: false };
            try {
              const res = await getEmployees({
                page: 1,
                pageSize: 500,
                search: query,
                status: EmployeeStatusType.Active,
              }).unwrap();
              const items = (Array.isArray(res) ? res : res?.items || []).map((item: any) => ({
                id: item.id,
                name: item.fullName || item.name || '',
                label: item.fullName || item.name || '',
              }));
              if (items.length > 0) {
                return { data: items, hasMore: false };
              }
            } catch {
              // fallback
            }
            const q = query.trim().toLowerCase();
            const fallback = employeeOptions.filter(
              (item) => !q || optionLabel(item).toLowerCase().includes(q)
            );
            return { data: fallback, hasMore: false };
          }}
          value={selectedEmployee}
          isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
          getOptionLabel={(option: any) => optionLabel(option)}
          renderOption={(props: any, option: any) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key || option.id} {...optionProps}>
                {optionLabel(option)}
              </li>
            );
          }}
          minChars={0}
          onChange={(_, value: any) => {
            setTarget(value?.id || '', optionLabel(value));
          }}
          debounceMs={400}
          disabled={disabled}
          size="small"
        />
      </DrawerField>
    );
  }

  return (
    <DrawerField label="Group *">
      <Autocomplete
        key="group-target-autocomplete"
        options={groupOptions}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={groupOptions.find((item) => item.id === assignmentForm.targetKey) || null}
        onChange={(_, value) => setTarget(value?.id || '', optionLabel(value))}
        disabled={disabled}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          return (
            <Box component="li" key={key || option.id} {...optionProps}>
              <Stack spacing={0} sx={{ minWidth: 0 }}>
                <Typography variant="body2">{optionLabel(option)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatNumber(option.employeeCount ?? option.memberCount ?? 0)} members
                </Typography>
              </Stack>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder="Select group..." />
        )}
      />
    </DrawerField>
  );
}

// --- AssignmentPolicyDrawer ----------------------------------------------------

export function AssignmentPolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    drawer,
    formError,
    assignmentForm,
    setAssignmentForm,
    assignmentConflict,
    assignmentDateError,
    setAssignmentDateError,
    setEmployeeLookupSearch,
    activePayroll = [],
    activeAttendance = [],
    activeLeavePolicies = [],
    leaveSetupState,
    canOpenLeavePolicies,
    academicYearId,
    activePolicyOperation,
    isPolicyOperationActive,
    createAssignmentState,
    updateAssignmentState,
    previewPolicyAssignmentImpactState,
    canAssignPolicy,
    canPreviewImpact,
    closeDrawer,
    saveAssignment,
    previewCurrentAssignmentImpact,
  } = ctx;

  const originalForm = React.useRef(JSON.stringify(assignmentForm));
  const router = useRouter();
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const openLeavePolicies = () => {
    if (!canOpenLeavePolicies || isPolicyOperationActive) return;
    if (drawer?.mode !== 'view' && originalForm.current !== JSON.stringify(assignmentForm)) {
      setConfirmDiscard(true);
      return;
    }
    closeDrawer();
    router.push(hrPaths.policies.leavePolicies);
  };

  if (!drawer || drawer.kind !== 'assignment') return null;
  const isViewMode = drawer.mode === 'view';
  const title =
    drawer.mode === 'view'
      ? 'View Assignment'
      : `${drawer.mode === 'edit' ? 'Edit' : 'New'} Assignment`;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        bgcolor: 'background.default',
      }}
    >
      <DrawerHeader
        title={title}
        helpText="Assign payroll, attendance, and leave policies to a staff member or group. Groups cover role, department, employment type, and mixed dynamic targeting."
        onClose={closeDrawer}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
        {formError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        ) : null}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
            <DrawerSelectField
              label="Target Type"
              value={assignmentForm.targetType}
              disabled={isViewMode}
              onChange={(event) => {
                setAssignmentForm((current) => ({
                  ...current,
                  targetType: event.target.value as PolicyAssignmentTargetType,
                  targetKey: '',
                  targetDisplayName: '',
                }));
                setEmployeeLookupSearch('');
              }}
            >
              <MenuItem value="employee">Staff</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </DrawerSelectField>
            <AssignmentTargetPicker ctx={ctx} disabled={isViewMode} />
            {!isViewMode ? (
              <PolicySetupAlert
                state={leaveSetupState}
                policy="leave"
                canOpen={canOpenLeavePolicies && !isPolicyOperationActive}
                onOpen={openLeavePolicies}
              />
            ) : null}
            <DrawerSelectField
              label="Payroll Policy *"
              value={assignmentForm.payrollPolicyId}
              disabled={isViewMode}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  payrollPolicyId: event.target.value,
                }))
              }
            >
              {activePayroll.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </DrawerSelectField>
            <DrawerSelectField
              label="Attendance Policy *"
              value={assignmentForm.attendancePolicyId}
              disabled={isViewMode}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  attendancePolicyId: event.target.value,
                }))
              }
            >
              {activeAttendance.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </DrawerSelectField>
            <DrawerSelectField
              label="Leave Policy *"
              value={assignmentForm.leavePolicyId}
              disabled={isViewMode}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  leavePolicyId: event.target.value,
                }))
              }
            >
              {activeLeavePolicies.map((item: any) => (
                <MenuItem key={item.id} value={item.id}>
                  {getLeavePolicyName(item)}
                </MenuItem>
              ))}
            </DrawerSelectField>
            <DrawerFormGrid>
              <DrawerField label="Effective From *">
                <DatePicker
                  value={assignmentForm.effectiveFrom ? dayjs(assignmentForm.effectiveFrom) : null}
                  onChange={(val) => {
                    setAssignmentDateError('');
                    setAssignmentForm((current) => ({
                      ...current,
                      effectiveFrom: val?.format('YYYY-MM-DD') || '',
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(assignmentDateError),
                      disabled: isViewMode,
                    },
                  }}
                />
              </DrawerField>
              <DrawerField
                label="Effective To (optional)"
                helperText={assignmentDateError || 'Leave blank for no end date.'}
              >
                <DatePicker
                  value={assignmentForm.effectiveTo ? dayjs(assignmentForm.effectiveTo) : null}
                  onChange={(val) => {
                    setAssignmentDateError('');
                    setAssignmentForm((current) => ({
                      ...current,
                      effectiveTo: val?.format('YYYY-MM-DD') || '',
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      placeholder: 'No end date',
                      error: Boolean(assignmentDateError),
                      disabled: isViewMode,
                    },
                  }}
                />
              </DrawerField>
            </DrawerFormGrid>
            {assignmentConflict ? (
              <Alert severity="error">
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={700}>
                    Conflicts with{' '}
                    {assignmentConflict.targetDisplayName || assignmentConflict.targetKey}
                  </Typography>
                  <Typography variant="caption">
                    {formatRange(assignmentConflict.effectiveFrom, assignmentConflict.effectiveTo)}{' '}
                    - Priority {assignmentConflict.priority}
                  </Typography>
                  <Typography variant="caption">
                    Payroll: {assignmentConflict.payrollPolicyName} - Attendance:{' '}
                    {assignmentConflict.attendancePolicyName} - Leave:{' '}
                    {assignmentConflict.leavePolicyName || assignmentConflict.leavePolicyId || '-'}
                  </Typography>
                </Stack>
              </Alert>
            ) : null}
            <DrawerField label="Priority">
              <TextField
                fullWidth
                type="number"
                size="small"
                value={assignmentForm.priority}
                disabled={isViewMode}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    priority: event.target.value,
                  }))
                }
              />
            </DrawerField>
            <DrawerField label="Reason">
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                value={assignmentForm.assignmentReason}
                disabled={isViewMode}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    assignmentReason: event.target.value,
                  }))
                }
              />
            </DrawerField>
            <DrawerField
              label="Status"
              help="When active, this assignment is evaluated and applied during policy resolution. If inactive, the assignment is ignored and will not apply the policies to the target."
            >
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={assignmentForm.isActive}
                      disabled={isViewMode}
                      onChange={(event) =>
                        setAssignmentForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                  }
                  label={assignmentForm.isActive ? 'Active' : 'Inactive'}
                />
              </Box>
            </DrawerField>
          </Stack>
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <AssignmentPreviewPanel ctx={ctx} />
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="basil:cross-solid" />}
          onClick={closeDrawer}
          size="small"
          disabled={isPolicyOperationActive}
        >
          {isViewMode ? 'Close' : 'Cancel'}
        </Button>
        <Button
          variant="outlined"
          disabled={!canPreviewImpact || isPolicyOperationActive}
          loading={
            previewPolicyAssignmentImpactState.isLoading ||
            activePolicyOperation?.key === 'preview-impact'
          }
          size="small"
          onClick={previewCurrentAssignmentImpact}
        >
          Preview impact
        </Button>
        {!isViewMode ? (
          <Button
            variant="contained"
            disabled={!canAssignPolicy || isPolicyOperationActive}
            loading={
              createAssignmentState.isLoading ||
              updateAssignmentState.isLoading ||
              activePolicyOperation?.key === 'save-assignment'
            }
            size="small"
            startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
            onClick={saveAssignment}
          >
            {activePolicyOperation?.key === 'save-assignment' ? 'Saving...' : 'Submit'}
          </Button>
        ) : null}
      </Stack>
      <Dialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)}>
        <DialogTitle>Discard changes?</DialogTitle>
        <DialogContent>Unsaved assignment changes will be lost.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
          <Button
            color="warning"
            disabled={isPolicyOperationActive}
            onClick={() => {
              setConfirmDiscard(false);
              closeDrawer();
              router.push(hrPaths.policies.leavePolicies);
            }}
          >
            Discard and open Leave Policies
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
