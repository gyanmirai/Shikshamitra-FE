import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Stack, Divider, Typography } from '@mui/material';

import type { FeeCollectionPayment } from '../../Components/type';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  payment: FeeCollectionPayment;
  remarks?: string;
  bankAccounts?: { id: string; name: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: 'solar:banknote-2-bold',
  upi: 'solar:smartphone-bold',
  cheque: 'solar:notebook-bold',
  'bank transfer': 'solar:bank-bold',
  card: 'solar:card-bold',
  dd: 'solar:document-bold',
};

const getPaymentIcon = (method: string): string => {
  const key = method?.toLowerCase() ?? '';
  return (
    Object.entries(PAYMENT_METHOD_ICONS).find(([k]) => key.includes(k))?.[1] ?? 'solar:card-bold'
  );
};

const formatDetailValue = (
  key: string,
  value: any,
  bankAccounts?: { id: string; name: string }[]
): string => {
  if (!value) return '';
  if (key === 'bankAccount' && bankAccounts) {
    const found = bankAccounts.find((acc) => acc.id === value);
    if (found) return found.name;
  }
  if (dayjs.isDayjs(value)) return dayjs(value).format('DD/MM/YYYY');
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
    return dayjs(value).format('DD/MM/YYYY');
  if (key.toLowerCase().includes('date')) {
    const d = dayjs(value);
    if (d.isValid()) {
      return d.format('DD/MM/YYYY');
    }
  }
  return String(value);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <Box>
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={500}
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          fontSize: '10px',
          display: 'block',
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {value}
      </Typography>
    </Box>
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentInfoPreview = ({ payment, remarks, bankAccounts }: Props) => {
  const theme = useTheme();
  const amount = Number(String(payment.amount || 0).replace(/[₹,\s]/g, ''));
  const detailEntries = Object.entries(payment.details ?? {}).filter(([, v]) => Boolean(v));
  const paymentIcon = getPaymentIcon(payment.paymentMethod ?? '');

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'box-shadow 200ms ease',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.06)}`,
        },
      }}
    >
      {/* ── Section Label ── */}
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={600}
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          fontSize: '10px',
          display: 'block',
          mb: 1.5,
        }}
      >
        Payment Method
      </Typography>

      {/* ── Method Card ── */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Icon bubble */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={paymentIcon} width={20} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" lineHeight={1.2}>
            {payment.paymentMethod}
          </Typography>
        </Stack>

        {/* Amount badge */}
        <Box textAlign="right">
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={500}
            sx={{ fontSize: '10px', display: 'block' }}
          >
            AMOUNT
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary.main">
            ₹{formatNumber(amount)}
          </Typography>
        </Box>
      </Box>

      {/* ── Extra Details ── */}
      {detailEntries.length > 0 && (
        <>
          <Divider sx={{ my: 2, opacity: 0.6 }} />
          <Grid container spacing={2}>
            {detailEntries.map(([key, value]) => (
              <Grid size={{ xs: 6, sm: 4 }} key={key}>
                <DetailRow
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={formatDetailValue(key, value, bankAccounts)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* ── Remarks ── */}
      {remarks && (
        <>
          <Divider sx={{ my: 2, opacity: 0.6 }} />
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.text.secondary, 0.04),
              border: `1px dashed ${alpha(theme.palette.text.secondary, 0.15)}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.disabled"
              fontWeight={600}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontSize: '10px',
                display: 'block',
                mb: 0.5,
              }}
            >
              Remarks
            </Typography>
            <Typography variant="body2" color="text.primary" lineHeight={1.6}>
              {remarks}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PaymentInfoPreview;
