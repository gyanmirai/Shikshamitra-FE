import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import { DetailGrid, DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import {
  Box,
  Paper,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableContainer,
} from '@mui/material';

import type { ICollectionPolicy } from '../../types/finance-policy.types';

const PAYMENT_PRIORITIES = {
  Legacy: 'Existing selection order',
  Installment: 'Installment first (earliest due)',
  FeeHead: 'Fee structure order',
} as const;

const CALCULATION_METHODS: Record<ICollectionPolicy['lateFeeType'], string> = {
  Flat: 'Flat fixed amount (₹)',
  PerDay: 'Daily fixed amount (₹/day)',
  PerWeek: 'Weekly fixed amount (₹/week)',
  PerMonth: 'Monthly fixed amount (₹/month)',
  Slab: 'Escalation slab based',
  Percentage: 'Percentage',
  Compound: 'Compound',
};

function LateFeeIncomeCategory({ id, academicYearId }: { id: string; academicYearId: string }) {
  const { currentData, isFetching } = useGetFinanceRoutingOptionsQuery(
    { academicYearId, operation: 'collection-policy' },
    { skip: !academicYearId }
  );
  const name = currentData?.incomeCategories.find((category) => category.id === id)?.label;

  return (
    <DetailField
      label="Late fee income category"
      value={name ?? (isFetching ? undefined : 'Name unavailable')}
    />
  );
}

export default function CollectionPolicyDetails({
  policy,
  presentation = 'standard',
}: {
  policy: ICollectionPolicy & { lateFeeIncomeCategoryName?: string | null };
  presentation?: 'standard' | 'feeStructure';
}) {
  const feeStructure = presentation === 'feeStructure';
  const amounts: Partial<
    Record<ICollectionPolicy['lateFeeType'], { label: string; value: number | null }>
  > = {
    Flat: { label: 'Flat late fee amount', value: policy.flatAmount },
    PerDay: { label: 'Amount per day', value: policy.amountPerDay },
    PerWeek: { label: 'Amount per week', value: policy.amountPerWeek },
    PerMonth: { label: 'Amount per month', value: policy.amountPerMonth },
  };
  const amount = amounts[policy.lateFeeType];
  const slabs = policy.escalationRules ?? [];

  return (
    <Box sx={{ containerType: 'inline-size' }}>
      <Box
        sx={
          feeStructure
            ? {
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 2,
                mb: 2,
                '@container (min-width: 440px)': {
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                },
              }
            : undefined
        }
      >
        <DetailSection
          title={feeStructure ? 'Payment Priority' : 'Automatic Payment Priority'}
          icon={GlobalIcons.receiptIcon}
          sx={{ mb: feeStructure ? 0 : 2 }}
          helpText="Choose which outstanding fees to pay first when no items are selected."
        >
          <DetailField
            label="Prioritize automatic payments by"
            value={PAYMENT_PRIORITIES[policy.allocationBasis ?? 'Legacy']}
          />
        </DetailSection>
        <DetailSection
          title={feeStructure ? 'Receipts' : 'Receipt Generation'}
          icon={GlobalIcons.receiptIcon}
          sx={{ mb: feeStructure ? 0 : 2 }}
          helpText="Applies when fees and charges are collected together. A fees-only or charges-only payment produces one receipt."
        >
          {feeStructure ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              <DetailField
                label="Fee receipts"
                value={
                  policy.receiptGrouping === 'Combined'
                    ? 'Combined with charges'
                    : 'Separate from charges'
                }
              />
              <DetailField
                label="Charge receipts"
                value={
                  policy.receiptGrouping === 'Combined'
                    ? 'Combined with fees'
                    : 'Separate from fees'
                }
              />
            </Box>
          ) : (
            <DetailField
              label="Receipts for fees and charges"
              value={
                policy.receiptGrouping === 'Combined'
                  ? 'Single combined receipt'
                  : 'Separate fee and charge receipts'
              }
            />
          )}
        </DetailSection>
      </Box>
      <DetailSection
        title="Late Fee Rules"
        icon={GlobalIcons.receiptIcon}
        helpText="The grace period and calculation settings used for overdue fees."
      >
        <DetailGrid>
          <DetailField
            label="Enable late fee charges"
            value={
              <Label color={policy.enableLateFee ? 'success' : 'default'} sx={{ height: 22 }}>
                {policy.enableLateFee ? 'Yes / Enabled' : 'No / Disabled'}
              </Label>
            }
          />
          {policy.enableLateFee && (
            <>
              <DetailField
                label="Grace period"
                value={
                  policy.gracePeriodDays == null
                    ? undefined
                    : `${policy.gracePeriodDays} calendar days`
                }
              />
              <DetailField
                label="Calculation method"
                value={CALCULATION_METHODS[policy.lateFeeType]}
              />
              {amount && (
                <DetailField
                  label={amount.label}
                  value={amount.value == null ? undefined : formatNumber(amount.value, 'INR')}
                />
              )}
              {policy.lateFeeIncomeCategoryName ? (
                <DetailField
                  label="Late fee income category"
                  value={policy.lateFeeIncomeCategoryName}
                />
              ) : policy.lateFeeIncomeCategoryId ? (
                <LateFeeIncomeCategory
                  id={policy.lateFeeIncomeCategoryId}
                  academicYearId={policy.academicYearId}
                />
              ) : null}
            </>
          )}
        </DetailGrid>
        {policy.enableLateFee && policy.lateFeeType === 'Slab' && (
          <Box sx={{ mt: 2 }}>
            <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>
              Escalation slabs
            </Typography>
            {slabs.length ? (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                <Table size="small" aria-label="Escalation slabs">
                  <TableHead>
                    <TableRow>
                      <TableCell>From Day</TableCell>
                      <TableCell>To Day</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {slabs.map((slab) => (
                      <TableRow key={slab.startDay}>
                        <TableCell>{slab.startDay}</TableCell>
                        <TableCell>{slab.endDay ?? 'Onward'}</TableCell>
                        <TableCell>{slab.calculationType}</TableCell>
                        <TableCell align="right">
                          {slab.calculationType === 'Flat'
                            ? formatNumber(slab.value, 'INR')
                            : `${slab.value}%`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No escalation slabs configured.
              </Typography>
            )}
          </Box>
        )}
      </DetailSection>
    </Box>
  );
}
