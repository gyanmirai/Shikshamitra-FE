import dayjs from 'dayjs';
import * as Yup from 'yup';

// Validation schema for events and holidays form
export const eventAndHolidayValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  // Validate that start date is provided
  startDate: Yup.date().required('Start date is required'),
  // Validate end date with custom validation logic
  endDate: Yup.date()
    .nullable()
    // eslint-disable-next-line func-names
    .test('endDate', 'End date must be after start date', function (value) {
      // Get start date from parent object
      const { startDate } = this.parent;

      // Check if end date is provided
      if (!value) return this.createError({ message: 'End date is required' });
      // Skip validation if start date is not provided
      if (!startDate) return true;

      // Convert dates to dayjs objects for comparison
      const fullStartDate = dayjs(startDate);
      const endDate = dayjs(value);

      // Validate that end date is after start date
      if (!endDate.isSameOrAfter(fullStartDate)) {
        return this.createError({ message: 'End date must be after start date' });
      }

      return true;
    }),
  // Validate that reason is provided
  reason: Yup.string().required('Description is required'),
  documentSize: Yup.number().required('Document size is required'),
});
