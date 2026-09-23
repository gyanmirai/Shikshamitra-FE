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
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Button, TextField, Typography } from '@mui/material';
import { useGetSubjectUsageQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import SettingSubjectForm from './subjectForm';
import SubjectUsageDrawer from './subjectUsageDrawer';
import SettingSubjectTable from './settingSubjectTable';
import { useSubjectCreation } from './hooks/useSubjectCreation';
import { BulkSubjectImportDialog } from './bulkImport/BulkSubjectImportDialog';

import type { ISubject } from './type';

const SubjectCreation = () => {
  const insightsDrawer = useBoolean();
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.settings.subjectsCreation}.Delete`
  );
  const [archiveReason, setArchiveReason] = useState('');

  const {
    deleteSubjectDialog,
    open,
    setOpen,
    addSubjectDialog,
    bulkImportDialog,
    usageDrawer,
    archiveDialog,
    isDeleteLoading,
    isArchiveLoading,
    isRestoreLoading,
    currentMedium,
    selectedSubject,
    setSelectedSubject,
    deleteSubject,
    archiveSubject,
    restoreSubject,
    handleClose,
  } = useSubjectCreation();

  const { data: usageData, isFetching: isUsageFetching } = useGetSubjectUsageQuery(
    {
      academicMediumId: (currentMedium as any)?.id,
      id: selectedSubject?.id,
    },
    { skip: !(currentMedium as any)?.id || !selectedSubject?.id || !usageDrawer.value }
  );

  const handleRestoreSubject = async (subject: ISubject): Promise<boolean> => {
    try {
      await restoreSubject({
        academicMediumId: (currentMedium as any).id,
        id: subject.id,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Subject restored successfully.' });
      return true;
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Failed to restore subject.',
      });
      return false;
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Subject Creation"
        description="Manage master subjects used across curriculum, timetable, exams, lesson plans, and reports."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Settings' },
          { name: 'Subject Creation' },
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
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={bulkImportDialog.onTrue}
                    startIcon={<Iconify icon="mdi:cloud-upload-outline" width={18} />}
                  >
                    Bulk Add
                  </Button>
                  <Button
                    sx={{ px: '24px' }}
                    startIcon={<Add />}
                    variant="contained"
                    onClick={() => {
                      setSelectedSubject(null);
                      addSubjectDialog.onTrue();
                    }}
                    size="small"
                  >
                    Subject
                  </Button>
                </>
              )}
            </Box>
          )
        }
      />

      <SettingSubjectTable
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        insightsOpen={insightsDrawer.value}
        onCloseInsights={insightsDrawer.onFalse}
        onViewUsage={(data) => {
          setSelectedSubject(data);
          usageDrawer.onTrue();
        }}
        onArchive={(data) => {
          setSelectedSubject(data);
          setArchiveReason('');
          archiveDialog.onTrue();
        }}
        onRestore={handleRestoreSubject}
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
        onOpenDrawer={bulkImportDialog.onTrue}
      />

      <BulkSubjectImportDialog open={bulkImportDialog.value} onClose={bulkImportDialog.onFalse} />

      <CustomDialog
        open={addSubjectDialog.value}
        handleClose={() => {
          addSubjectDialog.onFalse();
          setTimeout(() => {
            setSelectedSubject(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{selectedSubject ? 'Edit Subject' : 'Add Subject'}</Typography>
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

      <SubjectUsageDrawer
        open={usageDrawer.value}
        onClose={() => {
          usageDrawer.onFalse();
          setSelectedSubject(null);
        }}
        selectedSubject={selectedSubject}
        usageData={usageData}
        isLoading={isUsageFetching}
        canArchive={canAdd}
        isRestoring={isRestoreLoading}
        onArchive={(subject) => {
          setSelectedSubject(subject);
          archiveDialog.onTrue();
        }}
        onRestore={handleRestoreSubject}
      />

      <ConfirmDialog
        open={archiveDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          archiveDialog.onFalse();
        }}
        title="Archive Subject"
        content={
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Archived subjects will not be available for new allocations but will remain visible in
              old records.
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
                await archiveSubject({
                  academicMediumId: (currentMedium as any).id,
                  id: selectedSubject?.id,
                  body: { reason: archiveReason },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Subject archived successfully.' });
                archiveDialog.onFalse();
                setSelectedSubject(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to archive subject.',
                });
              }
            }}
          >
            Archive
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteSubjectDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          deleteSubjectDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            {selectedSubject?.canDelete ? (
              <>
                Are you sure you want to delete subject{' '}
                <strong>&quot;{selectedSubject?.name}&quot;</strong>?
              </>
            ) : (
              <>
                <strong>&quot;{selectedSubject?.name}&quot;</strong> cannot be deleted because it is
                already used. You can archive this subject instead.
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
            disabled={!selectedSubject?.canDelete}
            onClick={async () => {
              try {
                await deleteSubject({
                  academicMediumId: (currentMedium as any).id,
                  id: (selectedSubject as any).id,
                }).unwrap();
                shikshaMitraToast.success({ message: 'Subject deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete subject.',
                });
              }
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
