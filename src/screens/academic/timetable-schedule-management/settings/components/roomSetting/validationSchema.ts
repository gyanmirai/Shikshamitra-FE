import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  roomNumber: Yup.number().required('Room Number is required'),
  buildingName: Yup.string().required('Building Name is required'),
  floor: Yup.number().required('Floor is required'),
  capacity: Yup.number().required('Capacity is required'),
});
