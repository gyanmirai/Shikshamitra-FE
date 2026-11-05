'use client';

import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { allocateAdjustmentBulk } from '../utils/allocateAdjustmentBulk';

import type { AdjustmentBulkMode, AdjustmentLineCapacity } from '../utils/allocateAdjustmentBulk';

export default function AdjustmentBulkActions({ lines, selectedIds, entries, onApply }: {
  lines: AdjustmentLineCapacity[];
  selectedIds: string[];
  entries: Record<string, string>;
  onApply: (amounts: Record<string, string>, mode: AdjustmentBulkMode) => void;
}) {
  const [perInstallment, setPerInstallment] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');

  const apply = (mode: AdjustmentBulkMode) => {
    const result = allocateAdjustmentBulk(
      lines, selectedIds, entries, mode === 'perInstallment' ? perInstallment : total, mode
    );
    setError(result.error ?? '');
    if (result.amounts) onApply(result.amounts, mode);
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems="flex-start">
          <NumericFormatCustom fullWidth size="small" name="adjustmentPerInstallment"
            label="Amount per installment" value={perInstallment} decimalScale={2}
            roundToWholeRupees={false}
            onValueChange={(value, source) => {
              if (source.source === 'event') { setPerInstallment(value.value); setError(''); }
            }} />
          <Button type="button" size="small" variant="outlined"
            disabled={!selectedIds.length || !perInstallment.trim()}
            onClick={() => apply('perInstallment')} sx={{ flexShrink: 0 }}>
            Apply to all installments
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems="flex-start">
          <NumericFormatCustom fullWidth size="small" name="adjustmentTotalAmount"
            label="Total adjustment amount" value={total} decimalScale={2}
            roundToWholeRupees={false}
            onValueChange={(value, source) => {
              if (source.source === 'event') { setTotal(value.value); setError(''); }
            }} />
          <Button type="button" size="small" variant="outlined"
            disabled={!lines.length || !total.trim()}
            onClick={() => apply('equalTotal')} sx={{ flexShrink: 0 }}>
            Auto-distribute equal
          </Button>
        </Stack>
      </Box>
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'} component="p"
        role={error ? 'alert' : undefined} sx={{ mt: 0.75 }}>
        {error || `${selectedIds.length} installments checked. Auto-distribute selects eligible rows and leaves one unpaid line to receive the transfer.`}
      </Typography>
    </Box>
  );
}
