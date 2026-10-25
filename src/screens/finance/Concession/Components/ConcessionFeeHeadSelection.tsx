import type {
  ConcessionEligibleDueFee,
  ConcessionEligibleFeeHead,
} from 'src/redux/finance/ConcessionManagement/types';

import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Stack, Checkbox, ButtonBase, Typography } from '@mui/material';

export type ConcessionSelectableFeeHead = Pick<
  ConcessionEligibleFeeHead,
  'feeHeadId' | 'feeHeadName'
> & { amount: number };

export default function ConcessionFeeHeadSelection({
  feeHeads,
  installments,
  selectedIds,
  activeId,
  onToggle,
  onInspect,
  detailsId,
  detailsExpanded = true,
}: {
  feeHeads: ConcessionSelectableFeeHead[];
  installments: ConcessionEligibleDueFee[];
  selectedIds: string[];
  activeId?: string;
  onToggle: (id: string) => void;
  onInspect: (id: string) => void;
  detailsId: string;
  detailsExpanded?: boolean;
}) {
  return (
    <Stack component="ul" aria-label="Eligible fee heads" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      <Stack
        component="li"
        aria-hidden="true"
        direction="row"
        justifyContent="space-between"
        gap={1}
        sx={{ pb: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Fee
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Eligible
        </Typography>
      </Stack>
      {feeHeads.map((head) => {
        const count = installments.filter((line) => line.feeHeadId === head.feeHeadId).length;
        const active = activeId === head.feeHeadId;
        return (
          <Stack
            component="li"
            direction="row"
            key={head.feeHeadId}
            alignItems="flex-start"
            sx={{ py: 0.75, borderBottom: 1, borderColor: 'divider', minWidth: 0 }}
          >
            <Checkbox
              size="small"
              checked={selectedIds.includes(head.feeHeadId)}
              onChange={() => onToggle(head.feeHeadId)}
              slotProps={{ input: { 'aria-label': head.feeHeadName } }}
              sx={{ ml: -1, mt: -0.5, mr: 0.5 }}
            />
            <ButtonBase
              onClick={() => onInspect(head.feeHeadId)}
              aria-label={`Inspect ${head.feeHeadName}`}
              aria-pressed={active}
              aria-controls={detailsId}
              aria-expanded={active && detailsExpanded}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'block',
                textAlign: 'left',
                borderRadius: 0.5,
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main' },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {head.feeHeadName}
                </Typography>
                <Iconify icon="solar:arrow-right-linear" width={18} sx={{ flexShrink: 0 }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" component="span" display="block">
                {count} installment
                {count === 1 ? '' : 's'}
              </Typography>
            </ButtonBase>
            <Typography
              variant="body2"
              sx={{ ml: 1, pt: 0.5, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
            >
              {formatNumber(head.amount, 'INR')}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
