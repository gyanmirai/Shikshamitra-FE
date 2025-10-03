'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetLibraryChargesQuery } from 'src/redux/library/charges-management/charges-get-api';

import AssignChargesForm from './Components/AssignChargesForm';
import LibraryChargesTable from './Components/ChargedManagementTable';
import CollectChargesForm from './Components/AssignChargeProcessForm';
import CollectChargesView from './Components/AssignViewChargeDetails';

import type { ILibraryChargeData } from './Components/type';

const LibraryChargesManagement = () => {
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState<ILibraryChargeData | null>(null);

  // Dialog states
  const addDialog = useBoolean();
  const deleteDialog = useBoolean();
  const viewDialog = useBoolean();
  const collectDialog = useBoolean();

  //   Fetch charges
  const { data: chargesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryChargesQuery,
  });

  // Redux confirm state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handle closing dialog with unsaved changes check
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      collectDialog.onFalse();
      addDialog.onFalse();
      setSelectedRecord(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      collectDialog.onFalse();
      addDialog.onFalse();
      setSelectedRecord(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Charges Management"
        description={
          addDialog.value
            ? 'Add new charge or update existing charge details.'
            : 'Manage charges for library members.'
        }
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Charges', href: '/library/charges' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Assign Charge
          </Button>
        }
        sx={{ px: 1 }}
      />

      {/* Dialog for Add/Edit */}
      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedRecord ? 'Update Charge' : 'Assign Charge'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedRecord
                  ? 'Update charge details such as category, amount, or status.'
                  : 'Fill details to add a new charge.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignChargesForm open={addDialog.value} onClose={handleClose} editData={selectedRecord} />
      </CustomDialog>

      <CustomDialog
        open={collectDialog.value}
        handleClose={() => {
          collectDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{selectedRecord ? 'Collect Charge' : 'Add Charge'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedRecord
                  ? 'Update charge details such as category, amount, or status.'
                  : 'Fill details to add a new charge.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CollectChargesForm open={collectDialog} onClose={handleClose} charge={selectedRecord} />
      </CustomDialog>

      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Charge Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed information about this charge"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CollectChargesView charge={selectedRecord} />
      </CustomDialog>

      {/* Table */}
      <LibraryChargesTable
        data={chargesData}
        addChargesDialog={addDialog}
        onEditCharge={(data) => {
          setSelectedRecord(data);
          addDialog.onTrue();
        }}
        onCollectCharges={(data) => {
          collectDialog.onTrue();
          setSelectedRecord(data);
        }}
        onViewCharges={(data) => {
          viewDialog.onTrue();
          setSelectedRecord(data);
        }}
        onDeleteCharge={(data) => {
          setSelectedRecord(data);
          deleteDialog.onTrue();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => {
            setSelectedRecord(null);
          }, 200);
        }}
        title="Delete Charge"
        content={
          <>
            Are you sure you want to delete the <strong>{selectedRecord?.chargeCategory}</strong>{' '}
            charge For <strong>{selectedRecord?.memberName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              // Handle delete action here
              shikshaMitraToast.success({
                message: (
                  <>
                    The <strong>{selectedRecord?.chargeCategory}</strong> Charge for{' '}
                    <strong>{selectedRecord?.memberName}</strong> was deleted successfully
                  </>
                ),
              });
              deleteDialog.onFalse();
              setSelectedRecord(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default LibraryChargesManagement;
