import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Alert, Divider, Skeleton, Typography } from '@mui/material';
import { useGetStudentReceiptDataQuery } from 'src/redux/invoiceAndReceipt/studentReceiptApi';

import type { IReceipt, IFeeReceipt } from '../type';

const ReceiptViewSkeleton = () => (
  <Box p={2.5}>
    <Skeleton variant="rounded" height={170} sx={{ borderRadius: 2.5, mb: 1 }} />
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 0.5 }} />
    ))}
    <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 3 }}>
      <Skeleton variant="rounded" height={80} sx={{ flex: 1, borderRadius: 2 }} />
      <Skeleton variant="rounded" height={80} sx={{ flex: 1, borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rounded" height={40} sx={{ borderRadius: 2, mb: 3 }} />
    <Skeleton variant="text" width={140} sx={{ mb: 1 }} />
    {[1, 2].map((i) => (
      <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2, mb: 1.5 }} />
    ))}
  </Box>
);

export default function StudentTableView({
  selectedStudent,
}: {
  selectedStudent: IFeeReceipt | null;
}) {
  const {
    data: receiptData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentReceiptDataQuery,
  });

  const receipts: IReceipt[] = receiptData || [];
  const loading = isLoading || isFetching;

  if (loading) {
    return <ReceiptViewSkeleton />;
  }

  return (
    <Scrollbar sx={{ maxHeight: '70vh' }}>
      <Box p={2}>
        {/* Green Gradient Header Card */}
        <Box
          sx={{
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #00A76F 0%, #007B55 50%, #005249 100%)',
              px: 3,
              py: 2.5,
              color: '#fff',
            }}
          >
            <Typography
              variant="overline"
              fontWeight={700}
              letterSpacing={2}
              sx={{ opacity: 0.85, display: 'block', mb: 0.5 }}
            >
              Receipt Summary
            </Typography>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2} sx={{ mb: 1.5 }}>
              {selectedStudent?.student || 'N/A'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Class
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedStudent?.class && selectedStudent?.division
                    ? ` ${selectedStudent.class}`
                    : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Division
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedStudent?.division || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Last Payment
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedStudent?.lastPaymentDate || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Payment Term
                </Typography>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedStudent?.paymentTerm || '—'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Detail Rows */}
          <Box>
            {[
              { label: 'Roll No.', value: selectedStudent?.rollNo },
              { label: 'GR No.', value: selectedStudent?.grNo },
              { label: 'Payment Term', value: selectedStudent?.paymentTerm },
              { label: 'Last Payment Date', value: selectedStudent?.lastPaymentDate },
              { label: 'Status', value: selectedStudent?.status },
            ].map((row, idx, arr) => (
              <Box key={row.label}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2.5,
                    py: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {row.value || '—'}
                  </Typography>
                </Box>
                {idx < arr.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Fee Summary */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: 'success.lighter',
              border: '1px solid',
              borderColor: 'success.light',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              color="success.dark"
              fontWeight={600}
              sx={{ display: 'block', mb: 0.5 }}
            >
              Total Paid
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.dark">
              ₹{selectedStudent?.totalPaidFees?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: 'error.lighter',
              border: '1px solid',
              borderColor: 'error.light',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              color="error.dark"
              fontWeight={600}
              sx={{ display: 'block', mb: 0.5 }}
            >
              Pending
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.dark">
              ₹{selectedStudent?.totalPendingFees?.toLocaleString() || 0}
            </Typography>
          </Box>
        </Box>

        {/* Immutability Notice */}
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ py: 0.5, borderRadius: 2 }}
          icon={<Iconify icon="mdi:lock-outline" width={18} />}
        >
          <Typography variant="caption">
            Receipts are immutable and cannot be edited or deleted after creation.
          </Typography>
        </Alert>

        {/* Payment History */}
        {receipts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Iconify icon="mdi:history" width={18} color="text.secondary" />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
              >
                Payment History ({receipts.length})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {receipts.map((receipt, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    pl: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    borderLeft: '4px solid',
                    borderLeftColor: 'success.main',
                    bgcolor: 'success.lighter',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {receipt.receiptId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {receipt.paymentMethod} · {receipt.paymentDate}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} color="success.dark">
                    ₹{receipt.amount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Scrollbar>
  );
}
