'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Paper, Stack, Button, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import examTypeTableData from 'src/json/academic/examination/examTypeTableData.json';
import {
  examinationTypeApi,
  useGetExaminationTypesQuery,
  useDeleteExaminationTypeMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';

import ExamTypeForm from './examTypeForm';

import type { IExamType } from '../type';

const getStatusLabel = (status: any) => {
  if (status === 0 || status === 'Active') return { label: 'Active', color: 'success' };
  if (status === 1 || status === 'Inactive') return { label: 'Inactive', color: 'error' };
  if (status === 2 || status === 'SystemDefault') return { label: 'System Default', color: 'info' };
  if (status === 3 || status === 'Archived') return { label: 'Archived', color: 'warning' };
  return { label: 'Unknown', color: 'default' };
};

const ExamTypeSettings = () => {
  // Dialog state for managing the create/edit exam type form.
  // const dialog = useBoolean();
  // State for storing and managing the exam type table data.
  const [examTypeTable, setExamTypeTable] = useState<IExamType[]>(
    examTypeTableData.map((item) => ({
      ...item,
      id: String(item.id),
      status: item.status === 'Publish' ? 0 : 1,
      includedInResult: true,
      marksEntryRequired: true,
      gradeScaleRequired: true,
      allowPracticalOral: false,
    }))
  );
  const addExamTypeDialog = useBoolean(false);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.settings.examTypes}.Add`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.settings.examTypes}.Delete`
  );

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

  // Statistics calculations
  const examTypeList = examTypeData?.items || [];
  const totalTypes = examTypeList.length;
  const activeTypes = examTypeList.filter(
    (t: any) =>
      t.status === 0 || t.status === 'Active' || t.status === 2 || t.status === 'SystemDefault'
  ).length;
  const usedTypes = examTypeList.filter((t: any) => t.usageCount > 0).length;
  const includedInResult = examTypeList.filter((t: any) => t.includedInResult).length;

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
          canAdd ? (
            <Button
              sx={{ width: '160px' }}
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={addExamTypeDialog.onTrue}
              variant="contained"
              size="small"
            >
              Exam Types
            </Button>
          ) : null
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, minmax(0, 1fr))',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(auto-fit, minmax(170px, 1fr))',
          },
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: 'Total Exam Types', value: totalTypes, color: 'text.primary' },
          { label: 'Active Types', value: activeTypes, color: 'success.main' },
          { label: 'Used Types', value: usedTypes, color: 'info.main' },
          { label: 'Included in Result', value: includedInResult, color: 'secondary.main' },
        ].map((card) => (
          <Paper
            key={card.label}
            variant="outlined"
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.04)
                  : theme.palette.background.paper,
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.12)
                  : theme.palette.divider,
              minWidth: 0,
            }}
          >
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h6" sx={{ color: card.color, lineHeight: 1.1 }}>
                {card.value}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Box>

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
          { id: 'category', label: 'Category', render: (val) => val || '-' },
          {
            id: 'defaultTotalMarks',
            label: 'Default Marks',
            filterType: 'number',
            render: (val) => val ?? '-',
          },
          {
            id: 'defaultWeightage',
            label: 'Weightage',
            filterType: 'number',
            render: (val) => (val !== null && val !== undefined ? `${val}%` : '-'),
          },
          {
            id: 'includedInResult',
            label: 'Result Impact',
            render: (val) =>
              val ? (
                <Label color="success">Included</Label>
              ) : (
                <Label color="default">Optional</Label>
              ),
          },
          {
            id: 'status',
            label: 'Status',
            render: (value, row: any) => {
              const { label, color } = getStatusLabel(row.status);
              return <Label color={color as any}>{label}</Label>;
            },
          },
          {
            id: 'usageCount',
            label: 'Usage Count',
            filterType: 'number',
            render: (val) => `${val || 0} exams`,
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            align: 'left',
            minWidth: 50,
            width: 50,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showThreeDots={false}
                  showEditIcon={canAdd}
                  showDeleteIcon={canDelete}
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
        data={examTypeData?.items || []}
      />

      <CustomDialog
        maxWidth="sm"
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
          confirmDeleteDialog.onFalse();
          setTimeout(() => {
            setSelectedExamType(null);
          }, 200);
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
                        const index = draft.items.findIndex(
                          (item: any) => item.id === (selectedExamType as any).id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) draft.items.splice(index, 1);
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
              setTimeout(() => {
                setSelectedExamType(null);
              }, 200);
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
