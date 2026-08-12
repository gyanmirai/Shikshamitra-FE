'use client';

import type { IconButtonProps } from '@mui/material/IconButton';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import Drawer from '@mui/material/Drawer';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useSession } from 'next-auth/react';
import { useRouter } from 'src/routes/hooks';
import { useState, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import HrProfile from 'src/screens/hr/profile';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';
import { shikshaMitraToast } from 'src/components/toast';
import { convertBase64Format } from 'src/utils/base64Formate';
import ShakingTextField from 'src/components/shaking-text-field';
import { useChangePasswordMutation } from 'src/redux/user/userApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Button, MenuItem, TextField, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

const hasRole = (role: unknown, expectedRole: string) => {
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === expectedRole);
  }

  return String(role || '').toLowerCase() === expectedRole;
};

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const theme = useTheme();
  const profileDialog = useBoolean();
  const router = useRouter();

  // const router = useRouter();

  // const pathname = usePathname();

  const { employee } = useSelector((state: any) => state.auth);

  const session: any = useSession();
  const { data: user } = session;

  const { profile } = user;
  const isAdminUser = hasRole(profile?.role, 'admin');
  const isStudentUser = hasRole(profile?.role, 'student');
  const canUseSelfLeaveCenter = !isAdminUser && !isStudentUser;

  const [open, setOpen] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  // const dispatch = useDispatch();

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  // const handleClickItem = useCallback(
  //   (path: string) => {
  //     handleCloseDrawer();
  //     router.push(path);
  //   },
  //   [handleCloseDrawer, router]
  // );

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: convertBase64Format(employee?.profilePicture || ''), alt: '' },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.palette.primary.main} 100%)`,
        },
      }}
    >
      {employee?.shortName}
    </AnimateAvatar>
  );

  return (
    <>
      <AccountButton
        open={open}
        onClick={handleOpenDrawer}
        photoURL=""
        displayName=""
        sx={sx}
        {...other}
      />
      <CustomDialog
        title="Change Password"
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
      >
        <ChangedPasswordForm handleClose={() => setOpenDialog(false)} sessionData={{}} />
      </CustomDialog>

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        <Box sx={{ width: 320 }}>
          <IconButton
            onClick={handleCloseDrawer}
            sx={{ top: 12, right: 12, zIndex: 9, position: 'absolute' }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <Scrollbar>
          <Stack alignItems="center" sx={{ pt: 8 }}>
            {renderAvatar}
            <Label sx={{ mt: 1 }} color="primary">
              {profile?.role}
            </Label>
            <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
              {profile?.preferred_username || profile?.unique_name}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {profile?.email}
            </Typography>
          </Stack>

          {/* <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ p: 3 }}>
            {[...Array(3)].map((_, index) => (
              <Tooltip
                key={_mock.fullName(index + 1)}
                title={`Switch to: ${_mock.fullName(index + 1)}`}
              >
                <Avatar
                  alt={_mock.fullName(index + 1)}
                  src={_mock.image.avatar(index + 1)}
                  onClick={() => {}}
                />
              </Tooltip>
            ))}

            <Tooltip title="Add account">
              <IconButton
                sx={{
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
                }}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Tooltip>
          </Stack> */}

          <Stack
            sx={{
              py: 3,
              px: 2.5,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            {canUseSelfLeaveCenter &&
              [
                {
                  label: 'Leave Center',
                  icon: <Iconify icon="mdi:calendar-account" />,
                  info: null,
                  onClick: () => {
                    handleCloseDrawer();
                    router.push('/dashboard/my-leave');
                  },
                },
                {
                  label: 'Profile',
                  icon: <Iconify icon="mdi:user-box" />,
                  info: null,
                  onClick: () => {
                    profileDialog.onTrue();
                  },
                },
              ].map((option) => (
                // const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';

                // const rootHref = pathname.includes('/dashboard') ? '/' : dashboardPath;
                // sdadsadsad
                <MenuItem
                  key={option.label}
                  onClick={option.onClick}
                  sx={{
                    py: 1,
                    color: 'text.secondary',
                    '& svg': { width: 24, height: 24 },
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {option.icon}

                  <Box component="span" sx={{ ml: 2 }}>
                    {option.label}
                  </Box>

                  {option?.info && (
                    <Label color="error" sx={{ ml: 1 }}>
                      {option?.info}
                    </Label>
                  )}
                </MenuItem>
              ))}
          </Stack>

          {/* <Box sx={{ px: 2.5, py: 3 }}>
            <UpgradeBlock />
          </Box> */}
        </Scrollbar>

        <CustomDialog
          title="User Profile"
          open={profileDialog.value}
          handleClose={profileDialog.onFalse}
          maxWidth="lg"
        >
          <Scrollbar sx={{ p: 2 }}>
            <HrProfile />
          </Scrollbar>
        </CustomDialog>

        <Box sx={{ p: 2.5 }}>
          <Button sx={{ mb: 2 }} variant="contained" fullWidth onClick={() => setOpenDialog(true)}>
            Change Password
          </Button>
          <SignOutButton
            onClose={async () => {
              handleCloseDrawer();
            }}
          />
        </Box>
      </Drawer>
    </>
  );
}

const ChangedPasswordForm = ({ handleClose, sessionData }: any) => {
  const [changePassword, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useChangePasswordMutation,
  });

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Old Password is required'),
      newPassword: Yup.string().required('New Password is required'),
      confirmPassword: Yup.string()
        .required('Confirm Password is required')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    }),
    onSubmit: async (values) => {
      try {
        await changePassword({
          data: {
            currentPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
          token: sessionData?.accessToken,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Password changed successfully' });
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <>
      <DialogScrollContent>
        <ShakingTextField error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}>
          <TextField
            fullWidth
            size="small"
            name="oldPassword"
            label="Old Password *"
            type="password"
            value={formik.values.oldPassword}
            onChange={formik.handleChange}
            error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
            helperText={formik.touched.oldPassword && formik.errors.oldPassword}
            sx={{ mb: 3 }}
          />
        </ShakingTextField>
        <ShakingTextField error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}>
          <TextField
            fullWidth
            size="small"
            name="newPassword"
            label="New Password *"
            type="password"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            sx={{ mb: 3 }}
          />
        </ShakingTextField>
        <ShakingTextField
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        >
          <TextField
            fullWidth
            size="small"
            name="confirmPassword"
            label="Confirm Password *"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            sx={{ mb: 3 }}
          />
        </ShakingTextField>
      </DialogScrollContent>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          size="small"
          onClick={() => handleClose()}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          onClick={(e: any) => formik.handleSubmit(e)}
          loading={isLoading}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
