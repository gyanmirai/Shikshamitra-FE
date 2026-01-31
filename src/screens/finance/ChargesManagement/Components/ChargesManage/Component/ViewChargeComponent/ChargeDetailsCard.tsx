import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { Flag, Event, Description, CurrencyRupee } from '@mui/icons-material';
import { Box, Card, Grid, Divider, Typography, CardContent } from '@mui/material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { IChargeData } from '../type';

interface ChargeDetailsCardProps {
  charge: IChargeData | null;
}

const ChargeViewDetailsCard: React.FC<ChargeDetailsCardProps> = ({ charge }) => {
  // Convert numeric priority to label & color
  const getPriorityLabel = (value?: number) => {
    switch (value) {
      case 1:
        return { label: 'High', color: '#FF4842', bg: 'rgba(255,72,66,0.1)' };
      case 2:
        return { label: 'Medium', color: '#FFC107', bg: 'rgba(255,193,7,0.1)' };
      case 3:
      default:
        return { label: 'Low', color: '#00A76F', bg: 'rgba(0,167,111,0.1)' };
    }
  };

  const priority = getPriorityLabel(charge?.priority);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Charge Details
        </Typography>
        <Label variant="soft" color="success">
          {priority.label}
        </Label>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Top Row: Key Metrics */}
          <InfoItem
            icon={<CurrencyRupee />}
            label="Amount"
            value={`₹ ${formatNumber(String(charge?.amount))}`}
          />
          <InfoItem icon={<Description />} label="Category" value={charge?.category} />
          <InfoItem icon={<Event />} label="Due Date" value={charge?.dueDate} />

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>

          {/* Description Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Description & Notes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1.5 }}
                >
                  {charge?.description || 'No description provided.'}
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
      </CardContent>
    </Card>
  );
};

export default ChargeViewDetailsCard;
