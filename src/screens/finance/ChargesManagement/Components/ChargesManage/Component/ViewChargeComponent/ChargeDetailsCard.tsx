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
          px: 3,
          py: 2.5,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Charge Details
        </Typography>
        <Chip
          label={priority.label}
          size="small"
          variant="soft"
          sx={{
            bgcolor: priority.bg,
            color: priority.color,
            fontWeight: 700,
            borderRadius: 1,
            height: 24,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Top Row: Key Metrics */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.08)',
                }}
              >
                <CurrencyRupee sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  AMOUNT
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
                  ₹ {charge?.amount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <Description sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                  sx={{ letterSpacing: 0.5 }}
                >
                  CATEGORY
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {charge?.category}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <Event sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                  sx={{ letterSpacing: 0.5 }}
                >
                  DUE DATE
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {charge?.dueDate}
                </Typography>
              </Box>
            </Box>
          </Grid>

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
                      ADDITIONAL DETAILS
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
