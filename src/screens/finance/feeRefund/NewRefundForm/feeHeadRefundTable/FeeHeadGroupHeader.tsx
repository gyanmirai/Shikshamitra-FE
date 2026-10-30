'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Chip, Button, Tooltip, Checkbox, ButtonBase, Typography } from '@mui/material';

import type { IFeeHeadPayment } from '../types';

export interface FeeHeadGroupHeaderProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  isOpen: boolean;
  contentId?: string;
  headerId?: string;
  totalRefundInput: number;
  mode?: 'refund' | 'adjustment';
  selectedReceiptId?: string;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
  applyInAllState?: { amount: number | string };
  isFullRefund?: boolean;
  onApplyInAllAmountChange?: (amount: number | string) => void;
  onApplyInAll?: () => void;
}

const FeeHeadGroupHeader: React.FC<FeeHeadGroupHeaderProps> = ({
  feeHead,
  selectedMonths,
  isOpen,
  contentId,
  headerId,
  totalRefundInput,
  mode = 'refund',
  selectedReceiptId,
  onCheckboxToggle,
  onExpandToggle,
  applyInAllState = { amount: '' },
  isFullRefund = false,
  onApplyInAllAmountChange,
  onApplyInAll,
}): React.ReactElement => {
  const isAdj = mode === 'adjustment';
  const refundableItems = feeHead.items.filter((i) => i.refundable > 0);
  const selectableItems = refundableItems.filter(
    (item) => isAdj || !selectedReceiptId || item.sourceReceiptId === selectedReceiptId
  );
  const selectedCount = refundableItems.filter((i) => selectedMonths.includes(i.month)).length;
  const isAllSelected = refundableItems.length > 0 && selectedCount === refundableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;
  const hasSelectable = selectableItems.length > 0;
  const hasSelectedMonths = selectedMonths.length > 0;
  const hasValidApplyAmount =
    String(applyInAllState.amount).trim() !== '' &&
    Number.isFinite(Number(applyInAllState.amount)) &&
    Number(applyInAllState.amount) > 0;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.neutral',
        color: 'text.primary',
        minWidth: 0,
        borderBottom: isOpen ? 1 : 0,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Tooltip
          title={
            !hasSelectable && refundableItems.length > 0
              ? 'Clear the selected installments to choose this receipt.'
              : !hasSelectable
                ? isAdj
                  ? 'No adjustable months for this fee head'
                  : 'No refundable months for this fee head'
                : ''
          }
          placement="top"
        >
          <span>
            <Checkbox
              size="small"
              checked={isAllSelected}
              indeterminate={isPartialSelected}
              disabled={!hasSelectable}
              inputProps={{
                'aria-label': `Select refundable installments for ${feeHead.feeHeadName}`,
              }}
              onChange={onCheckboxToggle}
              onClick={(e) => e.stopPropagation()}
            />
          </span>
        </Tooltip>

        <Box component="h3" sx={{ m: 0, flex: 1, minWidth: 0 }}>
          <ButtonBase
            type="button"
            aria-label={(isOpen ? 'Collapse ' : 'Expand ') + feeHead.feeHeadName}
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={onExpandToggle}
            sx={{
              width: 1,
              minWidth: 0,
              minHeight: 44,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textAlign: 'left',
              borderRadius: 1,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Typography
              id={headerId}
              component="span"
              variant="subtitle1"
              sx={{ flex: 1, minWidth: 0, fontWeight: 600, overflowWrap: 'anywhere' }}
            >
              {feeHead.feeHeadName}
            </Typography>
            <Box
              component="span"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Typography component="span" variant="body2" color="text.secondary">
                {refundableItems.length} {isAdj ? 'adjustable' : 'refundable'}
              </Typography>
              {refundableItems.length === 0 && (
                <Chip
                  component="span"
                  label={isAdj ? 'Fully adjusted' : 'Fully refunded'}
                  size="small"
                  color="default"
                  variant="soft"
                />
              )}
              {totalRefundInput > 0 && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatNumber(totalRefundInput, 'INR')}
                </Typography>
              )}
            </Box>
            <Iconify
              icon="mdi:chevron-down"
              width={20}
              sx={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </ButtonBase>
        </Box>
      </Box>
      <Box sx={{ '&:not(:empty)': { mt: 2 } }}>
        {hasSelectedMonths && !isFullRefund && (
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{
              width: { xs: 1, sm: 'auto' },
              order: { xs: 1, sm: 0 },
              justifyContent: 'flex-end',
              flexShrink: 0,
            }}
          >
            <NumericFormatCustom
              size="small"
              label="Amount per installment"
              fullWidth
              name={`apply-amount-${feeHead.feeHeadId}`}
              roundToWholeRupees={false}
              decimalScale={2}
              value={applyInAllState.amount}
              onValueChange={(vals, source) => {
                if (source.source === 'event') onApplyInAllAmountChange?.(vals.value);
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              inputProps={{
                'aria-label': `Amount for selected installments in ${feeHead.feeHeadName}`,
                style: {
                  fontVariantNumeric: 'tabular-nums',
                },
              }}
              sx={{
                width: { xs: 'auto', sm: 180 },
                minWidth: 140,
                flex: { xs: 1, sm: 'initial' },
              }}
            />
            <Tooltip
              title={
                hasValidApplyAmount
                  ? `Replace amounts for ${selectedMonths.length} selected installment${selectedMonths.length !== 1 ? 's' : ''}, up to each ${isAdj ? 'adjustable' : 'refundable'} balance`
                  : 'Enter an amount first'
              }
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon={GlobalIcons.approvedIcon} />}
                  disabled={!hasValidApplyAmount}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyInAll?.();
                  }}
                >
                  Apply
                </Button>
              </span>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeeHeadGroupHeader;
