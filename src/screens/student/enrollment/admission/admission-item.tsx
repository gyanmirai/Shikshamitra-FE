import type { Transform } from '@dnd-kit/utilities';
import type { IKanbanTask } from 'src/types/kanban';
import type { StackProps } from '@mui/material/Stack';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';

import { useFormik } from 'formik';
import { memo, useState, useEffect, forwardRef } from 'react';

import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Box, Avatar, Button, MenuList, MenuItem, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha, stylesMode } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { kanbanClasses } from 'src/sections/kanban/classes';

import RegisterForm from '../register/RegisterForm';

// ----------------------------------------------------------------------

export const StyledItemWrap = styled(ListItem)(() => ({
  '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
  transform:
    'translate3d(var(--translate-x, 0), var(--translate-y, 0), 0) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1))',
  transformOrigin: '0 0',
  touchAction: 'manipulation',
  [`&.${kanbanClasses.state.fadeIn}`]: { animation: 'fadeIn 500ms ease' },
  [`&.${kanbanClasses.state.dragOverlay}`]: { zIndex: 999 },
}));

export const StyledItem = styled(Stack)(({ theme }) => ({
  width: '100%',
  cursor: 'grab',
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  transformOrigin: '50% 50%',
  touchAction: 'manipulation',
  boxShadow: theme.customShadows.z1,
  borderRadius: 'var(--item-radius)',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: theme.vars.palette.common.white,
  transition: theme.transitions.create(['box-shadow']),
  [stylesMode.dark]: { backgroundColor: theme.vars.palette.grey[900] },
  [`&.${kanbanClasses.state.disabled}`]: {},
  [`&.${kanbanClasses.state.sorting}`]: {},
  [`&.${kanbanClasses.state.dragOverlay}`]: {
    backdropFilter: `blur(6px)`,
    boxShadow: theme.customShadows.z20,
    backgroundColor: varAlpha(theme.vars.palette.common.whiteChannel, 0.48),
    [stylesMode.dark]: { backgroundColor: varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
  },
  [`&.${kanbanClasses.state.dragging}`]: { opacity: 0.2, filter: 'grayscale(1)' },
}));

// ----------------------------------------------------------------------

type ItemBaseProps = StackProps & {
  task: IKanbanTask;
  stateProps?: {
    fadeIn?: boolean;
    sorting?: boolean;
    disabled?: boolean;
    dragging?: boolean;
    dragOverlay?: boolean;
    transition?: string | null;
    transform?: Transform | null;
    listeners?: DraggableSyntheticListeners;
  };
};

const AdmissionItem = forwardRef<HTMLLIElement, ItemBaseProps>(
  ({ task, stateProps, sx, ...other }, ref) => {
    const divisionDialog = useBoolean();
    const [open, setOpen] = useState(false);
    useEffect(() => {
      if (!stateProps?.dragOverlay) {
        return;
      }

      document.body.style.cursor = 'grabbing';

      // eslint-disable-next-line consistent-return
      return () => {
        document.body.style.cursor = '';
      };
    }, [stateProps?.dragOverlay]);

    const itemWrapClassName = kanbanClasses.itemWrap.concat(
      (stateProps?.fadeIn && ` ${kanbanClasses.state.fadeIn}`) ||
        (stateProps?.dragOverlay && ` ${kanbanClasses.state.dragOverlay}`) ||
        ''
    );

    const itemClassName = kanbanClasses.item.concat(
      (stateProps?.dragging && ` ${kanbanClasses.state.dragging}`) ||
        (stateProps?.disabled && ` ${kanbanClasses.state.disabled}`) ||
        (stateProps?.sorting && ` ${kanbanClasses.state.sorting}`) ||
        (stateProps?.dragOverlay && ` ${kanbanClasses.state.dragOverlay}`) ||
        ''
    );

    return (
      <>
        <StyledItemWrap
          ref={ref}
          disablePadding
          className={itemWrapClassName}
          sx={{
            ...(!!stateProps?.transition && { transition: stateProps.transition }),
            ...(!!stateProps?.transform && {
              '--translate-x': `${Math.round(stateProps.transform.x)}px`,
              '--translate-y': `${Math.round(stateProps.transform.y)}px`,
              '--scale-x': `${stateProps.transform.scaleX}`,
              '--scale-y': `${stateProps.transform.scaleY}`,
            }),
          }}
        >
          <StyledItem
            className={itemClassName}
            data-cypress="draggable-item"
            sx={sx}
            tabIndex={0}
            {...stateProps?.listeners}
            {...other}
          >
            {task.status === 'approved' && (
              <Box
                sx={{
                  color: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.5,
                  fontSize: 12,
                }}
              >
                <Iconify
                  icon="material-symbols:warning-outline-rounded"
                  sx={{ height: '20px', width: '20px', color: 'warning.main', mr: 1 }}
                />
                Please assign division
              </Box>
            )}
            <ThreeDotsActions
              sx={{ position: 'absolute', right: 0, top: 1 }}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      setOpen(true);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                    Edit
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      divisionDialog.onTrue();
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="fluent-mdl2:assign" sx={{ height: '16px', width: '16px' }} />
                    Assign Division
                  </MenuItem>
                </MenuList>
              )}
            />
            <Stack spacing={2} direction="row" sx={{ px: 2, py: 2.5, position: 'relative' }}>
              <Avatar />
              <Box>
                <Typography variant="subtitle2">{task.name}</Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  Class 5
                </Typography>
                <Typography variant="subtitle2" fontWeight={400}>
                  Submission Date 01-01-2025
                </Typography>
              </Box>
            </Stack>
          </StyledItem>
        </StyledItemWrap>
        <CustomDialog
          maxWidth="xl"
          open={open}
          handleClose={() => setOpen(false)}
          title="Registration"
        >
          <RegisterForm />
        </CustomDialog>
        <CustomDialog
          open={divisionDialog.value}
          handleClose={divisionDialog.onFalse}
          title="Assign Division"
        >
          <AssignDivisionForm handleClose={divisionDialog.onFalse} />
        </CustomDialog>
      </>
    );
  }
);

export default memo(AdmissionItem);

const AssignDivisionForm = ({ handleClose }: { handleClose: () => void }) => {
  const formik = useFormik({
    initialValues: {
      division: '',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Box sx={{ p: 2, bgcolor: 'Background.neutral' }}>
        <CustomSelect
          options={[]}
          value=""
          onChange={() => {}}
          label="Division"
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      </Box>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" variant="contained">
          Assign
        </Button>
      </DialogActions>
    </Box>
  );
};
