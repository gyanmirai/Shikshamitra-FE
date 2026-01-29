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
import { useGetImportanceLevelOptionsQuery } from 'src/redux/communication/setting/importanceLevel';

import ImportanceLevelForm from './Components/ImportanceLevelForm';
import ImportanceLevelTable from './Components/ImportanceLevelTable';

import type { IImportanceLevel } from './type';

const ImportanceLevelCreation = () => {
  const { data: importanceData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetImportanceLevelOptionsQuery,
  });
  const deleteImportanceLevelDialog = useBoolean();
  const addImportanceLevelDialog = useBoolean();
  const [selectedImportanceLevel, setSelectedImportanceLevel] = useState<IImportanceLevel | null>(
    null
  );

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedImportanceLevel(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addImportanceLevelDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addImportanceLevelDialog.onFalse();
      setTimeout(() => {
        setSelectedImportanceLevel(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Importance Level"
        description="Manage importance levels for events or notifications. Use actions to edit or delete existing levels. Click ‘Add Importance Level’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Settings', href: '/communication/setting' },
          { name: 'Importance Level', href: '/communication/importance-level' },
        ]}
        action={
          <Button
            onClick={() => addImportanceLevelDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Importance Level
          </Button>
        }
        sx={{ px: 1 }}
      />

      <ImportanceLevelTable
        data={importanceData} // Replace with actual API data
        onAddImportanceLevel={addImportanceLevelDialog}
        setOpenDialog={() => {}}
        setEditData={setSelectedImportanceLevel}
        onEdit={(data) => {
          setSelectedImportanceLevel(data);
          addImportanceLevelDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedImportanceLevel(data);
          deleteImportanceLevelDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addImportanceLevelDialog.value}
        handleClose={() => {
          addImportanceLevelDialog.onFalse();
          setTimeout(() => setSelectedImportanceLevel(null), 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedImportanceLevel ? 'Update Importance Level' : 'Add Importance Level'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedImportanceLevel
                  ? 'Update the importance level details including name and description.'
                  : 'Create a new importance level by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ImportanceLevelForm
          open={addImportanceLevelDialog}
          onClose={handleClose}
          editData={selectedImportanceLevel}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteImportanceLevelDialog.value}
        onClose={() => {
          setSelectedImportanceLevel(null);
          deleteImportanceLevelDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete importance level{' '}
            <strong>{selectedImportanceLevel?.levelName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteImportanceLevelDialog.onFalse();
              shikshaMitraToast.success({
                message: `Importance Level : ${selectedImportanceLevel?.levelName} deleted successfully`,
              });
              setSelectedImportanceLevel(null);
              // handle delete API call here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default ImportanceLevelCreation;
