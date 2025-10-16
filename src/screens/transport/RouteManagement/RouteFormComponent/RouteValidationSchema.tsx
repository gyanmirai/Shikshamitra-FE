import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as yup from 'yup';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export const routeValidationSchema = [
  // Step 0: General Information
  yup.object().shape({
    routeName: yup
      .string()
      .trim()
      .required('Route Name is required')
      .max(100, 'Route Name cannot exceed 100 characters'),

    routeCode: yup
      .string()
      .trim()
      .required('Route Code is required')
      .max(20, 'Route Code cannot exceed 20 characters'),

    routeType: yup.string().required('Route Type is required'),

    startPoint: yup
      .string()
      .trim()
      .required('Start Point is required')
      .max(100, 'Start Point cannot exceed 100 characters'),

    endPoint: yup
      .string()
      .trim()
      .required('End Point is required')
      .max(100, 'End Point cannot exceed 100 characters'),

    distance: yup.string().trim().required('Distance is required'),
    startTime: yup
      .mixed()
      .required('Start Time is required')
      .test(
        'is-valid-dayjs',
        'Start Time must be a valid time',
        (value) => value && dayjs(value as Dayjs).isValid()
      ),

    endTime: yup
      .mixed()
      .required('End Time is required')
      .test(
        'is-valid-dayjs',
        'End Time must be a valid time',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-start-time', 'End Time must be after Start Time', function (value) {
        const { startTime } = this.parent;
        if (!value || !startTime) return true;
        return dayjs(value as Dayjs).isAfter(dayjs(startTime as Dayjs));
      }),

    duration: yup.string().trim().required('Duration is required'),

    description: yup.string().nullable().max(500, 'Description cannot exceed 500 characters'),
  }),

  // Step 1: Stops Assignment
  yup.object().shape({
    stops: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string().required('Stop ID is required'),
          stopName: yup
            .string()
            .trim()
            .required('Stop Name is required')
            .max(100, 'Stop Name cannot exceed 100 characters'),
          expectedArrivalTime: yup
            .mixed()
            .required('Expected Arrival Time is required')
            .test(
              'is-valid-dayjs',
              'Expected Arrival Time must be a valid time',
              (value) => value && dayjs(value as Dayjs).isValid()
            ),
          expectedDepartureTime: yup
            .mixed()
            .required('Expected Departure Time is required')
            .test(
              'is-valid-dayjs',
              'Expected Departure Time must be a valid time',
              (value) => value && dayjs(value as Dayjs).isValid()
            )
            .test(
              'is-after-arrival',
              'Departure Time must be after Arrival Time',
              function (value) {
                const { expectedArrivalTime } = this.parent;
                if (!value || !expectedArrivalTime) return true;
                return dayjs(value as Dayjs).isSameOrAfter(dayjs(expectedArrivalTime as Dayjs));
              }
            ),
          arrivalTime: yup
            .mixed()
            .nullable()
            .test(
              'is-valid-dayjs',
              'Arrival Time must be a valid time',
              (value) => !value || dayjs(value as Dayjs).isValid()
            ),
          departureTime: yup
            .mixed()
            .nullable()
            .test(
              'is-valid-dayjs',
              'Departure Time must be a valid time',
              (value) => !value || dayjs(value as Dayjs).isValid()
            ),
          distanceFromPrevious: yup
            .string()
            .trim()
            .required('Distance from previous stop is required'),
          order: yup
            .number()
            .required('Stop order is required')
            .integer('Order must be a whole number')
            .min(1, 'Order must be at least 1'),
        })
      )
      .min(1, 'At least one stop is required'),
  }),

  // Step 2: Vehicle Assignments
  yup.object().shape({
    vehicleAssignments: yup
      .array()
      .of(
        yup.object().shape({
          vehicleId: yup.string().required('Vehicle is required'),
          vehicleNo: yup
            .string()
            .trim()
            .required('Vehicle No. is required')
            .max(20, 'Vehicle No. cannot exceed 20 characters'),
          capacity: yup
            .number()
            .required('Capacity is required')
            .integer('Capacity must be a whole number')
            .min(1, 'Capacity must be at least 1')
            .max(100, 'Capacity cannot exceed 100'),
          driverId: yup.string().required('Driver is required'),
          driverName: yup
            .string()
            .trim()
            .required('Driver Name is required')
            .max(100, 'Driver Name cannot exceed 100 characters'),
          conductorId: yup.string().required('Conductor is required'),
          conductorName: yup
            .string()
            .trim()
            .required('Conductor Name is required')
            .max(100, 'Conductor Name cannot exceed 100 characters'),
        })
      )
      .min(1, 'At least one vehicle assignment is required'),
  }),
];
