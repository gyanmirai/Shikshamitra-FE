import React from 'react';

import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

import { Label } from 'src/components/label';

import type { IChargeData } from './type';

interface Props {
  charge: IChargeData | null;
}

const ChargeFirstDetailsCard: React.FC<Props> = ({ charge }) => {
  const priorityMap: Record<
    number,
    { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' }
  > = {
    1: { label: 'Low', color: 'success' },
    2: { label: 'Medium', color: 'primary' },
    3: { label: 'High', color: 'error' },
  };

  const priority = charge?.priority
    ? priorityMap[charge.priority]
    : { label: 'Unknown', color: 'default' };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Charge Information
          </Typography>

          <Grid container spacing={2}>
            {/* Basic Details */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body1">{charge?.category}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography variant="body1">₹ {charge?.amount}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2">Due Date</Typography>
                  <Typography variant="body1">{charge?.dueDate}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2">Priority</Typography>
                  <Label
                    color={
                      priority.color as
                        | 'default'
                        | 'primary'
                        | 'secondary'
                        | 'success'
                        | 'error'
                        | 'warning'
                    }
                  >
                    {priority.label}
                  </Label>
                </Box>
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  bgcolor: '#fafafa',
                  minHeight: '120px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', m: 0 }}
                >
                  {charge?.description}
                </Typography>
              </Box>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Notes
              </Typography>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  bgcolor: '#fafafa',
                  minHeight: '120px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', m: 0 }}
                >
                  {charge?.additionalNotes || '—'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChargeFirstDetailsCard;
