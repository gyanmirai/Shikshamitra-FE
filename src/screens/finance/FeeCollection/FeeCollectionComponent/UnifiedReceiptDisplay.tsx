'use client';

import type { FeeReceiptDetail, ChargeReceiptDetail } from 'src/redux/feeCollection/feeCollection';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import {
  Box,
  Card,
  Table,
  Button,
  Skeleton,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

interface UnifiedReceiptDisplayProps {
  feeReceipt: FeeReceiptDetail | undefined;
  chargeReceipt: ChargeReceiptDetail | undefined;
  feeIsLoading: boolean;
  chargeIsLoading: boolean;
  feeBlobUrl: string | null;
  chargeBlobUrl: string | null;
  onOpenFeeInNewTab: () => void;
  onDownloadFee: () => void;
  onOpenChargeInNewTab: () => void;
  onDownloadCharge: () => void;
}

function UnifiedReceiptDisplay({
  feeReceipt,
  chargeReceipt,
  feeIsLoading,
  chargeIsLoading,
  feeBlobUrl,
  chargeBlobUrl,
  onOpenFeeInNewTab,
  onDownloadFee,
  onOpenChargeInNewTab,
  onDownloadCharge,
}: UnifiedReceiptDisplayProps) {
  const theme = useTheme();

  const renderFeeSection = () => {
    if (!feeReceipt && !feeIsLoading) return null;

    return (
      <Card sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.08),
            p: 1.5,
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={700} display="block">
              FEE RECEIPT
            </Typography>
            {feeIsLoading ? (
              <Skeleton width={150} height={24} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h6" fontWeight={700}>
                #{feeReceipt?.receiptNumber}
              </Typography>
            )}
          </Box>
          <Box textAlign="right">
            {feeIsLoading ? (
              <Skeleton width={100} height={24} />
            ) : (
              <Typography variant="h6" fontWeight={700}>
                ₹{formatNumber(feeReceipt?.totalAmount || 0)}
              </Typography>
            )}
          </Box>
        </Box>
        {feeIsLoading ? (
          <Box sx={{ mb: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={40} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : (
          <>
            {feeReceipt?.paidFeeHeads && feeReceipt.paidFeeHeads.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Paid Fee Heads
                </Typography>
                <TableContainer sx={{ bgcolor: '#fafafa', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.12) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Fee Head</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeReceipt.paidFeeHeads.map((head, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{head.feeHeadName}</TableCell>
                          <TableCell align="right">₹{formatNumber(head.amountPaid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {feeReceipt?.allocationDetails && feeReceipt.allocationDetails.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Allocation Details
                </Typography>
                <TableContainer sx={{ bgcolor: '#fafafa', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.12) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Fee Head</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Pending Before
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Paid
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Pending After
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeReceipt.allocationDetails.map((detail, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{detail.feeHeadName}</TableCell>
                          <TableCell align="right">₹{formatNumber(detail.pendingBefore)}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                            ₹{formatNumber(detail.amountPaid)}
                          </TableCell>
                          <TableCell align="right">₹{formatNumber(detail.pendingAfter)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {feeReceipt?.auditSummary && (
              <Box
                sx={{
                  mb: 1,
                  p: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="info.main">
                  {feeReceipt.auditSummary.headline}
                </Typography>
                {feeReceipt.auditSummary.changedFields &&
                  feeReceipt.auditSummary.changedFields.length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {feeReceipt.auditSummary.changedFields
                        .map(
                          (field: any) =>
                            `${field.fieldName}: ${field.oldValue} → ${field.newValue}`
                        )
                        .join(', ')}
                    </Typography>
                  )}
              </Box>
            )}
            {feeBlobUrl && (
              <Box sx={{ mb: 1 }}>
                <iframe
                  src={feeBlobUrl}
                  style={{
                    width: '100%',
                    height: '400px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: '8px',
                  }}
                  title="Fee Receipt PDF"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:open-in-new" />}
                    onClick={onOpenFeeInNewTab}
                  >
                    Open
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:download" />}
                    onClick={onDownloadFee}
                    variant="outlined"
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Card>
    );
  };

  const renderChargeSection = () => {
    if (!chargeReceipt && !chargeIsLoading) return null;

    return (
      <Card sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            p: 1.5,
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="caption" fontWeight={700} display="block">
              CHARGE RECEIPT
            </Typography>
            {chargeIsLoading ? (
              <Skeleton width={150} height={24} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h6" fontWeight={700}>
                #{chargeReceipt?.receiptNumber}
              </Typography>
            )}
          </Box>
          <Box textAlign="right">
            {chargeIsLoading ? (
              <Skeleton width={100} height={24} />
            ) : (
              <Typography variant="h6" fontWeight={700}>
                ₹{formatNumber(chargeReceipt?.totalAmount || 0)}
              </Typography>
            )}
          </Box>
        </Box>
        {chargeIsLoading ? (
          <Box sx={{ mb: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={40} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : (
          <>
            {chargeReceipt?.paidCharges && chargeReceipt.paidCharges.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Paid Charges
                </Typography>
                <TableContainer sx={{ bgcolor: '#fafafa', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.12) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Charge Name</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chargeReceipt.paidCharges.map((charge, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{charge.chargeName}</TableCell>
                          <TableCell align="right">₹{formatNumber(charge.amountPaid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            {chargeReceipt?.auditSummary && (
              <Box
                sx={{
                  mb: 1,
                  p: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="info.main">
                  {chargeReceipt.auditSummary.headline}
                </Typography>
                {chargeReceipt.auditSummary.changedFields &&
                  chargeReceipt.auditSummary.changedFields.length > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {chargeReceipt.auditSummary.changedFields
                        .map(
                          (field: any) =>
                            `${field.fieldName}: ${field.oldValue} → ${field.newValue}`
                        )
                        .join(', ')}
                    </Typography>
                  )}
              </Box>
            )}
            {chargeBlobUrl && (
              <Box sx={{ mb: 1 }}>
                <iframe
                  src={chargeBlobUrl}
                  style={{
                    width: '100%',
                    height: '400px',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: '8px',
                  }}
                  title="Charge Receipt PDF"
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:open-in-new" />}
                    onClick={onOpenChargeInNewTab}
                  >
                    Open
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:download" />}
                    onClick={onDownloadCharge}
                    variant="outlined"
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {renderFeeSection()}
      {renderChargeSection()}
    </Box>
  );
}

export default UnifiedReceiptDisplay;
