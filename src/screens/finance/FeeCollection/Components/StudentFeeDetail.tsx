import type { LabelColor } from 'src/components/label';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Avatar, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IStudentFee } from './type';

export const FeeSummaryCard = ({
  student,
  showHeader = true,
}: {
  student: IStudentFee | null;
  showHeader?: boolean;
}) => (
  // Get the current theme for consistent styling across the component

  <Box display="flex" gap={1} alignItems="center">
    {/* Avatar */}

    {/* Student Info + Fees */}
    <Box flex={1} display="flex" flexDirection="column" gap={1}>
      {/* Top Row: Name + Status */}
      {showHeader && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
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

      <Grid container spacing={2} columns={{ xs: 12, sm: 12, md: 12, lg: 60 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 }}>
          <FinanceCollectionCard
            icon="mdi:currency-inr"
            title="Total Fees"
            count={formatNumber(student?.totalFees ?? 0, 'INR')}
            color="text.primary"
            bgColor="background.neutral"
            href="#"
            labels={[]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 }}>
          <FinanceCollectionCard
            icon="mdi:cash-check"
            title="Paid Fees"
            count={formatNumber(student?.paidFees ?? 0, 'INR')}
            color="success.main"
            bgColor="success.lighter"
            href="#"
            labels={[]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 }}>
          <FinanceCollectionCard
            icon="mdi:cash-clock"
            title="Pending Fees"
            count={formatNumber(student?.pendingFees ?? 0, 'INR')}
            color="warning.main"
            bgColor="warning.lighter"
            href="#"
            labels={[]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 }}>
          <FinanceCollectionCard
            icon="mdi:cash-remove"
            title="Overdue Fees"
            count={formatNumber(student?.overdueFees ?? 0, 'INR')}
            color="error.main"
            bgColor="error.lighter"
            href="#"
            labels={[]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 }}>
          <FinanceCollectionCard
            icon="mdi:cash-plus"
            title="Charges"
            count={formatNumber(
              Number(student?.chargesPaid ?? 0) + Number(student?.chargesTotal ?? 0),
              'INR'
            )}
            color="info.main"
            bgColor="info.lighter"
            href="#"
            labels={[]}
          />
        </Grid>
      </Grid>
    </Box>
  </Box>
);

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
