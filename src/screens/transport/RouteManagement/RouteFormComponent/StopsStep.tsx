'use client';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { TimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { DragIndicator } from '@mui/icons-material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, TextField, Typography, IconButton, FormHelperText } from '@mui/material';
import { useGetZoneAreaOptionsQuery } from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import RouteDetailsView from './RouteBasicView';

import type { IStopPayload } from '../Components/type';

interface StopsStepProps {
  formik: any;
}

const StopsStep = ({ formik }: StopsStepProps) => {
  const availableStops = [
    { id: 'devadhgam', label: 'Devadhgam Chokdi', routes: 2 },
    { id: 'dhruv-park', label: 'Dhruv Park', routes: 3 },
    { id: 'manibhadra-campus', label: 'Manibhadra Campus', routes: 1 },
    { id: 'maharana-pratap', label: 'Maharana Pratap Circle', routes: 4 },
    { id: 'midas-square', label: 'Midas Square', routes: 2 },
  ];
  console.log('formik000values----', formik.values);
  console.log('formik erroes---', formik.errors);
  console.log('availableStops====', availableStops);
  const [draggedStop, setDraggedStop] = useState<IStopPayload | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { data: zoneAreaData, isLoading: zoneAreaLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetZoneAreaOptionsQuery,
  });
  const handleAddStop = (stop: IStopPayload) => {
    if (!formik.values.stops.some((s: IStopPayload) => s.id === stop.id)) {
      const newStops = [
        ...formik.values.stops,
        {
          id: stop.id,
          stopName: stop.stopName,
          expectedArrivalTime: null,
          expectedDepartureTime: null,
          distanceFromPrevious: '',
          order: formik.values.stops.length + 1,
        },
      ];
      formik.setFieldValue('stops', newStops);
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...formik.values.stops];
    updated.splice(index, 1);
    formik.setFieldValue('stops', updated);
  };

  const handleInternalDragStart = (index: number) => setDraggedIndex(index);
  const handleInternalDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...formik.values.stops];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    formik.setFieldValue('stops', reordered);
    setDraggedIndex(null);
  };

  const handleExternalDragStart = (stop: { id: string; label: string }) => {
    setDraggedStop({
      id: stop.id,
      stopName: stop.label,
      expectedArrivalTime: null,
      expectedDepartureTime: null,
      arrivalTime: null,
      departureTime: null,
      distanceFromPrevious: '',
      order: formik.values.stops.length + 1,
    });
  };

  const handleExternalDrop = () => {
    if (draggedStop) {
      handleAddStop(draggedStop);
      setDraggedStop(null);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <RouteDetailsView values={formik.values} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {formik.errors.stops && (
          <FormHelperText
            error
            sx={{
              fontSize: '10px', // your font size
              position: 'relative', // if you want to use bottom, else remove
              bottom: '-10px', // adjust if needed
              marginLeft: '5px', // optional, like your CSS
            }}
          >
            {String(formik.errors.stops)}
          </FormHelperText>
        )}
      </Grid>
      {/* LEFT SIDE — Assigned Stops */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleExternalDrop}
          sx={{
            minHeight: 400,
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 2,
            backgroundColor: '#fafafa',
          }}
        >
          <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
            Stops Assignment
          </Typography>
          {formik.values.stops.length > 0 ? (
            formik.values.stops.map((stop: IStopPayload, index: number) => (
              <Box
                key={stop.id}
                draggable
                onDragStart={() => handleInternalDragStart(index)}
                onDrop={() => handleInternalDrop(index)}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  backgroundColor: draggedIndex === index ? '#e3f2fd' : '#fff',
                  boxShadow: 1,
                  cursor: 'move',
                  transition: 'background-color 0.2s',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 0.7 }}>
                    <DragIndicator sx={{ color: 'gray', mt: 1 }} />
                  </Grid>

                  <Grid size={{ xs: 12, md: 10 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {index + 1}. {stop.stopName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 0.5 }}>
                    <IconButton onClick={() => handleDelete(index)} color="error">
                      <Iconify icon={GlobalIcons.delete} />
                    </IconButton>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={
                        !!(
                          formik.touched.stops?.[index]?.expectedArrivalTime &&
                          formik.errors.stops?.[index]?.expectedArrivalTime
                        )
                      }
                    >
                      <TimePicker
                        label="Expected Arrival *"
                        format="hh:mm A"
                        value={stop.expectedArrivalTime}
                        onChange={(val) =>
                          formik.setFieldValue(`stops.${index}.expectedArrivalTime`, val)
                        }
                        sx={{ minWidth: 180, width: '100%' }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: !!(
                              formik.touched.stops?.[index]?.expectedArrivalTime &&
                              formik.errors.stops?.[index]?.expectedArrivalTime
                            ),
                            helperText:
                              formik.touched.stops?.[index]?.expectedArrivalTime &&
                              formik.errors.stops?.[index]?.expectedArrivalTime,
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={
                        !!(
                          formik.touched.stops?.[index]?.expectedDepartureTime &&
                          formik.errors.stops?.[index]?.expectedDepartureTime
                        )
                      }
                    >
                      <TimePicker
                        label="Expected Departure *"
                        format="hh:mm A"
                        value={stop.expectedDepartureTime}
                        onChange={(val) =>
                          formik.setFieldValue(`stops.${index}.expectedDepartureTime`, val)
                        }
                        sx={{ minWidth: 180, width: '100%' }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: !!(
                              formik.touched.stops?.[index]?.expectedDepartureTime &&
                              formik.errors.stops?.[index]?.expectedDepartureTime
                            ),
                            helperText:
                              formik.touched.stops?.[index]?.expectedDepartureTime &&
                              formik.errors.stops?.[index]?.expectedDepartureTime,
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                </Grid>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', mt: 10, color: 'text.secondary' }}
            >
              Drag stops here to add.
            </Typography>
          )}
        </Box>
      </Grid>

      {/* RIGHT SIDE — Available Stops */}
      {availableStops.filter(
        (stop) => !formik.values.stops.some((s: IStopPayload) => s.id === stop.id)
      ).length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2} size={{ xs: 12 }} mb={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Zone"
                name="zone"
                options={zoneAreaData || []}
                labelKey="zoneName"
                valueKey="zoneName"
                value={formik.values.zone}
                onChange={(value) => formik.setFieldValue('zone', value)}
                error={!!(formik.touched.zone && formik.errors.zone)}
                helperText={formik.touched.zone ? formik.errors.zone : undefined}
                formControlProps={{ fullWidth: true }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                variant="outlined"
                size="small"
                value=""
                onChange={(e) => {}}
                label="Search Stop"
                fullWidth
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              p: 2,
              backgroundColor: '#fff',
            }}
          >
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Available Stops
            </Typography>

            {availableStops
              .filter((stop) => !formik.values.stops.some((s: IStopPayload) => s.id === stop.id))
              .map((stop) => (
                <Box
                  key={stop.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid #ccc',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    '&:hover': { backgroundColor: '#f1f8ff' },
                  }}
                >
                  {/* Drag icon box */}
                  <Box
                    draggable
                    onDragStart={() => handleExternalDragStart(stop)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' },
                    }}
                  >
                    <DragIndicator sx={{ color: 'gray', fontSize: 18 }} />
                  </Box>

                  {/* Two-line info box */}
                  <Box
                    sx={{
                      flex: 1,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Stop label */}
                    <Typography
                      sx={{
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {stop.label}
                    </Typography>

                    {/* Route info or secondary text */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: 13, mt: 0.3 }}
                    >
                      Assigned Routes : {stop.routes ? `${stop.routes}` : 'No assigned routes'}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default StopsStep;
