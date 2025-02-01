'use client';

import React, { useState } from 'react';

import { Box, Grid, Card, Button, Tooltip, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Scrollbar } from 'src/components/scrollbar';

export const assignmentData = [
  {
    title: 'Math Assignment 1',
    pending: 10,
    status: 'Completed',
    lastDate: '2024-12-10',
  },
  {
    title: 'Science Experiment Report',
    pending: 17,
    status: 'Review',
    lastDate: '2024-12-15',
  },
  {
    title: 'History Project',
    pending: 18,
    status: 'Pending',
    lastDate: '2024-12-20',
  },
  {
    title: 'English Essay',
    pending: 20,
    status: 'Review',
    lastDate: '2024-12-25',
  },
  {
    title: 'Geography Map Work',
    pending: 8,
    status: 'Completed',
    lastDate: '2024-12-30',
  },
];

const HomeworkPendingCards = () => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  return (
    <Grid container spacing={2} mt={1}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            width: '100%',
            height: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle1' }}>Pending Assignments</Box>
            <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
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
                      <Typography>{assignment.title}</Typography>
                      {hoveredResource === assignment.title && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 2,
                            color: 'text.secondary',
                          }}
                        >
                          Deadline : {assignment.lastDate}
                        </Typography>
                      )}
                    </Box>
                  </Button>
                ))}
              </Box>
            </Scrollbar>
          </Box>{' '}
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            width: '100%',
            height: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle1' }}>Completed Assignments</Box>
            <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
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
                  <Tooltip
                    key={index}
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              assignment.status === 'Completed'
                                ? 'green'
                                : assignment.status === 'Review'
                                  ? 'yellow'
                                  : 'red',
                            fontWeight: 'bold',
                          }}
                        >
                          Status: {assignment.status.toUpperCase()}
                        </Typography>
                        {assignment.status === 'Completed' && (
                          <Typography variant="body2">Grade : A</Typography>
                        )}
                      </Box>
                    }
                    placement="right"
                    arrow
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                      </Box>
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            width: '100%',
            height: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle1' }}>Pending Homeowrk</Box>
            <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
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
                      <Typography>{assignment.title}</Typography>
                      {hoveredResource === assignment.title && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 2,
                            color: 'text.secondary',
                          }}
                        >
                          Deadline : {assignment.lastDate}
                        </Typography>
                      )}
                    </Box>
                  </Button>
                ))}
              </Box>
            </Scrollbar>
          </Box>{' '}
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            width: '100%',
            height: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle1' }}>Completed Homeworks</Box>
            <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
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
                  <Tooltip
                    key={index}
                    title={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              assignment.status === 'Completed'
                                ? 'green'
                                : assignment.status === 'Review'
                                  ? 'yellow'
                                  : 'red',
                            fontWeight: 'bold',
                          }}
                        >
                          Status: {assignment.status.toUpperCase()}
                        </Typography>
                        {assignment.status === 'Completed' && (
                          <Typography variant="body2">Grade : A</Typography>
                        )}
                      </Box>
                    }
                    placement="right"
                    arrow
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{assignment.title}</Typography>
                      </Box>
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default HomeworkPendingCards;
