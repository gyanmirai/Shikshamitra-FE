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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import SurveyTypeForm from './Components/SurveyTypeForm';
import SurveyTypeTable from './Components/SurveyTypeTable';

import type { ISurveyType } from './type';

const SurveyTypeCreation = () => {
  const deleteSurveyTypeDialog = useBoolean();
  const addSurveyTypeDialog = useBoolean();
  const [, setOpen] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedSurveyType, setSelectedSurveyType] = useState<ISurveyType | null>(null);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedSurveyType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addSurveyTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addSurveyTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedSurveyType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Survey Type"
        description="Manage survey types such as Feedback, Assessment, or Poll. Use actions to edit or delete existing types. Click ‘Add Survey Type’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Setting', href: '/communication/setting' },
          { name: 'Survey Type', href: '/communication/survey-type' },
        ]}
        action={
          <Button
            onClick={() => addSurveyTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Survey Type
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <SurveyTypeTable
        onDelete={(data) => {
          setSelectedSurveyType(data);
          deleteSurveyTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedSurveyType(data);
          addSurveyTypeDialog.onTrue();
        }}
        onAddSurveyType={addSurveyTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedSurveyType}
        data={[]}
      />

      <CustomDialog
        open={addSurveyTypeDialog.value}
        handleClose={() => {
          addSurveyTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedSurveyType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedSurveyType ? 'Update Survey Type' : 'Add Survey Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedSurveyType
                  ? 'Update the survey type details including name and description.'
                  : 'Create a new survey type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SurveyTypeForm
          open={addSurveyTypeDialog}
          onClose={handleClose}
          editData={selectedSurveyType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteSurveyTypeDialog.value}
        onClose={() => {
          setSelectedSurveyType(null);
          deleteSurveyTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete survey type{' '}
            <strong>{selectedSurveyType?.surveyType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteSurveyTypeDialog.onFalse();
              setSelectedSurveyType(null);
              shikshaMitraToast.success({
                message: `Survey Type ${selectedSurveyType?.surveyType} deleted successfully`,
              });
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

export default SurveyTypeCreation;
