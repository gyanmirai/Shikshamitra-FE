import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Paper, Divider, Typography } from '@mui/material';

import type { IStudentFee } from './type';

export const StudentFeeSummaryCard = ({
  student,
  showHeader = true,
}: {
  student: IStudentFee | null;
  showHeader?: boolean;
}) => {
  // Get the current theme for consistent styling across the component

  <Box display="flex" gap={2} alignItems="center">
    {/* Avatar */}

    {/* Student Info + Fees */}
    <Box flex={1} display="flex" flexDirection="column" gap={2}>
      {/* Top Row: Name + Status */}
      {showHeader && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {student?.name}({student?.grNumber})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student?.className && student?.division
                  ? `${student.className} - ${student.division}`
                  : 'N/A'}{' '}
                | Roll No : {student?.rollNumber ?? 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Paper
            elevation={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              display: 'flex',
              borderRadius: 2,
              p: 1,
              // boxShadow: 'var(--shadows-4)',
            }}
          >
            {/* ITEM */}
            <Box textAlign="center" minWidth={120}>
              <Typography variant="body2" color="text.secondary">
                Total Fee
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {formatNumber(student?.totalFees ?? 0, 'INR')}
              </Typography>
            </Box>

            {/* DIVIDER */}
            <Divider orientation="vertical" flexItem />

            {/* ITEM */}
            <Box textAlign="center" minWidth={120}>
              <Typography variant="body2" color="text.secondary">
                Paid
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="success.main">
                {formatNumber(student?.paidFees ?? 0, 'INR')}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* ITEM */}
            <Box textAlign="center" minWidth={120}>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="warning.main">
                {formatNumber(student?.pendingFees ?? 0, 'INR')}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* ITEM */}
            <Box textAlign="center" minWidth={120}>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="error.main">
                {formatNumber(student?.overdueFees ?? 0, 'INR')}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  </Box>;
};

interface ILabel {
  name: string;
  color: LabelColor;
}

export interface IStudentEnrollmentCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: ILabel[];
  index?: number;
}

export const FinanceCollectionCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  index,
}: IStudentEnrollmentCardProps) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none', maxWidth: '200px' }}>
    <Card
      sx={{
        p: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        flexGrow: 1,
        cursor: 'pointer',
        height: '100%',
        width: '100%',
        transition: 'all 0.3s ease',
        '&:hover': { boxShadow: 'var(--shadows-8)', scale: 1.02 },
      }}
    >
      <Box>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h6">{count}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color}>
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
      <Iconify icon={icon} sx={{ height: '40px', width: '40px', color }} />
    </Card>
  </Box>
);
