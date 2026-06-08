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
import { subjectsApi } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import SettingSubjectForm from './subjectForm';
import SubjectAddDrawer from './subjectAddDrawer';
import SettingSubjectTable from './settingSubjectTable';
import { useSubjectCreation } from './hooks/useSubjectCreation';

const SubjectCreation = () => {
  const {
    deleteSubjectDialog,
    open,
    setOpen,
    addSubjectDialog,
    drawerOpen,
    isDeleteLoading,
    currentMedium,
    selectedSubject,
    setSelectedSubject,
    confirmWithUndo,
    deleteSubject,
    handleClose,
  } = useSubjectCreation();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Subject Creation"
        description="Create and manage subjects for your curriculum. Add, edit, or delete subjects as needed."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Subject Creation' },
        ]}
        action={
          <Button
            sx={{ px: '32px' }}
            startIcon={<Add />}
            variant="contained"
            onClick={drawerOpen.onTrue}
            size="small"
          >
            Subject
          </Button>
        }
      />

      <SettingSubjectTable
        onDelete={(data) => {
          setSelectedSubject(data);
          deleteSubjectDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedSubject(data);
          addSubjectDialog.onTrue();
        }}
        open={open}
        setOpenDialog={setOpen}
        setEditData={setSelectedSubject}
        onOpenDrawer={drawerOpen.onTrue}
      />

      <SubjectAddDrawer open={drawerOpen.value} onClose={drawerOpen.onFalse} />

      <CustomDialog
        open={addSubjectDialog.value && selectedSubject !== null}
        handleClose={() => {
          addSubjectDialog.onFalse();
          setTimeout(() => {
            setSelectedSubject(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Subject</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can update the subject details including name and color."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <SettingSubjectForm
          open={addSubjectDialog}
          onClose={handleClose}
          editData={selectedSubject}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteSubjectDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          deleteSubjectDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete subject{' '}
            <strong>&quot;{selectedSubject?.name}&quot;</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              let deletedItemIndex = -1;
              confirmWithUndo({
                item: selectedSubject,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    subjectsApi.util.updateQueryData(
                      'getCoreSubjectsByMedium',
                      { academicMediumId: (currentMedium as any).id },
                      (draft: any) => {
                        const index = draft.findIndex(
                          (item: any) => item.id === (selectedSubject as any).id
                        );
                        deletedItemIndex = index;
                        setDeleteIndex(index);
                        if (index !== -1) draft.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    subjectsApi.util.updateQueryData(
                      'getCoreSubjectsByMedium',
                      { academicMediumId: (currentMedium as any).id },
                      (draft: any) => {
                        if (!draft) return;
                        const restoreIndex = deletedItemIndex !== -1 ? deletedItemIndex : index;
                        draft.splice(restoreIndex, 0, selectedSubject);
                      }
                    )
                  ),
                onCommit: () =>
                  deleteSubject({
                    academicMediumId: (currentMedium as any).id,
                    id: (selectedSubject as any).id,
                  }),
              });
              deleteSubjectDialog.onFalse();
              setSelectedSubject(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default SubjectCreation;
