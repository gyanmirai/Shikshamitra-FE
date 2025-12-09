import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getTransportValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // Report
  shape.report = Yup.string().required('Report is required');

  // Vehicle (Multi)
  if (showField.includes('vehicles')) {
    shape.vehicles = Yup.array()
      .min(1, 'Select at least one vehicle')
      .required('Vehicle is required');
  }

  // Vehicle (Single)
  if (showField.includes('vehicle')) {
    shape.vehicle = Yup.string().required('Vehicle is required');
  }

  // Route (Multi)
  if (showField.includes('routes')) {
    shape.routes = Yup.array().min(1, 'Select at least one route').required('Route is required');
  }

  // Route (Single)
  if (showField.includes('route')) {
    shape.route = Yup.string().required('Route is required');
  }

  // Driver (Multi)
  if (showField.includes('drivers')) {
    shape.drivers = Yup.array().min(1, 'Select at least one driver').required('Driver is required');
  }

  // Driver (Single)
  if (showField.includes('driver')) {
    shape.driver = Yup.string().required('Driver is required');
  }

  // Stop (Multi)
  if (showField.includes('stops')) {
    shape.stops = Yup.array().min(1, 'Select at least one stop').required('Stop is required');
  }

  // Stop (Single)
  if (showField.includes('stop')) {
    shape.stop = Yup.string().required('Stop is required');
  }

  // Staff (Multi)
  if (showField.includes('staffs')) {
    shape.staffs = Yup.array().min(1, 'Select at least one staff').required('Staff is required');
  }

  // Staff (Single)
  if (showField.includes('staff')) {
    shape.staff = Yup.string().required('Staff is required');
  }

  // Student (Multi)
  if (showField.includes('students')) {
    shape.students = Yup.array()
      .min(1, 'Select at least one student')
      .required('Student is required');
  }

  // Student (Single)
  if (showField.includes('student')) {
    shape.student = Yup.string().required('Student is required');
  }

  // Standard / Class (Multi)
  if (showField.includes('standards')) {
    shape.standards = Yup.array().min(1, 'Select at least one class').required('Class is required');
  }

  // Standard / Class (Single)
  if (showField.includes('standard')) {
    shape.standard = Yup.string().required('Class is required');
  }

  // Division (Multi)
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'Select at least one division')
      .required('Division is required');
  }

  // Division (Single)
  if (showField.includes('division')) {
    shape.division = Yup.string().required('Division is required');
  }

  // Month
  if (showField.includes('month')) {
    shape.month = Yup.date().nullable().required('Month is required');
  }

  // From Date
  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test(
        'min-date',
        (value) =>
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      .test(
        'max-date',
        (value) =>
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      )
      .nullable()
      .optional();
  }

  // To Date
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      // To Date must be >= From Date
      // eslint-disable-next-line func-names
      .test('is-after-start', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;

        // allow empty value or empty fromDate
        if (value === null || value === undefined) return true;
        if (!fromDate) return true;

        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fromDate), 'day');
      })
      // Academic year MIN date check
      .test(
        'min-date',
        (value) =>
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day');
        }
      )
      // Academic year MAX date check
      .test(
        'max-date',
        (value) =>
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => {
          if (value === null || value === undefined) return true; // allow empty
          return dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day');
        }
      )
      .nullable()
      .optional();
  }

  // Status (Single)
  if (showField.includes('status')) {
    shape.status = Yup.string().required('Status is required');
  }

  // Status (Multi)
  if (showField.includes('statuses')) {
    shape.statuses = Yup.array()
      .min(1, 'Select at least one status')
      .required('Status is required');
  }

  // Type (Single)
  if (showField.includes('type')) {
    shape.type = Yup.string().required('Type is required');
  }

  // Type (Multi)
  if (showField.includes('types')) {
    shape.types = Yup.array().min(1, 'Select at least one type').required('Type is required');
  }

  return Yup.object().shape(shape);
};
