import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Chip, Paper, Stack, Button, Divider, Typography } from '@mui/material';

import FeeRefundDetailsForm from './FeeRefundDetailForm';
import RefundGeneralInfoCard from './RefundGeneralInfoCard';
import {
  buildRefundInitialValues,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

import type { IFeeHeadRefundItem } from './initialValuesAndValidation';

interface FeeRefundFormProps {
  onCancel?: (e: React.MouseEvent, isSubmit: boolean) => void;
  loading?: boolean;
}

const FeeRefundFormComponent = ({
  onCancel,
  loading = false,
}: FeeRefundFormProps): React.ReactElement => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const theme = useTheme();

  const formik = useFormik({
    initialValues: buildRefundInitialValues(),
    validationSchema: buildRefundValidationSchema(currentYear),
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: () => {
      // onSubmit?.(buildFeeRefundPayload(values));
    },
  });

  // ── Derived totals for sticky footer ────────────────────────────────────────
  const { totalSelectedMonths, totalRefundRequested } = useMemo(() => {
    const refunds = formik.values.feeHeadRefunds as IFeeHeadRefundItem[];
    let months = 0;
    let total = 0;
    refunds.forEach((fh) => {
      fh.months.forEach((m) => {
        months += 1;
        total += Number(m.amount) || 0;
      });
    });
    return { totalSelectedMonths: months, totalRefundRequested: total };
  }, [formik.values.feeHeadRefunds]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      {/* ── Scrollable content ── */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: { xs: 1, md: 2 }, pb: 1 }}>
          <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
            {/* ── Student Information Card ── */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              {/* Card header */}
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify
                  icon="solar:users-group-rounded-bold-duotone"
                  width={18}
                  sx={{ color: 'primary.main' }}
                />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Student Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select board, class, and student to proceed
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <RefundGeneralInfoCard formik={formik} />
            </Paper>

            {/* ── Fee Refund Details ── */}
            <FeeRefundDetailsForm formik={formik} />
          </BackPopUpChecked>
        </Box>
      </Scrollbar>

      {/* ── Sticky Finance Action Bar ── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(12px)',
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
        >
          {/* Left: selection summary */}
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            {totalSelectedMonths > 0 ? (
              <>
                <Chip
                  size="small"
                  label={`${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`}
                  color="primary"
                  variant="soft"
                  icon={<Iconify icon="solar:calendar-bold" width={14} />}
                />
                {totalRefundRequested > 0 && (
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Typography variant="caption" color="text.secondary">
                      Refund Amount:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                      {formatCurrency(totalRefundRequested)}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                No months selected yet
              </Typography>
            )}
          </Box>

          {/* Right: actions */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={loading}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={(e) => onCancel?.(e, false)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={loading}
              loadingPosition="start"
              startIcon={<Iconify icon="solar:money-bag-bold" />}
              onClick={() => formik.handleSubmit()}
            >
              Submit{' '}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FeeRefundFormComponent;
