import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Chip, Grid, Divider, Typography } from '@mui/material';

import type { FeeCollectionPayment } from '../../Components/type';

interface Props {
  payment: FeeCollectionPayment;
  remarks?: string;
}

const DetailRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  ) : null;

const PaymentInfoPreview = ({ payment, remarks }: Props) => {
  const amount = Number(String(payment.amount || 0).replace(/[₹,\s]/g, ''));

  const formatDetailValue = (key: string, value: any): string => {
    if (!value) return '';
    if (dayjs.isDayjs(value)) return dayjs(value).format('DD/MM/YYYY');
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))
      return dayjs(value).format('DD/MM/YYYY');
    return String(value);
  };

  const detailEntries = Object.entries(payment.details ?? {}).filter(([, v]) => Boolean(v));

  return (
    <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Payment Method
      </Typography>
      <Divider sx={{ mb: 1.5 }} />

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:card-bold" sx={{ color: 'primary.main', width: 22 }} />
          <Typography variant="body2" fontWeight={600}>
            {payment.paymentMethod}
          </Typography>
        </Box>
        <Chip
          label={`₹${formatNumber(amount)}`}
          color="primary"
          size="small"
          variant="soft"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {detailEntries.length > 0 && (
        <Grid container spacing={1.5} mt={0.5}>
          {detailEntries.map(([key, value]) => (
            <Grid size={{ xs: 6, sm: 4 }} key={key}>
              <DetailRow
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                value={formatDetailValue(key, value)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {remarks && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Remarks
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
              {remarks}
            </Typography>
          </Box>
        </>
      )}
    </Card>
  );
};

export default PaymentInfoPreview;
