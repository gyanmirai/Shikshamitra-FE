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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HostelForm from './components/hostelForm';
import HostelTable from './components/hostelTable';

import type { IHostelData } from './components/type';

const HostelConfiguration = () => {
  const addNewHostelDialog = useBoolean();
  const [selectedHostel, setSelectedHostel] = useState<IHostelData | null>(null);
  const [open, setOpen] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [hostelData, setHostelData] = useState<IHostelData[]>(hostelTableData);
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

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedHostel(null);
    } else if (!isChanges) {
      setOpen(false);
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
              setOpen(false);
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
        />
      )}
    </Box>
  );
};

export default HostelConfiguration;
