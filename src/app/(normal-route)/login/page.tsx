'use client';

import type { Variants } from 'framer-motion';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Icon } from '@iconify/react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { signIn } from 'next-auth/react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import useMediaQuery from '@mui/material/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import MobileLoginScreen from 'src/screens/login/login-screen';
import { LogoWithText } from 'src/components/logo/logo-with-text';

// --- Validation Schemas ---
const loginSchema = Yup.object({
  // organization: Yup.string().required('School code is required'),
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return isMobile ? <MobileLoginScreen /> : <DesktopLoginPage />;
}

function DesktopLoginPage() {
  const [tenantInactive, setTenantInactive] = useState(false);
  useEffect(() => {
    setTenantInactive(
      new URLSearchParams(window.location.search).get('reason') === 'tenant-inactive'
    );
  }, []);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordSent, setIsForgotPasswordSent] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const theme = useTheme();

  // --- Formik Hooks ---
  const loginFormik = useFormik({
    initialValues: { organization: '', email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setTenantInactive(false);
      try {
        const res = await signIn('credentials', {
          email: values.email,
          password: values.password,
          organizationName: values.organization,
          redirect: false,
        });
        if (res?.error) {
          const inactive = res.code === 'tenant-inactive';
          setTenantInactive(inactive);
          shikshaMitraToast.error({
            message: inactive
              ? 'This school is inactive. Contact the platform administrator.'
              : 'Invalid credentials',
          });
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
    initialValues: { email: '' },
    validationSchema: forgotPasswordSchema,
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 },
    },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 18 } },
  };

  const shakeVariants: Variants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  };

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 280, damping: 18, delay: 0.1 },
    },
  };

  // --- Input style (original — with icon space) ---
  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      backgroundColor: 'transparent',
      transition: 'all 0.15s ease',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1px',
        transition: 'border-color 0.15s ease',
      },
      '&:hover fieldset': { borderColor: '#d1d5db' },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: BRAND_GREEN, borderWidth: '1.5px' },
        boxShadow: '0 0 0 3px rgba(47,143,104,0.12)',
      },
      '&.Mui-error': {
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#ff4842' },
        '&.Mui-focused': {
          backgroundColor: '#ffffff',
          '& fieldset': { borderColor: '#ff4842', borderWidth: '1.5px' },
          boxShadow: 'none',
        },
      },
      '& input': {
        fontWeight: 400,
        fontSize: '0.9rem',
        color: '#111827',
        paddingLeft: '44px',
      },
      '& legend': {
        textTransform: 'uppercase',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.8125rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: '#9ca3af',
      backgroundColor: '#ffffff',
      padding: '0 4px',
      marginLeft: '-4px',
      zIndex: 1,
      '&:not(.MuiInputLabel-shrink)': { transform: 'translate(44px, 18px) scale(1)' },
      '&.Mui-focused': { color: BRAND_GREEN },
      '&.Mui-error': { color: '#ff4842' },
    },
    '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: '4px' },
  };

  // --- Sign In button (dark) ---
  const signInBtnStyle = {
    height: '50px',
    borderRadius: '12px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    backgroundColor: 'rgb(34 126 90) !important',
    color: '#ffffff !important',
    border: 'none',
    boxShadow: 'none',
    transition: 'background-color 0.18s ease, transform 0.12s ease',
    '&:hover': {
      backgroundColor: '#1f2937 !important',
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'scale(0.98)', backgroundColor: '#374151 !important' },
    '&.Mui-disabled': {
      backgroundColor: '#9ca3af !important',
      color: 'rgba(255,255,255,0.7) !important',
    },
  };

  const secondaryBtnStyle = {
    ...signInBtnStyle,
    backgroundColor: BRAND_GREEN,
    '&:hover': {
      backgroundColor: BRAND_GREEN_DARK,
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        bgcolor: '#ffffff',
      }}
    >
      {/* ===== LEFT BRANDING PANEL ===== */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: { md: '480px', lg: '600px' },
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(160deg, #144d36 0%, #1e6b4a 30%, #2f8f68 60%, #3aab7e 85%, #46bc8c 100%)',
          p: { md: 5, lg: 6 },
        }}
      >
        {/* Radial light + vignette overlay */}
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

        {/* SVG noise texture */}
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

        {/* Decorative blobs */}
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
          {/* Brand mark with ambient float */}
          <Box
            component={motion.div}
            animate={{ y: [0, -6, 0] }}
            // @ts-ignore
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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
              GyanMirai
            </Typography>
          </Box>

          {/* Heading */}
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
              mb: 4,
            }}
          />

          {/* Feature Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mb: 4,
            }}
          >
            {[
              { icon: 'ph:calendar-check-duotone', label: 'Attendance & Academics' },
              { icon: 'ph:currency-circle-dollar-duotone', label: 'Finance & Administration' },
              { icon: 'ph:chats-circle-duotone', label: 'Parent Communication' },
              { icon: 'ph:chart-line-up-duotone', label: 'Advanced Analytics' },
              { icon: 'ph:users-three-duotone', label: 'HR & Payroll' },
              { icon: 'ph:bus-duotone', label: 'Transport Management' },
            ].map((feature) => (
              <Box key={feature.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                      transform: 'scale(1.05)',
                    },
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
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {feature.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: '40px',
              height: '2px',
              bgcolor: 'rgba(255,255,255,0.35)',
              borderRadius: '2px',
              mb: 4,
            }}
          />

          {/* Security & Reliability */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // @ts-ignore
            transition={{ delay: 0.3, duration: 0.6 }}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '10px',
                  bgcolor: 'rgba(255,255,255,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                <Icon icon="ph:shield-star-duotone" width={24} style={{ color: '#fff' }} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}
                >
                  Enterprise-Grade Security
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.5,
                    mt: 0.75,
                  }}
                >
                  Your institute&apos;s data is protected with state-of-the-art encryption, ensuring
                  complete privacy and compliance.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Trust badge */}
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon
                icon="ph:shield-check-duotone"
                width={18}
                style={{ color: 'rgba(255,255,255,0.8)' }}
              />
            </Box>
            <Typography
              sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
            >
              Trusted by <span style={{ color: '#fff', fontWeight: 600 }}>500+</span> schools across
              India
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== RIGHT LOGIN PANEL ===== */}
      <Box
        data-mui-color-scheme="light"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 3, sm: 4, md: 6 },
          }}
        >
          {/* Inner max-width wrapper for the form */}
          <Box sx={{ width: '100%', maxWidth: '440px' }}>
            {/* Logo */}
            <Box
              component={motion.div}
              variants={logoVariants}
              initial="hidden"
              animate="visible"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              <Box sx={{ display: 'inline-flex', mb: 1 }}>
                <LogoWithText sx={{ width: '220px' }} disableLink />
              </Box>
            </Box>

            <motion.div
              initial="hidden"
              animate={shakeError ? 'shake' : 'visible'}
              variants={shakeError ? shakeVariants : containerVariants}
            >
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
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          color: '#111827',
                          mb: 0.5,
                          lineHeight: 1.3,
                        }}
                      >
                        Sign in to your account
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.875rem', fontWeight: 400, color: '#6b7280', mb: 3 }}
                      >
                        Enter your credentials to continue.
                      </Typography>
                    </motion.div>

                    <Box component="form" onSubmit={loginFormik.handleSubmit}>
                      {tenantInactive && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          This school is inactive. Contact the platform administrator.
                        </Alert>
                      )}
                      <Stack spacing={3}>
                        {/* Organization */}
                        <motion.div variants={itemVariants}>
                          <Box sx={{ position: 'relative' }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 16,
                                top: 28,
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
                                loginFormik.touched.organization && loginFormik.errors.organization
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
                                top: 28,
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
                              error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
                              helperText={
                                loginFormik.touched.email && loginFormik.errors.email
                                  ? loginFormik.errors.email
                                  : ' '
                              }
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
                                top: 28,
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
                                loginFormik.touched.password && Boolean(loginFormik.errors.password)
                              }
                              helperText={
                                loginFormik.touched.password && loginFormik.errors.password
                                  ? loginFormik.errors.password
                                  : ' '
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

                        {/* Remember me & Forgot Password */}
                        <motion.div variants={itemVariants}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                                  sx={{ fontSize: '0.8125rem', fontWeight: 400, color: '#6b7280' }}
                                >
                                  Remember me
                                </Typography>
                              }
                            />
                            <Link
                              component={RouterLink}
                              href="/forgot-password"
                              variant="body2"
                              underline="none"
                              sx={{
                                color: BRAND_GREEN,
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                transition: 'all 0.15s ease',
                                '&:hover': { textDecoration: 'underline', color: BRAND_GREEN_DARK },
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
                            sx={signInBtnStyle}
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
                  // --- Forgot Password View ---
                  <motion.div
                    key="forgot"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
                    {/* Back link */}
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
                        sx={{ fontWeight: 600, fontSize: '1.375rem', color: '#111827', mb: 0.75 }}
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
                        <Button fullWidth type="button" onClick={toggleView} sx={secondaryBtnStyle}>
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
                                  top: 28,
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
                                id="forgot-email"
                                name="email"
                                label="Email Address"
                                value={forgotFormik.values.email}
                                onChange={forgotFormik.handleChange}
                                onBlur={forgotFormik.handleBlur}
                                error={
                                  forgotFormik.touched.email && Boolean(forgotFormik.errors.email)
                                }
                                helperText={
                                  forgotFormik.touched.email && forgotFormik.errors.email
                                    ? forgotFormik.errors.email
                                    : ' '
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
                              sx={secondaryBtnStyle}
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
            </motion.div>

            {/* Privacy Policy footer */}
            <Box sx={{ mt: 2.5, textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#b8bec9',
                  letterSpacing: '0.01em',
                }}
              >
                © {new Date().getFullYear()} GyanMirai. All rights reserved.{' '}
                <Link
                  href="https://gyanmirai.in/privacy-policy"
                  target="_blank"
                  rel="noopener"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#94a3b8' : '#b8bec9',
                    textDecoration: 'underline',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
