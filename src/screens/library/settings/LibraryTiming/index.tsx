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
import {
  useGetLibraryTimingQuery,
  useAddLibraryTimingMutation,
} from 'src/redux/library/settingApi';
import {
  Box,
  Card,
  Table,
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
  const [sameAsSchoolApplied, setSameAsSchoolApplied] = useState(false);

  // Dialog control states
  const resetDialog = useBoolean();
  const saveDialog = useBoolean();
  const sameAsSchoolDialog = useBoolean();

  // Fetch library timing data
  const { data: fetchedTimingData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryTimingQuery,
  });

  // Add library timing mutation hook
  const { addLibraryTiming } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddLibraryTimingMutation,
  });

  // Initialize data when fetched
  useEffect(() => {
    if (fetchedTimingData && fetchedTimingData.length > 0) {
      setTimingData(fetchedTimingData);
      setOriginalTimingData(fetchedTimingData);
    } else if (!isLoading && (!fetchedTimingData || fetchedTimingData.length === 0)) {
      // Fallback: Initialize with default days if no data from API
      const daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];
      const defaultData = daysOfWeek.map((day, index) => ({
        id: `new-${index}`,
        day,
        startTime: '',
        endTime: '',
        status: 'Off',
      }));
      setTimingData(defaultData);
      setOriginalTimingData(defaultData);
    }
  }, [fetchedTimingData, isLoading]);

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
    // Any manual change invalidates the applied flag
    setSameAsSchoolApplied(false);

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
    setSameAsSchoolApplied(false);
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
    setSameAsSchoolApplied(false);
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

    // Construct payload matching API specification
    const payload = {
      hours: timingData.map((row) => ({
        day: row.day,
        startTime: row.startTime || '',
        endTime: row.endTime || '',
        status: row.status,
      })),
    };

    // Call POST API - POST /library/settings/hours
    addLibraryTiming(payload);

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
    setErrors({});
    setSameAsSchoolApplied(true);
    shikshaMitraToast.success({
      message: 'Library hours set same as school hours',
    });
  };

  // Helper to check if there are any changes
  const hasChanges = JSON.stringify(timingData) !== JSON.stringify(originalTimingData);

  return (
    <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Library Hours"
        description="Define the working schedule of the library by specifying opening and closing times for each day."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Settings', href: '/library/settings/book-category' },
          { name: 'Library Hours' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:clock-outline" />}
            size="small"
            onClick={sameAsSchoolDialog.onTrue}
            disabled={sameAsSchoolApplied}
            sx={{ px: '32px' }}
          >
            Same as School Hours
          </Button>
        }
      />

      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: (theme: any) => theme.customShadows.z16,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Weekly Schedule
          </Typography>
        </Box>

        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 140,
                    backgroundColor: 'background.paper',
                    borderBottom: (theme: any) => `2px solid ${theme.palette.divider}`,
                    zIndex: 3,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Time Slot
                  </Typography>
                </TableCell>
                {timingData.map((row) => (
                  <TableCell
                    key={row.id}
                    align="center"
                    sx={{
                      minWidth: 180,
                      backgroundColor: 'background.paper',
                      borderBottom: (theme: any) => `2px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {row.day}
                      </Typography>
                      <CustomTooltip
                        placement="top"
                        title={
                          row.status !== 'Off'
                            ? 'Library is open. Toggle to close.'
                            : 'Library is closed. Toggle to open.'
                        }
                      >
                        <Switch
                          size="small"
                          checked={row.status !== 'Off'}
                          onChange={(e) => handleStatusChange(row.id, e.target.checked)}
                          color="success"
                        />
                      </CustomTooltip>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Start Time Row */}
              <TableRow hover>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    verticalAlign: 'top',
                    pt: 3,
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    zIndex: 1,
                  }}
                >
                  Start Time
                </TableCell>
                {timingData.map((row) => (
                  <TableCell key={row.id} align="center" sx={{ verticalAlign: 'top', pt: 3 }}>
                    <Box
                      sx={{ opacity: row.status === 'Off' ? 0.5 : 1, transition: 'opacity 0.3s' }}
                    >
                      <TimePicker
                        value={row.startTime ? dayjs(row.startTime, 'hh:mm A') : null}
                        onChange={(newValue) => handleTimeChange(row.id, 'startTime', newValue)}
                        disabled={row.status === 'Off'}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: '--:-- --',
                            error: Boolean(errors[`${row.id}_startTime`]),
                            sx: {
                              maxWidth: 150,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                bgcolor:
                                  row.status === 'Off'
                                    ? 'action.disabledBackground'
                                    : 'background.paper',
                              },
                            },
                          },
                        }}
                      />
                      {errors[`${row.id}_startTime`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 1,
                            gap: 0.5,
                            fontWeight: 500,
                            bgcolor: 'error.lighter',
                            color: 'error.main',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Iconify icon="eva:alert-circle-fill" width={14} />
                          {errors[`${row.id}_startTime`]}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>

              {/* End Time Row */}
              <TableRow hover>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    verticalAlign: 'top',
                    pt: 3,
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    zIndex: 1,
                  }}
                >
                  End Time
                </TableCell>
                {timingData.map((row) => (
                  <TableCell key={row.id} align="center" sx={{ verticalAlign: 'top', pt: 3 }}>
                    <Box
                      sx={{ opacity: row.status === 'Off' ? 0.5 : 1, transition: 'opacity 0.3s' }}
                    >
                      <TimePicker
                        value={row.endTime ? dayjs(row.endTime, 'hh:mm A') : null}
                        onChange={(newValue) => handleTimeChange(row.id, 'endTime', newValue)}
                        disabled={row.status === 'Off'}
                        slotProps={{
                          textField: {
                            size: 'small',
                            placeholder: '--:-- --',
                            error: Boolean(errors[`${row.id}_endTime`]),
                            sx: {
                              maxWidth: 150,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                bgcolor:
                                  row.status === 'Off'
                                    ? 'action.disabledBackground'
                                    : 'background.paper',
                              },
                            },
                          },
                        }}
                      />
                      {errors[`${row.id}_endTime`] && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mt: 1,
                            gap: 0.5,
                            fontWeight: 500,
                            bgcolor: 'error.lighter',
                            color: 'error.main',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Iconify icon="eva:alert-circle-fill" width={14} />
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

        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={resetDialog.onTrue}
            disabled={!hasChanges}
            size="small"
          >
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            onClick={saveDialog.onTrue}
            disabled={!hasChanges}
            size="small"
          >
            Save
          </Button>
        </Box>
      </Card>

      <ConfirmDialog
        open={resetDialog.value}
        onClose={resetDialog.onFalse}
        title="Reset"
        content="Are you sure you want to discard all changes and reset to the original schedule?"
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
        onClose={saveDialog.onFalse}
        title="Save"
        content="Are you sure you want to save these library hours?"
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
        onClose={sameAsSchoolDialog.onFalse}
        title="Apply School Hours"
        content={
          <Box>
            <Typography gutterBottom>
              Are you sure you want to set library hours same as school hours?
            </Typography>
          </Box>
        }
        action={
          <Button
            startIcon={<Iconify icon="mdi:clock-outline" />}
            variant="contained"
            size="small"
            onClick={() => {
              handleSameAsSchoolHours();
              sameAsSchoolDialog.onFalse();
            }}
            disabled={sameAsSchoolApplied}
          >
            Confirm
          </Button>
        }
      />
    </Box>
  );
};

export default LibraryTimingCreation;
