import React from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
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

  const theme = useTheme();

  // Set default priority to 2 (Medium) if charge.priority doesn't exist
  const priority = charge?.priority
    ? priorityMap[charge.priority]
    : priorityMap[2] || { label: 'Medium', color: 'primary' };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Applied for
          </Typography>

          <Grid container spacing={2}>
            {/* Left Column - Basic Details */}
            <Grid size={{ xs: 12 }}>
              <Box display="flex" gap={7}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {charge?.categoryName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatNumber(charge?.amount ?? 0, 'INR')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {charge?.dueDate}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Priority
                  </Typography>
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
            <Grid size={{ xs: 12 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                {/* Purpose/Description Section */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Purpose/Description
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: theme.palette.grey[300],
                      borderRadius: 1,
                      borderStyle: 'dashed',
                      p: 2,
                      backgroundColor: theme.palette.grey[50],
                    }}
                  >
                    <Typography sx={{ fontWeight: 300, lineHeight: 1.6 }} variant="body1">
                      {charge?.purposeDescription ||
                        'Annual tuition fee applicable for Class 10 students in divisions A and B.'}
                    </Typography>
                  </Box>
                </Box>

                {/* Additional Details Section */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Additional Details
                  </Typography>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: theme.palette.grey[300],
                      borderRadius: 1,
                      borderStyle: 'dashed',
                      p: 2,
                      backgroundColor: theme.palette.grey[50],
                    }}
                  >
                    <Typography sx={{ fontWeight: 300, lineHeight: 1.6 }} variant="body1">
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
