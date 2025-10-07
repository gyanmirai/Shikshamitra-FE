import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as yup from 'yup';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

// Example: Replace with your actual academic/session year dates

export const vehicleValidationSchema = [
  // Step 0: Basic Information
  yup.object().shape({
    registrationNo: yup
      .string()
      .trim()
      .required('Registration No. is required')
      .max(20, 'Registration No. cannot exceed 20 characters'),

    vehicleNo: yup
      .string()
      .trim()
      .required('Vehicle No. is required')
      .max(20, 'Vehicle No. cannot exceed 20 characters'),

    vehicleType: yup.string().required('Vehicle Type is required'),

    vehicleCompany: yup
      .string()
      .trim()
      .required('Vehicle Company is required')
      .max(50, 'Vehicle Company cannot exceed 50 characters'),

    model: yup
      .string()
      .trim()
      .required('Model is required')
      .max(50, 'Model cannot exceed 50 characters'),

    yearOfManufacture: yup
      .string()
      .required('Year of Manufacture is required')
      .matches(/^\d{4}$/, 'Year must be 4 digits'),

    seatingCapacity: yup
      .number()
      .typeError('Seating Capacity must be a number')
      .required('Seating Capacity is required')
      .integer('Seating Capacity must be a whole number')
      .min(1, 'Seating Capacity must be at least 1')
      .max(100, 'Seating Capacity cannot exceed 100'),

    vehicleColor: yup
      .string()
      .trim()
      .required('Vehicle Color is required')
      .max(30, 'Vehicle Color cannot exceed 30 characters'),

    schoolAssignedNo: yup
      .string()
      .nullable()
      .max(20, 'School Assigned No. cannot exceed 20 characters'),

    owner: yup
      .string()
      .trim()
      .required('Owner is required')
      .max(50, 'Owner cannot exceed 50 characters'),

    fuelType: yup.string().required('Fuel Type is required'),

    isAC: yup.boolean(),
    isNonAC: yup.boolean(),

    description: yup.string().nullable().max(500, 'Description cannot exceed 500 characters'),
  }),

  // Step 2: Vehicle Maintenance (with robust date validation)
  yup.object().shape({}),
  yup.object().shape({
    insuranceCompany: yup
      .string()
      .trim()
      .required('Insurance Company is required')
      .max(50, 'Insurance Company cannot exceed 50 characters'),

    policyNo: yup
      .string()
      .trim()
      .required('Policy No. is required')
      .max(30, 'Policy No. cannot exceed 30 characters'),

    insuranceIssueDate: yup
      .mixed()
      .required('Issue Date is required')
      .test(
        'is-valid-dayjs',
        'Issue Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      ),

    insuranceExpiryDate: yup
      .mixed()
      .required('Expiry Date is required')
      .test(
        'is-valid-dayjs',
        'Expiry Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-issue-date', 'Expiry Date cannot be before Issue Date', function (value) {
        const { insuranceIssueDate } = this.parent;
        if (!value || !insuranceIssueDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(insuranceIssueDate), 'day');
      }),

    coverageAmount: yup
      .number()
      .transform((value, originalValue) => {
        // Remove ₹, commas, spaces, etc.
        if (typeof originalValue === 'string') {
          const cleaned = originalValue.replace(/[₹,\s]/g, '');
          return cleaned ? Number(cleaned) : undefined;
        }
        return value;
      })
      .required('Coverage Amount is required')
      .min(0, 'Coverage Amount cannot be negative')
      .max(10000000, 'Coverage Amount cannot exceed 1 crore'),

    pucCertificateNo: yup
      .string()
      .trim()
      .required('Certificate No. is required')
      .max(30, 'Certificate No. cannot exceed 30 characters'),

    pucIssueDate: yup
      .mixed()
      .required('Issue Date is required')
      .test(
        'is-valid-dayjs',
        'Issue Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      ),
    pucExpiryDate: yup
      .mixed()
      .required('Expiry Date is required')
      .test(
        'is-valid-dayjs',
        'Expiry Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-issue-date', 'Expiry Date cannot be before Issue Date', function (value) {
        const { pucIssueDate } = this.parent;
        if (!value || !pucIssueDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(pucIssueDate), 'day');
      }),

    fitnessCertificateNo: yup
      .string()
      .trim()
      .required('Fitness Certificate No. is required')
      .max(30, 'Fitness Certificate No. cannot exceed 30 characters'),

    fitnessIssueDate: yup
      .mixed()
      .required('Issue Date is required')
      .test(
        'is-valid-dayjs',
        'Issue Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      ),

    fitnessExpiryDate: yup
      .mixed()
      .required('Expiry Date is required')
      .test(
        'is-valid-dayjs',
        'Expiry Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-issue-date', 'Expiry Date cannot be before Issue Date', function (value) {
        const { fitnessIssueDate } = this.parent;
        if (!value || !fitnessIssueDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(fitnessIssueDate), 'day');
      }),

    roadTaxReceiptNo: yup
      .string()
      .trim()
      .required('Tax Receipt No. is required')
      .max(30, 'Tax Receipt No. cannot exceed 30 characters'),

    roadTaxIssueDate: yup
      .mixed()
      .required('Tax Issue Date is required')
      .test(
        'is-valid-dayjs',
        'Tax Issue Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      ),
  }),
];
