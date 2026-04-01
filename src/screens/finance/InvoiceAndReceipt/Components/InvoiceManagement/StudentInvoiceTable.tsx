import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Divider, Skeleton, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { InvoiceStatusColors } from 'src/enums/finance-invoice-status';
import { useGetStudentInvoiceDataQuery } from 'src/redux/invoiceAndReceipt/studentInvoiceApi';

import type { InvoiceData } from './type';

const InfoRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      px: 2.5,
      py: 1.25,
      ...(!isLast && { borderBottom: '1px solid', borderColor: 'divider' }),
    }}
  >
    <Typography variant="body2" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Typography variant="body2" fontWeight={600}>
        {value || '—'}
      </Typography>
    ) : (
      (value ?? (
        <Typography variant="body2" fontWeight={600}>
          —
        </Typography>
      ))
    )}
  </Box>
);

// Skeleton placeholder for the entire dialog content
const InvoiceViewSkeleton = () => (
  <Box p={2.5}>
    <Skeleton variant="rounded" height={160} sx={{ borderRadius: 2.5, mb: 3 }} />
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 1 }} />
    ))}
    <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2, mt: 2, mb: 2 }} />
    <Skeleton variant="rounded" height={90} sx={{ borderRadius: 2, mb: 3 }} />
    <Skeleton variant="text" width={140} sx={{ mb: 1 }} />
    {[1, 2].map((i) => (
      <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 2, mb: 1.5 }} />
    ))}
  </Box>
);

export default function InvoiceTableView({
  selectedStudent,
}: {
  selectedStudent: InvoiceData | null;
}) {
  const {
    data: invoiceData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInvoiceDataQuery,
  });

  const billingPeriodDisplay = Array.isArray(selectedStudent?.billingPeriod)
    ? selectedStudent.billingPeriod.join(', ')
    : selectedStudent?.billingPeriod || '—';

  const remaining = (selectedStudent?.totalAmount || 0) - (selectedStudent?.paidAmount || 0);
  const loading = isLoading || isFetching;

  if (loading) {
    return <InvoiceViewSkeleton />;
  }

  return (
    <Scrollbar sx={{ maxHeight: '70vh' }}>
      <Box p={2}>
        {/* Student Details Card */}
        <Box
          sx={{
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Gradient Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #00A76F 0%, #007B55 50%, #005249 100%)',
              px: 3,
              pt: 2.5,
              pb: 3,
              color: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  fontWeight={700}
                  letterSpacing={2}
                  sx={{ opacity: 0.8, display: 'block', mb: 0.25 }}
                >
                  Invoice
                </Typography>
                <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                  {selectedStudent?.invoiceNumber || 'N/A'}
                </Typography>
              </Box>
              <Label
                color={
                  (InvoiceStatusColors[selectedStudent?.status || ''] || 'default') as LabelColor
                }
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  py: 1,
                  px: 2,
                  height: 28,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
              >
                {selectedStudent?.status}
              </Label>
            </Box>

            {/* Row 1: Student, Class, Division, Created, Academic Year */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
              {[
                { label: 'Student', value: selectedStudent?.student },
                { label: 'Class', value: selectedStudent?.class },
                { label: 'Division', value: selectedStudent?.division },
                { label: 'Created', value: selectedStudent?.createdAt },
                { label: 'Academic Year', value: selectedStudent?.academicYear },
                { label: 'Billing Cycle', value: selectedStudent?.billingCycle },
                { label: 'Billing Period', value: billingPeriodDisplay },
              ].map((f) => (
                <Box key={f.label} sx={{ minWidth: 80 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.65,
                      display: 'block',
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {f.value || '—'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Fee Breakdown */}
        {selectedStudent?.feeItems && selectedStudent.feeItems.length > 0 && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 1,
            }}
          >
            <Box sx={{ px: 2.5, py: 1.25, bgcolor: 'background.neutral' }}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
              >
                Fee Breakdown
              </Typography>
            </Box>
            <Divider />
            {selectedStudent.feeItems.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.25,
                  px: 2.5,
                  borderBottom:
                    idx < selectedStudent.feeItems.length - 1 ||
                    (selectedStudent.concessions?.length || 0) > 0
                      ? '1px dashed'
                      : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {item.name}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  ₹{item.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
            {selectedStudent.concessions?.map((item, idx) => (
              <Box
                key={`c-${idx}`}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.25,
                  px: 2.5,
                  bgcolor: 'success.lighter',
                  borderBottom:
                    idx < (selectedStudent.concessions?.length || 0) - 1 ? '1px dashed' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="success.dark">
                  {item.name} (Concession)
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.dark">
                  - ₹{item.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Financial Summary */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 2.5,
            py: 2,
            bgcolor: 'background.neutral',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              Total Amount
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              ₹{selectedStudent?.totalAmount?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600} color="success.main">
              Paid Amount
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="success.main">
              ₹{selectedStudent?.paidAmount?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight={600} color="error.main">
              Remaining
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="error.main">
              ₹{remaining.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Payment History */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Iconify icon="mdi:history" width={18} color="text.secondary" />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}
          >
            Payment History ({(invoiceData || []).length})
          </Typography>
        </Box>

        {(invoiceData || []).length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.disabled">
              No Payment Records Found
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {(invoiceData || []).map((receipt: any, idx: number) => (
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
                    {receipt.invoiceNumber || receipt.receiptId || `Receipt #${idx + 1}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {receipt.paymentMethod || 'N/A'} ·{' '}
                    {receipt.dueDate || receipt.paymentDate || '—'}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="success.dark">
                  ₹{(receipt.paidAmount || receipt.amount || 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Scrollbar>
  );
}
