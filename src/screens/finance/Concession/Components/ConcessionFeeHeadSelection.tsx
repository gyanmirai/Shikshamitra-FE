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
}: {
  feeHeads: ConcessionSelectableFeeHead[];
  installments: ConcessionEligibleDueFee[];
  selectedIds: string[];
  activeId?: string;
  onToggle: (id: string) => void;
  onInspect: (id: string) => void;
  detailsId: string;
}) {
  return (
    <Stack component="ul" aria-label="Eligible fee heads" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {feeHeads.map((head) => {
        const count = installments.filter((line) => line.feeHeadId === head.feeHeadId).length;
        const active = activeId === head.feeHeadId;
        return (
          <Stack
            component="li"
            direction="row"
            key={head.feeHeadId}
            alignItems="flex-start"
            sx={{ py: 2, borderBottom: 1, borderColor: 'divider', minWidth: 0 }}
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
              <Typography
                variant="caption"
                color="text.secondary"
                component="span"
                display="block"
                mt={0.5}
              >
                {formatNumber(head.amount, 'INR')} eligible · {count} installment
                {count === 1 ? '' : 's'}
              </Typography>
              {active && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  component="span"
                  display="block"
                  mt={0.5}
                >
                  Viewing in detail panel
                </Typography>
              )}
            </ButtonBase>
          </Stack>
        );
      })}
    </Stack>
  );
}
