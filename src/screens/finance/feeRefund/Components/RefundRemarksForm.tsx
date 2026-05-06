'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import { Box, Card, Button, Divider, Typography, DialogActions } from '@mui/material';

import StudentRefundInfo from './StudentRefundInfo';
import RefundFeeHeadViewTable from './RefundFeeHeadViewTable';

import type { IRefundFormProps } from '../type';

const DUMMY_REFUND_FEE_HEAD_WISE = [
  {
    feeHeadId: 'fh-1',
    feeHeadName: 'Tuition Fee',
    totalPaid: 9000,
    totalRefunded: 2000,
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 3000,
        refundAmount: 1000,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'May',
        total: 3000,
        paid: 3000,
        refundAmount: 0,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'June',
        total: 3000,
        paid: 3000,
        refundAmount: 1000,
        status: FeeCollectionStatusType.Partial,
      },
    ],
  },
  {
    feeHeadId: 'fh-2',
    feeHeadName: 'Hostel Fee',
    totalPaid: 6000,
    totalRefunded: 0,
    items: [
      {
        month: 'April',
        total: 3000,
        paid: 3000,
        refundAmount: 0,
        status: FeeCollectionStatusType.Paid,
      },
      {
        month: 'May',
        total: 3000,
        paid: 3000,
        refundAmount: 0,
        status: FeeCollectionStatusType.Paid,
      },
    ],
  },
];

const RefundRemarksForm: React.FC<IRefundFormProps> = ({
  open,
  onClose,
  student,
  onReject,
  onApprove,
}) => (
  <Box display="flex" flexDirection="column" height="100%">
    <Scrollbar sx={{ p: 2, height: '100%' }}>
      <StudentRefundInfo student={student} />

      {/* Info Card */}
      <Card
        sx={{
          mb: 2,
          boxShadow: 'var(--shadows-10)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
          {[
            {
              label: 'Amount Applicable For Refund',
              value: student?.totalPaidFees ? formatCurrency(student.totalPaidFees) : 'N/A',
            },
            {
              label: 'Refund Amount',
              value: student?.refundAmount != null ? formatCurrency(student.refundAmount) : 'N/A',
            },
            {
              label: 'Refund Method',
              value: student?.refundMethod || 'N/A',
            },
            {
              label: 'Reason of Refund',
              value: student?.reason || 'N/A',
            },
          ].map((item, idx, arr) => (
            <React.Fragment key={item.label}>
              <Box sx={{ flex: 1, px: 3, py: 2 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    letterSpacing: 1.5,
                    fontSize: '0.65rem',
                    lineHeight: 1.4,
                  }}
                >
                  {item.label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {item.value}
                </Typography>
              </Box>
              {idx < arr.length - 1 && <Divider orientation="vertical" flexItem />}
            </React.Fragment>
          ))}
        </Box>
      </Card>

      {/* Fee Head Refund Breakdown */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="primary.main">
        Fee Head Refund Details
      </Typography>
      <RefundFeeHeadViewTable data={DUMMY_REFUND_FEE_HEAD_WISE} />
    </Scrollbar>
    {/* Actions */}
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Button
        variant="soft"
        color="error"
        onClick={onReject}
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Reject
      </Button>
      <Button
        variant="soft"
        color="success"
        onClick={onApprove}
        size="small"
        startIcon={<Iconify icon={GlobalIcons.tick} />}
      >
        Approve
      </Button>
    </DialogActions>
  </Box>
);

export default RefundRemarksForm;
