'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { Button } from '@mui/material';

import { signInUser } from 'src/redux/auth/authActions';

// const validationSchema = Yup.object({
//   email: Yup.string().email('Invalid email address').required('Email is required'),
//   password: Yup.string().required('Password is required'),
// });

const LoginPage = () => {
  const route = useRouter();
  const dispatch = useDispatch();
  // const initialValues: ILogin = {
  //   email: '',
  //   password: '',
  // };
  // const handleSubmitForm = (values: ILogin) => {
  //   route.push('/');
  // };

  return (
    <Button
      onClick={() => {
        dispatch(signInUser() as any);
      }}
    >
      Login
    </Button>
    // <Box
    //   display="flex"
    //   // flexDirection="column"
    //   alignItems="center"
    //   justifyContent="space-around"
    //   minHeight="100vh"
    // >
    //   <Image
    //     src="/assets/loginimage.jfif"
    //     width={100}
    //     height={100}
    //     alt="login"
    //     style={{ maxWidth: '380px', width: '100%', height: '100%' }}
    //   />
    //   <Formik
    //     initialValues={initialValues}
    //     validationSchema={validationSchema}
    //     onSubmit={handleSubmitForm}
    //   >
    //     {({ values, errors, touched, handleChange, handleSubmit }) => (
    //       <Paper
    //         elevation={4}
    //         sx={{
    //           mt: 1,
    //           maxWidth: 380,
    //           width: '100%',
    //           // border: '1px solid #e0e0e0',
    //           borderRadius: 2,
    //           padding: 3,
    //         }}
    //       >
    //         <Box component="form" noValidate onSubmit={handleSubmit}>
    //           <Typography variant="h4" gutterBottom textAlign="center">
    //             Login
    //           </Typography>
    //           <TextField
    //             margin="normal"
    //             required
    //             fullWidth
    //             id="email"
    //             name="email"
    //             label="Email Address"
    //             autoComplete="email"
    //             autoFocus
    //             value={values.email}
    //             onChange={handleChange}
    //             error={touched.email && Boolean(errors.email)}
    //             helperText={touched.email && errors.email}
    //           />
    //           <TextField
    //             margin="normal"
    //             required
    //             fullWidth
    //             name="password"
    //             label="Password"
    //             type="password"
    //             id="password"
    //             autoComplete="current-password"
    //             value={values.password}
    //             onChange={handleChange}
    //             error={touched.password && Boolean(errors.password)}
    //             helperText={touched.password && errors.password}
    //           />
    //           <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
    //             Sign In
    //           </Button>
    //         </Box>
    //       </Paper>
    //     )}
    //   </Formik>
    // </Box>
  );
};

export default LoginPage;
