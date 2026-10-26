import { useFormik } from 'formik';
import { Add } from '@mui/icons-material';
import React, { useCallback } from 'react';
import { MuiColorInput } from 'mui-color-input';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, MenuList, MenuItem, TextField, DialogActions } from '@mui/material';

const AttendanceType = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();

  useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();

            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            dialog.onTrue();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, dialog]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={dialog.onTrue}
          variant="contained"
          size="small"
        >
          Attendance Type
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Attendance Type Found{' '}
            <Box
              component="button"
              type="button"
              onClick={() => {
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                border: 0,
                p: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Attendance Type
            </Box>
          </>
        }
        tableId="attendance-type"
        columns={[
          { id: 'type', label: 'Type' },
          {
            id: 'color',
            label: 'Color',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: value,
                  }}
                />
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,

            render: (value, row) => (
              <ThreeDotsActions
                showEditIcon
                showDeleteIcon
                showThreeDots={false}
                handleDeleteClick={confirm.onTrue}
                handleEditClick={() => {
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          { id: 1, type: 'Present', color: '#4CAF50' },
          { id: 2, type: 'Absent', color: '#F44336' },
          { id: 3, type: 'Late', color: '#FFC107' },
          { id: 4, type: 'Half Day', color: '#FF9800' },
          { id: 5, type: 'Leave', color: '#9C27B0' },
        ]}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Attendance Type">
        <AttendanceTypeForm />
      </CustomDialog>
    </Box>
  );
};

export default AttendanceType;

const AttendanceTypeForm = () => {
  const { values, handleChange, setFieldValue } = useFormik({
    initialValues: {
      type: '',
      color: 'white',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form">
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Type"
            name="type"
            value={values.type}
            onChange={handleChange}
            size="small"
          />
          <MuiColorInput
            format="hex"
            value={values.color}
            onChange={(color) => setFieldValue('color', color)}
            fullWidth
            placeholder="color"
            label="Background Color"
            size="small"
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={() => {}}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
