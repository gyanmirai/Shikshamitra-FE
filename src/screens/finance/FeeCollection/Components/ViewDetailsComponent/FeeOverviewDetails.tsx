import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
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

  const RowCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
  }) => (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'text.disabled',
          bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
          color: 'text.secondary',
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.2 }}
        >
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          ₹ {value.toLocaleString('en-IN')}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1.5,
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Fee Overview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Summary of total fee collection
        </Typography>
      </Box>

      <Scrollbar sx={{ flexGrow: 1, maxHeight: 350 }}>
        {/* Total Fee */}
        <motion.div {...rowVariant(0)}>
          <RowCard
            icon={<Iconify icon="streamline:bag-dollar" width={18} />}
            label="Total Fee"
            value={total}
          />
        </motion.div>
        {/* Paid Fee */}
        <motion.div {...rowVariant(1)}>
          <RowCard icon={<CheckCircleIcon sx={{ fontSize: 18 }} />} label="Paid Fee" value={paid} />
        </motion.div>

        {/* Pending Fee */}
        <motion.div {...rowVariant(2)}>
          <RowCard
            icon={<Iconify icon="game-icons:sands-of-time" width={18} />}
            label="Pending Fee"
            value={pending}
          />
        </motion.div>

        {/* Overdue Fee */}
        <motion.div {...rowVariant(3)}>
          <RowCard icon={<ErrorIcon sx={{ fontSize: 18 }} />} label="Overdue Fee" value={overdue} />
        </motion.div>

        {/* Concession */}
        <motion.div {...rowVariant(4)}>
          <RowCard
            icon={<CreditCardIcon sx={{ fontSize: 18 }} />}
            label="Concession"
            value={concession}
          />
        </motion.div>
      </Scrollbar>
    </Card>
  );
}
