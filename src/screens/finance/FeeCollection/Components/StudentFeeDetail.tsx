import type { LabelColor } from 'src/components/label';

import Link from 'next/link';

import { Box, Card, Grid, Avatar, useTheme, Typography } from '@mui/material';

import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

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

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:currency-inr"
                title="Total Fees"
                count={student?.totalFees ?? 0}
                color="text.primary"
                bgColor="background.neutral"
                href="#"
                labels={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:cash-check"
                title="Paid Fees"
                count={student?.paidFees ?? 0}
                color="success.main"
                bgColor="success.lighter"
                href="#"
                labels={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:cash-clock"
                title="Pending Fees"
                count={student?.pendingFees ?? 0}
                color="warning.main"
                bgColor="warning.lighter"
                href="#"
                labels={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:cash-remove"
                title="Overdue Fees"
                count={student?.overdueFees ?? 0}
                color="error.main"
                bgColor="error.lighter"
                href="#"
                labels={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:cash-plus"
                title="Charges"
                count={Number(student?.chargesPaid ?? 0) + Number(student?.chargesTotal ?? 0)}
                color="info.main"
                bgColor="info.lighter"
                href="#"
                labels={[]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <FinanceCollectionCard
                icon="mdi:cash-minus"
                title="Concessions"
                count={Number(student?.chargesPaid ?? 0) + Number(student?.chargesTotal ?? 0)}
                color="info.main"
                bgColor="info.lighter"
                href="#"
                labels={[]}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Card>
  );
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
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          scale: 1.02,
        },
      }}
    >
      <Box>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h5">{count}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color}>
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
      <Iconify
        icon={icon}
        sx={{
          height: '40px',
          width: '40px',
          color,
        }}
      />
    </Card>
  </Box>
);
