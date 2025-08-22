import React from 'react';

import { Box, Card, Grid, Chip, Typography, CardContent } from '@mui/material';

import type { RequestorInfoProps } from './type';

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => {
  const displayedStudents = charge?.studentList?.slice(0, 3) || []; // show first 3
  const remainingCount = (charge?.studentList?.length || 0) - displayedStudents.length;

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Requestor Information
          </Typography>

          <Grid container spacing={3}>
            {/* Left Section */}
            <Grid item xs={12} sm={6} md={4}>
              <Box mb={2}>
                <Typography variant="subtitle2">Category</Typography>
                <Typography variant="body1">{charge?.category}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2">Academic Year</Typography>
                <Typography variant="body1">{charge?.academicYear}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2">Due Date</Typography>
                <Typography variant="body1">{charge?.dueDate}</Typography>
              </Box>
            </Grid>

            {/* Right Section */}
            <Grid item xs={12} sm={6} md={8}>
              <Box mb={2}>
                <Typography variant="subtitle2">Affected Students</Typography>
                <Typography variant="body2" color="text.secondary">
                  Class: {charge?.class} • Division: {charge?.divisions.join(', ')} • Total
                  Students: {charge?.students}
                </Typography>
              </Box>

              <Grid container spacing={1}>
                {displayedStudents.map((student) => (
                  <Grid item key={student.id}>
                    <Chip label={`${student.name} | ${student.division}`} variant="outlined" />
                  </Grid>
                ))}
                {remainingCount > 0 && (
                  <Grid item>
                    <Chip label={`+ ${remainingCount} more students...`} />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestorInfoCard;
