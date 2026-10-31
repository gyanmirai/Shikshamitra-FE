import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
} from 'src/redux/finance/ConcessionManagement/types';

import { Box, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailField } from 'src/components/detail-view';
import RequestEnteredInstallmentTable from './RequestEnteredInstallmentTable';

import { validateConcessionInstallments } from '../concessionValueValidation';

export default function RequestEnteredInstallments({
  formik,
  requestContext,
  policy,
  feeHeadId,
}: {
  formik: any;
  requestContext?: ConcessionRequestContext;
  policy: ConcessionPolicyOption;
  /** Restrict visible rows only; all selected fees still share the request limit. */
  feeHeadId?: string;
}) {
  const { values } = formik;
  const selectedHeads = new Set<string>(values.selectedFeeHeads[values.concessionTypeId] || []);
  const lines = (requestContext?.eligibleDueFees || []).filter(
    (line) => selectedHeads.has(line.feeHeadId) && line.eligibleConcessionAmount > 0
  );
  const entries: Record<string, number | string> = values.dueFeeEntries || {};
  const validationErrors = validateConcessionInstallments(
    [...selectedHeads],
    entries,
    requestContext,
    policy
  );
  const enteredTotal = lines.reduce((sum, line) => sum + Number(entries[line.dueFeeId] || 0), 0);
  const visibleLines = feeHeadId ? lines.filter((line) => line.feeHeadId === feeHeadId) : lines;
  const percentage = policy.calculationMethod === 'Percentage';
  const maximum = percentage
    ? Math.min(100, policy.maximumPercentage ?? 100)
    : (policy.maximumFixedAmount ?? Number.POSITIVE_INFINITY);
  const showAllowance = Number.isFinite(maximum) && lines.length > 0;
  const hasInvalidEntries = Object.keys(validationErrors).length > 0;
  const remaining = Math.max(0, Number((maximum - enteredTotal).toFixed(2)));
  const maximumReached = !hasInvalidEntries && remaining === 0;
  const money = (amount: number) => formatNumber(amount, 'INR');
  const allowanceValue = (amount: number) => (percentage ? `${amount}%` : money(amount));
  return (
    <Box sx={{ minWidth: 0 }}>
      {showAllowance && (
        <Box
          role="status"
          aria-label="Concession request allowance"
          aria-live="polite"
          aria-atomic="true"
          sx={{ mb: 1.5, fontVariantNumeric: 'tabular-nums' }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <DetailField
              layout="inline"
              label="Maximum concession allowed: "
              value={allowanceValue(maximum)}
            />
            <DetailField
              layout="inline"
              label="Entered: "
              value={hasInvalidEntries ? '—' : allowanceValue(Number(enteredTotal.toFixed(2)))}
            />
            <DetailField
              layout="inline"
              label="Remaining: "
              value={hasInvalidEntries ? '—' : allowanceValue(remaining)}
            />
          </Box>
          {maximumReached && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
              Maximum concession reached. Reduce an installment{' '}
              {percentage ? 'percentage' : 'amount'} to add more elsewhere.
            </Typography>
          )}
        </Box>
      )}
      <RequestEnteredInstallmentTable
        formik={formik}
        lines={visibleLines}
        validationErrors={validationErrors}
        percentage={percentage}
        maximum={maximum}
        enteredTotal={enteredTotal}
        tableKey={feeHeadId || 'all'}
      />
    </Box>
  );
}
