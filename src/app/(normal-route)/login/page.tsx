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
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
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

// Brand color constants
const BRAND_GREEN = '#2f8f68';
const BRAND_GREEN_DARK = '#1f7a57';

export default function LoginPage() {
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
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
    },
    exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 320, damping: 26 },
    },
  };

  const shakeVariants: Variants = {
    shake: {
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.4 },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: -16 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  // --- Styles ---
  const cardStyle = {
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.06)',
    overflow: 'hidden',
    position: 'relative' as const,
  };

  // Shared refined input style — matches second screenshot: floating label, no icons
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: 'transparent', // Matches white card background
      transition: 'all 0.15s ease',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
        transition: 'border-color 0.15s ease',
      },
      '&:hover fieldset': {
        borderColor: '#d1d5db',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        '& fieldset': {
          borderColor: BRAND_GREEN,
          borderWidth: '1.5px',
        },
        boxShadow: '0 0 0 3px rgba(47,143,104,0.12)',
      },
      '&.Mui-error': {
        backgroundColor: '#ffffff',
        '& fieldset': {
          borderColor: '#ff4842',
        },
        '&.Mui-focused': {
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: '#ff4842',
            borderWidth: '1.5px',
          },
          boxShadow: 'none', // Remove red glow ring
        },
      },
      '& input': {
        fontWeight: 400,
        fontSize: '0.9rem',
        color: '#111827',
        paddingLeft: '44px', // Space for the absolute icon
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.8125rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#9ca3af',
      backgroundColor: '#ffffff', // Fixes the line going through label
      padding: '0 4px',
      marginLeft: '-4px', // Adjust for padding
      '&:not(.MuiInputLabel-shrink)': {
        transform: 'translate(44px, 16px) scale(1)',
      },
      '&.Mui-focused': {
        color: BRAND_GREEN,
      },
      '&.Mui-error': {
        color: '#ff4842',
      },
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.75rem',
      marginTop: '4px',
    },
  };

  const primaryButtonStyle = {
    height: '50px',
    borderRadius: '12px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    background: `linear-gradient(135deg, ${BRAND_GREEN}, ${BRAND_GREEN_DARK})`,
    // Improvement 4: stronger shadow presence
    boxShadow: `0 6px 20px rgba(47,143,104,0.34), 0 2px 6px rgba(47,143,104,0.18)`,
    color: '#ffffff',
    border: 'none',
    transition: 'all 0.18s ease',
    '&:hover': {
      // Darken gradient by ~5% on hover
      background: `linear-gradient(135deg, #288059, #1a6b4a)`,
      boxShadow: `0 8px 26px rgba(47,143,104,0.42), 0 2px 8px rgba(47,143,104,0.22)`,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      // Press: scale down slightly
      transform: 'scale(0.98) translateY(0px)',
      boxShadow: `0 3px 10px rgba(47,143,104,0.22)`,
    },
    '&.Mui-disabled': {
      background: 'linear-gradient(135deg, #a8d5c4, #8bbfb0)',
      boxShadow: 'none',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'not-allowed',
    },
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 10% 20%, rgb(224, 236, 248) 0%, rgb(213, 228, 244) 40%, rgb(218, 223, 242) 90%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* --- Radial glow behind card --- */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(47,143,104,0.08), transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Subtle ambient blobs */}
      <Box
        component={motion.div}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        // @ts-ignore
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          top: '-8%',
          left: '-4%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,143,104,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        component={motion.div}
        animate={{
          y: [0, 40, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        // @ts-ignore
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        sx={{
          position: 'absolute',
          bottom: '-12%',
          right: '-8%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31,122,87,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />

      {/* --- Main Content --- */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: { xs: '420px', lg: '900px', xl: '960px' },
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: '24px',
          overflow: 'hidden',
          // Improvement 3: stronger shadow + 1px white border for login card contrast
          boxShadow: '0 28px 70px rgba(0,0,0,0.14), 0 6px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.72)',
        }}
      >
        {/* ===== LEFT BRANDING CARD ===== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: { md: '40%', lg: '50%' },
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            // Improvement 1: richer base gradient — dark top to lighter bottom
            background:
              'linear-gradient(160deg, #144d36 0%, #1e6b4a 30%, #2f8f68 60%, #3aab7e 85%, #46bc8c 100%)',
            p: { md: 4, lg: 5 },
          }}
        >
          {/* Improvement 1: radial light top-right + dark vignette bottom-left */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 88% 8%, rgba(255,255,255,0.18) 0%, transparent 50%), ' +
                'radial-gradient(ellipse at 8% 92%, rgba(0,0,0,0.18) 0%, transparent 48%)',
              zIndex: 0,
            }}
          />

          {/* Improvement 1: SVG noise texture at ~2.5% opacity for premium feel */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.025,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '180px 180px',
              zIndex: 0,
            }}
          />

          {/* Grid dot pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.06,
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              zIndex: 0,
            }}
          />

          {/* Floating decorative blob top-right */}
          <Box
            sx={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              zIndex: 0,
            }}
          />

          {/* Floating decorative blob bottom-left */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '-80px',
              left: '-40px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.07)',
              zIndex: 0,
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Brand mark */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.25,
                mb: 4,
                bgcolor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '10px',
                px: 1.75,
                py: 0.75,
              }}
            >
              <Icon
                icon="ph:graduation-cap-duotone"
                width={20}
                style={{ color: 'rgba(255,255,255,0.9)' }}
              />
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.04em',
                }}
              >
                ShikshaMitra
              </Typography>
            </Box>

            {/* Improvement 2: heading with visual anchor on "Smarter" */}
            <Typography
              component="h1"
              sx={{
                fontSize: { md: '1.7rem', lg: '2rem' },
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.3,
                mb: 1.75,
                letterSpacing: '-0.02em',
              }}
            >
              Empowering{' '}
              <Box
                component="span"
                sx={{
                  color: 'rgba(255,255,255,1)',
                  fontWeight: 800,
                  textShadow: '0 0 24px rgba(255,255,255,0.35)',
                }}
              >
                Smarter
              </Box>
              <br />
              School Management
            </Typography>

            {/* Sub-text */}
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.78)',
                fontWeight: 400,
                lineHeight: 1.65,
                mb: 4,
                maxWidth: '320px',
              }}
            >
              A unified platform for seamless academic and administrative operations.
            </Typography>

            {/* Divider */}
            <Box
              sx={{
                width: '40px',
                height: '2px',
                bgcolor: 'rgba(255,255,255,0.35)',
                borderRadius: '2px',
                mb: 3,
              }}
            />

            {/* Improvement 5: feature highlights — uniform 36px icons, tighter gap */}
            <Stack spacing={1.5}>
              {[
                { icon: 'ph:calendar-check-duotone', label: 'Attendance & Academics' },
                { icon: 'ph:currency-circle-dollar-duotone', label: 'Finance & Administration' },
                { icon: 'ph:chats-circle-duotone', label: 'Parent Communication' },
              ].map((feature) => (
                <Box
                  key={feature.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      borderRadius: '9px',
                      bgcolor: 'rgba(255,255,255,0.16)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      icon={feature.icon}
                      width={18}
                      style={{ color: 'rgba(255,255,255,0.95)' }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.88)',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {feature.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Bottom trust badge */}
            <Box
              sx={{
                mt: 5,
                pt: 3,
                borderTop: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Icon
                icon="ph:shield-check-duotone"
                width={16}
                style={{ color: 'rgba(255,255,255,0.65)' }}
              />
              <Typography
                sx={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}
              >
                Trusted by schools across India
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ===== RIGHT LOGIN CARD WRAPPER ===== */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#ffffff',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 4, md: 4.5 },
            }}
          >
            {/* Branding Section — Logo unchanged */}
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
                }}
              >
                <LogoWithText sx={{ width: '220px' }} disableLink />
              </Box>
            </Box>

            <motion.div
              initial="hidden"
              animate={shakeError ? 'shake' : 'visible'}
              variants={shakeError ? shakeVariants : containerVariants}
            >
              <Box sx={cardStyle}>
                <Box sx={{ p: { xs: 3, sm: 4 } }}>
                  <AnimatePresence mode="wait">
                    {view === 'login' ? (
                      <motion.div
                        key="login"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                      >
                        {/* Heading */}
                        <motion.div variants={itemVariants}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '1.5rem',
                              color: '#111827',
                              mb: 0.75,
                              lineHeight: 1.3,
                            }}
                          >
                            Welcome back
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 400,
                              color: '#6b7280',
                              mb: 3,
                            }}
                          >
                            Sign in to your school workspace
                          </Typography>
                        </motion.div>

                        <Box component="form" onSubmit={loginFormik.handleSubmit}>
                          <Stack spacing={3}>
                            {/* Organization */}
                            <motion.div variants={itemVariants}>
                              <Box sx={{ position: 'relative' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    color: '#9ca3af',
                                  }}
                                >
                                  <Icon icon="ph:buildings-duotone" width={20} />
                                </Box>
                                <TextField
                                  fullWidth
                                  id="organization"
                                  name="organization"
                                  label="School Code"
                                  value={loginFormik.values.organization}
                                  onChange={loginFormik.handleChange}
                                  onBlur={loginFormik.handleBlur}
                                  error={
                                    loginFormik.touched.organization &&
                                    Boolean(loginFormik.errors.organization)
                                  }
                                  helperText={
                                    loginFormik.touched.organization &&
                                    loginFormik.errors.organization
                                      ? loginFormik.errors.organization
                                      : ' '
                                  }
                                  sx={inputStyle}
                                />
                              </Box>
                            </motion.div>

                            {/* Email */}
                            <motion.div variants={itemVariants}>
                              <Box sx={{ position: 'relative' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    color: '#9ca3af',
                                  }}
                                >
                                  <Icon icon="ph:user-duotone" width={20} />
                                </Box>
                                <TextField
                                  fullWidth
                                  id="email"
                                  name="email"
                                  label="Email / Username"
                                  value={loginFormik.values.email}
                                  onChange={loginFormik.handleChange}
                                  onBlur={loginFormik.handleBlur}
                                  error={
                                    loginFormik.touched.email && Boolean(loginFormik.errors.email)
                                  }
                                  helperText={loginFormik.touched.email && loginFormik.errors.email}
                                  sx={inputStyle}
                                />
                              </Box>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={itemVariants}>
                              <Box sx={{ position: 'relative' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    pointerEvents: 'none',
                                    display: 'flex',
                                    color: '#9ca3af',
                                  }}
                                >
                                  <Icon icon="ph:lock-key-duotone" width={20} />
                                </Box>
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
                                    loginFormik.touched.password &&
                                    Boolean(loginFormik.errors.password)
                                  }
                                  helperText={
                                    loginFormik.touched.password && loginFormik.errors.password
                                  }
                                  sx={inputStyle}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() => setShowPassword(!showPassword)}
                                          edge="end"
                                          size="small"
                                          sx={{
                                            color: '#9ca3af',
                                            '&:hover': { color: '#6b7280', bgcolor: 'transparent' },
                                            transition: 'color 0.15s ease',
                                          }}
                                        >
                                          <Icon
                                            icon={
                                              showPassword
                                                ? 'solar:eye-bold-duotone'
                                                : 'solar:eye-closed-bold-duotone'
                                            }
                                            width={20}
                                          />
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                            </motion.div>

                            {/* Remember me & Forgot password */}
                            <motion.div variants={itemVariants}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      defaultChecked
                                      size="small"
                                      sx={{
                                        color: '#d1d5db',
                                        p: '6px',
                                        '&.Mui-checked': { color: BRAND_GREEN },
                                        '&:hover': { bgcolor: 'rgba(47,143,104,0.06)' },
                                        transition: 'all 0.15s ease',
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography
                                      sx={{
                                        fontSize: '0.8125rem',
                                        fontWeight: 400,
                                        color: '#6b7280',
                                      }}
                                    >
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
                                    color: BRAND_GREEN,
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                      color: BRAND_GREEN_DARK,
                                    },
                                  }}
                                >
                                  Forgot password?
                                </Link>
                              </Stack>
                            </motion.div>

                            {/* Sign In Button */}
                            <motion.div variants={itemVariants}>
                              <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={loginFormik.isSubmitting}
                                sx={primaryButtonStyle}
                              >
                                {loginFormik.isSubmitting ? (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CircularProgress
                                      size={16}
                                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                                    />
                                    <Box
                                      component="span"
                                      sx={{ opacity: 0.85, fontSize: '0.9rem', fontWeight: 600 }}
                                    >
                                      Signing in...
                                    </Box>
                                  </Stack>
                                ) : (
                                  'Sign In'
                                )}
                              </Button>
                            </motion.div>
                          </Stack>
                        </Box>

                        {/* Terms */}
                        <motion.div variants={itemVariants}>
                          <Typography
                            sx={{
                              mt: 2.5,
                              textAlign: 'center',
                              fontSize: '0.75rem',
                              color: '#9ca3af',
                              fontWeight: 400,
                            }}
                          >
                            By signing in, you agree to GyanMirai&apos;s Terms of Service.
                          </Typography>
                        </motion.div>
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
                        {/* Back to login */}
                        <motion.div variants={itemVariants}>
                          <Link
                            component="button"
                            type="button"
                            onClick={toggleView}
                            underline="none"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8125rem',
                              color: '#6b7280',
                              fontWeight: 500,
                              mb: 2.5,
                              transition: 'color 0.15s ease',
                              '&:hover': { color: '#374151' },
                            }}
                          >
                            <Icon icon="eva:arrow-back-fill" width={16} />
                            Back to login
                          </Link>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              p: 1.25,
                              borderRadius: '12px',
                              bgcolor: 'rgba(47,143,104,0.08)',
                              color: BRAND_GREEN,
                              mb: 2,
                            }}
                          >
                            <Icon icon="ph:lock-key-open-duotone" width={28} height={28} />
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '1.375rem',
                              color: '#111827',
                              mb: 0.75,
                            }}
                          >
                            Reset your password
                          </Typography>
                          <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 3 }}>
                            Enter your email and we&apos;ll send you a reset link.
                          </Typography>
                        </motion.div>

                        {isForgotPasswordSent ? (
                          <motion.div variants={itemVariants}>
                            <Alert
                              severity="success"
                              sx={{
                                borderRadius: '12px',
                                mb: 3,
                                bgcolor: 'rgba(47,143,104,0.06)',
                                border: '1px solid rgba(47,143,104,0.18)',
                                '& .MuiAlert-icon': { color: BRAND_GREEN },
                              }}
                            >
                              Reset link has been sent to your email. Please check your inbox.
                            </Alert>
                            <Button
                              fullWidth
                              type="button"
                              onClick={toggleView}
                              sx={{
                                ...primaryButtonStyle,
                              }}
                            >
                              Back to Login
                            </Button>
                          </motion.div>
                        ) : (
                          <Box component="form" onSubmit={forgotFormik.handleSubmit}>
                            <Stack spacing={2}>
                              <motion.div variants={itemVariants}>
                                <Box sx={{ position: 'relative' }}>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 16,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      zIndex: 1,
                                      pointerEvents: 'none',
                                      display: 'flex',
                                      color: '#9ca3af',
                                    }}
                                  >
                                    <Icon icon="ph:envelope-simple-duotone" width={20} />
                                  </Box>
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
                                      forgotFormik.touched.email &&
                                      Boolean(forgotFormik.errors.email)
                                    }
                                    helperText={
                                      forgotFormik.touched.email && forgotFormik.errors.email
                                    }
                                    sx={inputStyle}
                                  />
                                </Box>
                              </motion.div>

                              <motion.div variants={itemVariants}>
                                <Button
                                  fullWidth
                                  type="submit"
                                  variant="contained"
                                  disabled={forgotFormik.isSubmitting}
                                  sx={primaryButtonStyle}
                                >
                                  {forgotFormik.isSubmitting ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CircularProgress
                                        size={16}
                                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                                      />
                                      <Box
                                        component="span"
                                        sx={{ opacity: 0.85, fontSize: '0.9rem', fontWeight: 600 }}
                                      >
                                        Sending...
                                      </Box>
                                    </Stack>
                                  ) : (
                                    'Send Reset Link'
                                  )}
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

            {/* Improvement 6: footer — reduced opacity, centered */}
            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#b8bec9', letterSpacing: '0.01em' }}>
                © {new Date().getFullYear()} GyanMirai. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
