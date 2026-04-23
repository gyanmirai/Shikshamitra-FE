'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
// import type { TabComponentType } from 'src/screens/hr/leave-request';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
  subjectAssignmentsApi,
  useGetSubjectAssignmentsQuery,
  useDeleteSubjectAssignmentMutation,
  usePublishSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectTable from './component/subjectTable';
import { ViewSubject } from './component/viewDetailComponents/viewSubjectComponent';
import SubjectAssignmentForm from './component/subjectAssignmentForm/subjectAssignmentForm';

import type { ISubjectFormValues } from './component/type';

const Subject = () => {
  const [deleteSubjectAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteSubjectAssignmentMutation,
  });

  const [publishSubjectAssignment, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishSubjectAssignmentMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  // Query hook to fetch class data
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  const [classId, setClassId] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClassId(allClasses[0]?.id || '');
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: classId,
    },
    options: {
      skip: !medium?.id || !classId,
    },
  });
  // URL search parameter state for form visibility
  const addSubjectDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteConfirmDialog = useBoolean();
  // Dialog control for publish/unpublish confirmation
  const confirmPublishDialog = useBoolean();
  // Dialog control for viewing subject details
  const showSubjectDialog = useBoolean();
  // State for managing selected subject and edit mode
  // State to store the currently selected subject for editing/viewing
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  // Boolean flag to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();
  // Open dialog to view subject details
  const handleViewSubject = (subject: ISubjectFormValues) => {
    setSelectedSubject(subject);
    showSubjectDialog.onTrue();
  };
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addSubjectDialog.onFalse();
      setIsEdit(false);
      setSelectedSubject(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addSubjectDialog.onFalse();
      setIsEdit(false);
      setSelectedSubject(null);
    }
  };
  // Close all dialogs and reset form state
  const handleCloseDialog = () => {
    addSubjectDialog.onFalse();
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
    setTimeout(() => {
      setSelectedSubject(null);
    }, 100);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addSubjectDialog.value ? (
        <CustomBreadcrumbs
          heading="Subjects Assignment"
          description={
            selectedSubject
              ? 'Update and modify existing subject assignments by revising key details, curriculum mappings, teacher assignments, and assessment criteria for improved academic delivery.'
              : 'Create and manage subject assignments by entering key details, mapping them to the curriculum, assigning teachers, and configuring assessment criteria for effective academic delivery.'
          }
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            // Links when viewing subject list
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Subjects Assignment', href: '/academic/curriculumSubjects' },
            // { name: selectedSubject ? 'Update Subject Assignment' : 'Subject Assignment Form' },
          ]}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Subjects Assignment"
          description={
            showSubjectDialog.value
              ? 'Access detailed information on the selected subject, such as name, code, curriculum mapping, and assessment criteria to support structured academic planning.'
              : 'Define and organize academic subjects by linking them to classes, setting subject codes, and outlining curriculum requirements to ensure effective teaching-learning process.'
          }
          links={[
            // Links when form is open
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            {
              name: 'Subjects Assignment',
              href: showSubjectDialog.value ? '/academic/curriculumSubjects' : undefined,
            },
          ]}
          isBack={showSubjectDialog.value}
          onBack={() => {
            showSubjectDialog.onFalse();
            setSelectedSubject(null);
          }}
        />
      )}
      {/* Conditional rendering based on form state */}
      {addSubjectDialog.value ? (
        <>
          {/* Subject form card for creating/editing subjects */}
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <SubjectAssignmentForm
              onClose={handleClose}
              data={selectedSubject}
              isEdit={isEdit}
              selectedClass={classes}
              classId={classId}
            />{' '}
          </Card>
        </>
      ) : (
        <>
          {/* Class selection dropdown */}
          {!showSubjectDialog.value && (
            <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CustomSelect
                  label="Class"
                  name="class"
                  options={allClass}
                  valueKey="id"
                  labelKey="name"
                  formControlProps={{ sx: { maxWidth: '247px', width: '100%' } }}
                  value={classId}
                  onChange={(value) => {
                    setClassId(value as string);
                    const standard = allClass.find((c) => c.id === value);
                    setClasses(standard?.name || '');
                  }}
                />
                <Button
                  size="small"
                  startIcon={<Add />}
                  variant="contained"
                  onClick={
                    addSubjectDialog.value
                      ? () => handleClose(null, false)
                      : () => {
                          addSubjectDialog.onTrue();
                          setIsEdit(false);
                          setSelectedSubject(null);
                        }
                  }
                  sx={{ px: '32px' }}
                >
                  Subjects Assignment
                </Button>
              </Box>
            </Card>
          )}
          {/* Subject table displayed when class is selected */}

          {!showSubjectDialog.value && (
            <SubjectTable
              isLoading={isTableLoading || isFetching}
              classId={classId}
              addSubjectDialog={addSubjectDialog}
              editData={selectedSubject}
              setEditData={setSelectedSubject}
              subjectTableData={subjectTableData?.data?.items || []}
              onView={handleViewSubject}
              onEdit={(row: ISubjectFormValues) => {
                setSelectedSubject(row);
                setIsEdit(true);
                addSubjectDialog.onTrue();
              }}
              onDelete={(row: ISubjectFormValues) => {
                setSelectedSubject(row);
                deleteConfirmDialog.onTrue();
              }}
              onToggleStatus={(row: ISubjectFormValues) => {
                setSelectedSubject(row);
                confirmPublishDialog.onTrue();
              }}
            />
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={handleCloseDialog}
        title="Remove"
        content={
          <>
            Are you sure you want to remove the following{' '}
            {selectedSubject?.subjectType === 1 ? 'subjects and group' : 'subject'}{' '}
            <strong>
              {selectedSubject?.subjectType === 1
                ? selectedSubject?.subjects
                    ?.map((sub: any) => `${sub.subjectName} (${sub.subjectCode})`)
                    .join(' , ')
                : `${selectedSubject?.subjects?.[0]?.subjectName} (${selectedSubject?.subjects?.[0]?.subjectCode})`}
            </strong>{' '}
            from Class {classes}?
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
                item: selectedSubject,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    subjectAssignmentsApi.util.updateQueryData(
                      'getSubjectAssignments',
                      { academicMediumId: medium?.id, classId },
                      (draft: any) => {
                        const index = draft.findIndex((b: any) => b.id === selectedSubject?.id);
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () =>
                  deleteSubjectAssignment({ assignmentId: selectedSubject?.id || '' }),
              });
              deleteConfirmDialog.onFalse();
              setSelectedSubject(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      {/* Publish confirmation dialog */}
      <ConfirmDialog
        open={confirmPublishDialog.value}
        icon={
          selectedSubject?.status === PublishUnpublishStatusType.Published ? 'warning' : 'success'
        }
        onClose={() => {
          confirmPublishDialog.onFalse();
          setTimeout(() => {
            setSelectedSubject(null);
          }, 100);
        }}
        title={
          selectedSubject?.status === PublishUnpublishStatusType.Published ? 'Draft' : 'Publish'
        }
        content={
          <>
            Are you sure you want to move{' '}
            <strong>
              {selectedSubject?.subjectType === 1
                ? selectedSubject?.subjects
                    ?.map((sub: any) => `${sub.subjectName} (${sub.subjectCode})`)
                    .join(', ')
                : `${selectedSubject?.subjects?.[0]?.subjectName} (${selectedSubject?.subjects?.[0]?.subjectCode})`}
            </strong>{' '}
            subject to{' '}
            {selectedSubject?.status === PublishUnpublishStatusType.Published ? 'Draft' : 'Publish'}
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isPublishLoading}
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={
                  selectedSubject?.status === PublishUnpublishStatusType.Published
                    ? GlobalIcons.publish
                    : GlobalIcons.draftIcon
                }
              />
            }
            onClick={async () => {
              const nextStatus =
                selectedSubject?.status === PublishUnpublishStatusType.Published
                  ? PublishUnpublishStatusType.Draft
                  : PublishUnpublishStatusType.Published;

              publishSubjectAssignment({
                assignmentId: selectedSubject?.id,
                status: nextStatus,
              });

              confirmPublishDialog.onFalse();

              setTimeout(() => {
                setSelectedSubject(null);
              }, 100);
              shikshaMitraToast.success({
                message: `"${
                  selectedSubject?.subjectType === 1
                    ? selectedSubject?.subjects
                        ?.map((sub: any) => `${sub.subjectName} (${sub.subjectCode})`)
                        .join(', ')
                    : `${selectedSubject?.subjects?.[0]?.subjectName} (${selectedSubject?.subjects?.[0]?.subjectCode})`
                }" subject ${
                  nextStatus === PublishUnpublishStatusType.Published
                    ? 'published'
                    : 'moved to draft'
                } successfully`,
              });
            }}
          >
            {selectedSubject?.status === PublishUnpublishStatusType.Published ? 'Draft' : 'Publish'}
          </LoadingButton>
        }
      />

      {/* View subject details dialog */}
      {showSubjectDialog.value && (
        <Box sx={{ height: '100%' }}>
          <ViewSubject subject={selectedSubject} />
        </Box>
      )}
    </Box>
  );
};

export default Subject;
