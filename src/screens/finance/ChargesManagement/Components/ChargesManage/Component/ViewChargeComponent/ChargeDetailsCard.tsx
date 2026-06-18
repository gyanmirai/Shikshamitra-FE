import React from 'react';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { Event, Description, CurrencyRupee, CalendarToday } from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IChargeDetailData } from '../type';

interface ChargeDetailsCardProps {
  charge: IChargeDetailData | null;
}

const ChargeViewDetailsCard: React.FC<ChargeDetailsCardProps> = ({ charge }) => {
  const detailIconColor = 'success.main';
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      {/* Header Section */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify icon="mdi:information-outline" width={18} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Charge Details
          </Typography>
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Box>
        <Grid container spacing={3}>
          {/* Top Row: Key Metrics */}
          <InfoItem
            icon={<Description />}
            label="Charge Name"
            value={charge?.chargeName || 'N/A'}
            iconColor={detailIconColor}
          />
          <InfoItem
            icon={<CurrencyRupee />}
            label="Amount"
            value={`₹ ${formatNumber(String(charge?.amount || 0))}`}
            iconColor={detailIconColor}
          />
          <InfoItem
            icon={<Description />}
            label="Category"
            value={charge?.categoryName || 'N/A'}
            iconColor={detailIconColor}
          />
          <InfoItem
            icon={<Event />}
            label="Due Date"
            value={charge?.dueDate ? dayjs(charge.dueDate).format('DD-MM-YYYY') : 'N/A'}
            iconColor={detailIconColor}
          />
          <InfoItem
            icon={<CalendarToday />}
            label="Created Date"
            value={charge?.appliedOn ? dayjs(charge.appliedOn).format('DD-MM-YYYY') : 'N/A'}
            iconColor={detailIconColor}
          />
          <InfoItem
            icon={<Description />}
            label="Description"
            value={charge?.purposeDescription || 'No description provided.'}
            iconColor={detailIconColor}
          />
        </Grid>
      </Box>
    </Paper>
  );
};

export default ChargeViewDetailsCard;
