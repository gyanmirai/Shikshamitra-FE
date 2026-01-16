'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import examTypeTableData from 'src/json/academic/examination/examTypeTableData.json';
import {
  examinationTypeApi,
  useGetExaminationTypesQuery,
  useDeleteExaminationTypeMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';

import ExamTypeForm from './examTypeForm';

import type { IExamType } from '../type';

const ExamTypeSettings = () => {
  // Dialog state for managing the create/edit exam type form.
  // const dialog = useBoolean();
  // State for storing and managing the exam type table data.
  const [examTypeTable, setExamTypeTable] = useState<IExamType[]>(examTypeTableData);
  const addExamTypeDialog = useBoolean(false);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: examTypeData,
    isLoading,
    isFetching,
    refetch: refetchExamTypes,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });
  const [deleteExamType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExaminationTypeMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
  });
  // Dialog state for confirming the deletion of an exam type.
  const confirmDeleteDialog = useBoolean();
  // Redux state indicating if there are unsaved changes.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { confirmWithUndo } = useConfirmWithUndo();
  // Redux dispatch function for dispatching actions.
  const dispatch = useDispatch();
  // State for tracking whether the form is in edit mode.
  const [isEdit, setIsEdit] = useState(false);
  // State for storing the currently selected exam type for editing or other actions.
  const [selectedExamType, setSelectedExamType] = useState<IExamType | null>(null);

  // Function to handle form submission for creating or editing an exam type.
  const handleSubmit = (values: any) => {
    if (isEdit && selectedExamType) {
      // Update the existing exam type in the table.
      setExamTypeTable(
        examTypeTable.map((examType) => (examType.id === values.id ? values : examType))
      );
    } else {
      // Add the new exam type to the table.
      setExamTypeTable([...examTypeTable, values]);
    }
    // Close the dialog after submission.
    addExamTypeDialog.onFalse();
    // Reset the edit state.
    setIsEdit(false);
    // Clear the selected exam type.
    setSelectedExamType(null);
  };

  // Function to handle closing of the dialog
  const handleClose = (e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
        setIsEdit(false);
        setSelectedExamType(null);
      }, 200); // Adjust this delay based on your dialog's closing animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addExamTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addExamTypeDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Exam Types "
        description="Manage the different types of exams conducted in your institution. Add, edit, or delete exam types as needed."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          {
            name: 'Settings',
          },
          { name: 'Exam Types' },
        ]}
        action={
          <Button
            sx={{ width: '160px' }}
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={addExamTypeDialog.onTrue}
            variant="contained"
            size="small"
          >
            Exam Types
          </Button>
        }
        sx={{ mb: 2 }}
      />
      <CustomizableTable
        tableId="examTypeTable"
        isLoading={isLoading || isFetching}
        noDataText={
          <>
            No Exam Type Data Found{' '}
            <Box
              onClick={() => {
                addExamTypeDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Exam Type
            </Box>
          </>
        }
        columns={[
          { id: 'examType', label: 'Exam Types' },
          { id: 'description', label: 'Description' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            align: 'left',
            minWidth: 50,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    confirmDeleteDialog.onTrue();
                    setSelectedExamType(row as IExamType);
                  }}
                  handleEditClick={() => {
                    addExamTypeDialog.onTrue();
                    setSelectedExamType(row as IExamType);
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={examTypeData?.data || []}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedExamType ? 'Update Exam Type' : 'Add Exam Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedExamType
                  ? 'You can update the exam type details including name and other information.'
                  : 'You can create a new exam type by entering the required details.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={addExamTypeDialog.value}
        handleClose={() => {
          addExamTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedExamType(null);
          }, 200); // Adjust the delay if needed to match the dialog's close animation
        }}
      >
        <ExamTypeForm
          onClose={handleClose}
          data={selectedExamType}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      </CustomDialog>

      <ConfirmDialog
        open={confirmDeleteDialog.value}
        onClose={() => {
          setSelectedExamType(null);
          confirmDeleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete exam type{' '}
            <strong>&quot;{selectedExamType?.examType}&quot;</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedExamType,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    examinationTypeApi.util.updateQueryData(
                      'getExaminationTypes',
                      { academicMediumId: (currentMedium as any).id },
                      (draft: any) => {
                        const index = draft.data.findIndex(
                          (item: any) => item.id === (selectedExamType as any).id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) draft.data.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: () => refetchExamTypes(),
                onCommit: () =>
                  deleteExamType({
                    academicMediumId: (currentMedium as any).id,
                    id: (selectedExamType as any).id,
                  }).unwrap(),
              });
              confirmDeleteDialog.onFalse();
              setSelectedExamType(null);
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ExamTypeSettings;
