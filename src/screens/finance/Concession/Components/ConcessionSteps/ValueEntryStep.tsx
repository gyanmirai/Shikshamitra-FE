import React, { useMemo, useCallback } from 'react';
import PercentIcon from '@mui/icons-material/Percent';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStandardFeeStructureQuery } from 'src/redux/student/admission/admission-api';
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
    (concessionTypeId: string, feeHeadId: string, field: 'basedOn' | 'amount', value: any) => {
      const prev = values.valueEntries[concessionTypeId]?.[feeHeadId] || {
        basedOn: 0, // 0 for Amount, 1 for Percentage
        amount: 0,
      };

      // If switching basedOn, reset amount to 0 specifically
      // Or keep it? Usually resetting is safer to avoid confusion (e.g. 5000% is invalid)
      let newAmount = prev.amount;
      if (field === 'basedOn') {
        newAmount = 0;
      } else {
        newAmount = value; // field is 'amount' here
      }

      setFieldValue('valueEntries', {
        ...values.valueEntries,
        [concessionTypeId]: {
          ...values.valueEntries[concessionTypeId],
          [feeHeadId]: {
            ...prev,
            [field]: value,
            amount: field === 'basedOn' ? 0 : value,
          },
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
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: values.studentId,
    options: { skip: !values.studentId },
  });

  const selectedFeeHeadIds: string[] = values.selectedFeeHeads[concessionType.id] || [];

  // We need to match IDs to names and amounts
  const selectedFeeHeads =
    assignedStructureData?.feeHeads?.filter((fh: any) =>
      selectedFeeHeadIds.includes(fh.feeHeadId)
    ) || [];

  if (selectedFeeHeads.length === 0) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <Card
      sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      variant="outlined"
    >
      <Box
        sx={{
          p: 2,
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

      <CardContent sx={{ p: 2 }}>
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
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={entry.amount || ''} // Handle 0 well
                      onChange={(e) => {
                        const val = e.target.value;
                        // Prevent negative
                        if (parseFloat(val) < 0) return;
                        // If percentage, limit to 100?
                        if (isPercentage && parseFloat(val) > 100) return;
                        setEntry(concessionType.id, fhId, 'amount', Number(val));
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tooltip
                              title={
                                isPercentage ? 'Switch to Amount (₹)' : 'Switch to Percentage (%)'
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setEntry(concessionType.id, fhId, 'basedOn', isPercentage ? 0 : 1)
                                }
                              >
                                {isPercentage ? (
                                  <PercentIcon fontSize="small" />
                                ) : (
                                  <CurrencyRupeeIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      placeholder="0"
                    />
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
