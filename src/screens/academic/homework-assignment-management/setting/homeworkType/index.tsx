import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import HomeworkTypeForm from './homeworkTypeForm';
import HomeworkTypeTable from './homeworkTypeTable';

import type { IHomeworkType } from './type';

const HomeworkTypeCreation = ({ addHomeworkTypeDialog }: any) => {
  // Dialog control for add/Update Homework Type
  // const addHomeworkTypeDialog = useBoolean();

  // Dialog control for delete confirmation
  const deleteDialog = useBoolean();

  // Modal open/close state
  const [open, setOpen] = useState(false);

  // Track unsaved changes from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Currently selected homework type for edit/delete
  const [selectedData, setSelectedData] = useState<IHomeworkType | null>(null);

  // Table data state containing list of homework types
  const [tableData, setTableData] = useState<IHomeworkType[]>([]);

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Handles closing of the add/edit dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedData(null);
      addHomeworkTypeDialog.onFalse();
    } else if (!isChanges) {
      setOpen(false);
      setSelectedData(null);
      addHomeworkTypeDialog.onFalse();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={addHomeworkTypeDialog.onTrue}
          startIcon={<Add />}
          size="small"
          sx={{
            width: '147px',
          }}
        >
          Homework Type
        </Button>
      </Box> */}

      <HomeworkTypeTable
        data={tableData}
        onEdit={(data) => {
          setSelectedData(data);
          addHomeworkTypeDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedData(data);
          deleteDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addHomeworkTypeDialog.value}
        handleClose={() => {
          addHomeworkTypeDialog.onFalse();
          setSelectedData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedData ? 'Update Homework Type' : 'Add Homework Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedData
                  ? 'You can update the homework type details including name and other information'
                  : 'You can create a new homework type by entering the name and other required details'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <HomeworkTypeForm
          open={addHomeworkTypeDialog}
          onClose={() => handleClose(null, false)}
          editData={selectedData}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedData(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete Homework Type{' '}
            <strong>{selectedData?.homeworkTypeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            size="small"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {
              deleteDialog.onFalse();
              shikshaMitraToast.success({
                message: `Homeowork Type : ${selectedData?.homeworkTypeName} deleted successfullly`,
              });

              setSelectedData(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default HomeworkTypeCreation;
