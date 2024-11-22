import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

const RefundTracking = () => (
  <Box sx={{ mt: 3 }}>
    <Grid container spacing={2}>
      {/* Total Refund Card */}
      <Grid item xs={12} sm={12}>
        <Card
          sx={{
            background: 'linear-gradient(to right, #fbe8d3, #e0f7fa)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            height: 'auto',
            maxHeight: '320px', // Reduce height for compactness

            color: 'black',
            borderRadius: 2, // Round corners
            boxShadow: 6, // Elevated shadow for depth
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)', // Slight zoom effect on hover
              boxShadow: 12, // Increase shadow on hover for depth
            },
          }}
        >
          <CardContent sx={{ padding: 2 }}>
            <Box display="flex" flexDirection="row">
              <Box flexGrow={1}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Total Refund
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <Iconify icon="game-icons:wallet" width={20} height={20} sx={{ mr: 1 }} />{' '}
                  {/* Add icon here */}
                  <Typography fontSize="14px">₹ 50,000</Typography>
                </Box>
              </Box>

              <Box flexGrow={1}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Success Rate
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <Iconify icon="proicons:graph" width={20} height={20} sx={{ mr: 1 }} />{' '}
                  {/* Add icon here */}
                  <Typography fontSize="14px">98 %</Typography>
                </Box>
              </Box>
              <Box flexGrow={1}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Pending Requests
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <Iconify
                    icon="material-symbols-light:pending-actions-rounded"
                    width={20}
                    height={20}
                    sx={{ mr: 1 }}
                  />{' '}
                  {/* Add icon here */}
                  <Typography fontSize="14px">5 Requests - ₹ 50,000</Typography>
                </Box>
              </Box>
              <Box flexGrow={1}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Processing Time
                </Typography>

                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <Iconify icon="mingcute:time-line" width={20} height={20} sx={{ mr: 1 }} />{' '}
                  {/* Add icon here */}
                  <Typography fontSize="14px">Avg. Processing Time: 3 Days</Typography>
                </Box>
              </Box>
            </Box>

            {/* <Iconify icon="mdi:cash-refund" width={50} height={50} sx={{ mb: 2 }} /> */}
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Requests and Processing Time Card */}
    </Grid>
  </Box>
);

export default RefundTracking;
