'use client';

/* eslint-disable react/no-unescaped-entities */

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button, TextField, Typography } from '@mui/material';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const ViewSummary = () => (
  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', p: 2 }}>
    {/* Scrollable container for survey summary content */}
    <Scrollbar sx={{ height: '500px' }}>
      <Grid container spacing={2}>
        {/* Survey metadata section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Survey Metadata</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField size="small" label="Parent Satisfaction Survey - 2023" value="" />
              <TextField size="small" label="Audience" value="" />
              <TextField size="small" label="Term" value="" />
              <TextField size="small" label="Response Rate" />
            </Box>
            <Button
              variant="contained"
              sx={{ justifySelf: 'flex-end', alignSelf: 'flex-end', mt: 1 }}
            >
              Download Report
            </Button>
          </Card>
        </Grid>

        {/* Analytics visualization section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <AnalyticsCurrentVisits
              title="Multiple Choice Question"
              chart={{
                series: [
                  { label: '', value: 35 },
                  { label: '', value: 25 },
                  { label: '', value: 15 },
                  { label: '', value: 50 },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Qualitative responses analysis section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Qualitative responses analysis
              </Typography>
              <Typography variant="body1" gutterBottom>
                Question: What suggestions do you have for improving school events?
              </Typography>
              <Typography variant="body1" gutterBottom>
                Type: Open-ended question
              </Typography>
              <Typography variant="body1" gutterBottom>
                Word Cloud: "more sports events," "cultural programs," and "parent involvement."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Response List:
              </Typography>
              <Typography variant="body2" gutterBottom>
                "It would be great if parents could participate in sports day activities."
              </Typography>
              <Typography variant="body2" gutterBottom>
                "More interactive cultural events would be appreciated."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Insight: e.g., "Plan more cultural events based on parent feedback"
              </Typography>
            </Card>
          </Grid>

          {/* Overall survey insights section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Overall Survey Insights
              </Typography>
              <Typography variant="body1" gutterBottom>
                Positive Feedback : What suggestions do you have for improving school events?
              </Typography>
              <Typography variant="body1" gutterBottom>
                Areas for Improvement: Open-ended question
              </Typography>
              <Typography variant="body1" gutterBottom>
                Actionable Suggestions : "more sports events," "cultural programs," and "parent
                involvement."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Recommendation :
              </Typography>
              <Typography variant="body2" gutterBottom>
                "It would be great if parents could participate in sports day activities."
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Scrollbar>
  </Box>
);

export default ViewSummary;
