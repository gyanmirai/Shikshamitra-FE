'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import React, { useState, useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions, academicPaths } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Paper, Stack, Button, Typography, IconButton } from '@mui/material';
import {
  gradeScalingApi,
  useGetGradeScalingsQuery,
  useDeleteGradeScalingMutation,
  useArchiveGradeScalingMutation,
  useRestoreGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import GradeForm from './gradeScaleForm';

import type { IGrade } from './type';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  const archiveDialog = useBoolean();

  const addGradeScalingDialog = useBoolean(false);

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

  // -------------------------------------------------------------------------
  // API
  // -------------------------------------------------------------------------

  const [deleteGradeScaling, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteGradeScalingMutation,
    params: { academicMediumId: (currentMedium as Medium)?.id },
  });
  const [archiveGradeScaling, { isLoading: isArchiveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveGradeScalingMutation,
  });
  const [restoreGradeScaling, { isLoading: isRestoreLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRestoreGradeScalingMutation,
  });
  const {
    data: gradeScalings,
    isLoading,
    isFetching,
    refetch: refetchGradeScalings,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: true },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  // -------------------------------------------------------------------------
  // Derived stats
  // -------------------------------------------------------------------------

  const scalesList = gradeScalings?.data || [];
  const totalScales = scalesList.length;
  const activeScales = scalesList.filter(
    (s: any) =>
      s.status === 0 || s.status === 'Active' || s.status === 2 || s.status === 'SystemDefault'
  ).length;
  const usedScales = scalesList.filter((s: any) => s.usageCount > 0).length;
  const unusedScales = scalesList.filter((s: any) => !s.usageCount || s.usageCount === 0).length;
  const defaultScale = scalesList.find((s: any) => s.isDefault)?.name || 'None';

  const summaryCards = useMemo(
    () => [
      {
        label: 'Total Scales',
        value: totalScales,
        icon: 'mdi:scale-balance',
        color: 'primary' as const,
      },
      {
        label: 'Active Scales',
        value: activeScales,
        icon: 'mdi:check-circle-outline',
        color: 'success' as const,
      },
      {
        label: 'Used Scales',
        value: usedScales,
        icon: 'mdi:database-check',
        color: 'info' as const,
      },
      {
        label: 'Unused Scales',
        value: unusedScales,
        icon: 'mdi:alert-circle-outline',
        color: 'warning' as const,
      },
      {
        label: 'Default Scale',
        value: defaultScale,
        icon: 'mdi:star-outline',
        color: 'info' as const,
      },
    ],
    [totalScales, activeScales, usedScales, unusedScales, defaultScale]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  /** Called by GradeForm after a successful save or when the user clicks Cancel. */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit) {
      // Successful save — clear dirty flag first, then close
      dispatch(setIsChanges(false));
    }
    addGradeScalingDialog.onFalse();
    viewDialog.onFalse();
    // Delay clearing selectedGrade so the dialog close animation can finish
    setTimeout(() => {
      setSelectedGrade(null);
    }, 200);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* ------------------------------------------------------------------- */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------- */}
      <CustomBreadcrumbs
        heading="Grade Scaling"
        description="Define and manage grade scales for assessments. Create, edit, or delete grade scales as needed."
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Examination' },
          { name: 'Settings' },
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

      {/* ------------------------------------------------------------------- */}
      {/* Summary cards                                                        */}
      {/* ------------------------------------------------------------------- */}
      <TimetableSettingsSummaryCards cards={summaryCards} />

      {/* ------------------------------------------------------------------- */}
      {/* Table                                                                */}
      {/* ------------------------------------------------------------------- */}
      <CustomizableTable
        tableId="gradesTable"
        isLoading={isLoading || isFetching}
        noDataText={
          <>
            No Grade Scaling Data Found{' '}
            {canAdd && (
              <Box
                component="span"
                onClick={addGradeScalingDialog.onTrue}
                color="primary.main"
                fontWeight={600}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Add Grade Scale
              </Box>
            )}
          </>
        }
        columns={[
          {
            id: 'name',
            label: 'Grade Scale Title',
            sticky: true,
            minWidth: 180,
          },
          {
            id: 'totalMarks',
            label: 'Total Marks',
            filterType: 'number',
          },
          {
            id: 'passMarks',
            label: 'Pass Marks',
            filterType: 'number',
            render: (val) =>
              val !== undefined && val !== null ? (
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  {val}
                </Typography>
              ) : (
                '-'
              ),
          },
          {
            id: 'gradeRange',
            label: 'Grade Range',
            isSort: false,
            filterType: 'string',
            render: (_value, row: any) => {
              const ranges = row.gradingScale || [];
              if (ranges.length === 0) return '-';
              const sorted = [...ranges].sort((a, b) => b.minMarks - a.minMarks);
              const highGrade = sorted[0]?.grade || '';
              const lowGrade = sorted[sorted.length - 1]?.grade || '';
              return highGrade && lowGrade ? `${highGrade} to ${lowGrade}` : '-';
            },
          },
          {
            id: 'usageCount',
            label: 'Usage Count',
            filterType: 'number',
            render: (val) => `${val || 0} exams`,
          },
          {
            id: 'status',
            label: 'Status',
            sticky: true,
            stickyPosition: 'right',
            minWidth: 120,
            filterType: 'enum',
            enumOptions: [
              { label: 'Active', value: 'Active' },
              { label: 'System Default', value: 'System Default' },
              { label: 'Archived', value: 'Archived' },
            ],
            render: (_value, row: any) => {
              const { label, color } = getStatusLabel(row.status);
              return <Label color={color as any}>{label}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            sticky: true,
            stickyPosition: 'right',
            minWidth: 50,
            width: 50,
            align: 'left',
            isFilter: false,
            render(value, row) {
              const scale = row as any;
              const isArchived = scale.status === 3 || scale.status === 'Archived';
              return (
                <Stack direction="row" spacing={1} justifyContent="center">
                  {isArchived ? (
                    <ArchiveActionButton
                      title="Restore grade scale"
                      icon="solar:restart-bold"
                      color="success"
                      disabled={!canAdd || isRestoreLoading}
                      onClick={async () => {
                        try {
                          await restoreGradeScaling({
                            academicMediumId: (currentMedium as any).id,
                            id: scale.id,
                          }).unwrap();
                          shikshaMitraToast.success({
                            message: 'Grade scale restored successfully.',
                          });
                        } catch (error: any) {
                          shikshaMitraToast.error({
                            message: error?.data?.message || 'Failed to restore grade scale.',
                          });
                        }
                      }}
                    />
                  ) : (
                    <>
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
                        disableDeleteIcon={(scale.usageCount || 0) > 0}
                        handleDeleteClick={() => {
                          setSelectedGrade(row as any);
                          deleteConfirmDialog.onTrue();
                        }}
                        handleEditClick={() => {
                          setSelectedGrade(row as any);
                          addGradeScalingDialog.onTrue();
                        }}
                      />
                      <ArchiveActionButton
                        title="Archive grade scale"
                        icon="solar:archive-bold"
                        color="warning"
                        disabled={!canDelete || isArchiveLoading}
                        onClick={() => {
                          setSelectedGrade(row as any);
                          archiveDialog.onTrue();
                        }}
                      />
                    </>
                  )}
                </Stack>
              );
            },
          },
        ]}
        data={scalesList}
      />

      {/* ------------------------------------------------------------------- */}
      {/* Add / Edit dialog                                                    */}
      {/* ------------------------------------------------------------------- */}
      <CustomDialog
        maxWidth="md"
        open={addGradeScalingDialog.value}
        handleClose={() => handleClose(null, false)}
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
        <GradeForm onSubmit={() => { }} onClose={handleClose} data={selectedGrade} />
      </CustomDialog>

      {/* ------------------------------------------------------------------- */}
      {/* View dialog                                                          */}
      {/* ------------------------------------------------------------------- */}
      <CustomDialog
        open={viewDialog.value}
        maxWidth="lg"
        handleClose={() => handleClose(null, false)}
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
        <GradeForm onSubmit={() => { }} onClose={handleClose} data={selectedGrade} viewOnly />
      </CustomDialog>

      {/* ------------------------------------------------------------------- */}
      {/* Delete confirmation                                                  */}
      {/* ------------------------------------------------------------------- */}
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
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={async () => {
              confirmWithUndo({
                item: selectedGrade,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    gradeScalingApi.util.updateQueryData(
                      'getGradeScalings',
                      {
                        academicMediumId: (currentMedium as any).id,
                        includeArchived: true,
                      },
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
          >
            Yes
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          setSelectedGrade(null);
          archiveDialog.onFalse();
        }}
        title="Archive Grade Scale"
        content={
          <>
            Archive <strong>&quot;{selectedGrade?.name}&quot;</strong>? It will not be available for
            future exams, but old results and schedules will remain unchanged.
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
                await archiveGradeScaling({
                  academicMediumId: (currentMedium as any).id,
                  id: (selectedGrade as any).id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Grade scale archived successfully.' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive grade scale.',
                });
              }
              archiveDialog.onFalse();
              setSelectedGrade(null);
            }}
          >
            Archive
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default GradingScale;

const ArchiveActionButton = ({
  title,
  icon,
  color,
  disabled = false,
  onClick,
}: {
  title: string;
  icon: string;
  color: 'success' | 'warning';
  disabled?: boolean;
  onClick: () => void;
}) => (
  <CustomTooltip title={title} arrow placement="top">
    <span>
      <IconButton
        size="small"
        color={color}
        disabled={disabled}
        aria-label={title}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        sx={{ width: 18, height: 18, p: 0 }}
      >
        <Iconify icon={icon} width={16} height={16} />
      </IconButton>
    </span>
  </CustomTooltip>
);
