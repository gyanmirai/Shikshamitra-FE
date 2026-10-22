'use client';

import type { RootState } from 'src/redux/store';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { useGetSubjectUsageQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import SettingSubjectForm from './subjectForm';
import SubjectUsageDrawer from './subjectUsageDrawer';
import SettingSubjectTable from './settingSubjectTable';
import { useSubjectCreation } from './hooks/useSubjectCreation';
import { SubjectPageHeader } from './components/SubjectPageHeader';
import { SubjectDecisionDialogs } from './components/SubjectDecisionDialogs';
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
      <SubjectPageHeader canView={canView} canAdd={canAdd}
        onInsights={insightsDrawer.onTrue} onBulkAdd={bulkImportDialog.onTrue}
        onAdd={() => { setSelectedSubject(null); addSubjectDialog.onTrue(); }} />

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

      {addSubjectDialog.value && <SettingSubjectForm open={addSubjectDialog} onClose={handleClose} editData={selectedSubject} />}

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

      <SubjectDecisionDialogs archiveOpen={archiveDialog.value} deleteOpen={deleteSubjectDialog.value}
        onCloseArchive={archiveDialog.onFalse} onCloseDelete={deleteSubjectDialog.onFalse}
        isArchiveLoading={isArchiveLoading} isDeleteLoading={isDeleteLoading}
        selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject}
        currentMedium={currentMedium} archiveReason={archiveReason} setArchiveReason={setArchiveReason}
        archiveSubject={archiveSubject} deleteSubject={deleteSubject} />
    </Box>
  );
};

export default SubjectCreation;
