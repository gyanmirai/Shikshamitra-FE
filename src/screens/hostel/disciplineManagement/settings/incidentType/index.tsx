'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import IncidentTypeForm from './incidentTypeForm';

import type { IIncidentType } from './type';

const IncidentTypeSetting = (props: TabComponentType) => {
  const dialog = useBoolean();
  const dialogForDeleteConfirmation = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IIncidentType | null>(null);

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
          Incident Type
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Incident Type Found{' '}
            <Box
              onClick={() => {
                setOpen(true);
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
            >
              Add Incident Type
            </Box>
          </>
        }
        tableId="incident-type-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'incidentTypeName', label: 'Incident Type' },
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
                  setSelectedEntry(row as IIncidentType);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            incidentTypeName: 'Bullying',
            description: 'Involves physical or emotional harm to another student.',
          },
          {
            incidentTypeName: 'Vandalism',
            description: 'Damage to school property.',
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
        title={selectedEntry ? 'Edit Incident Type' : 'Add Incident Type'}
      >
        <IncidentTypeForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>

      <Box pb="20px" />
    </>
  );
};

export default IncidentTypeSetting;
