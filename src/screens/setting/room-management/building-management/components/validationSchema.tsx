import * as Yup from 'yup';

export const buildingValidationSchema = Yup.object().shape({
  buildingName: Yup.string().required('Building Name is required'),

  totalFloors: Yup.number().required('Total Floors is required'),
  floors: Yup.array().of(
    Yup.object().shape({
      floorName: Yup.string().required('Floor Name is required'),
      totalRoom: Yup.number()
        .required('Total rooms is required')
        .min(1, 'Floor must have at least 1 room')
        .max(100, 'Floor cannot have more than 100 rooms'),
    })
  ),
});
