import React, { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStandardFeeStructureQuery } from 'src/redux/student/admission/admission-api';
import {
  Box,
  Card,
  Grid,
  Table,
  Paper,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  TableContainer,
} from '@mui/material';

interface ReviewSubmitStepProps {
  formik: any;
  concessionTypes: any[];
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ formik, concessionTypes }) => {
  const { values, handleChange, handleBlur } = formik;
  const theme = useTheme();

  // Fetch fee structure to get original amounts and names
  const { data: assignedStructureData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: values.studentId,
    options: { skip: !values.studentId },
  });

  // Calculate breakdown and totals
  const breakdown = useMemo(() => {
    let totalFee = 0;
    let totalDiscount = 0;
    const rows: any[] = [];

    const selectedTypeIds = values.concessionTypeIds || [];

    selectedTypeIds.forEach((ctId: string) => {
      const concessionType = concessionTypes.find((ct: any) => ct.id === ctId);
      const feeHeadIds = values.selectedFeeHeads?.[ctId] || [];

      if (feeHeadIds.length > 0) {
        rows.push({
          type: 'header',
          name: concessionType?.concessionName || concessionType?.name || 'Unknown Concession',
          id: ctId,
        });

        feeHeadIds.forEach((fhId: string) => {
          const feeHeadDef = assignedStructureData?.feeHeads?.find(
            (fh: any) => fh.feeHeadId === fhId
          );
          const entry = values.valueEntries?.[ctId]?.[fhId] || { basedOn: 0, amount: 0 };

          if (feeHeadDef) {
            const baseAmount = feeHeadDef.amount || 0;
            let discount = 0;

            if (entry.basedOn === 1) {
              // Percentage
              const percent = parseFloat(entry.amount) || 0;
              discount = (baseAmount * percent) / 100;
            } else {
              // Flat Amount
              discount = parseFloat(entry.amount) || 0;
            }

            const net = baseAmount - discount;

            totalFee += baseAmount;
            totalDiscount += discount;

            rows.push({
              type: 'row',
              id: fhId,
              name: feeHeadDef.feeHeadName,
              baseAmount,
              entryType: entry.basedOn === 1 ? 'PERCENTAGE' : 'FLAT',
              entryValue: entry.amount,
              discount,
              net,
            });
          }
        });
      }
    });

    return { totalFee, totalDiscount, netPayable: totalFee - totalDiscount, rows };
  }, [values, concessionTypes, assignedStructureData]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <Box sx={{ p: 1 }}>
      {/* Summary Stats Card */}
      <Card sx={{ mb: 1 }}>
        <CardContent sx={{ p: 1, pb: 0 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                TOTAL ANNUAL FEE (SELECTED HEADS)
              </Typography>
              <Typography variant="h6">{formatCurrency(breakdown.totalFee)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                TOTAL DISCOUNT
              </Typography>
              <Typography variant="h6">{formatCurrency(breakdown.totalDiscount)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                NET PAYABLE
              </Typography>
              <Typography variant="h6" color="secondary.light">
                {formatCurrency(breakdown.netPayable)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Concession Breakdown Table */}
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}
      >
        CONCESSION BREAKDOWN
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: theme.palette.grey[200] }}>
            <TableRow>
              <TableCell>Concession Type / Fee Head</TableCell>
              <TableCell align="right">Original (₹)</TableCell>
              <TableCell align="center">Entry Type</TableCell>
              <TableCell align="right">Discount (₹)</TableCell>
              <TableCell align="right">Net Payable (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breakdown.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No fee heads selected.
                </TableCell>
              </TableRow>
            ) : (
              breakdown.rows.map((row: any, index: number) => {
                if (row.type === 'header') {
                  return (
                    <TableRow
                      key={`header-${row.id}-${index}`}
                      sx={{ bgcolor: theme.palette.action.hover }}
                    >
                      <TableCell
                        colSpan={6}
                        sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
                      >
                        {row.name}
                      </TableCell>
                    </TableRow>
                  );
                }
                return (
                  <TableRow key={`row-${row.id}-${index}`}>
                    <TableCell sx={{ pl: 4 }}>{row.name}</TableCell>
                    <TableCell align="right">{formatCurrency(row.baseAmount)}</TableCell>
                    <TableCell align="center">
                      <Box
                        component="span"
                        sx={{
                          bgcolor:
                            row.entryType === 'PERCENTAGE' ? 'info.lighter' : 'success.lighter',
                          color: row.entryType === 'PERCENTAGE' ? 'info.dark' : 'success.dark',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          typography: 'caption',
                          fontWeight: 'bold',
                        }}
                      >
                        {row.entryType}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      -{formatCurrency(row.discount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(row.net)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Remarks Section */}
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase' }}
      >
        REMARKS / JUSTIFICATION
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Enter any additional remarks or justification..."
        name="remarks"
        value={values.remarks}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Box>
  );
};

export default ReviewSubmitStep;
