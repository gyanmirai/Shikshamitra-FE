'use client';

import type { Variants } from 'framer-motion';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Icon } from '@iconify/react';
import Alert from '@mui/material/Alert';
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import { signIn } from 'next-auth/react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LogoWithText } from 'src/components/logo/logo-with-text';

// --- Validation Schemas ---
const loginSchema = Yup.object({
  organization: Yup.string().required('Organization name is required'),
  email: Yup.string().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
});

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export default function LoginPage() {
  const theme = useTheme();

  // State
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordSent, setIsForgotPasswordSent] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // --- Formik Hooks ---
  const loginFormik = useFormik({
    initialValues: {
      organization: '',
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const res = await signIn('credentials', {
          email: values.email,
          password: values.password,
          organizationName: values.organization,
          redirect: false,
        });
        if (res?.error) {
          shikshaMitraToast.error({ message: 'Invalid credentials' });
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
      } catch (error) {
        console.error(error);
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    },
  });

  const forgotFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API
      setIsForgotPasswordSent(true);
    },
  });

  const toggleView = () => {
    setView((prev) => (prev === 'login' ? 'forgot' : 'login'));
    setIsForgotPasswordSent(false);
    if (view === 'login') forgotFormik.resetForm();
    else loginFormik.resetForm();
  };

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const shakeVariants: Variants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  // --- Styles ---
  const glassCardStyle = {
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha('#FFF', 0.85),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
    borderRadius: '24px',
    border: `1px solid ${alpha('#FFF', 0.6)}`,
    overflow: 'hidden',
    position: 'relative' as const,
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: alpha('#FFF', 0.6),
      transition: 'all 0.3s ease',
      '& fieldset': {
        borderColor: alpha(theme.palette.grey[400], 0.3),
      },
      '&.Mui-focused': {
        backgroundColor: '#FFF',
        boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.15)}`,
        '& fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: '1px',
        },
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '& input': {
        fontWeight: 500,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 10% 20%, rgb(242, 249, 255) 0%, rgb(235, 244, 255) 40%, rgb(240, 242, 255) 90%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* --- Ambient Background Elements --- */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.1, 1],
        }}
        // @ts-ignore
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100, 181, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        animate={{
          y: [0, 50, 0],
          x: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.2, 1],
        }}
        // @ts-ignore
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 199, 132, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.05, 1],
        }}
        // @ts-ignore
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        sx={{
          position: 'absolute',
          top: '30%',
          left: '40%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(149, 117, 205, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          zIndex: 0,
        }}
      />

      {/* --- Main Content --- */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        {/* Branding Section */}
        <Box
          component={motion.div}
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              mb: 1,
              p: 1.5,
              borderRadius: '50%',
              // bgcolor: 'rgba(255,255,255,0.8)',
              // boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <LogoWithText sx={{ width: '240px' }} />
          </Box>
          {/* <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: theme.palette.text.primary,
              mb: 0.5,
            }}
          >
            Shiksha Mitra
          </Typography> */}
          <Typography
            variant="subtitle1"
            sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
          >
            Empowering Smarter School Management
          </Typography>
        </Box>

        <motion.div
          initial="hidden"
          animate={shakeError ? 'shake' : 'visible'}
          variants={shakeError ? shakeVariants : containerVariants}
        >
          <Box sx={glassCardStyle}>
            <Box sx={{ p: { xs: 3, sm: 5 } }}>
              <AnimatePresence mode="wait">
                {view === 'login' ? (
                  <motion.div
                    key="login"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}
                    >
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                      Access your school&apos;s digital workspace securely and efficiently.
                    </Typography>

                    <Box component="form" onSubmit={loginFormik.handleSubmit}>
                      <Stack spacing={2.5}>
                        <motion.div variants={itemVariants}>
                          <TextField
                            fullWidth
                            id="organization"
                            name="organization"
                            label="Organization Name"
                            placeholder="e.g. St. Xaviers High"
                            value={loginFormik.values.organization}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            error={
                              loginFormik.touched.organization &&
                              Boolean(loginFormik.errors.organization)
                            }
                            helperText={
                              loginFormik.touched.organization && loginFormik.errors.organization
                            }
                            // sx={inputStyle}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon
                                    icon="ph:buildings-duotone"
                                    color={theme.palette.text.disabled}
                                    width={22}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email / Username"
                            placeholder="admin@school.edu"
                            value={loginFormik.values.email}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
                            helperText={loginFormik.touched.email && loginFormik.errors.email}
                            // sx={inputStyle}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon
                                    icon="ph:user-duotone"
                                    color={theme.palette.text.disabled}
                                    width={22}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={loginFormik.values.password}
                            onChange={loginFormik.handleChange}
                            onBlur={loginFormik.handleBlur}
                            error={
                              loginFormik.touched.password && Boolean(loginFormik.errors.password)
                            }
                            helperText={loginFormik.touched.password && loginFormik.errors.password}
                            sx={inputStyle}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon
                                    icon="ph:lock-key-duotone"
                                    color={theme.palette.text.disabled}
                                    width={22}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                  >
                                    <Icon
                                      icon={
                                        showPassword
                                          ? 'solar:eye-bold-duotone'
                                          : 'solar:eye-closed-bold-duotone'
                                      }
                                      width={22}
                                      color={theme.palette.text.secondary}
                                    />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  defaultChecked
                                  sx={{ '&.Mui-checked': { color: theme.palette.primary.main } }}
                                />
                              }
                              label={
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  Remember me
                                </Typography>
                              }
                            />
                            <Link
                              component="button"
                              variant="body2"
                              type="button"
                              onClick={toggleView}
                              underline="none"
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                '&:hover': { textDecoration: 'underline' },
                              }}
                            >
                              Forgot Password?
                            </Link>
                          </Stack>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={loginFormik.isSubmitting}
                            component={motion.button}
                            whileHover={{
                              scale: 1.01,
                              boxShadow: `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
                            }}
                            color="primary"
                            whileTap={{ scale: 0.98 }}
                            sx={{
                              py: 1.5,
                              borderRadius: '12px',
                              fontSize: '1rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
                            }}
                          >
                            {loginFormik.isSubmitting ? 'Signing in...' : 'Sign In'}
                          </Button>
                        </motion.div>
                      </Stack>
                    </Box>
                  </motion.div>
                ) : (
                  // Forgot Password View
                  <motion.div
                    key="forgot"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 1.5,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mb: 2,
                        }}
                      >
                        <Icon icon="ph:lock-key-open-duotone" width={32} height={32} />
                      </Box>
                      <Typography variant="h5" fontWeight="700" color="text.primary" gutterBottom>
                        Forgot Password?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enter the email associated with your account and we&apos;ll send you a link
                        to reset your password.
                      </Typography>
                    </Box>

                    {isForgotPasswordSent ? (
                      <motion.div variants={itemVariants}>
                        <Alert
                          severity="success"
                          sx={{
                            borderRadius: '12px',
                            mb: 3,
                            bgcolor: alpha(theme.palette.success.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          }}
                        >
                          Reset link has been sent to your email.
                        </Alert>
                        <Button
                          fullWidth
                          size="large"
                          variant="outlined"
                          onClick={toggleView}
                          startIcon={<Icon icon="eva:arrow-back-fill" />}
                          sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            borderWidth: 2,
                            '&:hover': { borderWidth: 2 },
                          }}
                        >
                          Back to Login
                        </Button>
                      </motion.div>
                    ) : (
                      <Box component="form" onSubmit={forgotFormik.handleSubmit}>
                        <Stack spacing={3}>
                          <motion.div variants={itemVariants}>
                            <TextField
                              fullWidth
                              id="email"
                              name="email"
                              label="Email Address"
                              placeholder="admin@school.edu"
                              value={forgotFormik.values.email}
                              onChange={forgotFormik.handleChange}
                              onBlur={forgotFormik.handleBlur}
                              error={
                                forgotFormik.touched.email && Boolean(forgotFormik.errors.email)
                              }
                              helperText={forgotFormik.touched.email && forgotFormik.errors.email}
                              // sx={inputStyle}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Icon
                                      icon="ph:envelope-simple-duotone"
                                      color={theme.palette.text.disabled}
                                      width={22}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Button
                              fullWidth
                              size="large"
                              type="submit"
                              variant="contained"
                              disabled={forgotFormik.isSubmitting}
                              component={motion.button}
                              whileHover={{
                                scale: 1.01,
                                boxShadow: `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
                              }}
                              color="primary"
                              whileTap={{ scale: 0.98 }}
                              sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.25)}`,
                              }}
                            >
                              {forgotFormik.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <Button
                              fullWidth
                              size="medium"
                              onClick={toggleView}
                              sx={{
                                color: theme.palette.text.secondary,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  color: theme.palette.text.primary,
                                  bgcolor: 'transparent',
                                },
                              }}
                            >
                              Back to Login
                            </Button>
                          </motion.div>
                        </Stack>
                      </Box>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </motion.div>

        {/* Footer/Copyright if needed, but keeping minimal as requested */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            © {new Date().getFullYear()} Gyanmirai. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
