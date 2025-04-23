'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import hostelTableData from 'src/json/hostel/hostelConfiguration/hostelTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';

import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HostelForm from './components/hostelForm';
import HostelTable from './components/hostelTable';
import AddRoomForm from './components/addRoomForm';

import type { IHostelData } from './components/type';

const HostelConfiguration = () => {
  // State for managing the visibility of the add new hostel dialog.
  const addNewHostelDialog = useBoolean();
  // State for storing the selected hostel data for editing or deleting.
  const [selectedHostel, setSelectedHostel] = useState<IHostelData | null>(null);
  // State for managing the visibility of the hostel form.
  const [open, setOpen] = useState(false);
  // Selector for retrieving the 'isChanges' state from the Redux store.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State for managing the visibility of the delete confirmation dialog.
  const deleteDialog = useBoolean();
  const addRoomDialog = useBoolean();

  // Redux dispatch function for dispatching actions.
  const dispatch = useDispatch();
  // State for storing the hostel data.
  const [hostelData, setHostelData] = useState<IHostelData[]>(hostelTableData);
  // Dynamically generated links for the breadcrumbs based on the 'open' state.
  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Hostel Configuration', href: '' },
        { name: 'Add Hostel' },
        { name: 'Hostel Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Hostel Configuration', href: '' },
      ];

  // Handler function for closing the hostel form, optionally handling form submission and changes.
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      addRoomDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedHostel(null);
    } else if (!isChanges) {
      setOpen(false);
      addRoomDialog.onFalse();
      setSelectedHostel(null);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Hostel Management"
        description={
          open
            ? 'Create or update hostel details, including hostel name, contact information, and address. Manage hostel configurations and make adjustments as needed.'
            : 'View and manage all hostels, including their details, contact information, and addresses. Add new hostels, update existing ones, or remove them as necessary.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleClose(null, false)
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Hostel'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <HostelForm
            open={addNewHostelDialog}
            onClose={() => {
              handleClose(null, false);
            }}
            editData={selectedHostel}
          />
        </Card>
      ) : (
        <HostelTable
          onDelete={(data) => {
            setSelectedHostel(data);
            deleteDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedHostel(data);
            setOpen(true);
          }}
          openDialog={open}
          setOpenDialog={setOpen}
          editData={selectedHostel}
          setEditData={setSelectedHostel}
          data={hostelData}
          onAddRoomDialog={addRoomDialog}
          onAddRoom={(data) => {
            addRoomDialog.onTrue();
            setSelectedHostel(data);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedHostel(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Delete
          </Button>
        }
      />

      <CustomDialog
        title="Room Configuration"
        open={addRoomDialog.value}
        handleClose={() => {
          addRoomDialog.onFalse();
        }}
        maxWidth="md"
      >
        <AddRoomForm
          open={addRoomDialog}
          onClose={() => {
            handleClose(null, false);
          }}
        />
      </CustomDialog>

    </Box>
  );
};

export default HostelConfiguration;
