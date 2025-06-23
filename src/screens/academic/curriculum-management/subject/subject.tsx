'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import electiveSubjectData from 'src/json/academic/curriculum/electiveSubjectData.json';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SubjectTable from './component/subjectTable';
import SubjectForm from './component/subjectFormComponent';
import { ViewSubject } from './component/viewDetailComponents/viewSubjectComponent';

import type { ISubjectFormValues } from './component/type';

const Subject = (props: TabComponentType) => {
  // State to manage subject table data and filtered data
  const [subjectTableData, setSubjectTableData] =
    useState<ISubjectFormValues[]>(electiveSubjectData);

  // Query hook to fetch class data
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
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
  console.log('selected subject-----', selectedSubject);

  // Boolean flag to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();
  // State to track pending status changes for subjects
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Handle subject status toggle between Publish/Unpublish
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Published' ? 'Unpublish' : 'Published' });
    confirmPublishDialog.onTrue();
  };

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
    setSelectedSubject(null);
    addSubjectDialog.onFalse();
    deleteConfirmDialog.onFalse();
    confirmPublishDialog.onFalse();
    setIsEdit(false);
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
              removed successfully!
            </>
          ) : (
            <>
              Subject :{' '}
              <strong>
                {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
              </strong>{' '}
              removed successfully!
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
          heading="Subject Assignment"
          description="Create and manage subject assignments by specifying subject details like name, code, type (theory/practical), and curriculum mapping. Configure assessment criteria, assign teachers, and set up subject requirements to ensure comprehensive academic planning and delivery."
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            // Links when viewing subject list
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Subject Assignment', href: '/academic/curriculumSubjects' },
            // { name: selectedSubject ? 'Update Subject Assignment' : 'Subject Assignment Form' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Subject Assignment"
          description={
            showSubjectDialog.value
              ? 'View comprehensive details of the selected subject, including subject name, code, curriculum mapping, and assessment criteria. This information helps ensure proper subject organization and academic planning.'
              : 'Create and manage academic subjects by assigning them to specific classes, defining subject codes, and setting up curriculum requirements. This systematic approach helps maintain educational standards and streamlines the teaching-learning process.'
          }
          links={[
            // Links when form is open
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            {
              name: 'Subject Assignment',
              href: showSubjectDialog.value ? '/academic/curriculumSubjects' : undefined,
            },
          ]}
          isBack={showSubjectDialog.value}
          onBack={() => {
            showSubjectDialog.onFalse();
            setSelectedSubject(null);
          }}
          sx={{ px: 1, mb: 2 }}
        />
      )}
      {/* Conditional rendering based on form state */}
      {addSubjectDialog.value ? (
        <>
          {/* Subject form card for creating/editing subjects */}
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <SubjectForm
              onClose={handleClose}
              data={selectedSubject}
              isEdit={isEdit}
              selectedClass={classes}
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
                valueKey="name"
                labelKey="name"
                formControlProps={{ sx: { maxWidth: '247px', width: '100%' } }}
                value={classes}
                onChange={(value) => {
                  setClasses(value as string);
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
              >
                Subject Assignment
              </Button>
            </Box>
          )}
          {/* Subject table displayed when class is selected */}

          {!showSubjectDialog.value && (
            <SubjectTable
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
          selectedSubject && Array.isArray(selectedSubject.subjectName) ? (
            <>
              Are you sure you want to Remove{' '}
              <strong>
                {selectedSubject.subjectName
                  .map((name: any, index: any) => {
                    const code = selectedSubject.subjectCode?.[index] || '';
                    return `${name} (${code})`;
                  })
                  .join(' , ')}
              </strong>{' '}
              from Class {classes} ?
            </>
          ) : (
            <>
              Are you sure you want to Remove{' '}
              <strong>
                {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
              </strong>{' '}
              from Class {classes} ?
            </>
          )
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={handleDelete}
          >
            Yes
          </Button>
        }
      />

      {/* Publish confirmation dialog */}
      <ConfirmDialog
        open={confirmPublishDialog.value}
        onClose={() => {
          setSelectedSubject(null);
          confirmPublishDialog.onFalse();
        }}
        title={selectedSubject?.status === 0 ? 'Draft' : 'Publish'}
        content={
          selectedSubject && Array.isArray(selectedSubject.subjectName) ? (
            <>
              Are you sure you want move{' '}
              <strong>
                {selectedSubject.subjectName
                  .map((name: any, index: any) => {
                    const code = selectedSubject.subjectCode?.[index] || '';
                    return `${name} (${code})`;
                  })
                  .join(', ')}
              </strong>{' '}
              subject to {selectedSubject.status === 0 ? 'draft' : 'publish'} ?
            </>
          ) : (
            <>
              Are you sure you want move{' '}
              <strong>
                {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
              </strong>{' '}
              subject to {selectedSubject?.status === 0 ? 'draft' : 'publish'} ?
            </>
          )
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={selectedSubject?.status === 0 ? GlobalIcons.draftIcon : GlobalIcons.publish}
              />
            }
            onClick={() => {
              const status = selectedSubject?.status === 0 ? 'Draft' : 'Published';
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
                      move to {status} successfully!
                    </>
                  ) : (
                    <>
                      Subject :{' '}
                      <strong>
                        {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
                      </strong>{' '}
                      move to {status} successfully!
                    </>
                  ),
              });
              confirmPublishDialog.onFalse();
            }}
          >
            {selectedSubject?.status === 0 ? 'Draft' : 'Publish'}
          </Button>
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
