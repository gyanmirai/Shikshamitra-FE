import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import AddStopIndex from 'src/screens/transport/StopManagement/AddStopComponents';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Button, TableRow, TableCell, Typography, IconButton } from '@mui/material';

const StopsDetails = ({ formik }: { formik: any }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const addStopDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAssignStop = (stop: any) => {
    formik.setFieldValue('studentDetails', {
      ...formik.values.studentDetails,
      assignedStop: stop.id,
      assignedRoute: formik.values.selectedRoute.routeId,
    });
  };

  const handleAddStop = (newStop: any) => {
    const updatedStops = formik.values.stops.map((stop: any) => ({
      ...stop,
      isLatestAdded: false,
    }));

    const newStopWithFlag = {
      ...newStop,
      id: `ST${Math.floor(Math.random() * 100000)}`,
      isLatestAdded: true,
    };

    formik.setFieldValue('stops', [...updatedStops, newStopWithFlag]);
    formik.setFieldValue('studentDetails', {
      ...formik.values.studentDetails,
      assignedStop: newStopWithFlag.id,
      assignedRoute: formik.values.selectedRoute.routeId,
    });
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addStopDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addStopDialog.onFalse();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number, event: React.DragEvent) => {
    event.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const updatedStops = [...formik.values.stops];
    const [movedItem] = updatedStops.splice(draggedIndex, 1);
    updatedStops.splice(index, 0, movedItem);

    formik.setFieldValue('stops', updatedStops);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Box height="100%">
      <SectionCard
        title="Stop Details"
        headerContent={
          !formik.values.studentDetails.isExistingStop && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => addStopDialog.onTrue()}
            >
              Stop
            </Button>
          )
        }
      >
        {formik.values.stops.length > 0 ? (
          <Scrollbar sx={{ height: 260, width: '100%', p: 1 }}>
            {formik.values.stops.map((stop: any, index: number) => {
              const isAssigned =
                formik.values.studentDetails.assignedStop === stop.id &&
                formik.values.studentDetails.assignedRoute === formik.values.selectedRoute.routeId;

              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index && draggedIndex !== index;

              return (
                <Grid
                  container
                  key={stop.id}
                  spacing={2}
                  onDragOver={(e) => handleDragOver(index, e)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  sx={{
                    backgroundColor: stop.isLatestAdded
                      ? theme.palette.primary.lighter
                      : isDragOver
                        ? theme.palette.action.hover
                        : 'transparent',
                    border: isDragging ? '2px dashed #808080' : '1px dashed #808080',
                    borderRadius: 2,
                    alignItems: 'center',
                    p: 1.5,
                    mb: 2,
                    opacity: isDragging ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Drag handle */}
                  <Grid size={{ xs: 0.5 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      sx={{
                        cursor: 'grab',
                        color: isDragging ? 'primary.main' : 'text.secondary',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      <DragIndicatorIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Grid>

                  {/* Stop Number */}
                  <Grid size={{ xs: 0.2 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {index + 1}.
                    </Typography>
                  </Grid>

                  {/* Stop Name */}
                  <Grid size={{ xs: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {stop.stopName}
                    </Typography>
                  </Grid>

                  {/* Arrival Time */}
                  <Grid size={{ xs: 2.8 }}>
                    <TimePicker
                      label="Arrival Time"
                      value={stop.arrivalTime ? dayjs(stop.arrivalTime, 'HH:mm') : null}
                      onChange={(newValue) =>
                        formik.setFieldValue(
                          `stops[${index}].arrivalTime`,
                          newValue ? newValue.format('HH:mm') : ''
                        )
                      }
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                  </Grid>

                  {/* Departure Time */}
                  <Grid size={{ xs: 2.8 }}>
                    <TimePicker
                      label="Departure Time"
                      value={stop.departureTime ? dayjs(stop.departureTime, 'HH:mm') : null}
                      onChange={(newValue) =>
                        formik.setFieldValue(
                          `stops[${index}].departureTime`,
                          newValue ? newValue.format('HH:mm') : ''
                        )
                      }
                      slotProps={{
                        textField: { size: 'small', fullWidth: true },
                      }}
                    />
                  </Grid>

                  {/* Assign Button */}
                  <Grid size={{ xs: 3 }}>
                    <Button
                      variant="contained"
                      color={isAssigned ? 'primary' : 'inherit'}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        width: '90%',
                      }}
                      startIcon={<Iconify icon={GlobalIcons.assigned} />}
                      onClick={() => handleAssignStop(stop)}
                    >
                      {isAssigned ? 'Assigned' : 'Assign this Stop'}
                    </Button>
                  </Grid>
                </Grid>
              );
            })}
          </Scrollbar>
        ) : (
          <TableRow>
            <TableCell sx={{ height: '50px' }}>
              <Box className="loader" height={24} />
            </TableCell>
          </TableRow>
        )}
      </SectionCard>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add New Stop</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Add a new stop to the selected route with arrival and departure times"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={addStopDialog.value}
        maxWidth="md"
        handleClose={() => addStopDialog.onFalse()}
      >
        <AddStopIndex
          open={addStopDialog}
          onClose={handleClose}
          routeDetails={formik.values.selectedRoute}
          stopName={formik.values.studentDetails.searchStop}
          handleSubmit={(newStop: any) => handleAddStop(newStop)}
        />
      </CustomDialog>
    </Box>
  );
};

export default StopsDetails;
