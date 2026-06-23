'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';
import { useElectiveSubjectSetting } from './hooks/useElectiveSubjectSetting';

const ElectiveSubjectSetting = () => {
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

  const {
    deleteDialog,
    open,
    setOpen,
    addElectiveGroupDialog,
    isDeleteLoading,
    currentMedium,
    selected,
    setSelected,
    handleClose,
    deleteElectiveGroup,
  } = useElectiveSubjectSetting();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Elective Group Creation"
        description="Create and manage elective subject groups for your curriculum. Add, edit, or delete groups as needed."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Elective Group Creation' },
        ]}
        action={
          canAdd && (
            <Button
              sx={{ width: '160px' }}
              startIcon={<Add />}
              onClick={addElectiveGroupDialog.onTrue}
              variant="contained"
              size="small"
            >
              Elective Group
            </Button>
          )
        }
      />

      <ElectiveSubjectTable
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        onDelete={(data) => {
          setSelected(data);
          deleteDialog.onTrue();
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

      <CustomDialog
        open={addElectiveGroupDialog.value}
        handleClose={() => {
          addElectiveGroupDialog.onFalse();
          setTimeout(() => {
            setSelected(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selected ? 'Update Elective Group' : 'Add Elective Group'}
            </Typography>
            <CustomTooltip
              arrow
              sx={{ textAlign: 'justify' }}
              placement="right"
              title={
                selected
                  ? 'You can update the elective group details by entering group name, subjects and color.'
                  : 'You can create a new elective group details by entering the group name, subjects and color.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SettingElectiveSubjectForm
          open={addElectiveGroupDialog}
          onClose={handleClose}
          editData={selected}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelected(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete elective subject <strong>{selected?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
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
