'use client';

import dayjs from 'dayjs';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetLibraryTimingQuery } from 'src/redux/library/settingApi';
import {
  Box,
  Table,
  Paper,
  Button,
  Switch,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

const LibraryTimingCreation = () => {
  // State for managing timing data
  const [timingData, setTimingData] = useState<any[]>([]);
  const [originalTimingData, setOriginalTimingData] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Dialog control states
  const resetDialog = useBoolean();
  const saveDialog = useBoolean();
  const sameAsSchoolDialog = useBoolean();

  // Fetch library timing data
  const { data: fetchedTimingData } = useQueryAndMutation({
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

    // Validation for End Time when changed
    if (field === 'endTime') {
      setTimingData((prev) => {
        const row = prev.find((timing) => timing.id === id);
        if (row && row.status === 'On' && row.startTime && value) {
          const start = dayjs(row.startTime, 'hh:mm A');
          const end = dayjs(value);
          if (!end.isAfter(start)) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [`${id}_endTime`]: 'End Time must be after Start Time',
            }));
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [`${id}_endTime`]: '',
            }));
          }
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [`${id}_endTime`]: '',
          }));
        }
        return prev;
      });
    } else {
      // Clear error for this field
      setErrors((prev) => ({ ...prev, [`${id}_${field}`]: '' }));
    }
  };

  // Handle status changes
  const handleStatusChange = (id: string, checked: boolean) => {
    setTimingData((prev) =>
      prev.map((timing) =>
        timing.id === id
          ? {
              ...timing,
              status: checked ? 'On' : 'Off',
              ...(checked ? {} : { startTime: '', endTime: '' }),
            }
          : timing
      )
    );
    // Clear errors for this row
    setErrors((prev) => ({
      ...prev,
      [`${id}_startTime`]: '',
      [`${id}_endTime`]: '',
    }));
  };

  // Handles resetting all timing settings
  const handleReset = () => {
    setTimingData(originalTimingData);
    setErrors({});
    resetDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Library timing settings have been reset successfully',
    });
  };

  // Handles saving timing settings
  const handleSave = () => {
    // Simple validation: End Time must be after Start Time if both are set and status is 'On'
    let hasError = false;
    const newErrors: { [key: string]: string } = {};
    timingData.forEach((row) => {
      if (row.status === 'On' && row.startTime && row.endTime) {
        const start = dayjs(row.startTime, 'hh:mm A');
        const end = dayjs(row.endTime, 'hh:mm A');
        if (!end.isAfter(start)) {
          newErrors[`${row.id}_endTime`] = 'End Time must be after Start Time';
          hasError = true;
        }
      }
    });
    setErrors(newErrors);

    if (hasError) return;

    saveDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Library timing settings have been saved successfully',
    });
    setOriginalTimingData(timingData);
  };

  // Handler for setting same hours as school
  const handleSameAsSchoolHours = () => {
    const defaultStartTime = '09:00 AM';
    const defaultEndTime = '05:00 PM';

    setTimingData((prev) =>
      prev.map((timing) => ({
        ...timing,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        status: 'On',
      }))
    );

    // Clear all errors
    setErrors({});

    shikshaMitraToast.success({
      message: 'Library hours set same as school hours',
    });
  };

  // Helper to check if there are any changes
  const hasChanges = JSON.stringify(timingData) !== JSON.stringify(originalTimingData);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Library Hours"
        description="This screen defines the working schedule of the library by specifying opening and closing times for each day or marking certain days as closed."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/settings/book-category' },
          { name: 'Library Hours' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:clock-outline" />}
            size="small"
            onClick={() => sameAsSchoolDialog.onTrue()}
          >
            Same as School Hours
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <Box sx={{ px: 1, overflow: 'auto', flex: 1 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    minWidth: 120,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 2,
                  }}
                >
                  <Typography variant="subtitle2">Time</Typography>
                </TableCell>
                {timingData.map((row) => (
                  <TableCell key={row.id} align="center" sx={{ fontWeight: 600, minWidth: 180 }}>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <Typography variant="subtitle2">{row.day}</Typography>
                      <CustomTooltip
                        placement="top"
                        title={
                          row.status !== 'Off'
                            ? 'Library is open on this day. Toggle to mark as closed.'
                            : 'Library is closed on this day. Toggle to mark as open.'
                        }
                      >
                        <Switch
                          size="small"
                          checked={row.status !== 'Off'}
                          onChange={(e) => handleStatusChange(row.id, e.target.checked)}
                        />
                      </CustomTooltip>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Start Time Row */}
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    verticalAlign: 'top',
                    pt: 2,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  Start Time
                </TableCell>
                {timingData.map((row) => (
                  <TableCell key={row.id} align="center" sx={{ verticalAlign: 'top', pt: 2 }}>
                    <Box>
                      <TimePicker
                        value={row.startTime ? dayjs(row.startTime, 'hh:mm A') : null}
                        onChange={(newValue) => handleTimeChange(row.id, 'startTime', newValue)}
                        disabled={row.status === 'Off'}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: 'hh:mm aa',
                            error: Boolean(errors[`${row.id}_startTime`]),
                            sx: { maxWidth: 140 },
                          },
                        }}
                      />
                      {errors[`${row.id}_startTime`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {errors[`${row.id}_startTime`]}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>

              {/* End Time Row */}
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    verticalAlign: 'top',
                    pt: 2,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  End Time
                </TableCell>
                {timingData.map((row) => (
                  <TableCell key={row.id} align="center" sx={{ verticalAlign: 'top', pt: 2 }}>
                    <Box>
                      <TimePicker
                        value={row.endTime ? dayjs(row.endTime, 'hh:mm A') : null}
                        onChange={(newValue) => handleTimeChange(row.id, 'endTime', newValue)}
                        disabled={row.status === 'Off'}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: 'hh:mm aa',
                            error: Boolean(errors[`${row.id}_endTime`]),
                            sx: { maxWidth: 140 },
                          },
                        }}
                      />
                      {errors[`${row.id}_endTime`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            fontSize: '0.75rem',
                            lineHeight: 1.2,
                          }}
                        >
                          {errors[`${row.id}_endTime`]}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ px: 1, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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

      <ConfirmDialog
        open={sameAsSchoolDialog.value}
        onClose={() => sameAsSchoolDialog.onFalse()}
        title="Same as School Hours"
        content="Are you sure you want to set library hours same as school hours? This will override current timings."
        action={
          <Button
            startIcon={<Iconify icon="mdi:clock-outline" />}
            variant="contained"
            size="small"
            onClick={() => {
              handleSameAsSchoolHours();
              sameAsSchoolDialog.onFalse();
            }}
          >
            Confirm
          </Button>
        }
      />
    </Box>
  );
};

export default LibraryTimingCreation;
