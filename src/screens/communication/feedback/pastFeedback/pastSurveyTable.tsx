'use client';

import dayjs from 'dayjs';
import React, { useCallback } from 'react';

import { Box, Chip, MenuList, MenuItem, Typography, CircularProgress } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

type Props = {
  data: any[];
  onViewDetails: (survey: any) => void;
  onViewSummary: () => void;
};

const PastSurveyTable = ({ data, onViewDetails, onViewSummary }: Props) => {
  const actions = useCallback(
    ({ row }: any) => (
      <MenuList>
        <MenuItem onClick={onViewSummary}>
          <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
          View Summary
        </MenuItem>
      </MenuList>
    ),
    [onViewSummary]
  );

  return (
    <CustomizableTable
      tableId="survey-table"
      columns={[
        { id: 'surveyTitle', label: 'Survey Title' },
        {
          id: 'audience',
          label: 'Audience',
          render: (value) => (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {value.map((audience: string) => (
                <Chip key={audience} label={audience} size="small" variant="outlined" />
              ))}
            </Box>
          ),
        },
        {
          id: 'endDate',
          label: 'End Date',
          render: (value) => (
            <Typography fontSize="12px" gutterBottom>
              {dayjs(value).format('DD MMM YYYY')}
            </Typography>
          ),
        },
        {
          id: 'responseRate',
          label: 'Response Rate',
          render(value) {
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
          sticky: true,
          isSort: false,
          render: (value, row) => (
            <ThreeDotsActions
              actions={(props) => actions({ ...props, row })}
              placement="right-top"
              showViewIcon
              handleViewClick={() => onViewDetails(row)}
            />
          ),
        },
      ]}
      data={data}
    />
  );
};

export default PastSurveyTable;
