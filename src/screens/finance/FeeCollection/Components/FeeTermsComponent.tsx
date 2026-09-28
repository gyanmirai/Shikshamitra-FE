import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Paper, Divider, Checkbox, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
  feeInstallmentStatusLabel,
} from 'src/enums/fee-collection-type';

import type { IFeeHead, IFeeCharge, ITermsToCollectProps } from './type';

const MotionCard = motion(Card);

const TermsToCollect: React.FC<ITermsToCollectProps> = ({
  formik,
  feeHeads = [],
  charges = [],
  showError,
  errorMessage,
}) => {
  const theme = useTheme();

  const toggleFeeHead = (head: IFeeHead) => {
    const isSelected = formik.values.selectedFeeHeads.some((fh) => fh.feeHeadId === head.feeHeadId);
    if (isSelected) {
      formik.setFieldValue(
        'selectedFeeHeads',
        formik.values.selectedFeeHeads.filter((fh) => fh.feeHeadId !== head.feeHeadId)
      );
    } else {
      formik.setFieldValue('selectedFeeHeads', [
        ...formik.values.selectedFeeHeads,
        { feeHeadId: head.feeHeadId, amount: head.pendingAmount },
      ]);
    }
  };

  const toggleCharge = (charge: IFeeCharge) => {
    const isSelected = formik.values.selectedCharges.some((ch) => ch.chargeId === charge.chargeId);
    if (isSelected) {
      formik.setFieldValue(
        'selectedCharges',
        formik.values.selectedCharges.filter((ch) => ch.chargeId !== charge.chargeId)
      );
    } else {
      formik.setFieldValue('selectedCharges', [
        ...formik.values.selectedCharges,
        { chargeId: charge.chargeId, amount: charge.amount },
      ]);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ml: 0.5,
        mt: 0.5,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {/* HEADER SECTION */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px dashed ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          General Fee Structure
        </Typography>
      </Box>

      {/* LIST SECTION */}
      <Scrollbar sx={{ flexGrow: 1, p: 1.5, height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} pb={1}>
          {/* Fee Heads Section */}
          <Box>
            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
              Fee Heads
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {feeHeads.map((head, i) => {
                const isSelected = formik.values.selectedFeeHeads.some(
                  (fh) => fh.feeHeadId === head.feeHeadId
                );
                const isPaid = head.pendingAmount === 0;

                return (
                  <MotionCard
                    key={head.feeHeadId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.04)
                        : 'background.default',
                      ...(isPaid && { opacity: 0.7, bgcolor: 'action.disabledBackground' }),
                      transition:
                        'border-color 200ms ease, background-color 200ms ease, opacity 200ms ease',
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          size="small"
                          checked={isSelected || isPaid}
                          disabled={isPaid}
                          onChange={() => toggleFeeHead(head)}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {head.feeHeadName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total: ₹{formatNumber(head.totalAmount)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          ₹{formatNumber(head.pendingAmount)}
                        </Typography>
                        <Label variant="soft" color={FeeCollectionStatusTypeColors[head.status]}>
                          {feeInstallmentStatusLabel(head.status)}
                        </Label>
                      </Box>
                    </Box>
                  </MotionCard>
                );
              })}
            </Box>
          </Box>

          <Divider />

          {/* Charges Section */}
          <Box>
            <Typography variant="h6" color="error" sx={{ mb: 1.5 }}>
              Additional Charges
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {charges.map((charge, i) => {
                const isSelected = formik.values.selectedCharges.some(
                  (ch) => ch.chargeId === charge.chargeId
                );

                return (
                  <MotionCard
                    key={charge.chargeId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      border: `1px solid ${isSelected ? theme.palette.error.main : alpha(theme.palette.divider, 0.1)}`,
                      bgcolor: isSelected
                        ? alpha(theme.palette.error.main, 0.04)
                        : 'background.default',
                      transition: 'border-color 200ms ease, background-color 200ms ease',
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleCharge(charge)}
                          color="error"
                        />
                        <Typography variant="subtitle2" fontWeight={600}>
                          {charge.chargeName}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" color="error.main" fontWeight={700}>
                        ₹{formatNumber(charge.amount)}
                      </Typography>
                    </Box>
                  </MotionCard>
                );
              })}
            </Box>
          </Box>

          <AnimatePresence>
            {showError && errorMessage && (
              <motion.div
                key="fee-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Iconify icon="solar:danger-circle-bold" color="error.main" width={20} />
                  <Typography variant="subtitle2" color="error.main">
                    {errorMessage}
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default TermsToCollect;
