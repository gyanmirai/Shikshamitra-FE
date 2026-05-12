import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const COLUMNS = [
  { key: 'TOTAL', width: 90 },
  { key: 'PAID', width: 90 },
  { key: 'REFUNDED', width: 90 },
  { key: 'REFUNDABLE', width: 90 },
  { key: 'REFUND AMOUNT', width: 124 },
  { key: 'STATUS', width: 76 },
] as const;

const RefundColHeader = (): React.ReactElement => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      alignItems="center"
      pl={1}
      gap={1}
      pr={1.5}
      py={0.75}
      sx={{
        bgcolor: alpha(theme.palette.text.secondary, 0.05),
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Checkbox placeholder */}
      <Box sx={{ width: 32, flexShrink: 0 }} />

      {/* Month column */}
      <Typography
        flex={1}
        variant="caption"
        fontWeight={700}
        color="text.disabled"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}
      >
        Month
      </Typography>

      {/* Data columns */}
      {COLUMNS.map((col) => (
        <Typography
          key={col.key}
          variant="caption"
          fontWeight={700}
          color="text.disabled"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: 10,
            width: col.width,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {col.key}
        </Typography>
      ))}
    </Box>
  );
};

export default RefundColHeader;
