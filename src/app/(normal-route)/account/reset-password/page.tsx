'use client';

import type { Variants } from 'framer-motion';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Icon } from '@iconify/react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { motion, AnimatePresence } from 'framer-motion';
import { shikshaMitraToast } from 'src/components/toast';
import InputAdornment from '@mui/material/InputAdornment';
import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import { LogoWithText } from 'src/components/logo/logo-with-text';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useResetPasswordMutation,
  useVerifyPasswordResetTokenMutation,
} from 'src/redux/auth/authApi';

// Brand color constants
const BRAND_GREEN = '#2f8f68';
const BRAND_GREEN_DARK = '#1f7a57';

const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

function ResetPasswordSkeleton() {
  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Skeleton variant="circular" width={48} height={48} sx={{ borderRadius: '12px' }} />
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="90%" height={20} />
      <Skeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: '10px' }} />
      <Skeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: '10px' }} />
      <Skeleton variant="rounded" width="100%" height={50} sx={{ borderRadius: '12px' }} />
    </Stack>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('resetToken') || searchParams.get('token') || '';
  const tenantId =
    searchParams.get('tenantId') ||
    searchParams.get('__tenant') ||
    searchParams.get('tenant') ||
    '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [tokenChecked, setTokenChecked] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  const [verifyToken, { isLoading: isVerifying }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useVerifyPasswordResetTokenMutation,
  });

  const [resetPassword, { isLoading: isResetting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useResetPasswordMutation,
  });

  useEffect(() => {
    if (!userId || !token) {
      setTokenChecked(true);
      setIsValidToken(false);
      return;
    }

    const checkToken = async () => {
      try {
        const result = await verifyToken({
          body: { userId, resetToken: token },
          tenantId,
        }).unwrap();
        setIsValidToken(result);
      } catch (err) {
        setIsValidToken(false);
      } finally {
        setTokenChecked(true);
      }
    };

    checkToken();
  }, [userId, token, tenantId, verifyToken]);

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      try {
        await resetPassword({
          body: {
            userId,
            resetToken: token,
            password: values.password,
          },
          tenantId,
        }).unwrap();

        shikshaMitraToast.success({
          message: 'Password reset successful! Redirecting to login...',
        });

        formik.resetForm();

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('Failed to reset password:', error);
      }
    },
  });

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

  const logoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 280, damping: 18, delay: 0.1 },
    },
  };

  // --- Input style (matching LoginPage) ---
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
      '&:not(.MuiInputLabel-shrink)': { transform: 'translate(44px, 16px) scale(1)' },
      '&.Mui-focused': { color: BRAND_GREEN },
      '&.Mui-error': { color: '#ff4842' },
    },
    '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: '4px' },
  };

  const buttonStyle = {
    height: '50px',
    borderRadius: '12px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    backgroundColor: BRAND_GREEN,
    color: '#ffffff !important',
    border: 'none',
    boxShadow: 'none',
    transition: 'background-color 0.18s ease, transform 0.12s ease',
    '&:hover': {
      backgroundColor: BRAND_GREEN_DARK,
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'scale(0.98)' },
    '&.Mui-disabled': {
      backgroundColor: '#9ca3af !important',
      color: 'rgba(255,255,255,0.7) !important',
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

        <Box sx={{ position: 'relative', zIndex: 1 }}>
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

          <Box
            sx={{
              width: '40px',
              height: '2px',
              bgcolor: 'rgba(255,255,255,0.35)',
              borderRadius: '2px',
              mb: 4,
            }}
          />

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

          <Box
            sx={{
              width: '40px',
              height: '2px',
              bgcolor: 'rgba(255,255,255,0.35)',
              borderRadius: '2px',
              mb: 4,
            }}
          />

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

            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              <AnimatePresence mode="wait">
                {!tokenChecked || isVerifying ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ResetPasswordSkeleton />
                  </motion.div>
                ) : !isValidToken ? (
                  <motion.div
                    key="invalid"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 1.25,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255, 72, 66, 0.08)',
                          color: '#ff4842',
                          mb: 2,
                        }}
                      >
                        <Icon icon="ph:shield-warning-duotone" width={28} height={28} />
                      </Box>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '1.375rem', color: '#111827', mb: 0.75 }}
                      >
                        Invalid Password Link
                      </Typography>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Alert
                        severity="error"
                        sx={{
                          borderRadius: '12px',
                          mb: 3,
                          bgcolor: 'rgba(255, 72, 66, 0.06)',
                          border: '1px solid rgba(255, 72, 66, 0.18)',
                          '& .MuiAlert-icon': { color: '#ff4842' },
                        }}
                      >
                        Invalid or expired password reset link.
                      </Alert>
                      <Button
                        component={RouterLink}
                        href="/login"
                        fullWidth
                        type="button"
                        sx={buttonStyle}
                      >
                        Back to Login
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                  >
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
                        <Icon icon="ph:key-duotone" width={28} height={28} />
                      </Box>
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '1.375rem', color: '#111827', mb: 0.75 }}
                      >
                        Choose new password
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6b7280', mb: 3 }}>
                        Create a strong and secure password.
                      </Typography>
                    </motion.div>

                    <Box component="form" onSubmit={formik.handleSubmit}>
                      <Stack spacing={3}>
                        {/* New Password */}
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
                              label="New Password"
                              type={showPassword ? 'text' : 'password'}
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={formik.touched.password && Boolean(formik.errors.password)}
                              helperText={formik.touched.password && formik.errors.password}
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

                        {/* Confirm Password */}
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
                              id="confirmPassword"
                              name="confirmPassword"
                              label="Confirm Password"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={formik.values.confirmPassword}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                formik.touched.confirmPassword &&
                                Boolean(formik.errors.confirmPassword)
                              }
                              helperText={
                                formik.touched.confirmPassword && formik.errors.confirmPassword
                              }
                              sx={inputStyle}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                          showConfirmPassword
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

                        {/* Submit Button */}
                        <motion.div variants={itemVariants}>
                          <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={isResetting}
                            sx={buttonStyle}
                          >
                            {isResetting ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress
                                  size={16}
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                />
                                <Box
                                  component="span"
                                  sx={{ opacity: 0.85, fontSize: '0.9rem', fontWeight: 600 }}
                                >
                                  Resetting...
                                </Box>
                              </Stack>
                            ) : (
                              'Reset Password'
                            )}
                          </Button>
                        </motion.div>
                      </Stack>
                    </Box>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
