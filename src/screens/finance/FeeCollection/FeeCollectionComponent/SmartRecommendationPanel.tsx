'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { Box, Chip, Button, Typography } from '@mui/material';

import { toPeriod } from './FeeLedgerShared';

import type { IFeeCharge, IStudentFee, SelectedItem, FeeLedgerData } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SmartRecommendation {
  id: string;
  type: 'recommended' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  icon: string;
  amount?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface SmartRecommendationPanelProps {
  student: IStudentFee | null;
  ledgerData: FeeLedgerData;
  chargesData: IFeeCharge[];
  selectedItems: SelectedItem[];
  currentYear: number;
  onSelectionChange: (items: SelectedItem[]) => void;
}

const TYPE_STYLES = {
  recommended: {
    color: '#1565c0',
    icon: 'solar:magic-stick-bold',
    bgAlpha: 0.06,
    borderAlpha: 0.2,
  },
  warning: { color: '#e65100', icon: 'solar:danger-bold', bgAlpha: 0.06, borderAlpha: 0.22 },
  info: { color: '#00695c', icon: 'solar:info-circle-bold', bgAlpha: 0.05, borderAlpha: 0.18 },
  success: { color: '#2e7d32', icon: 'solar:check-circle-bold', bgAlpha: 0.05, borderAlpha: 0.18 },
};

// ─── Component ────────────────────────────────────────────────────────────────

const SmartRecommendationPanel = ({
  student,
  ledgerData,
  chargesData,
  selectedItems,
  currentYear,
  onSelectionChange,
}: SmartRecommendationPanelProps) => {
  const theme = useTheme();
  const allMonthWise = ledgerData.monthWise ?? [];

  // ── Compute recommendations ────────────────────────────────────────────────
  const nowMonth = new Date().getMonth();
  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long' });

  const overdueGroups = allMonthWise.filter(
    (g) => g.month < nowMonth && g.items.some((i) => i.due > 0)
  );

  const overdueTotal = overdueGroups.reduce(
    (s, g) => s + g.items.filter((i) => i.due > 0).reduce((ss, i) => ss + i.due, 0),
    0
  );

  const lateFees = chargesData.filter(
    (c) => c.chargeName?.toLowerCase().includes('late') && c.status !== 'Paid' && c.status !== 0
  );

  const quarterStart = Math.floor(nowMonth / 3) * 3;
  const quarterMonthNames = Array.from({ length: 3 }, (_, i) =>
    new Date(currentYear, quarterStart + i, 1).toLocaleString('en-IN', { month: 'long' })
  );
  const quarterMonthEnums = quarterMonthNames.map((m) => FeeMonth[m as keyof typeof FeeMonth]);
  const quarterGroups = allMonthWise.filter(
    (g) => quarterMonthEnums.includes(g.month) && g.items.some((i) => i.due > 0)
  );
  const quarterTotal = quarterGroups.reduce(
    (s, g) => s + g.items.filter((i) => i.due > 0).reduce((ss, i) => ss + i.due, 0),
    0
  );

  const hasConcession = (student?.concessionAmount ?? 0) > 0;

  const recommendations: SmartRecommendation[] = [];

  // Overdue warning
  if (overdueGroups.length > 0) {
    recommendations.push({
      id: 'overdue',
      type: 'warning',
      title: `${overdueGroups.length} month(s) overdue`,
      description: `₹${formatNumber(overdueTotal)} pending from previous months. Collect now to avoid further late fees.`,
      icon: 'solar:danger-bold',
      amount: overdueTotal,
      actionLabel: 'Select Overdue',
      onAction: () => {
        const items: SelectedItem[] = [];
        overdueGroups.forEach((g) => {
          const period = toPeriod(FeeMonth[g.month] as string, currentYear);
          g.items
            .filter((i) => i.due > 0)
            .forEach((i) => items.push({ feeHeadId: i.feeHeadId, period, dueAmount: i.due }));
        });
        onSelectionChange(items);
      },
    });
  }

  // Quarter recommendation
  if (quarterGroups.length > 0 && quarterTotal > 0) {
    recommendations.push({
      id: 'quarter',
      type: 'recommended',
      title: `Collect this quarter together`,
      description: `${quarterMonthNames.join(', ')} — ₹${formatNumber(quarterTotal)} total. Reduces future follow-ups.`,
      icon: 'solar:calendar-mark-bold',
      amount: quarterTotal,
      actionLabel: 'Select Quarter',
      onAction: () => {
        const items: SelectedItem[] = [];
        quarterGroups.forEach((g) => {
          const period = toPeriod(FeeMonth[g.month] as string, currentYear);
          g.items
            .filter((i) => i.due > 0)
            .forEach((i) => items.push({ feeHeadId: i.feeHeadId, period, dueAmount: i.due }));
        });
        onSelectionChange(items);
      },
    });
  }

  // Late fee waiver info
  if (lateFees.length > 0) {
    recommendations.push({
      id: 'late-fee',
      type: 'info',
      title: `Late fee can be reviewed`,
      description: `${lateFees.length} late charge(s) of ₹${formatNumber(lateFees.reduce((s, c) => s + c.amount, 0))} attached. Confirm with admin before waiving.`,
      icon: 'solar:bill-bold',
      amount: lateFees.reduce((s, c) => s + c.amount, 0),
    });
  }

  // Concession info
  if (hasConcession) {
    recommendations.push({
      id: 'concession',
      type: 'success',
      title: `Concession applied`,
      description: `₹${formatNumber(student!.concessionAmount!)} concession is active on this student's account.`,
      icon: 'solar:tag-bold',
      amount: student!.concessionAmount,
    });
  }

  // Balanced state
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{ mb: 0.9 }}
    >
      <Box display="flex" alignItems="center" gap={0.75} mb={0.65} px={0.25}>
        <Iconify icon="solar:magic-stick-bold" width={14} sx={{ color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontSize: '0.62rem',
          }}
        >
          Smart Recommendations
        </Typography>
        <Chip
          label={recommendations.length}
          size="small"
          color="primary"
          variant="soft"
          sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, '& .MuiChip-label': { px: 0.6 } }}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap={0.65}>
        <AnimatePresence>
          {recommendations.map((rec, idx) => {
            const styles = TYPE_STYLES[rec.type];
            return (
              <Box
                key={rec.id}
                component={motion.div}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                sx={{
                  px: 1.1,
                  py: 0.75,
                  borderRadius: 1.6,
                  border: `1px solid ${alpha(styles.color, styles.borderAlpha)}`,
                  bgcolor: alpha(styles.color, styles.bgAlpha),
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 0.85,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    bgcolor: alpha(styles.color, 0.14),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.1,
                  }}
                >
                  <Iconify icon={rec.icon} width={13} sx={{ color: styles.color }} />
                </Box>

                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{ color: styles.color, display: 'block', lineHeight: 1.3 }}
                  >
                    {rec.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      fontSize: '0.68rem',
                      mt: 0.2,
                      lineHeight: 1.4,
                    }}
                  >
                    {rec.description}
                  </Typography>
                </Box>

                {rec.onAction && rec.actionLabel && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={rec.onAction}
                    sx={{
                      flexShrink: 0,
                      height: 24,
                      px: 0.85,
                      fontSize: '0.67rem',
                      fontWeight: 700,
                      borderRadius: 1,
                      borderColor: alpha(styles.color, 0.35),
                      color: styles.color,
                      '&:hover': { bgcolor: alpha(styles.color, 0.1), borderColor: styles.color },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rec.actionLabel}
                  </Button>
                )}
              </Box>
            );
          })}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default SmartRecommendationPanel;
