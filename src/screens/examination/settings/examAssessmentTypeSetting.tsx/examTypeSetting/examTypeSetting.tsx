'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { academicPermissions } from 'src/constants/academic-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import examTypeTableData from 'src/json/academic/examination/examTypeTableData.json';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import {
  examinationTypeApi,
  useGetExaminationTypesQuery,
  useDeleteExaminationTypeMutation,
  useArchiveExaminationTypeMutation,
  useRestoreExaminationTypeMutation,
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
    }))
  );
  const addExamTypeDialog = useBoolean(false);
  const archiveDialog = useBoolean(false);
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
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: true },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });
  const [deleteExamType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExaminationTypeMutation,
  });
  const [archiveExamType, { isLoading: isArchiveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveExaminationTypeMutation,
  });
  const [restoreExamType, { isLoading: isRestoreLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRestoreExaminationTypeMutation,
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
  const examTypeList = useMemo(() => examTypeData?.items || [], [examTypeData?.items]);
  const totalTypes = examTypeList.length;
  const activeTypes = examTypeList.filter(
    (t: any) =>
      t.status === 0 || t.status === 'Active' || t.status === 2 || t.status === 'SystemDefault'
  ).length;
  const usedTypes = examTypeList.filter((t: any) => t.usageCount > 0).length;

  const existingNames = useMemo(
    () => new Set<string>(examTypeList.map((t: any) => t.examType.trim().toLowerCase())),
    [examTypeList]
  );

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
  const handleClose = (e?: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
        setIsEdit(false);
        setSelectedExamType(null);
      }, 200); // Adjust this delay based on your dialog's closing animation
    };

    addExamTypeDialog.onFalse();
    resetState();
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

      <TimetableSettingsSummaryCards
        cards={[
          {
            label: 'Total Exam Types',
            value: totalTypes,
            icon: 'solar:documents-bold-duotone',
            color: 'primary',
          },
          {
            label: 'Active Types',
            value: activeTypes,
            icon: 'solar:check-circle-bold-duotone',
            color: 'success',
          },
          {
            label: 'Used Types',
            value: usedTypes,
            icon: 'solar:chart-square-bold-duotone',
            color: 'info',
          },
        ]}
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
          {
            id: 'examType',
            label: 'Exam Types',
            filterType: 'string',
            sticky: true,
            stickyPosition: 'left',
            minWidth: 150,
          },
          {
            id: 'description',
            label: 'Description',
            filterType: 'string',
            minWidth: 200,
          },
          {
            id: 'category',
            label: 'Category',
            filterType: 'string',
            minWidth: 130,
            render: (val) => val || '-',
          },
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
            render: (val) => (val && val !== '-' ? `${val}%` : '-'),
          },
          {
            id: 'usageCount',
            label: 'Usage Count',
            filterType: 'number',
            minWidth: 120,
            render: (val) => `${val || 0} exams`,
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: [
              { label: 'Active', value: 'Active' },
              { label: 'System Default', value: 'System Default' },
              { label: 'Archived', value: 'Archived' },
            ],
            minWidth: 120,
            sticky: true,
            stickyPosition: 'right',
            render: (value, row: any) => {
              const { label, color } = getStatusLabel(row.status);
              return <Label color={color as any}>{label}</Label>;
            },
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
            stickyPosition: 'right',
            render(value, row) {
              const examType = row as any;
              const isArchived = examType.status === 3 || examType.status === 'Archived';
              const actions = isArchived
                ? [
                    {
                      id: 'restore',
                      label: 'Restore exam type',
                      icon: 'solar:restart-bold',
                      color: 'success.main',
                      disabled: !canAdd || isRestoreLoading,
                      onClick: async () => {
                        try {
                          await restoreExamType({
                            academicMediumId: (currentMedium as any).id,
                            id: examType.id,
                          }).unwrap();
                          shikshaMitraToast.success({
                            message: 'Exam type restored successfully.',
                          });
                        } catch (error: any) {
                          shikshaMitraToast.error({
                            message: error?.data?.message || 'Failed to restore exam type.',
                          });
                        }
                      },
                    },
                  ]
                : [
                    ...(canAdd
                      ? [
                          {
                            id: 'edit',
                            label: 'Edit exam type',
                            icon: 'solar:pen-bold',
                            onClick: () => {
                              addExamTypeDialog.onTrue();
                              setSelectedExamType(row as IExamType);
                              setIsEdit(true);
                            },
                          },
                        ]
                      : []),
                    ...(canDelete
                      ? [
                          {
                            id: 'delete',
                            label: 'Delete exam type',
                            icon: 'solar:trash-bin-trash-bold',
                            color: 'error.main',
                            disabled: (examType.usageCount || 0) > 0,
                            tooltip:
                              (examType.usageCount || 0) > 0
                                ? 'This exam type is in use and cannot be deleted.'
                                : undefined,
                            onClick: () => {
                              confirmDeleteDialog.onTrue();
                              setSelectedExamType(row as IExamType);
                            },
                          },
                        ]
                      : []),
                    {
                      id: 'archive',
                      label: 'Archive exam type',
                      icon: 'solar:archive-bold',
                      color: 'warning.main',
                      disabled: !canDelete || isArchiveLoading,
                      onClick: () => {
                        archiveDialog.onTrue();
                        setSelectedExamType(row as IExamType);
                      },
                    },
                  ];

              return <AdaptiveThreeDotsActions actions={actions} placement="right-top" />;
            },
          },
        ]}
        data={examTypeList}
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
          isEdit={isEdit}
          data={selectedExamType}
          onClose={handleClose}
          onSubmit={handleSubmit}
          existingNames={existingNames}
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
                      {
                        academicMediumId: (currentMedium as any).id,
                        includeArchived: true,
                      },
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

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          archiveDialog.onFalse();
          setSelectedExamType(null);
        }}
        title="Archive Exam Type"
        content={
          <>
            Archive <strong>&quot;{selectedExamType?.examType}&quot;</strong>? It will not be
            available for future exams, but old records will remain unchanged.
          </>
        }
        action={
          <LoadingButton
            loading={isArchiveLoading}
            variant="contained"
            color="warning"
            size="small"
            onClick={async () => {
              try {
                await archiveExamType({
                  academicMediumId: (currentMedium as any).id,
                  id: (selectedExamType as any).id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Exam type archived successfully.' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive exam type.',
                });
              }
              archiveDialog.onFalse();
              setSelectedExamType(null);
            }}
          >
            Archive
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ExamTypeSettings;
