'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  electiveGroupsApi,
  useDeleteElectiveGroupMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import ElectiveSubjectTable from './components/electiveSubjectTable';
import SettingElectiveSubjectForm from './components/electiveSubjectForm';

import type { IElectiveSubject } from './type';

const ElectiveSubjectSetting = () => {
  // Dialog control hooks
  // Controls visibility of add/edit elective subject dialog
  // const addElectiveGroupDialog = useBoolean();
  // Controls visibility of delete confirmation dialog
  const deleteDialog = useBoolean();
  // Controls visibility of main dialog window
  const [open, setOpen] = useState(false);
  const addElectiveGroupDialog = useBoolean(false);

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const [deleteElectiveGroup, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteElectiveGroupMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  // Local state management
  const [selected, setSelected] = useState<IElectiveSubject | null>(null);

  /**
   * Handles dialog close with confirmation
   * @param _e - Event object
   * @param isSubmit - Flag indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelected(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay if your dialog animation is longer/shorter
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      addElectiveGroupDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      setOpen(false);
      addElectiveGroupDialog.onFalse();
      setTimeout(() => {
        setSelected(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* Separate breadcrumbs for Elective Group Creation */}
      <CustomBreadcrumbs
        heading="Elective Group Creation"
        description="Create and manage elective subject groups for your curriculum. Add, edit, or delete groups as needed."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          {
            name: 'Curriculum Management',
            href: '/academic/curriculumSubjects',
          },
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
          }, 200); // Adjust delay if your dialog has a different close animation duration
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
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ElectiveSubjectSetting;
