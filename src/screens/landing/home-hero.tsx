import React from 'react';
import { Label } from 'src/components/label';
import { ArrowForward } from '@mui/icons-material';
import { Box, Grid, Button, Container, Typography } from '@mui/material';

const HomeHero = () => (
  <Box sx={{ height: '734px', width: '100%', position: 'relative' }}>
    <Box
      component="img"
      src="/assets/images/landing/gradient-image.svg"
      alt=""
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: '0px',
        top: '0px',
        zIndex: -1,
        objectFit: 'cover',
        // top: '72px',
      }}
    />
    <Container sx={{ height: '100%' }}>
      <Grid container sx={{ height: '100%' }} spacing={2}>
        <Grid
          size={{ xs: 12, md: 6 }}
          display="flex"
          gap={3}
          justifyContent="center"
          flexDirection="column"
        >
          <Typography
            variant="body2"
            color="#000000"
            sx={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700 }}
          >
            <Label variant="filled" color="success">
              New
            </Label>{' '}
            Shikshamitra ERP System
          </Typography>

          <Typography variant="h2" color="#000000" fontWeight={800}>
            Simplify School Operations with Our All-in-One ERP System.
          </Typography>

          <Typography variant="subtitle1" color="#000000" fontWeight={700}>
            Empower your institution with seamless management tools.
          </Typography>

          <Box display="flex" gap="16px">
            <Button
              variant="contained"
              color="success"
              endIcon={<ArrowForward />}
              sx={{ borderRadius: '0' }}
            >
              EXPLORE PLATFORM
            </Button>

            <Button
              variant="outlined"
              color="success"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: '0',
                color: 'black',
                border: (theme) => `2px solid ${theme.vars.palette.success.main}`,
                '&:hover': {
                  border: (theme) => `2px solid ${theme.vars.palette.success.main}`,
                  outline: 'none',
                  boxShadow: 'none',
                },
              }}
            >
              REQUEST DEMO
            </Button>
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
        >
          <Box
            component="img"
            src="/assets/images/landing/banner-image.svg"
            alt=""
            sx={{ scale: 1.3 }}
          />
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default HomeHero;
/* Vector 2 */
