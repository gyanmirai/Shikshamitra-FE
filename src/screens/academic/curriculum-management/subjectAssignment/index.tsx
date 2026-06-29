'use client';

import type { RootState } from 'src/redux/store';

import { Box, Card } from '@mui/material';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';

import SubjectTable from './component/subjectTable';
import SubjectKpiCards from './component/SubjectKpiCards';
import SubjectActionBar from './component/SubjectActionBar';
import SubjectBreadcrumbs from './component/SubjectBreadcrumbs';
import SubjectDeleteDialog from './component/SubjectDeleteDialog';
import SubjectPublishDialog from './component/SubjectPublishDialog';
import SubjectArchiveDialog from './component/SubjectArchiveDialog';
import { useSubjectAssignment } from './hooks/useSubjectAssignment';
import { ViewSubject } from './component/viewDetailComponents/viewSubjectComponent';
import SubjectAssignmentForm from './component/subjectAssignmentForm/subjectAssignmentForm';

const Subject = () => {
  const {
    allClass,
    classes,
    classId,
    selectedSubject,
    isEdit,
    isDeleteLoading,
    isPublishLoading,
    isArchiveLoading,
    isTableLoading,
    isFetching,
    subjectTableData,
    kpiData,
    isKpiLoading,
    addSubjectDialog,
    deleteConfirmDialog,
    confirmPublishDialog,
    archiveConfirmDialog,
    showSubjectDialog,
    handleClose,
    handleViewSubject,
    handleEditSubject,
    handleRequestDelete,
    handleRequestToggleStatus,
    handleRequestArchive,
    handleConfirmArchive,
    handleCloseDialog,
    handleConfirmDelete,
    handleConfirmPublish,
    handleClassChange,
    handleAddNew,
    handleBackFromView,
    query,
    setQuery,
  } = useSubjectAssignment();

  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Delete`
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SubjectBreadcrumbs
        isFormOpen={addSubjectDialog.value && canAdd}
        isViewOpen={showSubjectDialog.value && canView}
        selectedSubject={selectedSubject}
        onBackFromForm={() => handleClose(null, false)}
        onBackFromView={handleBackFromView}
      />

      {addSubjectDialog.value && canAdd ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <SubjectAssignmentForm
            onClose={handleClose}
            data={selectedSubject}
            isEdit={isEdit}
            selectedClass={classes}
            classId={classId}
            subjectTableData={subjectTableData?.data?.items || []}
          />
        </Card>
      ) : (
        <>
          {!showSubjectDialog.value && (
            <SubjectActionBar
              allClass={allClass}
              classId={classId}
              onClassChange={handleClassChange}
              onAddNew={handleAddNew}
            />
          )}

          {/* KPI summary cards – only shown on list view, when class is selected */}
          {!showSubjectDialog.value && classId && (
            <SubjectKpiCards kpi={kpiData?.data} isLoading={isKpiLoading} />
          )}

          {!showSubjectDialog.value && (
            <SubjectTable
              isLoading={isTableLoading || isFetching}
              classId={classId}
              addSubjectDialog={addSubjectDialog}
              editData={selectedSubject}
              setEditData={() => {}}
              subjectTableData={subjectTableData?.data?.items || []}
              onView={handleViewSubject}
              onEdit={handleEditSubject}
              onDelete={handleRequestDelete}
              onArchive={handleRequestArchive}
              onToggleStatus={handleRequestToggleStatus}
              query={query}
              setQuery={setQuery}
              totalCount={subjectTableData?.data?.totalCount || 0}
            />
          )}
        </>
      )}

      {deleteConfirmDialog.value && canDelete && (
        <SubjectDeleteDialog
          open={deleteConfirmDialog.value}
          isLoading={isDeleteLoading}
          selectedSubject={selectedSubject}
          className={classes}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
        />
      )}

      {confirmPublishDialog.value && canAdd && (
        <SubjectPublishDialog
          open={confirmPublishDialog.value}
          isLoading={isPublishLoading}
          selectedSubject={selectedSubject}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmPublish}
        />
      )}

      {archiveConfirmDialog.value && canDelete && (
        <SubjectArchiveDialog
          open={archiveConfirmDialog.value}
          isLoading={isArchiveLoading}
          selectedSubject={selectedSubject}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmArchive}
        />
      )}

      {showSubjectDialog.value && canView && (
        <Box sx={{ height: '100%' }}>
          <ViewSubject subject={selectedSubject} classId={classId} classes={classes} />
        </Box>
      )}
    </Box>
  );
};

export default Subject;
