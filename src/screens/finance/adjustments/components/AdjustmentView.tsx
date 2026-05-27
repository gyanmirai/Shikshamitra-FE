'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import {
  Box,
  Card,
  Paper,
  Table,
  Stack,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogActions,
} from '@mui/material';

import { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import { ADJUSTMENT_STATUS_COLORS } from '../constants/adjustmentOptions';

import type { IAdjustmentViewProps } from '../types/adjustment.types';

// ─── Info Item ─────────────────────────────────────────────────────────────────

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | number | null;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            display: 'block',
            mb: 0.2,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: '0.65rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}
        >
          {value ?? 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Column header helper ──────────────────────────────────────────────────────

const ColHead = ({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) => (
  <TableCell
    align={align}
    sx={{
      py: 1,
      px: 2,
      fontWeight: 700,
      fontSize: '0.65rem',
      letterSpacing: '0.7px',
      textTransform: 'uppercase',
      color: 'text.disabled',
      bgcolor: 'background.neutral',
      borderBottom: '1px solid',
      borderColor: 'divider',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </TableCell>
);

// ─── Component ────────────────────────────────────────────────────────────────

const AdjustmentView: React.FC<IAdjustmentViewProps> = ({
  student,
  onClose,
  onApprove,
  onReject,
}) => {
  const isPending = student.status === AdjustmentStatusEnum.Pending;
  const statusColor = (ADJUSTMENT_STATUS_COLORS[student.status] ?? 'default') as LabelColor;

  const infoItems = [
    {
      label: 'Adjustment Type',
      value: student.adjustmentType,
    },
    {
      label: 'Adjustment Amount',
      value: formatCurrency(student.adjustmentAmount),
    },
    {
      label: 'Requested Date',
      value: new Date(student.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      label: 'Total Paid Fees',
      value: student.totalPaidFees != null ? formatCurrency(Number(student.totalPaidFees)) : 'N/A',
    },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        {/* ── Student Info Card ──────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
          {/* Header row */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify
                icon="mdi:account-circle-outline"
                width={20}
                sx={{ color: 'primary.main' }}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {student.studentName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GR No: {student.studentGrNo ?? 'N/A'}&nbsp;·&nbsp;
                  {student.className}
                  {student.divisionName ? ` / ${student.divisionName}` : ''}
                  {student.rollNumber ? ` · Roll ${student.rollNumber}` : ''}
                </Typography>
              </Box>
            </Box>
            <Label color={statusColor} sx={{ fontWeight: 700, fontSize: 13 }}>
              {student.status}
            </Label>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Info grid */}
          <Box display="flex" flexWrap="wrap" gap={3}>
            <InfoItem icon="mdi:phone-outline" label="Contact No." value={student.contactNo} />
            <InfoItem
              icon="mdi:account-tie-outline"
              label="Requested By"
              value={student.requestedBy}
            />
            {student.approvedBy && (
              <InfoItem
                icon="mdi:check-decagram-outline"
                label="Approved By"
                value={student.approvedBy}
              />
            )}
            {student.approvedAt && (
              <InfoItem
                icon="mdi:calendar-check-outline"
                label="Approved Date"
                value={new Date(student.approvedAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            )}
            {student.rejectedBy && (
              <InfoItem
                icon="mdi:account-cancel-outline"
                label="Rejected By"
                value={student.rejectedBy}
              />
            )}
          </Box>
        </Paper>

        {/* ── Summary Info Card ──────────────────────────────────── */}
        <Card sx={{ mb: 1, boxShadow: 'var(--shadows-10)', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
            {infoItems.map((item, idx, arr) => (
              <React.Fragment key={item.label}>
                <Box sx={{ flex: '1 1 160px', px: 3, py: 2 }}>
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
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.value}
                  </Typography>
                </Box>
                {idx < arr.length - 1 && <Divider orientation="vertical" flexItem />}
              </React.Fragment>
            ))}
          </Box>
        </Card>

        {/* ── Reason / Remarks / Rejection Reason ───────────────── */}
        <Stack spacing={1.5} mb={2}>
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing={1}
              display="block"
              mb={0.5}
            >
              Reason
            </Typography>
            <Typography variant="body2">{student.reason || 'N/A'}</Typography>
          </Card>

          {student.rejectionReason && (
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2, borderColor: 'error.light' }}>
              <Typography
                variant="caption"
                color="error.main"
                fontWeight={700}
                textTransform="uppercase"
                letterSpacing={1}
                display="block"
                mb={0.5}
              >
                Rejection Reason
              </Typography>
              <Typography variant="body2" color="error.dark">
                {student.rejectionReason}
              </Typography>
            </Card>
          )}
        </Stack>

        {/* ── Paid Fee Records Table ─────────────────────────────── */}
        {student.paidFeeDetails && student.paidFeeDetails.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Paid Fee Records
            </Typography>
            <Card
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <ColHead>#</ColHead>
                    <ColHead>Receipt No.</ColHead>
                    <ColHead>Fee Type</ColHead>
                    <ColHead>Installment</ColHead>
                    <ColHead>Payment Date</ColHead>
                    <ColHead align="right">Paid Amount</ColHead>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {student.paidFeeDetails.map((fee, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell
                        sx={{ px: 2, py: 1.25, color: 'text.disabled', fontSize: '0.75rem' }}
                      >
                        {idx + 1}
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.25 }}>
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <Iconify
                            icon="mdi:receipt-text-outline"
                            width={16}
                            sx={{ color: 'primary.main', flexShrink: 0 }}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {fee.receiptNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.25 }}>
                        <Typography variant="body2">{fee.feeType}</Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.25 }}>
                        <Typography variant="body2" color="text.secondary">
                          {fee.installment ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.25 }}>
                        <Typography variant="body2">
                          {new Date(fee.paymentDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ px: 2, py: 1.25 }}>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(fee.paidAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </Scrollbar>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        {isPending ? (
          <>
            <Button
              variant="soft"
              color="error"
              size="small"
              startIcon={<Iconify icon="mdi:close-circle-outline" />}
              onClick={onReject}
            >
              Reject
            </Button>
            <Button
              variant="soft"
              color="success"
              size="small"
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              onClick={onApprove}
            >
              Approve
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Box>
  );
};

export default AdjustmentView;
