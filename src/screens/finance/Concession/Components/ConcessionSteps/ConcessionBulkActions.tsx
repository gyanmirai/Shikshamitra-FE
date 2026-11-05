import type { ConcessionEligibleDueFee } from 'src/redux/finance/ConcessionManagement/types';

import { useId, useState } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { allocateConcessionBulk } from './concessionBulkAllocation';

import type { ConcessionBulkMode } from './concessionBulkAllocation';

type Props = {
  lines: ConcessionEligibleDueFee[];
  targetIds: string[];
  entries: Record<string, number | string>;
  maximum: number;
  percentage: boolean;
  decimalPlaces: 0 | 2;
  disabled?: boolean;
  onApply: (entries: Record<string, number | string>) => void;
};

/** A draft becomes a single Formik update only after the complete batch is valid. */
export default function ConcessionBulkActions({
  lines,
  targetIds,
  entries,
  maximum,
  percentage,
  decimalPlaces,
  disabled = false,
  onApply,
}: Props) {
  const helpId = useId();
  const [perInstallment, setPerInstallment] = useState('');
  const [total, setTotal] = useState('');
  const [attempted, setAttempted] = useState<ConcessionBulkMode | null>(null);
  const allocation = (mode: ConcessionBulkMode) =>
    allocateConcessionBulk({
      lines,
      targetIds,
      entries,
      value: mode === 'perInstallment' ? perInstallment : total,
      mode,
      maximum,
      percentage,
      decimalPlaces,
    });
  const error = attempted ? allocation(attempted).error : undefined;
  const apply = (mode: ConcessionBulkMode) => {
    if (disabled || !targetIds.length) return;
    const result = allocation(mode);
    setAttempted(result.error ? mode : null);
    if (result.entries) onApply(result.entries);
  };
  return (
    <Box sx={{ mb: 1.5, minWidth: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.5 }}>
        {(['perInstallment', 'equalTotal'] as const).map((mode) => {
          const perRow = mode === 'perInstallment';
          const fieldError = attempted === mode ? error : undefined;
          return (
            <Stack
              key={mode}
              direction={{ xs: 'column', sm: 'row' }}
              gap={1}
              alignItems="flex-start"
              sx={{ minWidth: 0 }}
            >
              <NumericFormatCustom
                fullWidth
                size="small"
                name={perRow ? 'bulkConcessionPerInstallment' : 'bulkConcessionTotal'}
                label={
                  perRow
                    ? percentage
                      ? 'Percentage per installment'
                      : 'Amount per installment'
                    : percentage
                      ? 'Total concession percentage'
                      : 'Total concession amount'
                }
                value={perRow ? perInstallment : total}
                prefix={percentage ? '' : '₹ '}
                suffix={percentage ? '%' : ''}
                roundToWholeRupees={false}
                decimalScale={decimalPlaces}
                disabled={disabled}
                slotProps={{ htmlInput: fieldError ? {} : { 'aria-describedby': helpId } }}
                error={Boolean(fieldError)}
                helperText={fieldError}
                onValueChange={(input, source) => {
                  if (source.source !== 'event') return;
                  (perRow ? setPerInstallment : setTotal)(input.value);
                  setAttempted(null);
                }}
              />
              <Button
                type="button"
                size="small"
                variant="outlined"
                disabled={
                  disabled || !targetIds.length || !(perRow ? perInstallment : total).trim()
                }
                onClick={() => apply(mode)}
                startIcon={<Iconify icon={perRow ? 'mdi:content-copy' : 'mdi:equal'} width={18} />}
                sx={{ flexShrink: 0 }}
              >
                {perRow ? 'Apply to all installments' : 'Auto-distribute equal'}
              </Button>
            </Stack>
          );
        })}
      </Box>
      <Typography
        id={helpId}
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mt: 0.75 }}
      >
        {targetIds.length} installments checked for bulk actions. Only checked installments are
        updated; other amounts stay unchanged.
      </Typography>
    </Box>
  );
}
