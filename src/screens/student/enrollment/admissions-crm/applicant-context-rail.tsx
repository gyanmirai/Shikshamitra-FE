'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmStaffLookupDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import { AdmissionCrmRouteType } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { AdmissionCrmLeadPriority } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  useGetAdmissionCrmStaffQuery,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import {
  formatEnumLabel,
  joinEnrollmentMetadata,
  getApplicantUpdateError,
  getDistinctAdmissionIntent,
} from './enrollment-display';

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';
const assignOwnerPermission = `${permissionRoot}.AssignOwner`;
const setPriorityPermission = `${permissionRoot}.SetPriority`;

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const getStaffLabel = (staff: AdmissionCrmStaffLookupDto) =>
  joinEnrollmentMetadata(staff.displayName, staff.employeeCode, staff.email || undefined);

type Props = {
  lead: AdmissionCrmLeadDto;
  academicYearId?: string;
  hasRegistration: boolean;
  canViewGovernance: boolean;
  onOpenGovernance: () => void;
  refetchLead: () => Promise<unknown>;
};

export function ApplicantContextRail({
  lead,
  academicYearId,
  hasRegistration,
  canViewGovernance,
  onOpenGovernance,
  refetchLead,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [ownerEditorOpen, setOwnerEditorOpen] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState('');
  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [priority, setPriority] = useState(lead.priority);
  const [announcement, setAnnouncement] = useState('');
  const canAssignOwner = hasGrantedPermission(permissions, assignOwnerPermission);
  const canSetPriority = hasGrantedPermission(permissions, setPriorityPermission);
  const distinctAdmissionIntent = getDistinctAdmissionIntent(
    lead.admissionIntent,
    lead.intendedRouteNameSnapshot
  );
  const admissionPathway =
    lead.intendedRouteNameSnapshot?.trim() ||
    (lead.intendedRouteType != null
      ? formatEnumLabel(AdmissionCrmRouteType[lead.intendedRouteType])
      : 'Not captured');

  const ownerStaffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedOwnerSearch || undefined,
      ids: ownerEditorOpen ? undefined : lead.ownerUserId || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !ownerEditorOpen && !lead.ownerUserId }
  );
  const [assignOwner, assignOwnerState] = useAssignAdmissionCrmLeadOwnerMutation();
  const [changePriority, changePriorityState] = useChangeAdmissionCrmLeadPriorityMutation();
  const ownerLabel = owner
    ? getStaffLabel(owner)
    : ownerStaffQuery.isFetching
      ? 'Loading owner…'
      : lead.ownerUserId
        ? 'Assigned staff member'
        : 'Unassigned';

  useEffect(() => setPriority(lead.priority), [lead.id, lead.priority]);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedOwnerSearch(ownerSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [ownerSearch]);
  useEffect(() => {
    const selectedOwner = ownerStaffQuery.data?.find((staff) => staff.id === lead.ownerUserId);
    if (selectedOwner) setOwner(selectedOwner);
    else if (!lead.ownerUserId) setOwner(null);
  }, [lead.ownerUserId, ownerStaffQuery.data]);


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

  return (
    <Stack
      component="aside"
      aria-label="Applicant context"
      spacing={1.25}
      sx={{
        minWidth: 0,
        alignSelf: 'start',
        position: { lg: 'sticky' },
        top: { lg: 16 },
      }}
    >
      <Box
        aria-live="polite"
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      >
        {announcement}
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1">Admission Profile</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Admission pathway
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {admissionPathway}
              </Typography>
              {lead.intendedRouteDefinitionVersion ? (
                <Typography variant="caption" color="text.secondary">
                  Version {lead.intendedRouteDefinitionVersion} captured at inquiry
                </Typography>
              ) : null}
            </Box>
            {distinctAdmissionIntent ? (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Admission Intent
                </Typography>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {distinctAdmissionIntent}
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle1">Operational Context</Typography>
            {canAssignOwner || canSetPriority ? (
              <Typography variant="caption" color="text.secondary">
                Changes save when you select a value.
              </Typography>
            ) : null}
          </Box>
          {canAssignOwner ? (
            <Autocomplete
              fullWidth
              open={ownerEditorOpen}
              onOpen={() => setOwnerEditorOpen(true)}
              onClose={() => setOwnerEditorOpen(false)}
              options={ownerStaffQuery.data || []}
              value={owner}
              loading={ownerStaffQuery.isFetching || assignOwnerState.isLoading}
              onInputChange={(_, value, reason) => {
                if (reason === 'input' || reason === 'clear') setOwnerSearch(value);
              }}
              onChange={(_, value) => saveOwner(value)}
              getOptionLabel={getStaffLabel}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  name="leadOwner"
                  autoComplete="off"
                  label="Lead Owner"
                  placeholder={lead.ownerUserId ? 'Assigned owner' : 'Search staff…'}
                />
              )}
            />
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Lead Owner
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {ownerLabel}
              </Typography>
            </Box>
          )}
          {canAssignOwner && ownerEditorOpen && ownerStaffQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => ownerStaffQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Staff options could not be loaded.
            </Alert>
          ) : null}
          {canSetPriority ? (
            <TextField
              select
              size="small"
              fullWidth
              name="leadPriority"
              autoComplete="off"
              label="Priority"
              value={priority}
              disabled={changePriorityState.isLoading}
              onChange={(event) => savePriority(Number(event.target.value))}
            >
              {Object.entries(priorityLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {priorityLabels[priority]}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Lead Score
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {lead.leadScore}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack>
          {hasRegistration && canViewGovernance ? (
            <Button
              color="inherit"
              startIcon={<Iconify icon="solar:shield-check-bold-duotone" />}
              onClick={onOpenGovernance}
              sx={{ minHeight: 44, justifyContent: 'flex-start' }}
            >
              Additional Checks
            </Button>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
