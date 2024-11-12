import React from 'react';
import { useRouter } from 'next/navigation';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, useTheme, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

const Overview = () => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <Grid2 xs={6}>
      <Box
        sx={{
          boxShadow: 'var(--shadows-2)',
          height: '100%',

          padding: '8px',
          borderRadius: 2,
        }}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Card
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexGrow: 1,
            background: varAlpha(theme.palette.primary.mainChannel, 0.21),
            cursor: 'pointer',
            height: '100%',
          }}
          onClick={() => router.push('/student/enrollment/inquiry')}
        >
          <Iconify
            icon="wpf:inspection"
            sx={{ height: '32px', width: '32px', color: 'primary.main' }}
          />

          <Box>
            <Typography variant="h6" color="primary.main">
              Inquiry
            </Typography>
            <Typography variant="h3" color="primary.main">
              700
            </Typography>
            <Typography variant="h5" color="primary.main">
              200 Female / 500 Male
            </Typography>
          </Box>
        </Card>
        <Card
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexGrow: 1,
            background: varAlpha(theme.palette.secondary.mainChannel, 0.21),
            cursor: 'pointer',
            height: '100%',
          }}
          onClick={() => router.push('/student/enrollment/registration')}
        >
          <Iconify
            icon="medical-icon:i-registration"
            sx={{ height: '32px', width: '32px', color: 'secondary.main' }}
          />

          <Box>
            <Typography variant="h6" color="secondary.main">
              Registration
            </Typography>
            <Typography variant="h3" color="secondary.main">
              700
            </Typography>
            <Typography variant="h5" color="secondary.main">
              200 Female / 500 Male
            </Typography>
          </Box>
        </Card>
        <Card
          sx={{
            p: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: varAlpha(theme.palette.warning.mainChannel, 0.21),
            cursor: 'pointer',
            height: '100%',
          }}
          onClick={() => router.push('/student/enrollment/admission')}
        >
          <Iconify
            icon="fluent-mdl2:open-enrollment"
            sx={{ height: '32px', width: '32px', color: 'warning.main' }}
          />

          <Box>
            <Typography variant="h6" color="warning.main">
              Admission
            </Typography>
            <Typography variant="h3" color="warning.main">
              700
            </Typography>
            <Typography variant="h5" color="warning.main">
              200 Female / 500 Male
            </Typography>
          </Box>
        </Card>
      </Box>
    </Grid2>
  );
};

export default Overview;
