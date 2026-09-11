import type { AdmissionSeatStage } from 'src/redux/student/admissions/admission-seat-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Card, Chip, Alert, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionSeatStageQuery } from 'src/redux/student/admissions/admission-seat-api';

import { SeatHistory } from './seat-history';
import { SeatActionDialog } from './seat-action-dialog';
import { useApplicationSeat } from './use-application-seat';
import { SeatCapacitySummary } from './seat-capacity-summary';

type Props = { applicationId: string; stage: AdmissionApplicationStage; canAdvance: boolean;
  advancing: boolean; onComplete: (concurrencyStamp?: string) => void };
const color = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' =>
  status === 'confirmed' ? 'success' : status === 'released' ? 'error' :
    status === 'expired' || status === 'waitlisted' ? 'warning' : status === 'reserved' ? 'info' : 'default';

export function ApplicationSeatStage({ applicationId, stage, canAdvance, advancing, onComplete }: Props) {
  const query = useGetAdmissionSeatStageQuery({ applicationId, stageId: stage.id });
  const state = query.data;
  if (query.isLoading) return <Card variant="outlined" sx={{ p: 2 }}><Skeleton height={180} /></Card>;
  if (query.isError || !state) return <Alert severity="error">Seat allocation could not be loaded. Refresh before continuing.</Alert>;
  return <SeatStageContent state={state} canAdvance={canAdvance} advancing={advancing} onComplete={onComplete} />;
}

function SeatStageContent({ state, canAdvance, advancing, onComplete }: {
  state: AdmissionSeatStage;
  canAdvance: boolean; advancing: boolean; onComplete: (concurrencyStamp?: string) => void;
}) {
  const actions = useApplicationSeat(state.applicationId, state.stageId, state, canAdvance && !advancing, onComplete);
  const buttons = [
    { show: state.canReserve, action: 'reserve' as const, label: state.status === 'waitlisted' ? 'Promote to reservation' : 'Reserve seat', icon: 'mdi:seat-outline' },
    { show: state.canConfirm, action: 'confirm' as const, label: 'Confirm seat', icon: 'mdi:seat-passenger' },
    { show: state.canRenew, action: 'renew' as const, label: 'Renew hold', icon: 'mdi:clock-plus-outline' },
    { show: state.canJoinWaitlist, action: 'waitlist' as const, label: 'Add to waitlist', icon: 'mdi:account-clock-outline' },
    { show: state.canRelease, action: 'release' as const, label: 'Release', icon: 'mdi:seat-individual-suite' },
    { show: state.canManageCapacity, action: 'capacity' as const, label: 'Change capacity', icon: 'mdi:counter' },
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
      {state.canComplete && <Button size="small" variant="contained" color="success" disabled={!canAdvance || advancing}
        onClick={() => onComplete(state.concurrencyStamp)}>Continue</Button>}
    </Stack>
    <Divider /><Stack><Typography variant="subtitle2">Seat history</Typography><SeatHistory events={state.events} /></Stack>
  </Stack></Card><SeatActionDialog action={actions.action} state={state} busy={actions.busy}
    onClose={actions.close} onSubmit={actions.submit} /></>;
}
