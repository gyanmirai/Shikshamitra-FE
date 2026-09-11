import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Card, Chip, Alert, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';
import { useGetAdmissionOfferStageQuery } from 'src/redux/student/admissions/admission-offer-api';

import { OfferHistory } from './offer-history';
import { OfferActionDialog } from './offer-action-dialog';
import { useApplicationOffer } from './use-application-offer';

type Props = { applicationId: string; stage: AdmissionApplicationStage; canAdvance: boolean;
  advancing: boolean; onComplete: (concurrencyStamp?: string) => void };
const color = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' =>
  status === 'accepted' ? 'success' : status === 'declined' || status === 'withdrawn' ? 'error' :
    status === 'expired' ? 'warning' : status === 'issued' ? 'info' : 'default';

export function ApplicationOfferStage({ applicationId, stage, canAdvance, advancing, onComplete }: Props) {
  const query = useGetAdmissionOfferStageQuery({ applicationId, stageId: stage.id });
  const state = query.data;
  const actions = useApplicationOffer(applicationId, stage.id, state?.concurrencyStamp ?? '',
    canAdvance && !advancing, onComplete);
  if (query.isLoading) return <Card variant="outlined" sx={{ p: 2 }}><Skeleton height={160} /></Card>;
  if (query.isError || !state) return <Alert severity="error">Offer details could not be loaded. Refresh before continuing.</Alert>;
  const buttons = [
    { show: state.canIssue, action: 'issue' as const, label: 'Issue offer', icon: 'mdi:email-fast-outline', variant: 'contained' as const },
    { show: state.canAccept, action: 'accept' as const, label: 'Record acceptance', icon: 'mdi:check-circle-outline', variant: 'contained' as const },
    { show: state.canDecline, action: 'decline' as const, label: 'Record decline', icon: 'mdi:close-circle-outline', variant: 'outlined' as const },
    { show: state.canExtend, action: 'extend' as const, label: 'Extend expiry', icon: 'mdi:calendar-plus', variant: 'outlined' as const },
    { show: state.canWithdraw, action: 'withdraw' as const, label: 'Withdraw', icon: 'mdi:email-remove-outline', variant: 'outlined' as const },
    { show: state.canReissue, action: 'reissue' as const, label: 'Reissue offer', icon: 'mdi:email-sync-outline', variant: 'contained' as const },
  ];
  return <>
    <Card variant="outlined" sx={{ p: 2.5 }}><Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Stack><Typography variant="h6">{state.policy?.title ?? 'Admission offer'}</Typography>
          <Typography variant="body2" color="text.secondary">Version {Math.max(1, state.versionNumber)} · {state.policy?.offerType}</Typography></Stack>
        <Chip size="small" label={state.status} color={color(state.status)} sx={{ textTransform: 'capitalize' }} />
      </Stack>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{state.policy?.message}</Typography>
      {state.policy?.conditions && <Alert severity="info"><strong>Conditions:</strong> {state.policy.conditions}</Alert>}
      {state.expiresAt && <Typography variant="body2" color={state.status === 'expired' ? 'error' : 'text.secondary'}>
        {state.status === 'expired' ? 'Expired' : 'Expires'} {new Date(state.expiresAt).toLocaleString()}</Typography>}
      {state.blockers.map((item) => <Alert key={item} severity="warning">{item}</Alert>)}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {buttons.filter((item) => item.show).map((item) => <Button key={item.action} size="small"
          variant={item.variant} color={item.action === 'decline' || item.action === 'withdraw' ? 'warning' : 'primary'}
          startIcon={<Iconify icon={item.icon} />} onClick={() => actions.open(item.action)}>{item.label}</Button>)}
		{state.canComplete && <Button size="small" variant="contained" color="success"
			disabled={!canAdvance || advancing} onClick={() => onComplete()}>Continue</Button>}
      </Stack>
      <Divider /><Stack><Typography variant="subtitle2">Offer history</Typography><OfferHistory events={state.events} /></Stack>
    </Stack></Card>
    <OfferActionDialog action={actions.action} state={state} busy={actions.busy}
      onClose={actions.close} onSubmit={actions.submit} />
  </>;
}
