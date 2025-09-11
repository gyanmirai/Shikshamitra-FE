'use client';

import dayjs from 'dayjs';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, Switch, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetLibraryTimingQuery } from 'src/redux/library/settingApi';

const LibraryTimingCreation = () => {
  // State for managing timing data
  const [timingData, setTimingData] = useState<any[]>([]);
  const [originalTimingData, setOriginalTimingData] = useState<any[]>([]);

  // Dialog control states
  const resetDialog = useBoolean();
  const saveDialog = useBoolean();

  // Fetch library timing data
  const { data: fetchedTimingData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryTimingQuery,
  });

  // Initialize data when fetched
  useEffect(() => {
    if (fetchedTimingData) {
      setTimingData(fetchedTimingData);
      setOriginalTimingData(fetchedTimingData);
    }
  }, [fetchedTimingData]);

  // Handle time changes
  const handleTimeChange = (id: string, field: string, value: any) => {
    setTimingData((prev) =>
      prev.map((timing) =>
        timing.id === id
          ? {
              ...timing,
              [field]: value ? dayjs(value).format('hh:mm A') : '',
            }
          : timing
      )
    );
  };

  // Handle status changes
  const handleStatusChange = (id: string, checked: boolean) => {
    setTimingData((prev) =>
      prev.map((timing) =>
        timing.id === id
          ? {
              ...timing,
              status: checked ? 'On' : 'Off',
              // Clear times when status is off
              ...(checked ? {} : { startTime: '', endTime: '' }),
            }
          : timing
      )
    );
  };

  // Handles resetting all timing settings
  const handleReset = () => {
    setTimingData(originalTimingData);
    resetDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Library timing settings have been reset successfully',
    });
  };

  // Handles saving timing settings
  const handleSave = () => {
    saveDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Library timing settings have been saved successfully',
    });
  };

  // Helper to check if there are any changes
  const hasChanges = JSON.stringify(timingData) !== JSON.stringify(originalTimingData);

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
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              onClick={() => resetDialog.onTrue()}
              disabled={!hasChanges}
              size="small"
            >
              Reset
            </Button>
            <Button
              startIcon={<Save />}
              variant="contained"
              onClick={() => saveDialog.onTrue()}
              disabled={!hasChanges}
              size="small"
            >
              Save
            </Button>
          </Box>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        tableId="library-timing-table"
        isLoading={isLoading}
        isSearch={false}
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
                    value={value ? dayjs(value, 'hh:mm A') : null}
                    onChange={(newValue) => handleTimeChange(row.id, 'startTime', newValue)}
                    disabled={row.status === 'Off'}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: value || 'Select start time',
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
                    value={value ? dayjs(value, 'hh:mm A') : null}
                    onChange={(newValue) => handleTimeChange(row.id, 'endTime', newValue)}
                    disabled={row.status === 'Off'}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        placeholder: value || 'Select end time',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            ),
          },
          {
            id: 'status',
            label: 'IsHoliday',
            align: 'left',
            render: (value, row) => (
              <Switch
                size="small"
                checked={value !== 'Off'}
                onChange={(e) => handleStatusChange(row.id, e.target.checked)}
              />
            ),
          },
        ]}
        data={timingData || []}
      />

      <ConfirmDialog
        open={resetDialog.value}
        onClose={() => resetDialog.onFalse()}
        title="Reset"
        content="Are you sure you want to reset all timing settings?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            variant="contained"
            size="small"
            onClick={handleReset}
          >
            Reset
          </Button>
        }
      />

      <ConfirmDialog
        open={saveDialog.value}
        onClose={() => saveDialog.onFalse()}
        title="Save"
        content="Are you sure you want to save these changes?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
            size="small"
            onClick={handleSave}
          >
            Save
          </Button>
        }
      />
    </Box>
  );
};

export default LibraryTimingCreation;
