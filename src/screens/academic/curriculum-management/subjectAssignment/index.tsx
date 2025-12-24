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
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import {
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
  // State to manage subject table data and filtered data
  const [subjectTableData, setSubjectTableData] = useState<any[]>([
    {
      id: 'math-assign-id',
      status: PublishUnpublishStatusType.Draft,
      subjectType: 0,
      academicMediumId: 'medium-id',
      subjects: [
        {
          assignedId: 'math-assigned-01',
          subjectCode: 'MATH-101',
          subjectId: 'math-sub-id',
          subjectName: 'Mathematics',
          color: '#DEB887',
          electiveGroupId: null,
          primaryTeacher: 'teacher-1',
          secondaryTeachers: ['teacher-2'],
          learningGoal: 'To master algebra and geometry concepts.',
          prerequisites: 'Basic arithmetic',
          description: 'Core mathematics course for 10th grade.',
          documents: [],
        },
      ],
    },
    {
      id: 'science-assign-id',
      status: PublishUnpublishStatusType.Draft,
      subjectType: 0,
      academicMediumId: 'medium-id',
      subjects: [
        {
          assignedId: 'sci-assigned-01',
          subjectCode: 'SCI-101',
          subjectId: 'sci-sub-id',
          subjectName: 'Science',
          color: '#00CED1',
          electiveGroupId: null,
          primaryTeacher: 'teacher-3',
          secondaryTeachers: [],
          learningGoal: 'Understanding basic physics and chemistry.',
          prerequisites: 'None',
          description: 'General science covering various topics.',
          documents: [],
        },
      ],
    },
    {
      id: 'tech-fitness-group-id',
      status: PublishUnpublishStatusType.Draft,
      subjectType: 1,
      academicMediumId: 'medium-id',
      electiveGroupName: 'Tech & Fitness Group',
      electiveGroupId: 'tech-fitness-group-id',
      color: '#4169E1',
      subjects: [
        {
          assignedId: 'comp-assigned-01',
          subjectCode: 'COMP-101',
          subjectId: 'comp-sub-id',
          subjectName: 'Computer',
          color: '#4169E1',
          electiveGroupId: 'tech-fitness-group-id',
          primaryTeacher: 'teacher-4',
          secondaryTeachers: [],
          learningGoal: 'Basic programming skills',
          prerequisites: 'None',
          description: 'Introduction to computers.',
          documents: [],
        },
        {
          assignedId: 'pt-assigned-01',
          subjectCode: 'PT-101',
          subjectId: 'pt-sub-id',
          subjectName: 'Physical Training',
          color: '#FF69B4',
          electiveGroupId: 'tech-fitness-group-id',
          primaryTeacher: 'teacher-5',
          secondaryTeachers: [],
          learningGoal: 'Physical fitness and sportsmanship',
          prerequisites: 'None',
          description: 'Weekly PT sessions.',
          documents: [],
        },
      ],
    },
    {
      id: 'lang-group-id',
      status: PublishUnpublishStatusType.Draft,
      subjectType: 1,
      academicMediumId: 'medium-id',
      electiveGroupName: 'Language Enrichment Group',
      electiveGroupId: 'lang-group-id',
      color: '#FF4500',
      subjects: [
        {
          assignedId: 'hindi-assigned-01',
          subjectCode: 'HIN-101',
          subjectId: 'hindi-sub-id',
          subjectName: 'Hindi',
          color: '#FF4500',
          electiveGroupId: 'lang-group-id',
          primaryTeacher: 'teacher-6',
          secondaryTeachers: [],
          learningGoal: 'Hindi literature and grammar',
          prerequisites: 'None',
          description: 'Compulsory language course.',
          documents: [],
        },
        {
          assignedId: 'sansk-assigned-01',
          subjectCode: 'SAN-101',
          subjectId: 'sansk-sub-id',
          subjectName: 'Sanskrit',
          color: '#DA70D6',
          electiveGroupId: 'lang-group-id',
          primaryTeacher: 'teacher-7',
          secondaryTeachers: [],
          learningGoal: 'Basics of Sanskrit',
          prerequisites: 'None',
          description: 'Ancient language study.',
          documents: [],
        },
      ],
    },
  ]);

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
  console.log('selectedSubject-----', selectedSubject);
  // Boolean flag to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();
  // State to track pending status changes for subjects
  // const [pendingStatusChange, setPendingStatusChange] = useState<{
  //   id: number;
  //   newValue: string;
  // } | null>(null);

  // Handle subject status toggle between Publish/Unpublish
  // const handleStatusChange = (id: number, value: string) => {
  //   setPendingStatusChange({ id, newValue: value === 'Published' ? 'Unpublish' : 'Published' });
  //   confirmPublishDialog.onTrue();
  // };

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

  // Delete selected subject from table
  const handleDelete = () => {
    if (selectedSubject) {
      setSubjectTableData(subjectTableData.filter((subject) => subject.id !== selectedSubject.id));
      deleteConfirmDialog.onFalse();
      setSelectedSubject(null);
      shikshaMitraToast.success({
        message:
          selectedSubject && Array.isArray(selectedSubject.subjectName) ? (
            <>
              Subject :{' '}
              <strong>
                {selectedSubject.subjectName
                  .map((name: any, index: any) => {
                    const code = selectedSubject.subjectCode?.[index] || '';
                    return `${name} (${code})`;
                  })
                  .join(' , ')}
              </strong>{' '}
              removed successfully from class {classes}.
            </>
          ) : (
            <>
              Subject :{' '}
              <strong>
                {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
              </strong>{' '}
              removed successfully from class {classes}.
            </>
          ),
      });
    }
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
          sx={{ px: 1, mb: 1 }}
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
          sx={{ mb: 2 }}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
                ml: 1,
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
          )}
          {/* Subject table displayed when class is selected */}

          {!showSubjectDialog.value && (
            <SubjectTable
              classId={classId}
              addSubjectDialog={addSubjectDialog}
              data={subjectTableData}
              editData={selectedSubject}
              setEditData={setSelectedSubject}
              subjectTableData={subjectTableData}
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
              try {
                await deleteSubjectAssignment({
                  subjectAssignmentId: selectedSubject?.id,
                }).unwrap();

                shikshaMitraToast.success({
                  message:
                    selectedSubject && Array.isArray(selectedSubject.subjectName) ? (
                      <>
                        Subject :{' '}
                        <strong>
                          {selectedSubject.subjectName
                            .map((name: any, index: number) => {
                              const code = selectedSubject.subjectCode?.[index] || '';
                              return `${name} (${code})`;
                            })
                            .join(', ')}
                        </strong>{' '}
                        deleted successfully.
                      </>
                    ) : (
                      <>
                        Subject :{' '}
                        <strong>
                          {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
                        </strong>{' '}
                        deleted successfully.
                      </>
                    ),
                });

                deleteConfirmDialog.onFalse();
                setSelectedSubject(null);
              } catch (error) {
                console.error('Delete subject failed', error);
              }
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
              try {
                const nextStatus =
                  selectedSubject?.status === PublishUnpublishStatusType.Published
                    ? PublishUnpublishStatusType.Draft
                    : PublishUnpublishStatusType.Published;

                await publishSubjectAssignment({
                  assignmentId: selectedSubject?.id,
                  status: nextStatus,
                }).unwrap();

                const statusText =
                  nextStatus === PublishUnpublishStatusType.Published ? 'Published' : 'Draft';

                shikshaMitraToast.success({
                  message:
                    selectedSubject && Array.isArray(selectedSubject.subjectName) ? (
                      <>
                        Subject :{' '}
                        <strong>
                          {selectedSubject.subjectName
                            .map((name: any, index: number) => {
                              const code = selectedSubject.subjectCode?.[index] || '';
                              return `${name} (${code})`;
                            })
                            .join(', ')}
                        </strong>{' '}
                        moved to {statusText} successfully.
                      </>
                    ) : (
                      <>
                        Subject :{' '}
                        <strong>
                          {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
                        </strong>{' '}
                        moved to {statusText} successfully.
                      </>
                    ),
                });

                confirmPublishDialog.onFalse();
              } catch (error) {
                console.error('Publish / Unpublish failed', error);
              }
            }}
          >
            {selectedSubject?.status === PublishUnpublishStatusType.Published ? 'Draft' : 'Publish'}
          </LoadingButton>
        }
      />

      {/* View subject details dialog */}
      {showSubjectDialog.value && (
        <Card>
          <ViewSubject subject={selectedSubject} />
        </Card>
      )}
    </Box>
  );
};

export default Subject;
