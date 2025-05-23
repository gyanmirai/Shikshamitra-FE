'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import visitorLogData from 'src/json/hostel/visitorManagement/visitorLogData.json';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VisitorForm from './logVisitorForm';
import VisitorLogTable from './logVisitorTable';

import type { IVisitorData } from './type';

const LogVisitor = () => {
  const addVisitorDialog = useBoolean();
  const markInDialog = useBoolean();
  const markOutDialog = useBoolean();
  const [selectedVisitor, setSelectedVisitor] = useState<IVisitorData | null>(null);
  const [open, setOpen] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [visitorData, setVisitorData] = useState<IVisitorData[]>(visitorLogData);

  const links = open
    ? [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Visitor Management', href: '/visitor/dashboard' },
        { name: 'Visitor Log', href: '' },
        { name: 'Visitor Form' },
      ]
    : [
        { name: 'Hostel Management', href: '/hostel/dashboard' },
        { name: 'Visitor Management', href: '/visitor/dashboard' },
        { name: 'Visitor Log', href: '' },
      ];

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedVisitor(null);
      addVisitorDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedVisitor(null);
      addVisitorDialog.onFalse();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Visitor Log"
        description={
          open
            ? 'Create or update visitor details, including name, contact information, and visit purpose. Manage visitor logs and make adjustments as needed.'
            : 'View and manage all visitors, including their details, entry/exit timings, and reasons for visits. Add new visitor entries or update existing ones.'
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
                    addVisitorDialog.onTrue();
                  }
            }
          >
            {open ? 'Back' : 'Log Visitor'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <VisitorForm
            open={addVisitorDialog}
            onClose={() => {
              handleClose(null, false);
            }}
            editData={selectedVisitor}
          />
        </Card>
      ) : (
        <VisitorLogTable
          onDelete={(data) => {
            setSelectedVisitor(data);
            deleteDialog.onTrue();
          }}
          onEdit={(data) => {
            setSelectedVisitor(data);
            setOpen(true);
          }}
          openDialog={open}
          onAddVisitor={addVisitorDialog}
          setOpenDialog={setOpen}
          editData={selectedVisitor}
          setEditData={setSelectedVisitor}
          data={visitorData}
          onMarkOut={(data) => {
            setSelectedVisitor(data);
            markOutDialog.onTrue();
          }}
          onMarkIn={(data) => {
            setSelectedVisitor(data);
            markInDialog.onTrue();
          }}
        />
      )}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedVisitor(null);
          deleteDialog.onFalse();
        }}
        title="Delete Visitor"
        content="Are you sure you want to delete this visitor entry?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
      <ConfirmDialog
        open={markInDialog.value}
        onClose={() => {
          setSelectedVisitor(null);
          markInDialog.onFalse();
        }}
        title="Mark In"
        content="Are you sure you want to mark this visitor as checked in?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Mark In
          </Button>
        }
      />
      <ConfirmDialog
        open={markOutDialog.value}
        onClose={() => {
          setSelectedVisitor(null);
          markOutDialog.onFalse();
        }}
        title="Mark Out"
        content="Are you sure you want to mark this visitor as checked out?"
        action={
          <Button variant="contained" onClick={() => {}}>
            Mark Out
          </Button>
        }
      />{' '}
    </Box>
  );
};

export default LogVisitor;
