'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { alpha } from '@mui/material/styles';
import CustomDialog from 'src/components/customDialog';
import { Box, Grid, Button, Typography, Paper, Stack } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  gradeScalingApi,
  useGetGradeScalingsQuery,
  useDeleteGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import GradeForm from './gradeScaleForm';

import type { IGrade } from './type';

const getStatusLabel = (status: any) => {
  if (status === 0 || status === 'Active') return { label: 'Active', color: 'success' };
  if (status === 1 || status === 'Inactive') return { label: 'Inactive', color: 'error' };
  if (status === 2 || status === 'SystemDefault') return { label: 'System Default', color: 'info' };
  if (status === 3 || status === 'Archived') return { label: 'Archived', color: 'warning' };
  return { label: 'Unknown', color: 'default' };
};

const GradingScale = () => {
  // State for storing currently selected grade
  const [selectedGrade, setSelectedGrade] = useState<IGrade | null>(null);
  // Dialog control for viewing grade details
  const viewDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteConfirmDialog = useBoolean();

  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const { confirmWithUndo } = useConfirmWithUndo();

  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.settings.gradeScaling}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.settings.gradeScaling}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.settings.gradeScaling}.Delete`
  );

  const addGradeScalingDialog = useBoolean(false);
  const [deleteGradeScaling, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteGradeScalingMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
  });
  const {
    data: gradeScalings,
    isLoading,
    isFetching,
    refetch: refetchGradeScalings,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const scalesList = gradeScalings?.data || [];
  const totalScales = scalesList.length;
  const activeScales = scalesList.filter(
    (s: any) =>
      s.status === 0 || s.status === 'Active' || s.status === 2 || s.status === 'SystemDefault'
  ).length;
  const usedScales = scalesList.filter((s: any) => s.usageCount > 0).length;
  const unusedScales = scalesList.filter((s: any) => !s.usageCount || s.usageCount === 0).length;
  const defaultScale = scalesList.find((s: any) => s.isDefault)?.name || 'None';

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedGrade(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust this if your dialog animation is different
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      setTimeout(() => {
        setSelectedGrade(null);
      }, 200);
    }
  };

  /**
   * Handles form submission
   * @param values - Form values to be processed
   */
  const handleSubmit = (values: any) => {};

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Grade Scaling"
        description="Define and manage grade scales for assessments. Create, edit, or delete grade scales as needed."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },

          { name: 'Examination ' },
          {
            name: 'Settings',
          },
          { name: 'Grade Scaling' },
        ]}
        action={
          canAdd ? (
            <Button
              sx={{ width: '160px' }}
              startIcon={<Iconify icon="mdi:plus" />}
              variant="contained"
              onClick={addGradeScalingDialog.onTrue}
              size="small"
            >
              Grade Scale
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
            md: 'repeat(auto-fit, minmax(160px, 1fr))',
          },
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: 'Total Scales', value: totalScales, color: 'text.primary' },
          { label: 'Active Scales', value: activeScales, color: 'success.main' },
          { label: 'Used Scales', value: usedScales, color: 'info.main' },
          { label: 'Unused Scales', value: unusedScales, color: 'warning.main' },
          { label: 'Default Scale', value: defaultScale, color: 'secondary.main' },
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
        tableId="gradesTable"
        isLoading={isLoading || isFetching}
        noDataText={
          <>
            No Grade Scaling Data Found{' '}
            <Box
              onClick={() => {
                addGradeScalingDialog.onTrue();
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
              Add Grade Scale
            </Box>
          </>
        }
        columns={[
          { id: 'name', label: 'Grade Scale Title' },
          { id: 'totalMarks', label: 'Total Marks', filterType: 'number' },
          {
            id: 'passMarks',
            label: 'Pass Marks',
            filterType: 'number',
            render: (val) => val ?? '-',
          },
          {
            id: 'gradeRange',
            label: 'Grade Range',
            isSort: false,
            isFilter: false,
            render: (value, row: any) => {
              const ranges = row.gradingScale || [];
              if (ranges.length === 0) return '-';
              const sorted = [...ranges].sort((a, b) => b.minMarks - a.minMarks);
              const highGrade = sorted[0]?.grade || '';
              const lowGrade = sorted[sorted.length - 1]?.grade || '';
              return highGrade && lowGrade ? `${highGrade} to ${lowGrade}` : '-';
            },
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
            sticky: true,
            minWidth: 50,
            width: 50,
            align: 'left',
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon={canView}
                  handleViewClick={() => {
                    viewDialog.onTrue();
                    setSelectedGrade(row as any);
                  }}
                  showEditIcon={canAdd}
                  showDeleteIcon={canDelete}
                  handleDeleteClick={() => {
                    setSelectedGrade(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedGrade(row as any);
                    addGradeScalingDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={gradeScalings?.data || []}
      />

      <CustomDialog
        maxWidth="sm"
        open={addGradeScalingDialog.value}
        handleClose={() => {
          addGradeScalingDialog.onFalse();
          setTimeout(() => {
            setSelectedGrade(null);
          }, 200); // Adjust this delay if your dialog animation takes more/less time
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedGrade ? 'Update Grade Scale' : 'Add Grade Scale'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedGrade
                  ? 'Modify grade ranges, total marks, and grading parameters as needed.'
                  : 'You can create a new grade scale by defining grade ranges, total marks and other grading parameters.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <GradeForm onSubmit={handleSubmit} onClose={handleClose} data={selectedGrade} />{' '}
      </CustomDialog>

      <CustomDialog
        open={viewDialog.value}
        maxWidth="sm"
        handleClose={() => {
          viewDialog.onFalse();
          setTimeout(() => {
            setSelectedGrade(null);
          }, 200); // Match dialog close animation duration
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Grade Scale</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="View grade scales, ranges, total marks, and grading criteria in one place."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <GradeForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          data={selectedGrade}
          viewOnly
        />{' '}
      </CustomDialog>

      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={() => {
          setSelectedGrade(null);
          deleteConfirmDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete grade scale{' '}
            <strong>&quot;{selectedGrade?.name}&quot;</strong>?
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
                item: selectedGrade,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    gradeScalingApi.util.updateQueryData(
                      'getGradeScalings',
                      { academicMediumId: (currentMedium as any).id },
                      (draft: any) => {
                        const index = draft.data.findIndex(
                          (item: any) => item.id === (selectedGrade as any).id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) draft.data.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: () => refetchGradeScalings(),
                onCommit: () =>
                  deleteGradeScaling({
                    academicMediumId: (currentMedium as any).id,
                    id: (selectedGrade as any).id,
                  }).unwrap(),
              });
              deleteConfirmDialog.onFalse();
              setSelectedGrade(null);
            }}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default GradingScale;
