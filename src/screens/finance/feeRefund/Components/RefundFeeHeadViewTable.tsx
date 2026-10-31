import React, { useId, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Stack, Typography, AccordionSummary } from '@mui/material';
import CustomAccordion from 'src/components/custom-accordian';
import CustomizableTable from 'src/components/customizabaleTable';
import { formatNumber } from 'src/utils/formate_number';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

export interface IRefundMonthItem {
  month: string;
  total: number;
  paid: number;
  refundAmount: number;
  status: FeeCollectionStatusType;
}

export interface IRefundFeeHeadItem {
  feeHeadId: string | null;
  feeHeadName: string;
  totalPaid: number;
  totalRefunded: number;
  items: IRefundMonthItem[];
}

interface Props {
  data: IRefundFeeHeadItem[];
}

const refundTotal = (head: IRefundFeeHeadItem) =>
  head.items.reduce((sum, item) => sum + item.refundAmount, 0);

const columns: IColumn[] = [
  {
    id: 'month',
    label: 'Installment',
    rowHeader: true,
    minWidth: 180,
    isFilter: false,
    isSort: false,
  },
  {
    id: 'paid',
    label: 'Paid amount',
    minWidth: 140,
    align: 'right',
    isFilter: false,
    isSort: false,
    valueType: 'money',
    render: (amount) => formatNumber(amount, 'INR'),
  },
  {
    id: 'refundAmount',
    label: 'Refund amount',
    minWidth: 140,
    align: 'right',
    isFilter: false,
    isSort: false,
    valueType: 'money',
    render: (amount) => formatNumber(amount, 'INR'),
  },
];

function FeeHeadViewGroup({ feeHead }: { feeHead: IRefundFeeHeadItem }) {
  const [open, setOpen] = useState(true);
  const sectionId = useId();
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        '& > .MuiAccordion-root': { m: 0, bgcolor: 'background.paper' },
        '& .MuiAccordionDetails-root': { p: 0 },
      }}
    >
      <CustomAccordion
        title={feeHead.feeHeadName}
        expanded={open}
        onChange={() => setOpen((value) => !value)}
        summary={
          <AccordionSummary
            id={`${sectionId}-header`}
            aria-controls={`${sectionId}-content`}
            aria-label={`${feeHead.feeHeadName} refund details`}
            expandIcon={<ExpandMoreIcon fontSize="small" />}
            sx={{ bgcolor: 'background.neutral', px: 2 }}
          >
            <Stack
              direction="row"
              spacing={2}
              useFlexGap
              flexWrap="wrap"
              justifyContent="space-between"
              sx={{ width: 1 }}
            >
              <Typography variant="subtitle2" color="text.primary">
                {feeHead.feeHeadName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Refund amount: {formatNumber(refundTotal(feeHead), 'INR')}
              </Typography>
            </Stack>
          </AccordionSummary>
        }
        content={
          <Box
            role="region"
            aria-label={`${feeHead.feeHeadName} installments`}
            hidden={!open}
          >
            <CustomizableTable
              tableId={`refund-view-${feeHead.feeHeadId ?? feeHead.feeHeadName}`}
              tableTitle={`${feeHead.feeHeadName} refunds`}
              variant="embedded"
              columns={columns}
              data={feeHead.items.map((item, index) => ({ ...item, id: `${sectionId}-${index}` }))}
              wrapperProps={{
                sx: { '& > .MuiCard-root': { border: 0, borderRadius: 0, boxShadow: 'none' } },
              }}
              page={0}
              rowsPerPage={Math.max(1, feeHead.items.length)}
              showToolbar={false}
              isSearch={false}
              isFilter={false}
              isPagination={false}
              isShowedDense={false}
            />
          </Box>
        }
      />
    </Box>
  );
}

export default function RefundFeeHeadViewTable({ data = [] }: Props) {
  const feeHeads = data
    .map((head) => ({
      ...head,
      items: head.items.filter((item) => item.refundAmount > 0),
    }))
    .filter((head) => head.items.length > 0);

  if (feeHeads.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No refund installments available.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        justifyContent="space-between"
        sx={{
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Fee heads: {feeHeads.length}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          Refund amount:{' '}
          {formatNumber(
            feeHeads.reduce((sum, head) => sum + refundTotal(head), 0),
            'INR'
          )}
        </Typography>
      </Stack>
      {feeHeads.map((head) => (
        <FeeHeadViewGroup key={head.feeHeadId ?? head.feeHeadName} feeHead={head} />
      ))}
    </Stack>
  );
}

export type { Props as RefundFeeHeadViewTableProps };
