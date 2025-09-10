'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Box, Grid, Switch, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetLibraryTimingQuery } from 'src/redux/library/settingApi';

const LibraryTimingCreation = () => {
  const { data: timingData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryTimingQuery,
  });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Library Timing"
        description="This screen defines the working schedule of the library by specifying opening and closing times for each day or marking certain days as closed."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/setting' },
          { name: 'Library Timing', href: '/library/settings/library-timing' },
        ]}
        action={
          <Box display="flex" gap={1}>
            <CustomTooltip title="Reset all timing settings">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <Iconify icon="material-symbols:refresh" width={16} />
                <Typography variant="body2">Reset</Typography>
              </Box>
            </CustomTooltip>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 2,
                py: 1,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <Iconify icon="material-symbols:save" width={16} />
              <Typography variant="body2">Save</Typography>
            </Box>
          </Box>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        tableId="library-timing-table"
        isPagination={false}
        columns={[
          {
            id: 'day',
            label: 'Day',
            align: 'left',
            render: (value) => (
              <Typography variant="body2" fontWeight={500}>
                {value}
              </Typography>
            ),
          },
          {
            id: 'startTime',
            label: 'Start Time',
            align: 'left',
            render: (value, row) => (
              <Grid container spacing={1}>
                <Grid size={12}>
                  <TimePicker
                    label=""
                    value={null}
                    onChange={(newValue) => {
                      // Handle start time change
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: value,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            ),
          },
          {
            id: 'endTime',
            label: 'End Time',
            align: 'left',
            render: (value, row) => (
              <Grid container spacing={1}>
                <Grid size={12}>
                  <TimePicker
                    label=""
                    value={null}
                    onChange={(newValue) => {
                      // Handle end time change
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: value,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'right',
            render: (value, row) => (
              <Switch
                size="small"
                checked={value !== 'Off'}
                onChange={(e) => {
                  // Handle status change
                }}
              />
            ),
          },
        ]}
        data={timingData || []}
      />
    </Box>
  );
};

export default LibraryTimingCreation;
