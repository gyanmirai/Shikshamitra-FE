'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import DisciplineActionForm from './disciplineActionForm';

import type { IDisciplineAction } from './type';

const DisciplineActionSetting = (props: TabComponentType) => {
  // Dialog state for main form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  // State to manage form open/close
  const [, setOpen] = useState(false);
  // State to store selected discipline action entry
  const [selectedEntry, setSelectedEntry] = useState<IDisciplineAction | null>(null);

  const dispatch = useDispatch();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles closing of the discipline action form
   * @param _e - Event object (optional)
   * @param isSubmit - Boolean indicating if form was submitted
   */
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
          Discipline Action
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Discipline Action Found{' '}
            <Box
              onClick={() => {
                setOpen(true);
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
            >
              Add Discipline Action
            </Box>
          </>
        }
        tableId="discipline-action-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'disciplineActionName', label: 'Discipline Action' },
          { id: 'description', label: 'Description' },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,
            align: 'right',
            minWidth: 40,
            render: (value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                showDeleteIcon
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                }}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as IDisciplineAction);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            disciplineActionName: 'Warning Letter',
            description: 'Issued for minor infractions.',
          },
          {
            disciplineActionName: 'Suspension',
            description: 'Temporary removal from campus.',
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
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
        title={selectedEntry ? 'Edit Discipline Action' : 'Add Discipline Action'}
      >
        <DisciplineActionForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>

      <Box pb="20px" />
    </>
  );
};

export default DisciplineActionSetting;
