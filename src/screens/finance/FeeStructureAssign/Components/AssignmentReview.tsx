import type {
  AssignmentHead,
  AssignmentLine,
  AssignmentPreview,
} from 'src/redux/finance/studentFeeAssignment';

import { useId } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import { selectableAssignmentPolicyFamilies } from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ButtonBase,
  TableContainer,
} from '@mui/material';

import { optionalServiceStatus } from './optionalServiceStatus';
import AssignmentProrationDetails from './AssignmentProrationDetails';
import { groupFeeHeadProration } from './assignmentReviewPresentation';

const summaryGrid = {
  display: 'grid',
  gap: 1.5,
  gridTemplateColumns: 'minmax(0, 1fr)',
  '@container (min-width: 420px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
};
const headGrid = {
  display: 'grid',
  gap: 0.75,
  alignItems: 'center',
  gridTemplateColumns: 'minmax(0, 1fr) auto 18px',
  gridTemplateAreas: '"name amount toggle" "term amount toggle" "dates dates dates"',
  '@container (min-width: 560px)': {
    gridTemplateColumns:
      'minmax(0, 1.15fr) minmax(0, 0.95fr) minmax(0, 1.2fr) minmax(7rem, 17%) 18px',
    gridTemplateAreas: '"name term dates amount toggle"',
  },
};

const headColumnHeading = {
  display: 'none',
  '@container (min-width: 560px)': { display: 'block' },
};

export default function AssignmentReview({
  data,
  committed = false,
}: {
  data: AssignmentPreview;
  committed?: boolean;
}) {
  const legacy = data.calculationVersion === 'LegacyUnknown';
  const cancelled = data.lines.reduce(
    (sum, line) => sum + (line.optionalServiceCancellationAmount ?? 0),
    0
  );
  const money = (value: number) => formatNumber(value, data.currency);
  const linesByHead = new Map<string, AssignmentLine[]>();
  data.lines.forEach((line) => {
    const lines = linesByHead.get(line.feeHeadId);
    if (lines) lines.push(line);
    else linesByHead.set(line.feeHeadId, [line]);
  });

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <DetailSection
        title="Assignment Total"
        icon="mdi:cash-multiple"
        helpText="Finance calculates these amounts from the selected fee heads, service dates and proration policy."
      >
        <Box sx={summaryGrid}>
          <DetailField label="Fee structure" value={data.structureName} />
          <DetailField
            label="Joining date"
            value={data.registrationJoiningDate ? fDate(data.registrationJoiningDate) : undefined}
          />
          <DetailField label="Assignment source" value={data.assignmentSource} />
        </Box>
        <Divider />
        <Box
          role="group"
          aria-label="Assignment total calculation"
          sx={{
            display: 'grid',
            alignItems: 'center',
            gap: 1,
            gridTemplateColumns: '20px minmax(0, 1fr)',
            gridTemplateAreas: '". total" "minus reduction" "equals final"',
            fontVariantNumeric: 'tabular-nums',
            '@container (min-width: 440px)': {
              gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)',
              gridTemplateAreas: '"total minus reduction equals final"',
            },
            '& [data-operator]': { color: 'text.secondary', typography: 'h6', textAlign: 'center' },
          }}
        >
          <Box sx={{ gridArea: 'total' }}>
            <DetailField label="Total fees" value={money(data.scheduledTotal)} />
          </Box>
          <Box data-operator sx={{ gridArea: 'minus' }}>
            −
          </Box>
          <Box sx={{ gridArea: 'reduction' }}>
            <DetailField label="Proration reduction" value={money(data.reductionTotal)} />
          </Box>
          <Box data-operator sx={{ gridArea: 'equals' }}>
            =
          </Box>
          <Box sx={{ gridArea: 'final', bgcolor: 'action.hover', borderRadius: 1, px: 1.5, py: 1 }}>
            <DetailField
              label="Final amount"
              value={<Box component="strong">{money(data.proratedTotal)}</Box>}
            />
          </Box>
        </Box>
        {committed && cancelled > 0 && (
          <DetailField label="Cancelled installments" value={money(cancelled)} />
        )}
        {data.overrideReason && (
          <DetailField label="Amount override reason" value={data.overrideReason} />
        )}
        {data.policyOverrideReason && (
          <DetailField label="Policy override reason" value={data.policyOverrideReason} />
        )}
      </DetailSection>

      <Box component="section" aria-label="Fee Breakdown">
        <DetailSection
          title="Fee Breakdown"
          icon="mdi:format-list-bulleted"
          helpText="Select a fee head to see its installment dates, amounts, and calculation details."
        >
          <Box
            sx={{
              ...headGrid,
              rowGap: 0,
              px: 1.25,
              color: 'text.secondary',
              typography: 'caption',
            }}
          >
            <Box sx={{ gridArea: 'name' }}>Fee head</Box>
            <Box sx={{ ...headColumnHeading, gridArea: 'term' }}>Payment term</Box>
            <Box sx={{ ...headColumnHeading, gridArea: 'dates' }}>Service dates</Box>
            <Box sx={{ gridArea: 'amount', textAlign: 'right' }}>
              {legacy ? 'Recorded amount' : 'Assigned amount'}
            </Box>
          </Box>
          <Stack divider={<Divider />} sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {data.heads.map((head) => (
              <FeeHeadReview
                key={head.feeHeadId}
                head={head}
                lines={linesByHead.get(head.feeHeadId) ?? []}
                currency={data.currency}
                committed={committed}
                legacy={legacy}
              />
            ))}
          </Stack>
          {!data.heads.length && (
            <Typography variant="body2" color="text.secondary">
              No fee heads recorded.
            </Typography>
          )}
        </DetailSection>
      </Box>

      <DetailSection
        title="Applicable Policies"
        icon="mdi:shield-check-outline"
        helpText="The policies applied to this assignment."
      >
        <Box sx={summaryGrid}>
          {[...selectableAssignmentPolicyFamilies, 'proration' as const].map((family) => {
            const policy = data.policies.find((item) => item.family === family);
            if (family === 'proration' && !policy) return null;
            return (
              <DetailField
                key={family}
                label={`${family.charAt(0).toUpperCase()}${family.slice(1)} policy`}
                value={policy?.name ?? 'No policy assigned'}
              />
            );
          })}
        </Box>
      </DetailSection>
    </Stack>
  );
}

function FeeHeadReview({
  head,
  lines,
  currency,
  committed,
  legacy,
}: {
  head: AssignmentHead;
  lines: AssignmentLine[];
  currency: string;
  committed: boolean;
  legacy: boolean;
}) {
  const expanded = useBoolean();
  const detailsId = useId();
  const status = optionalServiceStatus(
    head,
    lines.some((line) => (line.optionalServiceCancellationAmount ?? 0) > 0)
  );
  const chosen = head.included;
  const { startDate, endDate } = head.servicePeriod ?? {};
  const serviceDates =
    chosen && startDate ? `${fDate(startDate)} – ${endDate ? fDate(endDate) : '—'}` : '—';
  const serviceDatesId = `${detailsId}-service-dates`;
  const row = (
    <>
      <Stack
        component="span"
        spacing={0.25}
        sx={{ gridArea: 'name', minWidth: 0, alignItems: 'flex-start' }}
      >
        <Typography component="span" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
          {head.feeHeadName}
          {!head.isOptional && (
            <Box component="span" sx={{ color: 'error.main' }}>
              {' '}
              *
            </Box>
          )}
        </Typography>
        {status.label && status.label !== 'Cancellation recorded' && <Label>{status.label}</Label>}
        {!status.label && !chosen && <Label>Not selected</Label>}
      </Stack>
      <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{
          gridArea: 'term',
          overflowWrap: 'anywhere',
        }}
      >
        {chosen ? head.paymentTermName || '—' : '—'}
      </Typography>
      <Typography
        id={serviceDatesId}
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{ gridArea: 'dates' }}
      >
        {serviceDates}
      </Typography>
      <Typography
        component="span"
        variant="subtitle2"
        sx={{ gridArea: 'amount', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
      >
        {chosen ? formatNumber(head.obligation, currency) : '—'}
      </Typography>
      {chosen && (
        <Box component="span" sx={{ gridArea: 'toggle', display: 'flex' }} aria-hidden="true">
          <Iconify icon={expanded.value ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />
        </Box>
      )}
    </>
  );
  return (
    <Box sx={{ minWidth: 0 }}>
      {chosen ? (
        <ButtonBase
          aria-label={`View ${head.feeHeadName} installments`}
          aria-describedby={serviceDates === '—' ? undefined : serviceDatesId}
          aria-expanded={expanded.value}
          aria-controls={detailsId}
          onClick={expanded.onToggle}
          sx={{
            ...headGrid,
            width: '100%',
            textAlign: 'left',
            p: 1.25,
            '&.Mui-focusVisible': { bgcolor: 'action.focus' },
          }}
        >
          {row}
        </ButtonBase>
      ) : (
        <Box sx={{ ...headGrid, p: 1.25 }}>{row}</Box>
      )}
      <Box id={detailsId} hidden={!expanded.value}>
        {expanded.value && (
          <FeeHeadInstallments
            head={head}
            lines={lines}
            currency={currency}
            committed={committed}
            legacy={legacy}
          />
        )}
      </Box>
    </Box>
  );
}

function FeeHeadInstallments({
  head,
  lines,
  currency,
  committed,
  legacy,
}: {
  head: AssignmentHead;
  lines: AssignmentLine[];
  currency: string;
  committed: boolean;
  legacy: boolean;
}) {
  const { servicePeriod } = head;
  const { latestPeriod, stopped } = optionalServiceStatus(
    head,
    lines.some((line) => (line.optionalServiceCancellationAmount ?? 0) > 0)
  );
  const calculation = legacy
    ? undefined
    : groupFeeHeadProration(lines.filter((line) => !line.optionalServicePeriodId)).get(
        head.feeHeadId
      );
  const money = (value: number) => formatNumber(value, currency);
  const date = (value?: string | null) => (value ? fDate(value) : '—');

  return (
    <Stack spacing={1} sx={{ px: 1.25, pb: 1.25, minWidth: 0 }}>
      {latestPeriod && (
        <DetailField
          label="Latest service period"
          value={`${date(latestPeriod.startDate)} – ${date(latestPeriod.endDate)}`}
        />
      )}
      {stopped && head.optionalServiceEndDate && (
        <DetailField
          label="Cancellation effective date"
          value={date(head.optionalServiceEndDate)}
        />
      )}
      {head.originalOptionalServiceEndDate && latestPeriod && (
        <DetailField
          label="Original cancellation date"
          value={date(head.originalOptionalServiceEndDate)}
        />
      )}
      {head.amountBasis === 'MonthlyRate' && head.effectiveAmount != null && (
        <DetailField
          label={
            head.monthlyRateEffectiveDate
              ? `Monthly amount from ${date(head.monthlyRateEffectiveDate)}`
              : 'Monthly amount'
          }
          value={money(head.effectiveAmount)}
        />
      )}
      {head.zeroAmountReason && (
        <DetailField label="Zero amount reason" value={head.zeroAmountReason} />
      )}
      {servicePeriod?.reason && (
        <DetailField label="Service date reason" value={servicePeriod.reason} />
      )}
      <AssignmentProrationDetails head={head} calculation={calculation} currency={currency} />
      {lines.length ? (
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Table
            size="small"
            aria-label={`${head.feeHeadName} installments`}
            sx={{
              tableLayout: 'fixed',
              minWidth: committed ? 740 : 580,
              whiteSpace: 'nowrap',
              '& td, & th': { px: 1.25 },
              '& td': { fontVariantNumeric: 'tabular-nums' },
              '& tbody th': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
            }}
          >
            <colgroup>
              {(committed ? [14, 25, 14, 12, 11, 10, 14] : [24, 32, 17, 15, 12]).map(
                (width, index) => (
                  <col key={index} style={{ width: `${width}%` }} />
                )
              )}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell>Installment</TableCell>
                <TableCell>Service dates</TableCell>
                <TableCell title="When this installment becomes available for collection">
                  Available from
                </TableCell>
                <TableCell>Due date</TableCell>
                <TableCell align="right">Amount</TableCell>
                {committed && <TableCell align="right">Paid</TableCell>}
                {committed && <TableCell align="right">Outstanding</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={line.dueFeeId ?? index}>
                  <TableCell component="th" scope="row">
                    {line.installmentLabel}
                  </TableCell>
                  <TableCell>
                    {line.coverageStartDate && line.coverageEndDate
                      ? `${date(line.coverageStartDate)} – ${date(line.coverageEndDate)}`
                      : '—'}
                  </TableCell>
                  <TableCell>{date(line.demandDate)}</TableCell>
                  <TableCell>{date(line.dueDate)}</TableCell>
                  <TableCell align="right">{money(line.proratedAmount)}</TableCell>
                  {committed && <TableCell align="right">{money(line.paidAmount)}</TableCell>}
                  {committed && (
                    <TableCell align="right">{money(line.outstandingAmount)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No installments recorded.
        </Typography>
      )}
    </Stack>
  );
}
