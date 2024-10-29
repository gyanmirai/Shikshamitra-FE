import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Chip, MenuList, MenuItem, Typography, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Survey {
  id: number;
  surveyTitle: string;
  description: string;
  organization: string[];
  classes: string[];
  audience: string[];
  startDate: Dayjs;
  endDate: Dayjs;
  numberOfResponses: number;
  responseRate: number;
  status: string;
}

const surveyData: Survey[] = [
  {
    id: 1,
    surveyTitle: 'Student Feedback Survey',
    description: 'A survey to gather feedback from students about their learning experience.',
    organization: ['Primary', 'Secondary'],
    classes: ['1', '2', '3'],
    audience: ['Students'],
    startDate: dayjs('2024-10-20'),
    endDate: dayjs('2025-10-20'),
    numberOfResponses: 200,
    responseRate: 80,
    status: 'Active',
  },
  {
    id: 2,
    surveyTitle: 'Parent Satisfaction Survey',
    description: 'Survey to assess parent satisfaction with school facilities and communication.',
    organization: ['Pre Primary', 'Primary'],
    classes: ['Nursery', 'KG', '1'],
    audience: ['Parents'],
    startDate: dayjs('2024-12-25'),
    endDate: dayjs('2026-05-10'),
    numberOfResponses: 120,
    responseRate: 60,
    status: 'Closed',
  },
];

const PastFeedback = (props: TabComponentType) => {
  const [surveyTableData, setSurveyTableData] = useState<any | null>(surveyData);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Past Feedback</Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'surveyTitle', label: 'Survey Title' },
          {
            id: 'audience',
            label: 'Audience',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip
                    key={audience}
                    label={audience}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'endDate',
            label: 'End Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'responseRate',
            label: 'Response Rate',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
                      View Summary
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={surveyTableData}
      />
    </Box>
  );
};

export default PastFeedback;
