import React, { useMemo, useCallback } from 'react';
import type { RootState } from 'src/redux/store';
import { useSelector } from 'react-redux';
import PercentIcon from '@mui/icons-material/Percent';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetStudentFeeStructureQuery } from 'src/redux/student/admission/admission-api';
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
	const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: assignedStructureData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentFeeStructureQuery,
		params: { studentId: values.studentId, academicYearId: currentYear?.id },
		options: { skip: !values.studentId || !currentYear?.id },
  });

  const selectedFeeHeadIds: string[] = values.selectedFeeHeads[concessionType.id] || [];
  const isPolicyFixed = assignedStructureData?.concessionValueSource === 'PolicyFixed';
	const calculationMethod = assignedStructureData?.concessionCalculationMethod;
	const permittedBasedOn = calculationMethod === 'Percentage' ? 1 : 0;
	const maximumValue = calculationMethod === 'Percentage'
		? assignedStructureData?.maximumConcessionPercentage
		: assignedStructureData?.maximumConcessionFixedAmount;

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
        (sum: number, feeHead: any) => sum + (feeHead.amount || 0), 0
      );

      selectedFeeHeads.forEach((fh: any) => {
        const fhId = fh.feeHeadId;
        const existingEntry = values.valueEntries[concessionType.id]?.[fhId];
        const baseAmount = fh.amount || 0;

        // If entry is missing OR netAmount is missing (for existing entries from prev steps that might be incomplete)
        if (isPolicyFixed) {
          const method = assignedStructureData?.concessionCalculationMethod;
          const basedOn = method === 'FixedAmount' ? 0 : 1;
          const amount = method === 'Percentage'
            ? assignedStructureData?.concessionPercentageValue || 0
            : method === 'FullWaiver'
              ? 100
              : selectedBaseTotal > 0
                ? ((assignedStructureData?.concessionFixedAmount || 0) * baseAmount) / selectedBaseTotal
                : 0;
          const discount = basedOn === 1 ? (baseAmount * amount) / 100 : amount;
          updates[fhId] = { basedOn, amount, netAmount: Math.max(0, baseAmount - discount) };
          hasUpdates ||= !existingEntry || existingEntry.basedOn !== basedOn || existingEntry.amount !== amount;
		} else if (!existingEntry || existingEntry.netAmount === undefined || existingEntry.basedOn !== permittedBasedOn) {
          // Default: 0 discount, so netAmount = baseAmount
          // If existing entry has amount, calculate net based on it (though usually it's 0 if uninitialized)
			const currentAmount = existingEntry?.basedOn === permittedBasedOn ? existingEntry?.amount || 0 : 0;
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
  }, [selectedFeeHeads, concessionType.id, values.valueEntries, setEntry, isPolicyFixed,
    permittedBasedOn,
    assignedStructureData?.concessionCalculationMethod,
    assignedStructureData?.concessionPercentageValue,
    assignedStructureData?.concessionFixedAmount]);
  // Better to check if update is needed inside to avoid loop. The check `!existingEntry || existingEntry.netAmount === undefined` protects against loop if we set it correctly.

  if (selectedFeeHeads.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} variant="outlined">
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
              Values are calculated automatically by {assignedStructureData?.concessionPolicyName}
              {' '}v{assignedStructureData?.concessionPolicyVersion} and cannot be edited.
            </Typography>
          </Box>
        )}
        {selectedFeeHeads.map((fh: any, index: number) => {
          const fhId = fh.feeHeadId;
          const entry = values.valueEntries[concessionType.id]?.[fhId] || {
            basedOn: 0,
            amount: 0,
          };
		  const isPercentage = permittedBasedOn === 1;

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
                        disabled={isPolicyFixed}
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
						inputProps={{ min: 0, max: Math.min(100, maximumValue ?? 100), step: 'any' }}
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
                        disabled={isPolicyFixed}
                        size="small"
                        fullWidth
                        placeholder="0"
                        value={entry.amount === 0 ? '' : entry.amount}
                        isAllowed={(vals) => {
                          const { floatValue } = vals;
						  return floatValue === undefined || floatValue <= Math.min(baseAmount, maximumValue ?? baseAmount);
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
							<Tooltip title="Fixed amount is required by the assigned policy">
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
