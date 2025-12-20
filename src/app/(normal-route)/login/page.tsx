'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signInUser } from 'src/redux/auth/authActions';

// const validationSchema = Yup.object({
//   email: Yup.string().email('Invalid email address').required('Email is required'),
//   password: Yup.string().required('Password is required'),
// });

const LoginPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(signInUser() as any);
  }, [dispatch]);

  return null;
};

export default LoginPage;
