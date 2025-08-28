import type { LabelColor } from 'src/components/label';

import { Box, Card, Avatar, useTheme, Typography } from '@mui/material';

import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { Label } from 'src/components/label';

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
        borderRadius: 3,
        boxShadow: 2,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box display="flex" gap={2} alignItems="center">
        {/* Avatar */}

        {/* Student Info + Fees */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          {/* Top Row: Name + Status */}
          {showHeader && (
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar alt={student?.name} src="" sx={{ width: 50, height: 50 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {student?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student?.className} | Roll No : {student?.rollNumber}
                  </Typography>
                </Box>
              </Box>

              <Label
                color={
                  FeeCollectionStatusTypeColors[
                    student?.status as unknown as FeeCollectionStatusType
                  ] as LabelColor
                }
              >
                {FeeCollectionStatusType[student?.status as unknown as FeeCollectionStatusType]}
              </Label>
            </Box>
          )}

          {/* Fee Info Row */}
          <Box display="flex" gap={2} flexWrap="wrap">
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
            />
            <FeeDetailBox
              label="Charges"
              amount={Number(student?.chargesPaid ?? 0) + Number(student?.chargesTotal ?? 0)}
              color={theme.palette.info.main}
              bgColor={theme.palette.info.lighter}
            />
          </Box>
        </Box>
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
