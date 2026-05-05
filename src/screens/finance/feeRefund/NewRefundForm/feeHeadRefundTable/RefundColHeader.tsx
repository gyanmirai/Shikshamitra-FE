import { Box, Typography } from '@mui/material';

const COLUMNS = ['TOTAL', 'PAID', 'REFUNDED', 'REFUNDABLE', 'REFUND AMOUNT', 'STATUS'] as const;

const RefundColHeader = (): React.ReactElement => (
  <Box
    display="flex"
    alignItems="center"
    pl={1}
    gap={1}
    pr={1.5}
    py={0.5}
    sx={{ bgcolor: 'action.hover' }}
  >
    <Box sx={{ width: 32 }} />
    <Typography
      flex={1}
      variant="caption"
      fontWeight={700}
      color="text.disabled"
      textTransform="uppercase"
    >
      Month
    </Typography>
    {COLUMNS.map((col) => (
      <Typography
        key={col}
        variant="caption"
        fontWeight={700}
        color="text.disabled"
        textTransform="uppercase"
        sx={{ width: col === 'REFUND AMOUNT' ? 120 : 88, textAlign: 'right' }}
      >
        {col}
      </Typography>
    ))}
  </Box>
);

export default RefundColHeader;
