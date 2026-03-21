'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import LeaveTypeForm from './leaveTypeForm';

import type { ILeaveType } from './type';

const LeaveTypeSetting = (props: TabComponentType) => {
  const dialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ILeaveType | null>(null);

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const handleClose = (_e?: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      setSelectedEntry(null);
      dialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedEntry(null);
      dialog.onFalse();
    }
  };

  return (
    <>
      <Box gap={3} display="flex" justifyContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            dialog.onTrue();
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          Leave Type
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Leave Type Found{' '}
            <Box
              onClick={() => {
                setOpen(true);
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
            >
              Add Leave Type
            </Box>
          </>
        }
        tableId="leave-type-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'leaveTypeName', label: 'Leave Type' },
          {
            id: 'backgroundColor',
            label: 'Color',
            render: (value) => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  backgroundColor: value,
                  border: '1px solid #ccc',
                }}
              />
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,
            align: 'right',
            minWidth: 40,
            render: (_value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                showDeleteIcon
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                }}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as ILeaveType);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            leaveTypeName: 'Sick Leave',
            backgroundColor: '#FFB74D',
          },
          {
            leaveTypeName: 'Casual Leave',
            backgroundColor: '#4DB6AC',
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setSelectedEntry(null);
        }}
        title={selectedEntry ? 'Edit Leave Type' : 'Add Leave Type'}
      >
        <LeaveTypeForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>

      <Box pb="20px" />
    </>
  );
};

export default LeaveTypeSetting;
