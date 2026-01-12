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
        p: 2.5,
        borderRadius: 2,
        mb: 2,
        // bgcolor,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: `1px solid transparent`,
        transition: 'all 0.2s ease-in-out',
        boxShadow: theme.shadows[2],
        // borderColor: color,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor,
          color,
          boxShadow: theme.customShadows?.z1 || theme.shadows[1],
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ₹ {value.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        boxShadow: theme.customShadows?.card || theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Fee Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Summary of total fee collection
        </Typography>
      </Box>

      <Scrollbar sx={{ flexGrow: 1, height: 'auto', px: 1, mx: -1 }}>
        {/* Total Fee */}
        <RowCard
          icon={<Iconify icon="streamline:bag-dollar" width={24} />}
          label="Total Fee"
          value={total}
          bgcolor={`${theme.palette.secondary.light}33`}
          color={theme.vars.palette.text.primary}
        />
        {/* Paid Fee */}
        <RowCard
          icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
          label="Paid Fee"
          value={paid}
          bgcolor={`${theme.palette.success.light}33`}
          color={theme.palette.success.main}
        />

        {/* Pending Fee */}
        <RowCard
          icon={<Iconify icon="game-icons:sands-of-time" width={24} />}
          label="Pending Fee"
          value={pending}
          bgcolor={`${theme.palette.warning.light}33`}
          color={theme.palette.warning.main}
        />

        {/* Overdue Fee */}
        <RowCard
          icon={<ErrorIcon sx={{ fontSize: 24 }} />}
          label="Overdue Fee"
          value={overdue}
          bgcolor={`${theme.palette.error.light}33`}
          color={theme.palette.error.main}
        />

        {/* Concession */}
        <RowCard
          icon={<CreditCardIcon sx={{ fontSize: 24 }} />}
          label="Concession"
          value={concession}
          bgcolor={`${theme.palette.info.light}33`}
          color={theme.palette.info.main}
        />
      </Scrollbar>

      {/* Progress Bar (Preserved commented code) */}
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
