'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Alert, Button, TextField } from '@mui/material';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetElectiveGroupUsageQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';
import ElectiveGroupUsageDrawer from './components/ElectiveGroupUsageDrawer';
import { useElectiveSubjectSetting } from './hooks/useElectiveSubjectSetting';

const ElectiveSubjectSetting = () => {
  const insightsDrawer = useBoolean();
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.electiveGroupCreation}.Delete`
  );
  const [archiveReason, setArchiveReason] = useState('');

  const {
    deleteDialog,
    discardConfirmation,
    open,
    setOpen,
    addElectiveGroupDialog,
    archiveDialog,
    usageDrawer,
    isDeleteLoading,
    isArchiveLoading,
    currentMedium,
    selected,
    setSelected,
    handleClose,
    deleteElectiveGroup,
    archiveElectiveGroup,
    restoreElectiveGroup,
  } = useElectiveSubjectSetting();

  const { data: usageData, isFetching: isUsageFetching } = useGetElectiveGroupUsageQuery(
    {
      academicMediumId: (currentMedium as any)?.id,
      id: selected?.id,
    },
    { skip: !(currentMedium as any)?.id || !selected?.id || !usageDrawer.value }
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Elective Group Creation"
        description="Manage reusable elective subject groups used during class-wise subject allocation."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Elective Group Creation' },
        ]}
        action={
          (canView || canAdd) && (
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
              {canView && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
                  onClick={insightsDrawer.onTrue}
                >
                  View full insights
                </Button>
              )}
              {canAdd && (
                <Button
                  sx={{ width: '160px' }}
                  startIcon={<Add />}
                  aria-label="Add Elective Group"
                  onClick={() => {
                    setSelected(null);
                    addElectiveGroupDialog.onTrue();
                  }}
                  variant="contained"
                  size="small"
                >
                  Elective Group
                </Button>
              )}
            </Box>
          )
        }
      />

      <ElectiveSubjectTable
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        insightsOpen={insightsDrawer.value}
        onCloseInsights={insightsDrawer.onFalse}
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
        }}
        onArchive={(data) => {
          setSelected(data);
          setArchiveReason('');
          archiveDialog.onTrue();
        }}
        onRestore={async (data) => {
          try {
            await restoreElectiveGroup({
              academicMediumId: (currentMedium as any)?.id,
              id: data.id,
            }).unwrap();
            shikshaMitraToast.success({ message: 'Elective group restored successfully.' });
          } catch (error: any) {
            shikshaMitraToast.error({
              message: error?.data?.message || 'Failed to restore elective group.',
            });
          }
        }}
        onViewUsage={(data) => {
          setSelected(data);
          usageDrawer.onTrue();
        }}
        onEdit={(data) => {
          setSelected(data);
          addElectiveGroupDialog.onTrue();
        }}
        open={open}
        onAddElective={addElectiveGroupDialog}
        setOpenDialog={setOpen}
        editData={selected}
        setEditData={setSelected}
        data={[]}
      />

      {discardConfirmation}
      <ElectiveGroupUsageDrawer
        open={usageDrawer.value}
        onClose={() => {
          usageDrawer.onFalse();
          setSelected(null);
        }}
        selectedGroup={selected}
        usageData={usageData}
        isLoading={isUsageFetching}
        canArchive={canAdd}
        onArchive={(data) => {
          setSelected(data);
          archiveDialog.onTrue();
        }}
      />

      <CustomDialog
        open={addElectiveGroupDialog.value}
        handleClose={() => handleClose(null)}
        guardUnsavedChanges={false}
        formProps={{ noValidate: true }}
        title={selected ? 'Update Elective Group' : 'Add Elective Group'}
        titleInfo={
          selected
            ? 'Update the group details. Subject selection is locked after the group is used in academic records.'
            : 'Create an elective group by entering its name, subjects, and color.'
        }
      >
        <SettingElectiveSubjectForm
          open={addElectiveGroupDialog}
          onClose={handleClose}
          editData={selected}
        />
      </CustomDialog>

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          setSelected(null);
          archiveDialog.onFalse();
        }}
        title="Archive Elective Group"
        content={
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Archived groups will not be available for new class allocations but will remain
              visible in old academic records.
            </Alert>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason for archiving"
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
            />
          </Box>
        }
        action={
          <LoadingButton
            loading={isArchiveLoading}
            variant="contained"
            color="warning"
            size="small"
            onClick={async () => {
              try {
                await archiveElectiveGroup({
                  academicMediumId: (currentMedium as any)?.id,
                  id: selected?.id,
                  body: { reason: archiveReason },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Elective group archived successfully.' });
                archiveDialog.onFalse();
                setSelected(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive elective group.',
                });
              }
            }}
          >
            Archive
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelected(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            {selected?.canDelete ? (
              <>
                Are you sure you want to delete elective group <strong>{selected?.name}</strong>?
              </>
            ) : (
              <>
                <strong>{selected?.name}</strong> cannot be deleted because it is already used. You
                can archive this group instead.
              </>
            )}
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            disabled={!selected?.canDelete}
            onClick={async () => {
              try {
                await deleteElectiveGroup({
                  academicMediumId: (currentMedium as any)?.id,
                  id: (selected as any)?.id,
                }).unwrap();
                shikshaMitraToast.success({
                  message: 'Elective subject group deleted successfully',
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete elective subject group.',
                });
              }
              deleteDialog.onFalse();
              setSelected(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ElectiveSubjectSetting;
