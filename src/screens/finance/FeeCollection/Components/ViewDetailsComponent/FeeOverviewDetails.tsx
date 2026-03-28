import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import ErrorIcon from '@mui/icons-material/Error';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Typography } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const rowVariant = (i: number) => ({
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
});

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
        borderRadius: 2,
        mb: 1,
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
        p: 1,
        borderRadius: 2,
        height: '100%',
        boxShadow: theme.customShadows?.card || theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Fee Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Summary of total fee collection
        </Typography>
      </Box>

      <Scrollbar sx={{ flexGrow: 1, px: 1, maxHeight: 350 }}>
        {/* Total Fee */}
        <motion.div {...rowVariant(0)}>
          <RowCard
            icon={<Iconify icon="streamline:bag-dollar" width={24} />}
            label="Total Fee"
            value={total}
            bgcolor={`${theme.palette.secondary.light}33`}
            color={theme.vars.palette.text.primary}
          />
        </motion.div>
        {/* Paid Fee */}
        <motion.div {...rowVariant(1)}>
          <RowCard
            icon={<CheckCircleIcon sx={{ fontSize: 24 }} />}
            label="Paid Fee"
            value={paid}
            bgcolor={`${theme.palette.success.light}33`}
            color={theme.palette.success.main}
          />
        </motion.div>

        {/* Pending Fee */}
        <motion.div {...rowVariant(2)}>
          <RowCard
            icon={<Iconify icon="game-icons:sands-of-time" width={24} />}
            label="Pending Fee"
            value={pending}
            bgcolor={`${theme.palette.warning.light}33`}
            color={theme.palette.warning.main}
          />
        </motion.div>

        {/* Overdue Fee */}
        <motion.div {...rowVariant(3)}>
          <RowCard
            icon={<ErrorIcon sx={{ fontSize: 24 }} />}
            label="Overdue Fee"
            value={overdue}
            bgcolor={`${theme.palette.error.light}33`}
            color={theme.palette.error.main}
          />
        </motion.div>

        {/* Concession */}
        <motion.div {...rowVariant(4)}>
          <RowCard
            icon={<CreditCardIcon sx={{ fontSize: 24 }} />}
            label="Concession"
            value={concession}
            bgcolor={`${theme.palette.info.light}33`}
            color={theme.palette.info.main}
          />
        </motion.div>
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
