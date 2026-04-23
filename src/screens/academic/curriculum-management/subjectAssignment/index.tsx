'use client';

import { Box, Card } from '@mui/material';

import SubjectTable from './component/subjectTable';
import SubjectActionBar from './component/SubjectActionBar';
import SubjectBreadcrumbs from './component/SubjectBreadcrumbs';
import SubjectDeleteDialog from './component/SubjectDeleteDialog';
import SubjectPublishDialog from './component/SubjectPublishDialog';
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
    isTableLoading,
    isFetching,
    subjectTableData,
    addSubjectDialog,
    deleteConfirmDialog,
    confirmPublishDialog,
    showSubjectDialog,
    handleClose,
    handleViewSubject,
    handleEditSubject,
    handleRequestDelete,
    handleRequestToggleStatus,
    handleCloseDialog,
    handleConfirmDelete,
    handleConfirmPublish,
    handleClassChange,
    handleAddNew,
    handleBackFromView,
    query,
    setQuery,
  } = useSubjectAssignment();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SubjectBreadcrumbs
        isFormOpen={addSubjectDialog.value}
        isViewOpen={showSubjectDialog.value}
        selectedSubject={selectedSubject}
        onBackFromForm={() => handleClose(null, false)}
        onBackFromView={handleBackFromView}
      />

      {addSubjectDialog.value ? (
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
              onToggleStatus={handleRequestToggleStatus}
              query={query}
              setQuery={setQuery}
              totalCount={subjectTableData?.data?.totalCount || 0}
            />
          )}
        </>
      )}

      <SubjectDeleteDialog
        open={deleteConfirmDialog.value}
        isLoading={isDeleteLoading}
        selectedSubject={selectedSubject}
        className={classes}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
      />

      <SubjectPublishDialog
        open={confirmPublishDialog.value}
        isLoading={isPublishLoading}
        selectedSubject={selectedSubject}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmPublish}
      />

      {showSubjectDialog.value && (
        <Box sx={{ height: '100%' }}>
          <ViewSubject subject={selectedSubject} classId={classId} classes={classes} />
        </Box>
      )}
    </Box>
  );
};

export default Subject;
