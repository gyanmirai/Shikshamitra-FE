import * as Yup from 'yup';

export const buildingValidationSchema = Yup.object().shape({
  buildingName: Yup.string()
    .trim()
    .required('Building name is required')
    .max(128, 'Use 128 characters or fewer'),
  description: Yup.string().max(500, 'Use 500 characters or fewer'),
  floors: Yup.array()
    .min(1, 'Add at least one floor')
    .of(
      Yup.object().shape({
        floorName: Yup.string()
          .trim()
          .required('Floor name is required')
          .max(100, 'Use 100 characters or fewer'),
        totalRoom: Yup.number()
          .typeError('Enter a whole number of rooms')
          .integer('Enter a whole number of rooms')
          .required('Total rooms is required')
          .min(1, 'Floor must have at least 1 room')
          .max(100, 'Floor cannot have more than 100 rooms'),
      })
    ),
});
