'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Card,
  Chip,
  Divider,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SplitPaymentEntry {
  id: string;
  method: string;
  amount: string;
}

export type SplitPaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Bank Transfer'
  | 'Cheque'
  | 'Wallet'
  | 'Demand Draft (DD)';

interface PaymentMethodMeta {
  icon: string;
  color: string;
  shortLabel: string;
}

const PAYMENT_METHODS: Record<string, PaymentMethodMeta> = {
  Cash: { icon: 'solar:banknote-bold', color: '#2e7d32', shortLabel: 'Cash' },
  UPI: { icon: 'solar:smartphone-bold', color: '#1565c0', shortLabel: 'UPI' },
  Card: { icon: 'solar:card-bold', color: '#6a1b9a', shortLabel: 'Card' },
  'Bank Transfer': { icon: 'solar:transfer-horizontal-bold', color: '#00695c', shortLabel: 'Bank' },
  Cheque: { icon: 'solar:document-bold', color: '#e65100', shortLabel: 'Cheque' },
  Wallet: { icon: 'solar:wallet-bold', color: '#0277bd', shortLabel: 'Wallet' },
  'Demand Draft (DD)': { icon: 'solar:bill-bold', color: '#4e342e', shortLabel: 'DD' },
};

// ─── Payment Row ───────────────────────────────────────────────────────────────

interface PaymentRowProps {
  entry: SplitPaymentEntry;
  index: number;
  canRemove: boolean;
  remaining: number;
  onAmountChange: (id: string, value: string) => void;
  onMethodChange: (id: string, method: string) => void;
  onRemove: (id: string) => void;
  autoFocus?: boolean;
}

const PaymentRow = ({
  entry,
  index,
  canRemove,
  remaining,
  onAmountChange,
  onMethodChange,
  onRemove,
  autoFocus,
}: PaymentRowProps) => {
  const theme = useTheme();
  const meta = PAYMENT_METHODS[entry.method] ?? PAYMENT_METHODS.Cash;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -16, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      sx={{ overflow: 'hidden' }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        py={0.75}
        px={0.5}
        sx={{
          borderRadius: 1.75,
          border: `1px solid ${alpha(meta.color, 0.22)}`,
          bgcolor: alpha(meta.color, 0.04),
          mb: 0.85,
          transition: 'border-color 0.18s, background-color 0.18s',
          '&:hover': {
            bgcolor: alpha(meta.color, 0.07),
            borderColor: alpha(meta.color, 0.35),
          },
        }}
      >
        {/* Index badge */}
        <Box
          sx={{
            minWidth: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: alpha(meta.color, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: meta.color, fontWeight: 800, fontSize: '0.65rem' }}
          >
            {index + 1}
          </Typography>
        </Box>

        {/* Method icon */}
        <Iconify icon={meta.icon} width={18} sx={{ color: meta.color, flexShrink: 0 }} />

        {/* Method select */}
        <TextField
          select
          size="small"
          value={entry.method}
          onChange={(e) => onMethodChange(entry.id, e.target.value)}
          sx={{
            minWidth: 130,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              '& fieldset': { border: 'none' },
            },
            '& .MuiSelect-select': { fontWeight: 700, py: 0.5, fontSize: '0.82rem' },
          }}
        >
          {Object.keys(PAYMENT_METHODS).map((m) => (
            <MenuItem key={m} value={m}>
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify
                  icon={PAYMENT_METHODS[m].icon}
                  width={15}
                  sx={{ color: PAYMENT_METHODS[m].color }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {m}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <Box flex={1} />

        {/* Amount field */}
        <NumericFormatCustom
          size="small"
          value={entry.amount}
          onChange={(e) => onAmountChange(entry.id, e.target.value.replace(/[₹,\s]/g, ''))}
          placeholder={remaining > 0 ? `₹ ${formatNumber(remaining)}` : '₹ 0'}
          autoFocus={autoFocus}
          sx={{
            width: 148,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: alpha(meta.color, 0.28) },
              '&:hover fieldset': { borderColor: alpha(meta.color, 0.55) },
              '&.Mui-focused fieldset': { borderColor: meta.color },
            },
            '& input': {
              fontWeight: 800,
              fontSize: '1rem',
              textAlign: 'right',
              color: meta.color,
              fontVariantNumeric: 'tabular-nums',
            },
          }}
        />

        {canRemove ? (
          <Tooltip title="Remove payment row">
            <IconButton
              size="small"
              onClick={() => onRemove(entry.id)}
              sx={{ p: 0.4, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            >
              <Iconify icon="solar:close-circle-bold" width={18} />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ width: 26 }} />
        )}
      </Box>
    </Box>
  );
};

// ─── Main SplitPaymentPanel ────────────────────────────────────────────────────

interface SplitPaymentPanelProps {
  payable: number;
  entries: SplitPaymentEntry[];
  onEntriesChange: (entries: SplitPaymentEntry[]) => void;
}

export const SplitPaymentPanel = ({
  payable,
  entries,
  onEntriesChange,
}: SplitPaymentPanelProps) => {
  const theme = useTheme();

  const totalAllocated = entries.reduce((s, e) => {
    const n = Number(String(e.amount).replace(/[₹,\s]/g, ''));
    return s + (Number.isNaN(n) ? 0 : n);
  }, 0);

  const remaining = payable - totalAllocated;
  const isBalanced = Math.abs(remaining) < 0.01;
  const isExcess = remaining < -0.01;

  const addRow = () => {
    const usedMethods = entries.map((e) => e.method);
    const nextMethod = Object.keys(PAYMENT_METHODS).find((m) => !usedMethods.includes(m)) ?? 'Cash';
    const newEntry: SplitPaymentEntry = {
      id: `pay-${Date.now()}`,
      method: nextMethod,
      amount: remaining > 0 ? String(Math.round(remaining)) : '',
    };
    onEntriesChange([...entries, newEntry]);
  };

  const removeRow = (id: string) => {
    if (entries.length <= 1) return;
    onEntriesChange(entries.filter((e) => e.id !== id));
  };

  const updateAmount = (id: string, value: string) => {
    onEntriesChange(entries.map((e) => (e.id === id ? { ...e, amount: value } : e)));
  };

  const updateMethod = (id: string, method: string) => {
    onEntriesChange(entries.map((e) => (e.id === id ? { ...e, method } : e)));
  };

  const balanceColor = isBalanced
    ? theme.palette.success.main
    : isExcess
      ? theme.palette.error.main
      : theme.palette.warning.main;

  const balanceLabel = isBalanced ? 'Balanced' : isExcess ? 'Excess' : 'Remaining';

  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 2.4,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.72)}`,
        boxShadow: (t) => `0 10px 22px ${alpha(t.palette.common.black, 0.07)}`,
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.25,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:card-recive-bold" width={17} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Payment Split
          </Typography>
          {entries.length > 1 && (
            <Chip
              label={`${entries.length} methods`}
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, height: 20 }}
            />
          )}
        </Box>
        <Tooltip title="Add another payment method (split payment)">
          <Chip
            icon={<Iconify icon="solar:add-circle-bold" width={14} />}
            label="Add Method"
            size="small"
            variant="outlined"
            onClick={addRow}
            disabled={entries.length >= Object.keys(PAYMENT_METHODS).length}
            sx={{ fontWeight: 700, cursor: 'pointer', borderRadius: 1.25 }}
          />
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 1.25 }} />

      {/* Payment rows */}
      <AnimatePresence initial={false}>
        {entries.map((entry, idx) => (
          <PaymentRow
            key={entry.id}
            entry={entry}
            index={idx}
            canRemove={entries.length > 1}
            remaining={remaining + (Number(entry.amount) || 0)}
            onAmountChange={updateAmount}
            onMethodChange={updateMethod}
            onRemove={removeRow}
            autoFocus={idx === entries.length - 1 && entries.length > 1}
          />
        ))}
      </AnimatePresence>

      <Divider sx={{ my: 1 }} />

      {/* Summary strip */}
      <Box
        sx={{
          borderRadius: 1.5,
          p: 1.1,
          border: `1px solid ${alpha(balanceColor, 0.28)}`,
          bgcolor: alpha(balanceColor, 0.06),
        }}
      >
        <Box display="flex" justifyContent="space-between" mb={0.35}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Payable Amount
          </Typography>
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            ₹ {formatNumber(payable)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={0.35}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total Allocated
          </Typography>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            ₹ {formatNumber(totalAllocated)}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" fontWeight={700} sx={{ color: balanceColor }}>
            {balanceLabel}
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={900}
            sx={{ color: balanceColor, fontVariantNumeric: 'tabular-nums' }}
          >
            ₹ {formatNumber(Math.abs(remaining))}
          </Typography>
        </Box>
      </Box>

      {isExcess && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.75, display: 'block', textAlign: 'center' }}
        >
          Total payment exceeds payable amount. Please adjust.
        </Typography>
      )}
    </Card>
  );
};

export default SplitPaymentPanel;
