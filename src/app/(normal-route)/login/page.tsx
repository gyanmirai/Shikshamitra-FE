'use client';

import { useDispatch } from 'react-redux';
import { signInUser } from 'src/redux/auth/authActions';

// const validationSchema = Yup.object({
//   email: Yup.string().email('Invalid email address').required('Email is required'),
//   password: Yup.string().required('Password is required'),
// });

const LoginPage = () => {
  const dispatch = useDispatch();
  dispatch(signInUser() as any);

  return null;
};

export default LoginPage;
