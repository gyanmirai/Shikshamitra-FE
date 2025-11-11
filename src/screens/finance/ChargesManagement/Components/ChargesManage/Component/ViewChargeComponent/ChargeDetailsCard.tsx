import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Flag, Event, Description, CurrencyRupee } from '@mui/icons-material';
import { Box, Card, Chip, Grid, Divider, Typography, CardContent } from '@mui/material';

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
      sx={{
        borderRadius: 2,
        boxShadow: 'var(--shadows-8)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" color="primary.main" mb={2}>
          Charge Details
        </Typography>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Category */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <Description sx={{ color: 'primary.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Charge Category
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {charge?.category}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Amount */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <CurrencyRupee sx={{ color: 'primary.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  ₹ {charge?.amount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <Event sx={{ color: 'primary.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {charge?.dueDate}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Priority */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 2,
                }}
              >
                <Flag sx={{ color: 'primary.main', fontSize: 17 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Priority
                </Typography>
                <Chip
                  label={priority.label}
                  size="small"
                  sx={{
                    bgcolor: priority.bg,
                    color: priority.color,
                    fontWeight: 500,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Description */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Description
          </Typography>
          <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
            {charge?.description}
          </Typography>
          <Divider />
          {charge?.additionalNotes && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, mt: 0.5 }}>
                Additional Details
              </Typography>
              <Typography variant="body1" fontWeight="medium" color="text.primary">
                {charge.additionalNotes}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChargeViewDetailsCard;
