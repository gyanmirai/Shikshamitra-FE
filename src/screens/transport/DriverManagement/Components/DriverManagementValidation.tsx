import * as Yup from 'yup';

export const assignRouteValidationSchema = Yup.object().shape({
  selectedRoute: Yup.string().required('Route selection is required'),
});
