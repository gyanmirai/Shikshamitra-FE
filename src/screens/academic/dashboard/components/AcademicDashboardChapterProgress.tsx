import { Card } from '@mui/material';
import React, { useState } from 'react';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const CHAPTERS = ['Numbers', 'Algebra', 'Geometry', 'Data and Statistics', 'Problem Solving'];
const PROGRESS = [90, 20, 80, 65, 45];

const getBarColor = (value: number): string => {
  if (value >= 80) return '#22c55e'; // Green  80–100%
  if (value >= 50) return '#eab308'; // Yellow 50–79%
  return '#ef4444'; // Red     0–49%
};

const getEmoji = (value: number): string => {
  if (value >= 80) return '🟢';
  if (value >= 50) return '🟡';
  return '🔴';
};

const AcademicDashboardChapterProgress = () => {
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  return (
    <Card sx={{ height: '100%', p: 2 }}>
      <AnalyticsWebsiteVisits
        title="Chapter Progress Tracking"
        chart={{
          categories: CHAPTERS,
          colors: PROGRESS.map(getBarColor),
          series: [
            {
              name: 'Progress',
              data: PROGRESS,
            },
          ],
          options: {
            plotOptions: {
              bar: {
                distributed: true,
                borderRadius: 4,
                columnWidth: '45%',
              },
            },
            legend: { show: false },
            yaxis: {
              max: 100,
              labels: { formatter: (val: number) => `${val}%` },
            },
            tooltip: {
              custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
                const value = PROGRESS[dataPointIndex];
                return `
                  <div style="padding:8px;font-size:13px;">
                    <strong>${CHAPTERS[dataPointIndex]}</strong><br/>
                    ${getEmoji(value)} Progress: <strong>${value}%</strong>
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
