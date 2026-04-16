import PercentIcon from '@mui/icons-material/Percent';
import React, { useMemo, useEffect, useCallback } from 'react';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import { useGetConcessionRequestValueEntriesQuery } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
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
}

const ValueEntryStep: React.FC<Props> = ({ formik, concessionTypes }) => {
  const { values, setFieldValue } = formik;
  const { concessionRequestId } = values;

  // New API call to fetch saved value entries
  const { data: valueEntriesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionRequestValueEntriesQuery,
    params: concessionRequestId,
    options: {
      skip: !concessionRequestId,
      refetchOnMountOrArgChange: true,
    },
  });

  // Hydrate Formik with fetched data
  useEffect(() => {
    if (valueEntriesData?.data?.concessionTypeValues) {
      const hydratedValueEntries: Record<
        string,
        Record<
          string,
          {
            basedOn: 0 | 1;
            amount: number;
            netAmount: number;
          }
        >
      > = {};

      valueEntriesData.data.concessionTypeValues.forEach((ct: any) => {
        hydratedValueEntries[ct.concessionTypeId] = {};
        if (ct.feeHeadValues) {
          ct.feeHeadValues.forEach((fh: any) => {
            hydratedValueEntries[ct.concessionTypeId][fh.feeHeadId] = {
              basedOn: fh.basedOn,
              amount: fh.amount,
              netAmount: fh.netAmount,
            };
          });
        }
      });

      // Merge with existing logic or just set it
      // Since this is hydration on load/edit, we should probably check if keys exist in formik first?
      // Or if formik is empty for these keys?
      // The requirement says "run once on mount in edit mode".
      // We can check if `values.valueEntries` is empty or if we want to overwrite.
      // Usually, if we are fetching data, we want to set it.
      // However, to avoid overwriting user changes if they started editing before fetch completes (unlikely but possible),
      // we might want to be careful. But typically hydration overwrites initial empty state.

      // Only set if we have keys to set.
      if (Object.keys(hydratedValueEntries).length > 0) {
        setFieldValue('valueEntries', hydratedValueEntries);
      }
    }
  }, [valueEntriesData, setFieldValue]);

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
    <Box sx={{ p: 2 }}>
      {selectedTypes.map((ct: any) => (
        <ValueEntryStepItem key={ct.id} concessionType={ct} values={values} setEntry={setEntry} />
      ))}
      {selectedTypes.every((ct: any) => (values.selectedFeeHeads[ct.id] || []).length === 0) && (
        <Typography color="text.disabled" textAlign="center" py={4}>
          No fee heads selected. Go back to Step 3.
        </Typography>
      )}
    </Box>
  );
};

const ValueEntryStepItem = ({ concessionType, values, setEntry }: any) => {
  const { data: assignedStructureData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
    params: { studentId: values.studentId },
    options: { skip: !values.studentId },
  });

  const selectedFeeHeadIds: string[] = values.selectedFeeHeads[concessionType.id] || [];

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

      selectedFeeHeads.forEach((fh: any) => {
        const fhId = fh.feeHeadId;
        const existingEntry = values.valueEntries[concessionType.id]?.[fhId];

        // If entry is missing OR netAmount is missing (for existing entries from prev steps that might be incomplete)
        if (!existingEntry || existingEntry.netAmount === undefined) {
          const baseAmount = fh.amount || 0;
          // Default: 0 discount, so netAmount = baseAmount
          // If existing entry has amount, calculate net based on it (though usually it's 0 if uninitialized)
          const currentAmount = existingEntry?.amount || 0;
          const isPercentage = existingEntry?.basedOn === 1;

          let discount = 0;
          if (isPercentage) {
            discount = (baseAmount * currentAmount) / 100;
          } else {
            discount = currentAmount;
          }
          const netAmount = baseAmount - discount;

          updates[fhId] = {
            basedOn: existingEntry?.basedOn ?? 0,
            amount: existingEntry?.amount ?? 0,
            netAmount: Number(netAmount.toFixed(2)),
          };
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        setEntry(concessionType.id, 'BATCH_UPDATE', 'amount', updates);
      }
    }
  }, [selectedFeeHeads, concessionType.id, values.valueEntries, setEntry]); // heavily dependent on values, might cause loops if not careful.
  // Better to check if update is needed inside to avoid loop. The check `!existingEntry || existingEntry.netAmount === undefined` protects against loop if we set it correctly.

  if (selectedFeeHeads.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <Card
      sx={{ mb: 1, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      variant="outlined"
    >
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
        {selectedFeeHeads.map((fh: any, index: number) => {
          const fhId = fh.feeHeadId;
          const entry = values.valueEntries[concessionType.id]?.[fhId] || {
            basedOn: 0,
            amount: 0,
          };
          const isPercentage = entry.basedOn === 1;

          // Calculations
          const baseAmount = fh.amount || 0;
          let discountAmount = 0;

          if (isPercentage) {
            const percent = parseFloat(entry.amount) || 0;
            discountAmount = (baseAmount * percent) / 100;
          } else {
            discountAmount = parseFloat(entry.amount) || 0;
          }
          // Cap discount at base amount? Usually yes, but depends on logic. Let's not enforce strictly here for display, but user sees net.
          const netAmount = baseAmount - discountAmount;

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
                      Annual Base:{' '}
                      <Box component="span" fontWeight={500} color="text.primary">
                        {formatCurrency(baseAmount)}
                      </Box>
                    </Typography>
                  </Grid>

                  {/* Input Section */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    {isPercentage ? (
                      /* ---- Percentage mode: plain number 0-100 ---- */
                      <TextField
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
                          if (numVal < 0 || numVal > 100) return;
                          const newDiscount = (baseAmount * numVal) / 100;
                          setEntry(
                            concessionType.id,
                            fhId,
                            'amount',
                            numVal,
                            baseAmount - newDiscount
                          );
                        }}
                        inputProps={{ min: 0, max: 100, step: 'any' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Tooltip title="Switch to Amount (₹)">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setEntry(concessionType.id, fhId, 'basedOn', 0, baseAmount)
                                  }
                                >
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
                        size="small"
                        fullWidth
                        placeholder="0"
                        value={entry.amount === 0 ? '' : entry.amount}
                        isAllowed={(vals) => {
                          const { floatValue } = vals;
                          return floatValue === undefined || floatValue <= baseAmount;
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
                              <Tooltip title="Switch to Percentage (%)">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setEntry(concessionType.id, fhId, 'basedOn', 1, baseAmount)
                                  }
                                >
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
