'use client';

import React from 'react';

import {
  Box,
  Grid,
  Card,
  List,
  Button,
  Tooltip,
  ListItem,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { subjects } from '../dashboard';

const SubjectsList = () => {
  const theme = useTheme();
  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          borderRadius: 2,
          backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.1),
          height: '100%',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Iconify icon="solar:pen-bold" color={theme.palette.warning.main} sx={{ mr: 1 }} />
            <Typography variant="subtitle1">Pending Grade Submissions</Typography>
          </Box>
          <Typography variant="subtitle2" gutterBottom>
            Hover a subject to view Assignment&apos;s
          </Typography>
          <Box my={2}>
            {subjects.map((sub, index) => (
              <Tooltip
                key={index}
                title={
                  <List disablePadding>
                    {sub.assignments.map((assignment, idx) => (
                      <ListItem key={idx}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => {
                            // setSearchParams?.({
                            //   tab: 'gradebook',
                            //   subject: sub.name,
                            //   assignmentType: 'quiz',
                            //   assigngmentTitle: assignment,
                            // });
                          }}
                        >
                          {assignment}
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                }
                placement="right"
                arrow
              >
                <Box component="div" key={index} sx={{ mb: 2 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                    {sub.name}
                  </Button>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default SubjectsList;
