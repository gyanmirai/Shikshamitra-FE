import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
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
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import AddStopIndex from 'src/screens/transport/StopManagement/AddStopComponents';
import { Box, Grid, Button, TableRow, TableCell, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

const StopsDetails = ({ formik }: { formik: any }) => {
  const theme = useTheme();

  const handleAssignStop = (stop: any) => {
    formik.setFieldValue('studentDetails', {
      ...formik.values.studentDetails,
      assignedStop: stop.id,
      assignedRoute: formik.values.selectedRoute.routeId,
    });
  };

  const handleAddStop = (newStop: any) => {
    console.log('newStop----------', newStop);
    // Mark all existing stops as not latest
    const updatedStops = formik.values.stops.map((stop: any) => ({
      ...stop,
      isLatestAdded: false,
    }));

    // Add new stop with flag true
    const newStopWithFlag = {
      ...newStop,
      id: `ST${Math.floor(Math.random() * 100000)}`, // Or your unique id logic
      isLatestAdded: true,
    };
    // Update Formik field
    formik.setFieldValue('stops', [...updatedStops, newStopWithFlag]);
    formik.setFieldValue('studentDetails', {
      ...formik.values.studentDetails,
      assignedStop: newStopWithFlag.id,
      assignedRoute: formik.values.selectedRoute.routeId,
    });
  };

  const addStopDialog = useBoolean();
  // Redux
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handle form/dialog close
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addStopDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addStopDialog.onFalse();
    }
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
              onClick={() => {
                addStopDialog.onTrue();
              }}
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

              return (
                <Grid
                  container
                  key={stop.id}
                  spacing={2}
                  sx={{
                    backgroundColor: stop.isLatestAdded
                      ? theme.palette.primary.lighter
                      : 'transparent',
                    border: '1px dashed #808080',
                    borderRadius: 2,
                    alignItems: 'center',
                    p: 1.5,
                    mb: 2,
                  }}
                >
                  {/* Index */}
                  <Grid size={{ xs: 0.5 }}>
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

                  <Grid size={{ xs: 3 }}>
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
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 3 }}>
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
                        textField: {
                          size: 'small',
                          fullWidth: true,
                        },
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
        handleClose={() => {
          addStopDialog.onFalse();
        }}
      >
        <AddStopIndex
          open={addStopDialog}
          onClose={handleClose}
          stopName={formik.values.studentDetails.searchStop}
          handleSubmit={(newStop: any) => handleAddStop(newStop)}
        />
      </CustomDialog>
    </Box>
  );
};

export default StopsDetails;
