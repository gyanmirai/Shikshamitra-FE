import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

import React, { useMemo, useCallback } from 'react';
import PercentIcon from '@mui/icons-material/Percent';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Card,
  Grid,
  Stack,
  Tooltip,
  Divider,
  TextField,
  Typography,
  IconButton,
  CardContent,
  InputAdornment,
} from '@mui/material';

interface Props {
  formik: any;
  concessionTypes: any[];
  requestContext?: ConcessionRequestContext;
  policy?: ConcessionPolicyOption;
  preview?: ConcessionRequestPreview;
}

const ValueEntryStep: React.FC<Props> = ({
  formik,
  concessionTypes,
  requestContext,
  policy,
  preview,
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
        <RequestEnteredInstallments formik={formik} requestContext={requestContext} policy={policy} preview={preview} />
      ) : selectedTypes.map((ct: any) => (
        <ValueEntryStepItem
          key={ct.id}
          concessionType={ct}
          values={values}
          setEntry={setEntry}
          requestContext={requestContext}
          policy={policy}
          preview={preview}
        />
      ))}
      {selectedTypes.every((ct: any) => (values.selectedFeeHeads[ct.id] || []).length === 0) && (
        <Typography color="text.disabled" textAlign="center" py={4}>
          No fee heads selected. Go back to Step 3.
        </Typography>
      )}
    </Box>
  );
};

function RequestEnteredInstallments({ formik, requestContext, policy, preview }: {
  formik: any;
  requestContext?: ConcessionRequestContext;
  policy: ConcessionPolicyOption;
  preview?: ConcessionRequestPreview;
}) {
  const { values, setFieldValue } = formik;
  const selectedHeads = new Set<string>(values.selectedFeeHeads[values.concessionTypeId] || []);
  const lines = (requestContext?.eligibleDueFees || []).filter((line) =>
    selectedHeads.has(line.feeHeadId) && line.eligibleConcessionAmount > 0);
  const groups = lines.reduce<Record<string, typeof lines>>((acc, line) => {
    const key = `${line.year}-${line.installmentLabel}`;
    (acc[key] ||= []).push(line);
    return acc;
  }, {});
  const entries: Record<string, number> = values.dueFeeEntries || {};
  const enteredTotal = lines.reduce((sum, line) => sum + Number(entries[line.dueFeeId] || 0), 0);
  const percentage = policy.calculationMethod === 'Percentage';
  const maximum = percentage ? Math.min(100, policy.maximumPercentage ?? 100)
    : policy.maximumFixedAmount ?? Number.POSITIVE_INFINITY;
  const money = (amount: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Math.ceil(amount));

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Enter a {percentage ? 'percentage' : 'rupee amount'} for each eligible installment line.
        {policy.applyOn === 'AllFees'
          ? policy.autoCreateRefund === false
            ? 'Paid amounts can be discounted. The paid concession is refundable; create linked refund requests manually after approval.'
            : 'Paid amounts can be discounted. The paid concession automatically creates linked refund requests after approval.'
          : 'Only the remaining outstanding balance can be discounted.'}
      </Typography>
      {Object.entries(groups).map(([installment, rows]) => (
        <Card key={installment} variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>{installment.substring(5)}</Typography>
            <Stack spacing={1.5}>
              {(rows || []).map((line) => {
                const value = Number(entries[line.dueFeeId] || 0);
                const estimate = percentage
                  ? Math.round(line.eligibleConcessionAmount * value) / 100
                  : Math.min(value, line.eligibleConcessionAmount);
                return (
                  <Grid container spacing={1} alignItems="center" key={line.dueFeeId}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Typography variant="body2" fontWeight={600}>{line.feeHeadName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Paid {money(line.paidAmount)} · eligible {money(line.eligibleConcessionAmount)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 7, sm: 3 }}>
                      <TextField fullWidth size="small" type="number"
                        label={percentage ? 'Concession %' : 'Concession ₹'}
                        value={entries[line.dueFeeId] ?? ''}
                        inputProps={{ min: 0, max: percentage ? maximum : line.eligibleConcessionAmount, step: 0.01 }}
                        onChange={(event) => {
                          const next = event.target.value === '' ? 0 : Number(event.target.value);
                          if (!Number.isFinite(next) || next < 0 || next >
                            (percentage ? maximum : line.eligibleConcessionAmount)) return;
                          if (!percentage && enteredTotal - value + next > maximum) return;
                          setFieldValue('dueFeeEntries', { ...entries, [line.dueFeeId]: next });
                        }} />
                    </Grid>
                    <Grid size={{ xs: 5, sm: 4 }} sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="success.main">−{money(estimate)}</Typography>
                    </Grid>
                  </Grid>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ))}
      {lines.length === 0 && <Typography color="text.secondary">Select eligible fee heads to enter installment amounts.</Typography>}
      {!percentage && Number.isFinite(maximum) && (
        <Typography variant="caption">Entered total {money(enteredTotal)} of {money(maximum)} allowed</Typography>
      )}
      {preview && <Typography variant="subtitle2">Calculated concession: {money(preview.totalConcessionAmount)}</Typography>}
    </Stack>
  );
}

const ValueEntryStepItem = ({
  concessionType,
  values,
  setEntry,
  requestContext,
  policy,
  preview,
}: any) => {
  const assignedStructureData = requestContext && policy
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

  if (selectedFeeHeads.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.ceil(amount));

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
    <Card sx={{ borderRadius: 2, boxShadow: 'var(--shadows-4)' }} variant="outlined">
      <Box
        sx={{
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.default', // distinctive header background
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: 'primary.main' }}>
          {concessionType.concessionName || concessionType.name}
        </Typography>
      </Box>

      <CardContent sx={{ p: 1 }}>
        {isPolicyFixed && (
          <Box sx={{ px: 1, pb: 1 }}>
            <Typography variant="caption" color="info.main">
              Values are calculated automatically by {assignedStructureData?.concessionPolicyName} v
              {assignedStructureData?.concessionPolicyVersion} and cannot be edited.
            </Typography>
          </Box>
        )}
        {isRequestEnteredFixed && (
          <Box sx={{ px: 1, pb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Total fixed concession for this request (allocated proportionally by the server)
            </Typography>
            <NumericFormatCustom
              size="small"
              fullWidth
              value={requestFixedTotal || ''}
              isAllowed={(input) =>
                input.floatValue === undefined ||
                input.floatValue <= Math.min(selectedBaseTotal, maximumValue ?? selectedBaseTotal)
              }
              onValueChange={(input) => setRequestFixedTotal(input.floatValue ?? 0)}
              onChange={undefined}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText={`Maximum per request: ${formatCurrency(maximumValue ?? selectedBaseTotal)}`}
            />
          </Box>
        )}
        {selectedFeeHeads.map((fh: any, index: number) => {
          const fhId = fh.feeHeadId;
          const entry = values.valueEntries[concessionType.id]?.[fhId] || {
            basedOn: 0,
            amount: 0,
          };
          const isPercentage = permittedBasedOn === 1;

          const baseAmount = fh.amount || 0;
          const serverLine = preview?.feeHeadConcessions?.find(
            (line: any) => line.feeHeadId === fhId
          );
          const discountAmount = serverLine?.discountAmount ?? 0;
          const netAmount = serverLine?.netAmount ?? baseAmount;

          return (
            <React.Fragment key={fhId}>
              {index > 0 && <Divider />}
              <Box sx={{ p: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Fee Head Info */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                      {fh.feeHeadName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Eligible outstanding:{' '}
                      <Box component="span" fontWeight={500} color="text.primary">
                        {formatCurrency(baseAmount)}
                      </Box>
                    </Typography>
                  </Grid>

                  {/* Input Section */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {isPolicyFixed ? (
                      <Typography variant="body2" color="text.secondary">
                        Calculated by policy · {calculationMethod === 'Percentage'
                          ? `${assignedStructureData?.concessionPercentageValue ?? 0}%`
                          : calculationMethod === 'FixedAmount'
                            ? formatCurrency(assignedStructureData?.concessionFixedAmount ?? 0)
                            : 'Full waiver'}
                      </Typography>
                    ) : isPercentage ? (
                      /* ---- Percentage mode: plain number 0-100 ---- */
                      <TextField
                        disabled={isPolicyFixed || isRequestEnteredFixed}
                        size="small"
                        fullWidth
                        type="number"
                        value={entry.amount === 0 ? '' : entry.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setEntry(concessionType.id, fhId, 'amount', 0, baseAmount);
                            return;
                          }
                          const numVal = parseFloat(val);
                          if (numVal < 0 || numVal > Math.min(100, maximumValue ?? 100)) return;
                          const newDiscount = (baseAmount * numVal) / 100;
                          setEntry(
                            concessionType.id,
                            fhId,
                            'amount',
                            numVal,
                            baseAmount - newDiscount
                          );
                        }}
                        inputProps={{
                          min: 0,
                          max: Math.min(100, maximumValue ?? 100),
                          step: 'any',
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Tooltip title="Percentage is required by the assigned policy">
                                <IconButton disabled size="small">
                                  <PercentIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                        placeholder="0"
                      />
                    ) : (
                      /* ---- Rupee mode: formatted with ₹ and commas ---- */
                      <NumericFormatCustom
                        disabled={isPolicyFixed || isRequestEnteredFixed}
                        size="small"
                        fullWidth
                        placeholder="0"
                        value={entry.amount === 0 ? '' : entry.amount}
                        isAllowed={(vals) => {
                          const { floatValue } = vals;
                          return (
                            floatValue === undefined ||
                            floatValue <= Math.min(baseAmount, maximumValue ?? baseAmount)
                          );
                        }}
                        onValueChange={(vals) => {
                          const numVal = vals.floatValue ?? 0;
                          setEntry(concessionType.id, fhId, 'amount', numVal, baseAmount - numVal);
                        }}
                        // suppress the default onChange so NumericFormat doesn't fight with onValueChange
                        onChange={undefined}
                        prefix=""
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Tooltip
                                title={
                                  isRequestEnteredFixed
                                    ? 'Allocated from the request total above'
                                    : 'Fixed amount is required by the assigned policy'
                                }
                              >
                                <IconButton disabled size="small">
                                  <CurrencyRupeeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Grid>

                  {/* Calculation Result */}
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ textAlign: 'right' }}>
                    <Stack direction="column" alignItems="flex-end">
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 700,
                          color: 'success.dark',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        - {formatCurrency(discountAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Net:{' '}
                        <Box component="span" fontWeight={600} color="text.primary">
                          {formatCurrency(netAmount)}
                        </Box>
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </React.Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ValueEntryStep;
