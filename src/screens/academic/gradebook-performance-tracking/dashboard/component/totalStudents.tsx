'use client';

import React from 'react';

import { Box, Grid, Card, Button, useTheme, Typography, CardContent } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';

import { subjects } from '../dashboard';

const TotalStudents = () => {
  const theme = useTheme();
  const dialog = useBoolean();

  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: varAlpha(theme.palette.info.mainChannel, 0.1),
          height: '100%',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Iconify icon="mdi:reminder" color={theme.palette.info.main} sx={{ mr: 1 }} />
            <Typography variant="subtitle1" gutterBottom>
              Reminders
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Total Underperforming students - 30
          </Typography>
          <Box my={2}>
            {subjects.map((sub, index) => (
              <Box component="div" key={index} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'start' }}
                  onClick={() => {
                    dialog.onTrue();
                  }}
                >
                  {sub.name} - 10
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        title="Underperforming students"
        handleClose={() => {
          dialog.onFalse();
        }}
      >
        <Typography variant="h6">Student List</Typography>
      </CustomDialog>
    </Grid>
  );
};

export default TotalStudents;
