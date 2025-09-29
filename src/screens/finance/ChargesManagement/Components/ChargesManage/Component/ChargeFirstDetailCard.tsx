import React from 'react';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

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

  // Set default priority to 2 (Medium) if charge.priority doesn't exist
  const priority = charge?.priority
    ? priorityMap[charge.priority]
    : priorityMap[2] || { label: 'Medium', color: 'primary' };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Applied for
          </Typography>

          <Grid container spacing={3}>
            {/* Left Column - Basic Details */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography color="text.secondary">Category</Typography>
                  <Typography sx={{ fontWeight: 400 }}>{charge?.category}</Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary">Amount</Typography>
                  <Typography sx={{ fontWeight: 400 }}>
                    {formatNumber(charge?.amount ?? 0, 'INR')}
                  </Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary">Due Date</Typography>
                  <Typography sx={{ fontWeight: 400 }}>{charge?.dueDate}</Typography>
                </Box>

                <Box>
                  <Typography color="text.secondary">Priority</Typography>
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
                    sx={{ width: 'fit-content' }}
                  >
                    {priority.label}
                  </Label>
                </Box>
              </Box>
            </Grid>

            {/* Right Column - Description and Additional Notes */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Purpose/Description Section */}
                <Box>
                  <Typography color="text.secondary">Purpose/Description</Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      borderStyle: 'dashed',
                      p: 2,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {charge?.description ||
                        'Annual tuition fee applicable for Class 10 students in divisions A and B.'}
                    </Typography>
                  </Box>
                </Box>

                {/* Additional Details Section */}
                <Box>
                  <Typography color="text.secondary">Additional Details</Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      borderStyle: 'dashed',
                      p: 2,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {charge?.additionalNotes || 'Installments allowed in two parts.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChargeFirstDetailsCard;
