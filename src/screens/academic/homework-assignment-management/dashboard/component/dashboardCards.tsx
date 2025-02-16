import React, { useState } from 'react';

import { Box, Card, Grid, Button, Tooltip, Typography } from '@mui/material';

import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { assignmentData } from './homeworkPendingCards';

const DashboardCards = () => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  return (
    <>
      <Grid item xs={12} md={3}>
        <EmployeeDashboardCard
          title="Total Assignments"
          icon="material-symbols:assignment"
          value={35}
          labels={[
            { name: 'Active : 10', color: 'info' },
            { name: 'Pending : 10', color: 'warning' },
            { name: 'Completed : 15', color: 'primary' },
          ]}
          color="primary.main"
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <EmployeeDashboardCard
          title="Total Homeworks"
          icon="material-symbols:assignment"
          value={35}
          labels={[
            { name: 'Active : 10', color: 'info' },
            { name: 'Pending : 10', color: 'warning' },
            { name: 'Completed : 15', color: 'primary' },
          ]}
          color="primary.main"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            width: '100%',
            height: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle2' }}>Pending Grade Assign</Box>
            <Scrollbar sx={{ mt: 1.5, height: '215px' }}>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                  height: '300px',
                  m: 0.5,
                }}
              >
                {assignmentData.map((assignment, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 1,
                    }}
                    onMouseEnter={() => setHoveredResource(assignment.title)}
                    onMouseLeave={() => setHoveredResource(null)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{assignment.title}</Typography>
                      <Label color="warning" sx={{ ml: 1, px: 1, py: 0.5 }}>
                        {`${assignment.pending}`}
                      </Label>{' '}
                      {hoveredResource === assignment.title && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 2,
                            color: 'text.secondary',
                          }}
                        >
                          Publish Date : {assignment.lastDate}
                        </Typography>
                      )}
                    </Box>
                    {hoveredResource === assignment.title && (
                      <Tooltip title="Send Reminder">
                        <Iconify
                          icon="mdi:bell"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          sx={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Button>
                ))}
              </Box>
            </Scrollbar>
          </Box>{' '}
        </Card>
      </Grid>
    </>
  );
};

export default DashboardCards;
