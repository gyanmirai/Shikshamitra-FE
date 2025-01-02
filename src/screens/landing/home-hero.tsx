import React from 'react';

import { ArrowForward } from '@mui/icons-material';
import { Box, Grid, Button, Container, Typography } from '@mui/material';

import { Label } from 'src/components/label';

const HomeHero = () => (
  <Box
    sx={{
      height: '455px',
      width: '100%',
      background:
        'linear-gradient(103.61deg, #002D1E 19.31%, #044A3A 51.76%, #006251 71.87%, #007867 80.69%);',
    }}
  >
    <Container sx={{ height: '100%' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid
          item
          xs={12}
          md={6}
          display="flex"
          justifyContent="space-around"
          flexDirection="column"
        >
          <Typography
            variant="body2"
            color="white"
            sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Label variant="filled" color="success">
              New
            </Label>{' '}
            Shikshamitra ERP System
          </Typography>
          <Typography
            variant="h2"
            color="white"
          >{`"Simplify School Operations with Our All-in-One ERP System."`}</Typography>
          <Typography variant="subtitle1" color="white">
            {`"Empower your institution with seamless management tools."`}
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
              sx={{ borderRadius: '0' }}
            >
              REQUEST DEMO
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} />
      </Grid>
    </Container>
  </Box>
);

export default HomeHero;
