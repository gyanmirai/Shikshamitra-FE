import React, { useState } from 'react';

import { Card, useTheme } from '@mui/material';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const AcademicDashboardChapterProgress = () => {
  const theme = useTheme();
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  return (
    <Card sx={{ height: '100%' }}>
      <AnalyticsWebsiteVisits
        title="Chapter Progress Tracking"
        chart={{
          categories: ['Numbers', 'Algebra', 'Geometry', 'Data and Statistics', 'Problem Solving'],
          series: [
            {
              name: 'Participation',
              data: [9, 2, 8, 9, 8],
            },
          ],
          options: {
            tooltip: {
              custom: ({ series, seriesIndex, dataPointIndex }) => {
                const participants = [30, 10, 25, 28, 26];
                const scores = [80, 70, 75, 85, 78];
                return `
            <div style="padding: 8px; font-size: 13px;">
              <strong>Class ${dataPointIndex + 1}</strong><br/>
              <span style="color: green;">●</span> Participant: ${participants[dataPointIndex]}<br/>
              <span style="color: orange;">●</span> Average Score: ${scores[dataPointIndex]}%
            </div>
          `;
              },
            },
          },
        }}
        firstDropdownLabel="Subject"
        firstDropdownOptions={[
          { value: 'mathematics', label: 'Mathematics' },
          { value: 'science', label: 'Science' },
          { value: 'english', label: 'English' },
          { value: 'social-studies', label: 'Social Studies' },
          { value: 'language', label: 'Language' },
        ]}
        firstDropdownValue={selectedSubject}
        firstDropdownOnChange={(value) => setSelectedSubject(value)}
      />
    </Card>
  );
};

export default AcademicDashboardChapterProgress;
