import type { RootState } from 'src/redux/store';
import type { AdmissionSeatStage } from 'src/redux/student/admissions/admission-seat-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Card, Chip, Alert, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionSeatStageQuery } from 'src/redux/student/admissions/admission-seat-api';

import { SeatHistory } from './seat-history';
import { SeatActionDialog } from './seat-action-dialog';
import { useApplicationSeat } from './use-application-seat';
import { SeatCapacitySummary } from './seat-capacity-summary';
import { useApplicationStageReadiness } from '../application-detail/application-stage-readiness';

import type { ApplicationStageReadinessHandler } from '../application-detail/application-stage-readiness';

type Props = { applicationId: string; stage: AdmissionApplicationStage; canAdvance: boolean;
  advancing: boolean; onComplete: (concurrencyStamp?: string) => void;
  showCompletionAction?: boolean; onReadinessChange?: ApplicationStageReadinessHandler };
const color = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' =>
  status === 'confirmed' ? 'success' : status === 'released' ? 'error' :
    status === 'expired' || status === 'waitlisted' ? 'warning' : status === 'reserved' ? 'info' : 'default';

export function ApplicationSeatStage({ applicationId, stage, canAdvance, advancing, onComplete, showCompletionAction = true, onReadinessChange }: Props) {
  const permissions = useSelector((store: RootState) => store.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Admissions.Seats.View');
  const query = useGetAdmissionSeatStageQuery({ applicationId, stageId: stage.id }, { skip: !canView });
  const state = query.data;
  useApplicationStageReadiness(onReadinessChange, {
    stageId: stage.id,
    canComplete: Boolean(state?.canComplete && !query.isError),
    busy: query.isFetching || advancing,
    concurrencyStamp: state?.concurrencyStamp,
  });
  if (!canView) return <Alert severity="info">You do not have access to seat allocation.</Alert>;
  if (query.isLoading) return <Card variant="outlined" sx={{ p: 2 }}><Skeleton height={180} /></Card>;
  if (query.isError || !state) return <Alert severity="error">Seat allocation could not be loaded. Refresh before continuing.</Alert>;
  return <SeatStageContent state={state} canAdvance={canAdvance} advancing={advancing} onComplete={onComplete} showCompletionAction={showCompletionAction} />;
}

function SeatStageContent({ state, canAdvance, advancing, onComplete, showCompletionAction }: {
  state: AdmissionSeatStage;
  canAdvance: boolean; advancing: boolean; onComplete: (concurrencyStamp?: string) => void;
  showCompletionAction: boolean;
}) {
  const permissions = useSelector((store: RootState) => store.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Admissions.Seats.Add');
  const actions = useApplicationSeat(state.applicationId, state.stageId, state, canAdvance && !advancing, onComplete);
  const buttons = [
    { show: canWrite && state.canReserve, action: 'reserve' as const, label: state.status === 'waitlisted' ? 'Promote to reservation' : 'Reserve seat', icon: 'mdi:seat-outline' },
    { show: canWrite && state.canConfirm, action: 'confirm' as const, label: 'Confirm seat', icon: 'mdi:seat-passenger' },
    { show: canWrite && state.canRenew, action: 'renew' as const, label: 'Renew hold', icon: 'mdi:clock-plus-outline' },
    { show: canWrite && state.canJoinWaitlist, action: 'waitlist' as const, label: 'Add to waitlist', icon: 'mdi:account-clock-outline' },
    { show: canWrite && state.canRelease, action: 'release' as const, label: 'Release', icon: 'mdi:seat-individual-suite' },
    { show: canWrite && state.canManageCapacity, action: 'capacity' as const, label: 'Change capacity', icon: 'mdi:counter' },
  ];
  return <><Card variant="outlined" sx={{ p: 2.5 }}><Stack spacing={2}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
      <Stack><Typography variant="h6">Admission seat allocation</Typography>
        <Typography variant="body2" color="text.secondary">Offering capacity and applicant reservation</Typography></Stack>
      <Chip size="small" label={state.status} color={color(state.status)} sx={{ textTransform: 'capitalize' }} />
    </Stack>
    <SeatCapacitySummary state={state} />
    {state.expiresAt && <Alert severity="info">Reservation expires {new Date(state.expiresAt).toLocaleString()}.</Alert>}
    {state.waitlistPosition && <Alert severity="warning">Waitlist position: {state.waitlistPosition}</Alert>}
    {state.blockers.map((item) => <Alert key={item} severity="warning">{item}</Alert>)}
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {buttons.filter((item) => item.show).map((item) => <Button key={item.action} size="small"
        variant={item.action === 'reserve' || item.action === 'confirm' ? 'contained' : 'outlined'}
        color={item.action === 'release' ? 'warning' : 'primary'} startIcon={<Iconify icon={item.icon} />}
        onClick={() => actions.open(item.action)}>{item.label}</Button>)}
      {showCompletionAction && state.canComplete && <Button size="small" variant="contained" color="success" disabled={!canAdvance || advancing}
        onClick={() => onComplete(state.concurrencyStamp)}>Continue</Button>}
    </Stack>
    <Divider /><Stack><Typography variant="subtitle2">Seat history</Typography><SeatHistory events={state.events} /></Stack>
  </Stack></Card><SeatActionDialog action={actions.action} state={state} busy={actions.busy}
    onClose={actions.close} onSubmit={actions.submit} /></>;
}
