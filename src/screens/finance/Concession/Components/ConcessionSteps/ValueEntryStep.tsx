import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

import React, { useMemo, useCallback } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Stack, Typography } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import RequestEnteredInstallments from './RequestEnteredInstallments';

interface Props {
  formik: any;
  concessionTypes: any[];
  requestContext?: ConcessionRequestContext;
  policy?: ConcessionPolicyOption;
  preview?: ConcessionRequestPreview;
  showPolicyFixedDetails?: boolean;
}

const ValueEntryStep: React.FC<Props> = ({
  formik,
  concessionTypes,
  requestContext,
  policy,
  preview,
  showPolicyFixedDetails = true,
}) => {
  const { values, setFieldValue } = formik;
  const selectedTypes = useMemo(
    () => (concessionTypes as any[]).filter((ct: any) => values.concessionTypeIds.includes(ct.id)),
    [concessionTypes, values.concessionTypeIds]
  );

  const setEntry = useCallback(
    (
      concessionTypeId: string,
      feeHeadId: string | 'BATCH_UPDATE',
      field: 'basedOn' | 'amount',
      value: any,
      netAmount?: number
    ) => {
      if (feeHeadId === 'BATCH_UPDATE') {
        const updates = value;
        const currentEntries = values.valueEntries[concessionTypeId] || {};
        setFieldValue('valueEntries', {
          ...values.valueEntries,
          [concessionTypeId]: {
            ...currentEntries,
            ...updates,
          },
        });
        return;
      }

      const prev = values.valueEntries[concessionTypeId]?.[feeHeadId] || {
        basedOn: 0, // 0 for Amount, 1 for Percentage
        amount: 0,
        netAmount: 0,
      };

      // If switching basedOn, reset amount to 0 specifically
      let newAmount = prev.amount;
      if (field === 'basedOn') {
        newAmount = 0;
      } else {
        newAmount = value; // field is 'amount' here
      }

      const updatedEntry = {
        ...prev,
        [field]: value,
        amount: field === 'basedOn' ? 0 : value,
        newAmount, // keep track of the actual amount entered for display calculations
      };

      if (netAmount !== undefined) {
        updatedEntry.netAmount = netAmount;
      }

      setFieldValue('valueEntries', {
        ...values.valueEntries,
        [concessionTypeId]: {
          ...values.valueEntries[concessionTypeId],
          [feeHeadId]: updatedEntry,
        },
      });
    },
    [values.valueEntries, setFieldValue]
  );

  return (
    <Box>
      {policy?.valueSource === 'RequestEnteredWithinLimits' ? (
        <RequestEnteredInstallments
          formik={formik}
          requestContext={requestContext}
          policy={policy}
        />
      ) : (
        selectedTypes.map((ct: any) => (
          <ValueEntryStepItem
            key={ct.id}
            concessionType={ct}
            values={values}
            setEntry={setEntry}
            requestContext={requestContext}
            policy={policy}
            preview={preview}
            showPolicyFixedDetails={showPolicyFixedDetails}
          />
        ))
      )}
      {selectedTypes.every((ct: any) => (values.selectedFeeHeads[ct.id] || []).length === 0) && (
        <Typography color="text.disabled" textAlign="center" py={4}>
          Select fee heads above to enter concession values.
        </Typography>
      )}
    </Box>
  );
};

const ValueEntryStepItem = ({
  concessionType,
  values,
  setEntry,
  requestContext,
  policy,
  preview,
  showPolicyFixedDetails,
}: any) => {
  const assignedStructureData =
    requestContext && policy
      ? {
          concessionValueSource: policy.valueSource,
          concessionCalculationMethod: policy.calculationMethod,
          maximumConcessionPercentage: policy.maximumPercentage,
          maximumConcessionFixedAmount: policy.maximumFixedAmount,
          concessionPercentageValue: policy.percentageValue,
          concessionFixedAmount: policy.fixedAmount,
          concessionPolicyName: policy.policyName,
          concessionPolicyVersion: policy.version,
          feeHeads: requestContext.feeHeads.map((feeHead: any) => ({
            ...feeHead,
            amount: feeHead.eligibleOutstanding,
          })),
        }
      : undefined;

  const selectedFeeHeadIds: string[] = values.selectedFeeHeads[concessionType.id] || [];
  const isPolicyFixed = assignedStructureData?.concessionValueSource === 'PolicyFixed';
  const calculationMethod = assignedStructureData?.concessionCalculationMethod;
  const permittedBasedOn = calculationMethod === 'Percentage' ? 1 : 0;
  const maximumValue =
    calculationMethod === 'Percentage'
      ? assignedStructureData?.maximumConcessionPercentage
      : assignedStructureData?.maximumConcessionFixedAmount;
  const isRequestEnteredFixed = !isPolicyFixed && calculationMethod === 'FixedAmount';

  // We need to match IDs to names and amounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedFeeHeads =
    assignedStructureData?.feeHeads?.filter((fh: any) =>
      selectedFeeHeadIds.includes(fh.feeHeadId)
    ) || [];

  // Initialize missing values with defaults (0 discount, full net amount)
  React.useEffect(() => {
    if (selectedFeeHeads.length > 0) {
      const updates: any = {};
      let hasUpdates = false;
      const selectedBaseTotal = selectedFeeHeads.reduce(
        (sum: number, feeHead: any) => sum + (feeHead.amount || 0),
        0
      );

      selectedFeeHeads.forEach((fh: any) => {
        const fhId = fh.feeHeadId;
        const existingEntry = values.valueEntries[concessionType.id]?.[fhId];
        const baseAmount = fh.amount || 0;

        // If entry is missing OR netAmount is missing (for existing entries from prev steps that might be incomplete)
        if (isPolicyFixed) {
          const method = assignedStructureData?.concessionCalculationMethod;
          const basedOn = method === 'FixedAmount' ? 0 : 1;
          const amount = 0;
          updates[fhId] = { basedOn, amount, netAmount: baseAmount };
          hasUpdates ||=
            !existingEntry || existingEntry.basedOn !== basedOn || existingEntry.amount !== amount;
        } else if (
          !existingEntry ||
          existingEntry.netAmount === undefined ||
          existingEntry.basedOn !== permittedBasedOn
        ) {
          // Default: 0 discount, so netAmount = baseAmount
          // If existing entry has amount, calculate net based on it (though usually it's 0 if uninitialized)
          const currentAmount =
            existingEntry?.basedOn === permittedBasedOn ? existingEntry?.amount || 0 : 0;
          const isPercentage = permittedBasedOn === 1;

          let discount = 0;
          if (isPercentage) {
            discount = (baseAmount * currentAmount) / 100;
          } else {
            discount = currentAmount;
          }
          const netAmount = baseAmount - discount;

          updates[fhId] = {
            basedOn: permittedBasedOn,
            amount: currentAmount,
            netAmount: Number(netAmount.toFixed(2)),
          };
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        setEntry(concessionType.id, 'BATCH_UPDATE', 'amount', updates);
      }
    }
  }, [
    selectedFeeHeads,
    concessionType.id,
    values.valueEntries,
    setEntry,
    isPolicyFixed,
    permittedBasedOn,
    assignedStructureData?.concessionCalculationMethod,
  ]);
  // Better to check if update is needed inside to avoid loop. The check `!existingEntry || existingEntry.netAmount === undefined` protects against loop if we set it correctly.

  if (selectedFeeHeads.length === 0 || (isPolicyFixed && !showPolicyFixedDetails)) return null;

  const formatCurrency = (amount: number) => formatNumber(amount, 'INR');
  const selectedBaseTotal = selectedFeeHeads.reduce(
    (sum: number, feeHead: any) => sum + Number(feeHead.amount || 0),
    0
  );
  const requestFixedTotal = selectedFeeHeads.reduce(
    (sum: number, feeHead: any) =>
      sum + Number(values.valueEntries[concessionType.id]?.[feeHead.feeHeadId]?.amount || 0),
    0
  );
  const setRequestFixedTotal = (requestedTotal: number) => {
    requestedTotal = Math.ceil(requestedTotal);
    let remaining = requestedTotal;
    const updates: Record<string, { basedOn: number; amount: number; netAmount: number }> = {};
    selectedFeeHeads.forEach((feeHead: any, index: number) => {
      const baseAmount = Number(feeHead.amount || 0);
      const amount =
        index === selectedFeeHeads.length - 1
          ? remaining
          : Math.min(
              baseAmount,
              Math.floor((requestedTotal * baseAmount) / (selectedBaseTotal || 1))
            );
      remaining = Math.max(0, Number((remaining - amount).toFixed(2)));
      updates[feeHead.feeHeadId] = {
        basedOn: 0,
        amount,
        netAmount: Math.max(0, Number((baseAmount - amount).toFixed(2))),
      };
    });
    setEntry(concessionType.id, 'BATCH_UPDATE', 'amount', updates);
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" fontWeight={600}>
        {concessionType.concessionName || concessionType.name}
      </Typography>

      {isRequestEnteredFixed && (
        <Box sx={{ maxWidth: 320 }}>
          <NumericFormatCustom
            size="small"
            fullWidth
            label="Total concession amount"
            name={`valueEntries.${concessionType.id}.total`}
            value={requestFixedTotal || ''}
            isAllowed={({ floatValue }) =>
              floatValue === undefined ||
              floatValue <= Math.min(selectedBaseTotal, maximumValue ?? selectedBaseTotal)
            }
            onValueChange={(input, source) => {
              if (source.source === 'event') setRequestFixedTotal(input.floatValue ?? 0);
            }}
          />
        </Box>
      )}
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
        {selectedFeeHeads.map((fh: any, index: number) => {
          const fhId = fh.feeHeadId;
          const entry = values.valueEntries[concessionType.id]?.[fhId] || { basedOn: 0, amount: 0 };
          const isPercentage = permittedBasedOn === 1;
          const baseAmount = fh.amount || 0;
          const serverLine = preview?.feeHeadConcessions?.find(
            (line: any) => line.feeHeadId === fhId
          );
          const discountAmount = serverLine?.discountAmount ?? 0;
          const netAmount = serverLine?.netAmount ?? baseAmount;
          return (
            <Box key={fhId} sx={{ p: 1.5, borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {fh.feeHeadName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Eligible outstanding: {formatCurrency(baseAmount)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 7, sm: 4 }}>
                  {isPolicyFixed ? (
                    <Typography variant="body2" color="text.secondary">
                      Calculated automatically by policy ·{' '}
                      {calculationMethod === 'Percentage'
                        ? `${assignedStructureData?.concessionPercentageValue ?? 0}%`
                        : calculationMethod === 'FixedAmount'
                          ? formatCurrency(assignedStructureData?.concessionFixedAmount ?? 0)
                          : 'Full waiver'}
                    </Typography>
                  ) : (
                    <NumericFormatCustom
                      disabled={isRequestEnteredFixed}
                      size="small"
                      fullWidth
                      name={`valueEntries.${concessionType.id}.${fhId}.amount`}
                      label={isPercentage ? 'Concession %' : 'Concession amount'}
                      value={entry.amount === 0 ? '' : entry.amount}
                      prefix={isPercentage ? '' : '₹ '}
                      suffix={isPercentage ? '%' : ''}
                      roundToWholeRupees={false}
                      decimalScale={2}
                      slotProps={{ inputLabel: { shrink: true } }}
                      isAllowed={({ floatValue }) =>
                        floatValue === undefined ||
                        floatValue <=
                          (isPercentage
                            ? Math.min(100, maximumValue ?? 100)
                            : Math.min(baseAmount, maximumValue ?? baseAmount))
                      }
                      onValueChange={(input, source) => {
                        if (source.source !== 'event') return;
                        const numVal = input.floatValue ?? 0;
                        const discount = isPercentage ? (baseAmount * numVal) / 100 : numVal;
                        setEntry(
                          concessionType.id,
                          fhId,
                          'amount',
                          input.value,
                          baseAmount - discount
                        );
                      }}
                    />
                  )}
                </Grid>
                <Grid
                  size={{ xs: 5, sm: 4 }}
                  sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Concession
                  </Typography>
                  <Typography variant="subtitle2">−{formatCurrency(discountAmount)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Net payable: {formatCurrency(netAmount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default ValueEntryStep;
