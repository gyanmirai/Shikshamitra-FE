import type { FormikProps, FormikErrors } from 'formik';

import React from 'react';
import { DragIndicator } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Chip, TextField, Typography, IconButton, Autocomplete } from '@mui/material';

import type { IStopPayload, IRoutePayload } from '../Components/type';

interface StopsStepProps {
  formik: FormikProps<IRoutePayload>;
}

const StopsStep = ({ formik }: StopsStepProps) => {
  // Mock data for available stops
  const availableStops = [
    { value: 'maharana-pratap-circle', label: 'Maharana Pratap Circle' },
    { value: 'kangaroo-circle', label: 'Kangaroo Circle' },
    { value: 'deep-darshan-school', label: 'Deep Darshan School' },
    { value: 'parvat-patiya-main', label: 'Parvat Patiya Main' },
    { value: 'kamrej-junction', label: 'Kamrej Junction' },
    { value: 'kapodara-square', label: 'Kapodara Square' },
  ];

  // Handle adding selected stops to the route
  const handleStopsSelect = (selectedStops: string[]) => {
    const newStops: IStopPayload[] = selectedStops.map((stopValue, index) => {
      const existingStop = formik.values.stops.find((stop) => stop.id === stopValue);
      const stopLabel = availableStops.find((stop) => stop.value === stopValue)?.label || '';

      return (
        existingStop || {
          id: stopValue,
          stopName: stopLabel,
          expectedArrivalTime: null,
          expectedDepartureTime: null,
          arrivalTime: null,
          departureTime: null,
          distanceFromPrevious: '',
          order: index + 1,
        }
      );
    });

    formik.setFieldValue('stops', newStops);
  };

  // Get selected stop values for the autocomplete
  const selectedStopValues = formik.values.stops.map((stop) => stop.id);

  return (
    <SectionCard title="Stops Assignment">
      <Grid container spacing={2}>
        {/* Select Stops */}
        <Grid size={{ xs: 12 }} sx={{ mb: 3 }}>
          <ShakingTextField error={!!(formik.touched.stops && formik.errors.stops)}>
            <Autocomplete
              multiple
              options={availableStops.map((stop) => stop.value)}
              getOptionLabel={(option) =>
                availableStops.find((stop) => stop.value === option)?.label || option
              }
              value={availableStops
                .filter((stop) => selectedStopValues.includes(stop.value))
                .map((stop) => stop.value)}
              onChange={(event, newValue) => {
                handleStopsSelect(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const stopLabel =
                    availableStops.find((stop) => stop.value === option)?.label || option;
                  return (
                    <Chip
                      variant="outlined"
                      label={stopLabel}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Stops *"
                  size="small"
                  error={!!(formik.touched.stops && formik.errors.stops)}
                  helperText={
                    formik.touched.stops && typeof formik.errors.stops === 'string'
                      ? formik.errors.stops
                      : undefined
                  }
                />
              )}
            />
          </ShakingTextField>
        </Grid>

        {/* Stops List */}
        {formik.values.stops.map((stop, index) => (
          <Grid size={{ xs: 12 }} key={stop.id} sx={{ mb: 3 }}>
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#f9f9f9',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Order Number and Drag Handle */}
                <Grid size={{ xs: 12, md: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" color="primary">
                      {index + 1}.
                    </Typography>
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                  </Box>
                </Grid>

                {/* Stop Name (Disabled) */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Stop"
                    value={stop.stopName}
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#000',
                        opacity: 0.8,
                      },
                    }}
                  />
                </Grid>

                {/* Expected Arrival Time */}
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.stops?.[index]?.expectedArrivalTime &&
                        typeof formik.errors.stops?.[index] === 'object' &&
                        (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                          ?.expectedArrivalTime
                      )
                    }
                  >
                    <TimePicker
                      label="Expected Arrival Time *"
                      format="hh:mm A"
                      value={stop.expectedArrivalTime}
                      onChange={(newValue) => {
                        formik.setFieldValue(`stops.${index}.expectedArrivalTime`, newValue);
                      }}
                      sx={{ width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.stops?.[index]?.expectedArrivalTime &&
                            typeof formik.errors.stops?.[index] === 'object' &&
                            Boolean(
                              (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                                ?.expectedArrivalTime
                            )
                          ),
                          helperText:
                            formik.touched.stops?.[index]?.expectedArrivalTime &&
                            typeof formik.errors.stops?.[index] === 'object' &&
                            (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                              ?.expectedArrivalTime,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Expected Departure Time */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.stops?.[index]?.expectedDepartureTime &&
                        typeof formik.errors.stops?.[index] === 'object' &&
                        (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                          ?.expectedDepartureTime
                      )
                    }
                  >
                    <TimePicker
                      label="Expected Departure Time *"
                      format="hh:mm A"
                      value={stop.expectedDepartureTime}
                      onChange={(newValue) => {
                        formik.setFieldValue(`stops.${index}.expectedDepartureTime`, newValue);
                      }}
                      sx={{ width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.stops?.[index]?.expectedDepartureTime &&
                            typeof formik.errors.stops?.[index] === 'object' &&
                            Boolean(
                              (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                                ?.expectedDepartureTime
                            )
                          ),
                          helperText:
                            formik.touched.stops?.[index]?.expectedDepartureTime &&
                            typeof formik.errors.stops?.[index] === 'object' &&
                            (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                              ?.expectedDepartureTime,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Distance From Previous Stop */}
                <Grid size={{ xs: 12, md: 2.5 }}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.stops?.[index]?.distanceFromPrevious &&
                      typeof formik.errors.stops?.[index] === 'object'
                        ? (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                            ?.distanceFromPrevious
                        : undefined)
                    }
                  >
                    <TextField
                      fullWidth
                      label="Distance From Previous Stop"
                      value={stop.distanceFromPrevious}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.\s]/g, '');

                        formik.setFieldValue(`stops.${index}.distanceFromPrevious`, value);
                      }}
                      error={
                        !!(
                          formik.touched.stops?.[index]?.distanceFromPrevious &&
                          typeof formik.errors.stops?.[index] === 'object' &&
                          Boolean(
                            (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                              ?.distanceFromPrevious
                          )
                        )
                      }
                      helperText={
                        formik.touched.stops?.[index]?.distanceFromPrevious &&
                        typeof formik.errors.stops?.[index] === 'object'
                          ? (formik.errors.stops?.[index] as FormikErrors<IStopPayload>)
                              ?.distanceFromPrevious
                          : typeof formik.errors.stops?.[index] === 'string'
                            ? formik.errors.stops?.[index]
                            : undefined
                      }
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ))}

        {/* No Stops Selected Message */}
        {formik.values.stops.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body1">
                Please select stops from the dropdown above to configure the route.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </SectionCard>
  );
};

export default StopsStep;
