import type { ReactNode } from 'react';
import type {
  ConcessionEligibleDueFee,
  ConcessionEligibleFeeHead,
} from 'src/redux/finance/ConcessionManagement/types';

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
  renderDetails,
}: {
  feeHeads: ConcessionSelectableFeeHead[];
  installments: ConcessionEligibleDueFee[];
  selectedIds: string[];
  activeId?: string;
  onToggle: (id: string) => void;
  onInspect: (id: string) => void;
  detailsId: string;
  detailsExpanded?: boolean;
  renderDetails: (head: ConcessionSelectableFeeHead, detailsId: string) => ReactNode;
}) {
  return (
    <Stack
      component="ul"
      aria-label="Eligible fee heads"
      spacing={1}
      sx={{ m: 0, p: 0, listStyle: 'none' }}
    >
      {feeHeads.map((head, index) => {
        const count = installments.filter((line) => line.feeHeadId === head.feeHeadId).length;
        const active = activeId === head.feeHeadId;
        const headDetailsId = `${detailsId}-${index}`;
        return (
          <Stack
            component="li"
            key={head.feeHeadId}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              minWidth: 0,
              '& .MuiAccordion-root': { m: 0, borderRadius: 0, boxShadow: 'none' },
              '& .MuiAccordionSummary-root': {
                px: 1.25,
                minHeight: 32,
                borderLeft: 0,
                borderBottom: 0,
                borderTop: 1,
                borderColor: 'divider',
                '&.Mui-expanded': { minHeight: 32 },
              },
              '& .MuiAccordionSummary-content': { my: 0.5 },
              '& .MuiAccordionSummary-root .MuiTypography-root': { typography: 'caption' },
              '& .MuiAccordionDetails-root': { pt: 0.5, px: 1.25, pb: 1 },
            }}
          >
            <Stack direction="row" alignItems="center" sx={{ px: 1, py: 0.75 }}>
              <Checkbox
                size="small"
                checked={selectedIds.includes(head.feeHeadId)}
                onChange={() => onToggle(head.feeHeadId)}
                slotProps={{ input: { 'aria-label': head.feeHeadName } }}
                sx={{ ml: -0.5, mr: 0.5 }}
              />
              <ButtonBase
                onClick={() => onInspect(head.feeHeadId)}
                aria-label={`Inspect ${head.feeHeadName}`}
                aria-pressed={active}
                aria-controls={headDetailsId}
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
                <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {head.feeHeadName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="span"
                  display="block"
                >
                  {count} installment
                  {count === 1 ? '' : 's'}
                </Typography>
              </ButtonBase>
              <Stack sx={{ ml: 1, flexShrink: 0, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Eligible amount
                </Typography>
                <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumber(head.amount, 'INR')}
                </Typography>
              </Stack>
            </Stack>
            {renderDetails(head, headDetailsId)}
          </Stack>
        );
      })}
    </Stack>
  );
}
