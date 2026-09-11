import type { AdmissionPaymentTransaction } from 'src/redux/student/admissions/admission-payment-types';

import { Stack, Button, Divider, Typography } from '@mui/material';

type Props = { items: AdmissionPaymentTransaction[]; active: boolean; onVerify: (item: AdmissionPaymentTransaction) => void;
  onReject: (item: AdmissionPaymentTransaction) => void; onReverse: (item: AdmissionPaymentTransaction) => void };
const labels: Record<string, string> = { pendingVerification: 'Awaiting verification', settled: 'Settled', rejected: 'Rejected', reversed: 'Reversed', failed: 'Failed', pending: 'Pending', waived: 'Waived' };
export function PaymentTransactions({ items, active, onVerify, onReject, onReverse }: Props) {
  if (!items.length) return <Typography variant="body2" color="text.secondary">No payment activity yet.</Typography>;
  return <Stack divider={<Divider flexItem />}>
    {[...items].reverse().map((item) => <Stack key={item.id} direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ py: 1 }}>
      <Stack><Typography variant="body2" fontWeight={600}>{item.currency} {item.amount.toFixed(2)} · {labels[item.status] ?? item.status}</Typography>
        <Typography variant="caption" color="text.secondary">{item.receiptNumber ?? `Attempt ${item.attemptNumber}`} · {item.method}{item.externalReference ? ` · ${item.externalReference}` : ''}</Typography></Stack>
      {active && item.status === 'pendingVerification' && <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => onReject(item)} color="error">Reject</Button>
        <Button size="small" variant="outlined" onClick={() => onVerify(item)}>Verify</Button>
      </Stack>}
      {active && item.status === 'settled' && <Button size="small" color="error" onClick={() => onReverse(item)}>Reverse</Button>}
    </Stack>)}
  </Stack>;
}
