import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ConcessionEligibleDueFee } from 'src/redux/finance/ConcessionManagement/types';

import { useId } from 'react';
import { visuallyHidden } from '@mui/utils';
import { Box, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { roundUpWithinAmount } from 'src/utils/whole-rupee-amount';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { concessionInstallmentLabel } from '../concessionInstallmentLabel';

export default function RequestEnteredInstallmentTable({
  formik,
  lines,
  validationErrors,
  percentage,
  maximum,
  enteredTotal,
  tableKey,
}: {
  formik: any;
  lines: ConcessionEligibleDueFee[];
  validationErrors: Record<string, string>;
  percentage: boolean;
  maximum: number;
  enteredTotal: number;
  tableKey: string;
}) {
  const descriptionPrefix = useId();
  const entries: Record<string, number | string> = formik.values.dueFeeEntries || {};
  const money = (amount: number) => formatNumber(amount, 'INR');
  const errorFor = (line: ConcessionEligibleDueFee) =>
    validationErrors[line.dueFeeId] ||
    (formik.touched.dueFeeEntries?.[line.dueFeeId] && formik.errors.dueFeeEntries?.[line.dueFeeId]);
  const columns: IColumn[] = [
    {
      id: 'installmentLabel',
      label: 'Installment / fee',
      minWidth: 150,
      rowHeader: true,
      render: (_, row) => (
        <>
          <Typography variant="body2">
            {concessionInstallmentLabel(row.installmentLabel, row.year)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.feeHeadName}
          </Typography>
        </>
      ),
    },
    {
      id: 'eligibleConcessionAmount',
      label: 'Eligible',
      minWidth: 100,
      align: 'right',
      render: (value) => money(value),
    },
    {
      id: 'concessionValue',
      label: percentage ? 'Concession %' : 'Concession amount',
      minWidth: 170,
      render: (_, row) => {
        const line = row as ConcessionEligibleDueFee;
        const value = Number(entries[line.dueFeeId] || 0);
        const available = Math.min(
          percentage ? maximum : line.eligibleConcessionAmount,
          Math.max(0, Number((maximum - enteredTotal + value).toFixed(2)))
        );
        const error = errorFor(line);
        const description = percentage
          ? `Maximum: ${maximum}% per request. Available for this installment: ${available}%`
          : `Available for this installment: ${money(available)}`;
        const descriptionId = `${descriptionPrefix}-${line.dueFeeId}-allowance`;
        return (
          <>
            <NumericFormatCustom
              fullWidth
              size="small"
              name={`dueFeeEntries.${line.dueFeeId}`}
              label={percentage ? 'Concession %' : 'Concession amount'}
              value={entries[line.dueFeeId] ?? ''}
              roundToWholeRupees={false}
              decimalScale={2}
              prefix={percentage ? '' : '₹ '}
              suffix={percentage ? '%' : ''}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  'aria-label': `${line.installmentLabel} ${line.feeHeadName} ${percentage ? 'concession percentage' : 'concession amount'}`,
                  ...(!error && { 'aria-describedby': descriptionId }),
                },
              }}
              isAllowed={({ floatValue }) =>
                floatValue === undefined || (floatValue >= 0 && floatValue <= available)
              }
              onValueChange={(input, source) => {
                if (source.source === 'event')
                  formik.setFieldValue('dueFeeEntries', {
                    ...entries,
                    [line.dueFeeId]: input.value,
                  });
              }}
              onBlur={formik.handleBlur}
              error={Boolean(error)}
              helperText={error || undefined}
              FormHelperTextProps={{ sx: { mt: 0.5, mx: 0 } }}
            />
            <Box component="span" id={descriptionId} sx={visuallyHidden}>
              {description}
            </Box>
          </>
        );
      },
    },
    {
      id: 'reduction',
      label: 'Reduction',
      minWidth: 100,
      align: 'right',
      render: (_, row) => {
        const line = row as ConcessionEligibleDueFee;
        const value = Number(entries[line.dueFeeId] || 0);
        const estimate = percentage
          ? roundUpWithinAmount(
              (line.eligibleConcessionAmount * value) / 100,
              line.eligibleConcessionAmount
            )
          : Math.min(value, line.eligibleConcessionAmount);
        return errorFor(line) ? '—' : `−${money(estimate)}`;
      },
    },
  ];

  if (!lines.length)
    return (
      <Typography color="text.secondary" sx={{ py: 1 }}>
        Select eligible fee heads to enter installment amounts.
      </Typography>
    );

  return (
    <CustomizableTable
      tableId={`concession-request-installments-${tableKey}`}
      tableTitle="Installment concessions"
      variant="embedded"
      columns={columns.map((column) => ({ ...column, isFilter: false, isSort: false }))}
      data={lines.map((line) => ({ ...line, id: line.dueFeeId }))}
      showToolbar={false}
      showColumns={false}
      showExport={false}
      showFullScreen={false}
      isSearch={false}
      isFilter={false}
      isPagination={false}
      isShowedDense={false}
      wrapperProps={{ sx: { flex: '0 0 auto', minWidth: 0 } }}
      tableContainerProps={{ sx: { height: 'auto', maxHeight: 360 } }}
    />
  );
}
