'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { electiveGroupsApi } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';
import { useElectiveSubjectSetting } from './hooks/useElectiveSubjectSetting';

const ElectiveSubjectSetting = () => {
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
    confirmWithUndo,
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
          <Button
            sx={{ width: '160px' }}
            startIcon={<Add />}
            onClick={addElectiveGroupDialog.onTrue}
            variant="contained"
            size="small"
          >
            Elective Group
          </Button>
        }
      />

      <ElectiveSubjectTable
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
            onClick={() => {
              confirmWithUndo({
                item: selected,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    electiveGroupsApi.util.updateQueryData(
                      'getElectiveGroups',
                      { academicMediumId: (currentMedium as any)?.id },
                      (draft: any) => {
                        const index = draft.findIndex((item: any) => item.id === selected?.id);
                        setDeleteIndex(index);
                        if (index !== -1) draft.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    electiveGroupsApi.util.updateQueryData(
                      'getElectiveGroups',
                      { academicMediumId: (currentMedium as any)?.id },
                      (draft: any) => {
                        if (!draft) return;
                        draft.splice(index, 0, selected);
                      }
                    )
                  ),
                onCommit: () =>
                  deleteElectiveGroup({
                    academicMediumId: (currentMedium as any)?.id,
                    id: (selected as any)?.id,
                  }),
              });
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
