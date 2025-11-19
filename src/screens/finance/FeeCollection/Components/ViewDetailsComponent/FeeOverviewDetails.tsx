import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import ErrorIcon from '@mui/icons-material/Error';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Typography } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type FeeOverviewProps = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  concession: number;
};

export default function FeeOverview({
  total,
  paid,
  pending,
  overdue,
  concession,
}: FeeOverviewProps) {
  const theme = useTheme();

  // eslint-disable-next-line react/no-unstable-nested-components
  const RowCard = ({
    icon,
    label,
    value,
    bgcolor,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    bgcolor: string;
    color: string;
  }) => (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        mb: 1,
        bgcolor,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" display="flex" gap={1}>
        {icon} {label}
      </Typography>
      <Typography variant="h6" fontWeight={400} sx={{ color, mt: 0.5, ml: 1 }}>
        ₹ {value.toLocaleString()}
      </Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1,
        height: '100%',
        boxShadow: 'var(--shadows-8)',
      }}
    >
      <Typography variant="h6" color="primary.main" mb={1}>
        Fee Overview
      </Typography>
      <Scrollbar sx={{ height: '380px', p: 1 }}>
        {/* Total Fee */}
        <RowCard
          icon={<Iconify icon="streamline:bag-dollar" />}
          label="Total Fee"
          value={total}
          bgcolor={`${theme.palette.secondary.light}33`}
          color={theme.vars.palette.text.primary}
        />
        {/* Paid Fee */}
        <RowCard
          icon={<CheckCircleIcon color="success" />}
          label="Paid Fee"
          value={paid}
          bgcolor={`${theme.palette.success.light}33`}
          color={theme.palette.success.main}
        />

        {/* Pending Fee */}
        <RowCard
          icon={<Iconify icon="game-icons:sands-of-time" sx={{ color: 'warning.main' }} />}
          label="Pending Fee"
          value={pending}
          bgcolor={`${theme.palette.warning.light}33`}
          color={theme.palette.warning.main}
        />

        {/* Overdue Fee */}
        <RowCard
          icon={<ErrorIcon color="error" />}
          label="Overdue Fee"
          value={overdue}
          bgcolor={`${theme.palette.error.light}33`}
          color={theme.palette.error.main}
        />

        {/* Concession */}
        <RowCard
          icon={<CreditCardIcon color="info" />}
          label="Concession"
          value={concession}
          bgcolor={`${theme.palette.info.light}33`}
          color={theme.palette.info.main}
        />
      </Scrollbar>

      {/* Progress Bar */}
      {/* <Box mt={3}>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={0.5}
          display="flex"
          justifyContent="space-between"
        >
          <span>Payment Progress</span>
          <span>{progress}% Paid</span>
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
          }}
        />
      </Box> */}
    </Card>
  );
}
