import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';
import { Flag, Event, Description, CurrencyRupee } from '@mui/icons-material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IChargeDetailData } from '../type';

interface ChargeDetailsCardProps {
  charge: IChargeDetailData | null;
}

const ChargeViewDetailsCard: React.FC<ChargeDetailsCardProps> = ({ charge }) => {
  // Backend enum: Low=0, Medium=1, High=2
  const getPriorityLabel = (value?: number) => {
    switch (value) {
      case 0:
        return { label: 'Low', color: 'success' as const };
      case 1:
        return { label: 'Medium', color: 'warning' as const };
      case 2:
      default:
        return { label: 'High', color: 'error' as const };
    }
  };

  const priority = getPriorityLabel(charge?.priority);

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
        <Label variant="soft" color={priority.color}>
          {priority.label}
        </Label>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Box>
        <Grid container spacing={3}>
          {/* Top Row: Key Metrics */}
          <InfoItem
            icon={<CurrencyRupee />}
            label="Amount"
            value={`₹ ${formatNumber(String(charge?.amount || 0))}`}
          />
          <InfoItem icon={<Description />} label="Category" value={charge?.categoryName || 'N/A'} />
          <InfoItem
            icon={<Event />}
            label="Due Date"
            value={charge?.dueDate ? new Date(charge.dueDate).toLocaleDateString() : 'N/A'}
          />

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>

          {/* Description Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'info.main',
                  mt: 0.5,
                }}
              >
                <Flag sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Description & Notes</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1.5 }}
                >
                  {charge?.purposeDescription || 'No description provided.'}
                </Typography>

                {charge?.additionalNotes && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}
                    >
                      Additional Notes
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {charge.additionalNotes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ChargeViewDetailsCard;
