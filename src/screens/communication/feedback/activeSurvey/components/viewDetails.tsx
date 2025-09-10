'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Chip, Button, Typography } from '@mui/material';
import DetailRow from 'src/screens/communication/announcement/components/detailRow';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { ResponseComponent } from '../../scheduledSurvey/responseComponent';

export const ViewSurveyDetail = ({ survey }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
    <Scrollbar sx={{ height: '500px' }}>
      <Typography variant="h6" mb={1}>
        Audience Details
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Card sx={{ p: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Iconify icon="mdi:bullhorn-outline" className="text-gray-500 w-6 h-6" />
            <Typography variant="h6" className="font-semibold">
              {survey?.surveyTitle}
            </Typography>
          </Box>
          <hr className="my-6 border-gray-200" />
          <DetailRow
            label="Description"
            icon="mdi:text-box-outline"
            value={
              <Typography variant="body2" className="text-gray-700">
                {survey?.description}
              </Typography>
            }
          />
          <DetailRow
            label="Audience"
            icon="mdi:account-group-outline"
            value={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {survey?.audience?.map((aud: any) => (
                  <Chip key={aud} label={aud} size="small" variant="outlined" />
                ))}
              </Box>
            }
          />

          <DetailRow
            label="Response Rate"
            icon="mdi:information-outline"
            value={
              <Label
                variant="soft"
                color={
                  survey?.status === 'Active'
                    ? 'primary'
                    : survey?.status === 'Pending'
                      ? 'warning'
                      : survey?.status === 'Closed'
                        ? 'error'
                        : 'default'
                }
              >
                {survey?.responseRate}
              </Label>
            }
          />
        </Card>
      </Box>
      <Typography variant="h6" mb={1} mt={1}>
        Responses Details
      </Typography>
      <ResponseComponent />
      <AnalyticsCurrentVisits
        title="Analysis Chart"
        chart={{
          series: [
            { label: 'Question 1', value: 35 },
            { label: 'Question 2', value: 25 },
            { label: 'Question 3', value: 15 },
            { label: 'Question 4', value: 50 },
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Scrollbar>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button variant="contained">Close Survey</Button>
      <Button variant="contained">Download Responses</Button>
    </Box>
  </Box>
);
