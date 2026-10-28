'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';
import { AcademicInsights } from 'src/screens/academic/components/academic-insights';
import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';
import {
  useAcademicSetupFormState,
  AcademicSetupManagerHeader as CustomBreadcrumbs,
} from 'src/screens/academic/setup/embedding';
import {
  gradeScalingApi,
  useGetGradeScalingsQuery,
  useDeleteGradeScalingMutation,
  useArchiveGradeScalingMutation,
  useRestoreGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import GradeForm from './gradeScaleForm';
import { GradeScaleRowActions } from './GradeScaleRowActions';
import GradeScaleDetailsDrawer from './gradeScaleDetailsDrawer';

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
  const restoreDialog = useBoolean();
  const insightsDrawer = useBoolean();

  const addGradeScalingDialog = useBoolean(false);
  const [formState, setFormState] = useState({ dirty: false, busy: false });
  const discardGuard = useAcademicDiscardGuard(
    addGradeScalingDialog.value && formState.dirty,
    formState.busy
  );

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
  useAcademicSetupFormState({
    dirty: addGradeScalingDialog.value && formState.dirty,
    busy: formState.busy || isDeleteLoading || isArchiveLoading || isRestoreLoading,
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
  const usedScales = scalesList.filter((s: any) => Number(s.usageCount ?? 0) > 0).length;
  const unusedScales = totalScales - usedScales;
  const defaultScale = scalesList.find((s: any) => s.isDefault)?.name || 'None';

  const insightMetrics = useMemo<AcademicInsightMetric[]>(
    () => [
      {
        id: 'total-scales',
        label: 'Total scales',
        value: totalScales,
        icon: 'mdi:scale-balance',
      },
      {
        id: 'active-scales',
        label: 'Active scales',
        value: activeScales,
        icon: 'mdi:check-circle-outline',
      },
      {
        id: 'used-scales',
        label: 'Used scales',
        value: usedScales,
        icon: 'mdi:database-check',
      },
      {
        id: 'unused-scales',
        label: 'Unused scales',
        value: unusedScales,
        icon: 'mdi:alert-circle-outline',
      },
      {
        id: 'default-scale',
        label: 'Default scale',
        value: defaultScale,
        icon: 'mdi:star-outline',
      },
    ],
    [totalScales, activeScales, usedScales, unusedScales, defaultScale]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  /** Called by GradeForm after a successful save or when the user clicks Cancel. */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const close = () => {
      dispatch(setIsChanges(false));
      addGradeScalingDialog.onFalse();
      viewDialog.onFalse();
      setSelectedGrade(null);
      setFormState({ dirty: false, busy: false });
    };
    if (isSubmit) close();
    else discardGuard.requestNavigation(close);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Box height="100%" minHeight={0} display="flex" flexDirection="column">
      {discardGuard.confirmation}
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
          <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
              onClick={insightsDrawer.onTrue}
              disabled={!(currentMedium as Medium)?.id}
            >
              View all insights
            </Button>
            {canAdd && (
              <Button
                sx={{ width: '160px' }}
                startIcon={<Iconify icon="mdi:plus" />}
                variant="contained"
                onClick={addGradeScalingDialog.onTrue}
                size="small"
              >
                Grade Scale
              </Button>
            )}
          </Box>
        }
      />

      {/* ------------------------------------------------------------------- */}
      {/* Table                                                                */}
      {/* ------------------------------------------------------------------- */}
      <CustomizableTable
        tableTitle="Grade Scales"
        tableId="gradesTable"
        isLoading={isLoading || isFetching}
        noDataText={
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            No Grade Scaling Data Found
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
          </Box>
        }
        columns={[
          {
            id: 'name',
            label: 'Grade Scale Title',
            sticky: true,
            minWidth: 180,
            render: (value: any, row: any) =>
              row?.isDefault ? (
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {value}
                  </Typography>
                  <Label
                    color="info"
                    startIcon={<Iconify icon="mdi:star" />}
                    sx={{ height: 20, fontSize: 11 }}
                  >
                    Default
                  </Label>
                </Stack>
              ) : (
                value
              ),
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
            minWidth: 176,
            width: 176,
            align: 'center',
            isFilter: false,
            render(value, row) {
              return (
                <GradeScaleRowActions
                  scale={row as IGrade}
                  canAdd={canAdd}
                  canDelete={canDelete}
                  isArchiveLoading={isArchiveLoading}
                  isRestoreLoading={isRestoreLoading}
                  onEdit={() => {
                    setSelectedGrade(row as IGrade);
                    addGradeScalingDialog.onTrue();
                  }}
                  onDelete={() => {
                    setSelectedGrade(row as IGrade);
                    deleteConfirmDialog.onTrue();
                  }}
                  onArchive={() => {
                    setSelectedGrade(row as IGrade);
                    archiveDialog.onTrue();
                  }}
                  onRestore={() => {
                    setSelectedGrade(row as IGrade);
                    restoreDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={scalesList}
        handleRowClick={
          canView
            ? (row) => {
                setSelectedGrade(row as IGrade);
                viewDialog.onTrue();
              }
            : undefined
        }
        rowProps={(row) => ({
          tabIndex: canView ? 0 : -1,
          'aria-label': canView ? `View grade scale ${row.name}` : undefined,
          onKeyDown: (event) => {
            if (
              canView &&
              event.target === event.currentTarget &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              setSelectedGrade(row as IGrade);
              viewDialog.onTrue();
            }
          },
          sx: {
            cursor: canView ? 'pointer' : 'default',
            '&:focus-visible': canView
              ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
              : undefined,
          },
        })}
      />

      <AcademicInsights
        title="Grade scaling insights"
        description="Grade scale status and usage for the selected academic medium."
        metrics={insightMetrics}
        chart={
          totalScales > 0
            ? {
                title: 'Grade scale usage',
                description: 'Number of grade scales used in exams and not yet used.',
                categories: ['Used', 'Unused'],
                values: [usedScales, unusedScales],
                seriesName: 'Grade scales',
              }
            : undefined
        }
        isLoading={isLoading || isFetching}
        open={insightsDrawer.value}
        onClose={insightsDrawer.onFalse}
        hideTrigger
      />

      {/* ------------------------------------------------------------------- */}
      {/* Add / Edit dialog                                                    */}
      {/* ------------------------------------------------------------------- */}
      <CustomDialog
        hasForm={false}
        maxWidth="md"
        open={addGradeScalingDialog.value}
        handleClose={() => handleClose(null, false)}
        guardUnsavedChanges={false}
        disableClose={formState.busy}
        title={selectedGrade ? 'Update Grade Scale' : 'Add Grade Scale'}
        titleInfo="Define grade ranges, total marks, and grading parameters."
      >
        <GradeForm
          onSubmit={() => {}}
          onClose={handleClose}
          data={selectedGrade}
          onStateChange={setFormState}
        />
      </CustomDialog>

      {/* ------------------------------------------------------------------- */}
      {/* View Details Drawer                                                 */}
      {/* ------------------------------------------------------------------- */}
      <GradeScaleDetailsDrawer
        open={viewDialog.value}
        onClose={() => {
          viewDialog.onFalse();
          setTimeout(() => setSelectedGrade(null), 200);
        }}
        gradeScale={selectedGrade}
        canEdit={canAdd}
        onEdit={() => {
          viewDialog.onFalse();
          addGradeScalingDialog.onTrue();
        }}
      />

      {/* ------------------------------------------------------------------- */}
      {/* Delete confirmation                                                  */}
      {/* ------------------------------------------------------------------- */}
      <ConfirmDialog
        open={deleteConfirmDialog.value}
        disableBackdropClick
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
        disableBackdropClick
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

      {/* ----------------------------------------------------------------- */}
      {/* Restore confirmation                                               */}
      {/* ----------------------------------------------------------------- */}
      <ConfirmDialog
        open={restoreDialog.value}
        disableBackdropClick
        onClose={() => {
          setSelectedGrade(null);
          restoreDialog.onFalse();
        }}
        title="Restore Grade Scale"
        content={
          <>
            Restore <strong>&quot;{selectedGrade?.name}&quot;</strong>? It will become available
            again for future exams.
          </>
        }
        action={
          <LoadingButton
            loading={isRestoreLoading}
            variant="contained"
            color="success"
            size="small"
            startIcon={<Iconify icon="solar:restart-bold" />}
            onClick={async () => {
              try {
                await restoreGradeScaling({
                  academicMediumId: (currentMedium as any).id,
                  id: (selectedGrade as any).id,
                }).unwrap();
                shikshaMitraToast.success({
                  message: 'Grade scale restored successfully.',
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to restore grade scale.',
                });
              }
              restoreDialog.onFalse();
              setSelectedGrade(null);
            }}
          >
            Restore
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default GradingScale;
