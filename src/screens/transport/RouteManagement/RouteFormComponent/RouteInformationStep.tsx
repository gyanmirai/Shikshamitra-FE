import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import CustomSelect from 'src/components/custom-select';
import { renderTimeViewClock } from '@mui/x-date-pickers';
import { Grid, TextField, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetRouteMatcherOptionsQuery } from 'src/redux/transport/vehicle-management/route-management-api';

import type { IRoutePayload } from '../Components/type';

interface RouteInformationStepProps {
  formik: FormikProps<IRoutePayload>;
}

const RouteInformationStep = ({ formik }: RouteInformationStepProps) => {
  const { data: routeTypeOptions = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRouteMatcherOptionsQuery,
  });

  return (
    <Grid size={{ xs: 12 }}>
      <SectionCard title="General Information">
        {/* Route Name */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.routeName && formik.errors.routeName)}>
            <TextField
              fullWidth
              name="routeName"
              label="Route Name *"
              value={formik.values.routeName}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
                // Capitalize first letter of each word
                value = value.replace(/\b\w/g, (char) => char.toUpperCase());
                formik.setFieldValue('routeName', value);
              }}
              error={!!(formik.touched.routeName && formik.errors.routeName)}
              helperText={formik.touched.routeName && formik.errors.routeName}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Route Code */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.routeCode && formik.errors.routeCode)}>
            <TextField
              fullWidth
              name="routeCode"
              label="Route Code *"
              value={formik.values.routeCode}
              onChange={(e) => {
                let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                value = value.toUpperCase();
                formik.setFieldValue('routeCode', value);
              }}
              error={!!(formik.touched.routeCode && formik.errors.routeCode)}
              helperText={formik.touched.routeCode && formik.errors.routeCode}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Route Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.routeType && formik.errors.routeType)}>
            <CustomSelect
              label="Route Type *"
              name="routeType"
              options={routeTypeOptions}
              value={formik.values.routeType}
              onChange={(value) => formik.setFieldValue('routeType', value)}
              error={!!(formik.touched.routeType && formik.errors.routeType)}
              helperText={formik.touched.routeType ? formik.errors.routeType : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        {/* Distance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.distance && formik.errors.distance)}>
            <TextField
              fullWidth
              name="distance"
              label="Distance(KM) *"
              value={formik.values.distance}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.\s]/g, '');
                formik.setFieldValue('distance', value);
              }}
              error={!!(formik.touched.distance && formik.errors.distance)}
              helperText={formik.touched.distance && formik.errors.distance}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        {/* Start Point */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(Boolean(formik.touched?.startPoint) && formik.errors?.startPoint)}
          >
            <TextField
              label="Start Point *"
              fullWidth
              size="small"
              value={formik.values?.startPoint ?? ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                formik.setFieldValue('startPoint', value);
              }}
              error={!!(formik.touched && formik.touched?.startPoint && formik.errors?.startPoint)}
              helperText={formik.touched?.startPoint && formik.errors?.startPoint}
            />
          </ShakingTextField>
        </Grid>

        {/* End Point */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.endPoint && formik.errors.endPoint)}>
            <TextField
              label="End Point *"
              fullWidth
              size="small"
              value={formik?.values?.endPoint}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                formik.setFieldValue('endPoint', value);
              }}
              error={!!(formik.touched.endPoint && formik.errors.endPoint)}
              helperText={formik.touched.endPoint && formik.errors.endPoint}
            />
          </ShakingTextField>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={!!(formik.touched.description && formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              size="small"
              multiline
              minRows={3}
              maxRows={5}
            />
          </ShakingTextField>
        </Grid>

        {/* === Route Schedule Section === */}
        <Grid size={{ xs: 12 }}>
          <Grid container spacing={3}>
            {/* -------- Pickup Schedule -------- */}
            {(formik.values.routeType === 'pickup' || formik.values.routeType === 'both') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                  Pickup Schedule
                </Typography>

                {/* Start Time */}
                <Grid size={{ xs: 12 }} mb={3}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.pickupSchedule &&
                        (formik.touched.pickupSchedule as any)?.startTimee &&
                        (formik.touched.pickupSchedule as any)?.startTime
                      )
                    }
                  >
                    <TimePicker
                      label="Start Time *"
                      format="hh:mm A"
                      value={
                        formik.values.pickupSchedule?.startTime
                          ? dayjs(formik.values.pickupSchedule.startTime)
                          : null
                      }
                      onChange={(newValue) =>
                        formik.setFieldValue('pickupSchedule.startTime', newValue)
                      }
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.pickupSchedule &&
                            (formik.touched.pickupSchedule as any).startTime &&
                            (formik.errors.pickupSchedule as any)?.startTime
                          ),
                          helperText:
                            (formik.touched.pickupSchedule as any)?.startTime &&
                            (formik.errors.pickupSchedule as any)?.startTime,
                        },
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* End Time */}
                <Grid size={{ xs: 12 }} mb={2}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.pickupSchedule &&
                        (formik.touched.pickupSchedule as any)?.endTime &&
                        (formik.errors.pickupSchedule as any)?.endTime
                      )
                    }
                  >
                    <TimePicker
                      label="End Time *"
                      format="hh:mm A"
                      value={
                        formik.values.pickupSchedule?.endTime
                          ? dayjs(formik.values.pickupSchedule.endTime)
                          : null
                      }
                      onChange={(newValue) =>
                        formik.setFieldValue('pickupSchedule.endTime', newValue)
                      }
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.pickupSchedule &&
                            (formik.touched.pickupSchedule as any).endTime &&
                            (formik.errors.pickupSchedule as any)?.endTime
                          ),
                          helperText:
                            (formik.touched.pickupSchedule as any)?.endTime &&
                            (formik.errors.pickupSchedule as any)?.endTime,
                        },
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            )}

            {/* -------- Dropoff Schedule -------- */}
            {(formik.values.routeType === 'drop' || formik.values.routeType === 'both') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                  Dropoff Schedule
                </Typography>

                {/* Start Time */}
                <Grid size={{ xs: 12 }} mb={3}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.dropoffSchedule &&
                        (formik.touched.dropoffSchedule as any)?.startTime &&
                        (formik.errors.dropoffSchedule as any)?.startTime
                      )
                    }
                  >
                    <TimePicker
                      label="Start Time *"
                      format="hh:mm A"
                      value={
                        formik.values.dropoffSchedule?.startTime
                          ? dayjs(formik.values.dropoffSchedule.startTime)
                          : null
                      }
                      onChange={(newValue) =>
                        formik.setFieldValue('dropoffSchedule.startTime', newValue)
                      }
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.dropoffSchedule &&
                            (formik.touched.dropoffSchedule as any).startTime &&
                            (formik.errors.dropoffSchedule as any)?.startTime
                          ),
                          helperText:
                            (formik.touched.dropoffSchedule as any)?.startTime &&
                            (formik.errors.dropoffSchedule as any)?.startTime,
                        },
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* End Time */}
                <Grid size={{ xs: 12 }} mb={2}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.dropoffSchedule &&
                        (formik.touched.dropoffSchedule as any)?.endTime &&
                        (formik.errors.dropoffSchedule as any)?.endTime
                      )
                    }
                  >
                    <TimePicker
                      label="End Time *"
                      format="hh:mm A"
                      value={
                        formik.values.dropoffSchedule?.endTime
                          ? dayjs(formik.values.dropoffSchedule.endTime)
                          : null
                      }
                      onChange={(newValue) =>
                        formik.setFieldValue('dropoffSchedule.endTime', newValue)
                      }
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(
                            formik.touched.dropoffSchedule &&
                            (formik.touched.dropoffSchedule as any).endTime &&
                            (formik.errors.dropoffSchedule as any)?.endTime
                          ),
                          helperText:
                            (formik.touched.dropoffSchedule as any)?.endTime &&
                            (formik.errors.dropoffSchedule as any)?.endTime,
                        },
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </SectionCard>
    </Grid>
  );
};

export default RouteInformationStep;
