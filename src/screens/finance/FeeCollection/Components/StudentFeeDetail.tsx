import { Box, Card, useTheme, Typography } from '@mui/material';

import type { IStudentFee } from './type';

export const FeeSummaryCard = ({
  student,
  showHeader = true,
}: {
  student: IStudentFee | null;
  showHeader?: boolean;
}) => {
  // Get the current theme for consistent styling across the component
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: 2,
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Header */}
      {showHeader && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {student?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student?.className} | Roll No : {student?.rollNumber}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              bgcolor:
                student?.status === 'Pending'
                  ? theme.palette.warning.light
                  : theme.palette.success.light,
              color:
                student?.status === 'Pending'
                  ? theme.palette.warning.dark
                  : theme.palette.success.dark,
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {student?.status}
          </Box>
        </Box>
      )}

      {/* Fee Details */}
      <Box display="flex" gap={2}>
        <FeeDetailBox
          label="Total Fees"
          amount={student?.totalFees ?? 0}
          color={theme.palette.grey[800]}
          bgColor={theme.palette.grey[100]}
        />
        <FeeDetailBox
          label="Paid Fees"
          amount={student?.paidFees ?? 0}
          color={theme.palette.success.main}
          bgColor={theme.palette.success.lighter}
        />
        <FeeDetailBox
          label="Pending Fees"
          amount={student?.pendingFees ?? 0}
          color={theme.palette.warning.main}
          bgColor={theme.palette.warning.lighter}
        />
        <FeeDetailBox
          label="Overdue Fees"
          amount={student?.overdueFees ?? 0}
          color={theme.palette.error.main}
          bgColor={theme.palette.error.lighter}
        />{' '}
      </Box>
    </Card>
  );
};

/** Sub-box component inside the card */
const FeeDetailBox = ({
  label,
  amount,
  color,
  bgColor,
}: {
  label: string;
  amount: number;
  color: string;
  bgColor: string;
}) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: color,
      bgcolor: bgColor,
      borderRadius: 3,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      height: 100,
      flex: 1,
      mb: 2,
    }}
  >
    <Typography variant="body1" color={color} sx={{ mb: 1 }}>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight="bold" sx={{ color }}>
      ₹ {amount.toLocaleString('en-IN')}
    </Typography>
  </Box>
);
