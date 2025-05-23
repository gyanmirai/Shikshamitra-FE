import React from 'react';
import { m } from 'framer-motion';

import { Box, Grid, List, useTheme, ListItem, Typography, ListItemText } from '@mui/material';

const WelcomeScreen = ({ formik }: any) => {
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={2}
      sx={{
        backgroundColor: theme.palette.background.default,
        height: '100%',
      }}
    >
      {/* Left side - School Illustration */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={`https://api.pexels.com/v1/search?query=school education&per_page=1&page=${Math.floor(Math.random() * 100) + 1}`}
            alt="Random School Image"
            sx={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '400px',
              objectFit: 'cover',
              display: 'block',
              margin: 'auto',
              borderRadius: 2,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          />
        </Box>
      </Grid>

      {/* Right side - Welcome Text and Information */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          p: 4,
          height: '100%',
        }}
      >
        <Box
          component={m.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h3" component={m.h1} gutterBottom>
            Welcome to Gyanmirai
          </Typography>

          <Typography
            component={m.div}
            variant="h5"
            sx={{ color: 'text.secondary', mb: 3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            AI-Powered School Management Solution
          </Typography>

          <List
            component={m.div}
            sx={{ width: '100%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Experience the future of education with our{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      AI-driven platform
                    </Box>{' '}
                    that revolutionizes how schools operate, teach, and learn.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Our{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      intelligent learning system
                    </Box>{' '}
                    adapts to each student&apos;s needs, while our{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      AI-powered analytics
                    </Box>{' '}
                    provide real-time insights into academic performance and institutional
                    efficiency.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    From{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      automated administrative tasks
                    </Box>{' '}
                    to{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      personalized learning paths
                    </Box>
                    , Gyanmirai combines cutting-edge technology with educational excellence.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    Get started by completing the initial setup process. Our{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      smart setup wizard
                    </Box>{' '}
                    will guide you through configuring your school&apos;s essential information and
                    settings.
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Box>
      </Grid>
    </Grid>
  );
};

export default WelcomeScreen;
