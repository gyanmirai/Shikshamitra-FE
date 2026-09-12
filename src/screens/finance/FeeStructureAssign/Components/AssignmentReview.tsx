import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Alert, Table, TableBody, TableCell, TableHead, TableRow, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import type { AssignmentPreview } from 'src/redux/finance/studentFeeAssignment';

export default function AssignmentReview({ data, committed = false }: { data: AssignmentPreview; committed?: boolean }) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">{data.structureName} · revision {data.revisionNumber || 'historical'}</Typography>
      <Typography variant="h6">Obligation: {formatNumber(data.proratedTotal, data.currency)}</Typography>
      {data.calculationVersion !== 'LegacyUnknown' && <Typography variant="body2" color="text.secondary">
        Configured schedule {formatNumber(data.scheduledTotal, data.currency)} · Service reduction {formatNumber(data.reductionTotal, data.currency)}
      </Typography>}
      {data.overrideReason && <Alert severity="info">Amount override: {data.overrideReason}</Alert>}
      {data.warnings.map((warning) => <Alert key={warning} severity="warning">{warning}</Alert>)}
      {data.heads.map((head) => (
        <Box key={head.feeHeadId} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{head.feeHeadName} · {head.included ? (head.isOptional ? 'Selected optional head' : 'Mandatory') : 'Not selected — no obligation'}</Typography>
          {head.included && <Stack spacing={0.5} sx={{ mt: 1 }}>
            {data.calculationVersion === 'LegacyUnknown' ? <Typography variant="body2">Recorded obligation {formatNumber(head.obligation, data.currency)}</Typography> : <Typography variant="body2">Configured {formatNumber(head.configuredAmount, data.currency)} · {head.amountBasis === 'OneTime' ? 'One-time charge' : 'Annual service total'} · Obligation {formatNumber(head.obligation, data.currency)}</Typography>}
            {head.effectiveAmount !== head.configuredAmount && <Typography variant="body2">Authorized service total {formatNumber(head.effectiveAmount, data.currency)}</Typography>}
            {head.paymentTermName && <Typography variant="body2">Payment term: {head.paymentTermName} · version {head.paymentTermVersionNumber}</Typography>}
            {head.servicePeriod && <Typography variant="body2">Service: {fDate(head.servicePeriod.startDate)} – {fDate(head.servicePeriod.endDate)}</Typography>}
            <Typography variant="caption" color="text.secondary">{head.verification}{head.servicePeriod?.reason ? ` · ${head.servicePeriod.reason}` : ''}</Typography>
          </Stack>}
        </Box>
      ))}
      <Box sx={{ overflowX: 'auto', minWidth: 0 }}>
        <Table size="small" aria-label={committed ? 'Assigned fee installments and balances' : 'Preview fee installments'}>
          <TableHead><TableRow>
            {['Fee head / installment', 'Share', 'Demand date', 'Due date', 'Obligation', ...(committed ? ['Paid', 'Outstanding'] : [])].map((label) => <TableCell key={label}>{label}</TableCell>)}
          </TableRow></TableHead>
          <TableBody>{data.lines.map((line, i) => <TableRow key={line.dueFeeId ?? `${line.feeHeadId}-${line.sequence}-${i}`}>
            <TableCell><Typography variant="body2">{line.feeHeadName} · {line.installmentLabel}</Typography><Typography variant="caption" color="text.secondary">{line.explanation}</Typography></TableCell>
            <TableCell>{data.calculationVersion === 'LegacyUnknown' ? 'Unknown' : `${line.allocationPercentage}%`}</TableCell><TableCell>{line.demandDate ? fDate(line.demandDate) : '—'}</TableCell><TableCell>{fDate(line.dueDate)}</TableCell>
            <TableCell>{formatNumber(line.proratedAmount, data.currency)}</TableCell>
            {committed && <><TableCell>{formatNumber(line.paidAmount, data.currency)}</TableCell><TableCell>{formatNumber(line.outstandingAmount, data.currency)}</TableCell></>}
          </TableRow>)}</TableBody>
        </Table>
      </Box>
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}><Typography variant="subtitle2">Applicable policies</Typography></AccordionSummary>
        <AccordionDetails><Stack spacing={2}>
          {data.policies.map((policy) => <Box key={policy.family}>
            <Typography variant="subtitle2">{policy.name} · v{policy.version}</Typography>
            {data.heads.filter((h) => h.included).map((h) => <Typography key={h.feeHeadId} variant="body2">{h.feeHeadName}: {policy.headTreatment[h.feeHeadId]}</Typography>)}
          </Box>)}
          <Typography variant="caption" color="text.secondary">Collection and refund events are evaluated separately. Assignment does not assess a penalty or create a refund.</Typography>
        </Stack></AccordionDetails>
      </Accordion>
    </Stack>
  );
}
