'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useState, useEffect, useCallback } from 'react';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useDeleteChapterMutation,
  useGetChaptersByStandardQuery,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { AddNewChapter } from './addChapterForm';
import { subjectTempData } from '../subjectsData';
import ChapterTable from './components/chapterTable';
import ChapterDocuments from './components/chapterDocuments';
import BulkChapterForm from './components/bulkChapterForm/BulkChapterForm';
import { SubjectAssignmentStatus } from '../../curriculum-management/subjectAssignment/enum/subjectType';

import type { IChapter, SubjectOption } from './type';

const Subjects = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [deleteChapter, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChapterMutation,
  });
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.chaptersManagement}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.chaptersManagement}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.chaptersManagement}.Delete`
  );

  const [classes, setClasses] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>(''); // plain item.id — used for API
  const [subjectSelectValue, setSubjectSelectValue] = useState<string>(''); // composite key — used for dropdown display
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [subject, setSubject] = useState<string>('');
  const chapterDialog = useBoolean();
  const viewDocumentDialog = useBoolean();
  const deleteDialog = useBoolean();
  const addChapterDialog = useBoolean();
  const bulkChapterDialog = useBoolean();
  const [subjectData] = useState(subjectTempData);
  const [, setDialogData] = useState<
    { divisionName: string; chapters: unknown[]; progress: number }[]
  >([]);
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find(
      (cls: { name: string }) => cls.name === classes
    );

    const allDivisionChapters =
      selectedClassData?.divisions.map(
        (division: {
          name: string;
          subjects: { name: string; chapters?: unknown[]; progress?: number }[];
        }) => {
          const subjectDataOfClass = division.subjects.find((sub) => sub.name === subjectName);

          return {
            divisionName: division.name,
            chapters: subjectDataOfClass?.chapters || [],
            progress: subjectDataOfClass?.progress || 0,
          };
        }
      ) || [];

    setDialogData(allDivisionChapters);
    chapterDialog.onTrue();
  };

  // Menu actions for table rows
  const actions = useCallback(
    (actionProps: { popover: { onClose: () => void } }) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            actionProps.popover.onClose();
          }}
        >
          <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
          Add Learning Resources
        </MenuItem>
      </MenuList>
    ),
    []
  );

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
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

  const {
    data: chapterResponse,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
    refetch: refetchChapters,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: classId, subjectId },
    options: {
      skip: !classId || !subjectId,
    },
  });

  const handleClose = (_e: unknown, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addChapterDialog.onFalse();
      setIsEditMode(false);
      setSelectedChapter(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addChapterDialog.onFalse();
      setIsEditMode(false);
      setSelectedChapter(null);
    }
  };

  const handleBulkClose = (_e: unknown, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      bulkChapterDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      bulkChapterDialog.onFalse();
    }
  };

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
    setClassId(allClasses[0]?.id || '');
  }, [medium]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addChapterDialog.value || bulkChapterDialog.value ? (
        <CustomBreadcrumbs
          // heading={selectedChapter ? 'Update Chapter' : 'Add Chapter'}
          heading="Syllabus"
          description={
            bulkChapterDialog.value
              ? 'Select and assign multiple chapters at once. Fill in the required details for each chapter before submitting.'
              : selectedChapter
                ? 'Edit chapter details including name, sequence, and learning materials. Review and update chapter content to maintain curriculum accuracy and effectiveness.'
                : 'Add a new chapter to the selected subject and class. Specify chapter details, sequence, and attach relevant learning materials to build the curriculum structure.'
          }
          links={[
            // Links for form view (adding/editing chapter)
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum', href: '/academic/curriculumSubjects' },
            { name: 'Syllabus' },
            // { name: selectedChapter ? 'Update Chapter' : 'Add Chapter' },
          ]}
          isBack
          onBack={() => {
            if (bulkChapterDialog.value) {
              handleBulkClose(null, false);
            } else {
              handleClose(null, false);
            }
          }}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Syllabus"
          description="Select a class and subject to manage chapters, including the chapter name, number, and associated learning materials."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum', href: '/academic/curriculumSubjects' },
            { name: 'Syllabus' },
          ]}
        />
      )}
      {/* Conditional rendering based on form state */}
      {bulkChapterDialog.value ? (
        // Bulk form view for assigning multiple chapters
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <BulkChapterForm
            onClose={handleBulkClose}
            className={classes}
            subject={subject}
            classId={classId}
            subjectId={subjectId}
            existingChapters={chapterResponse || []}
          />
        </Card>
      ) : addChapterDialog.value ? (
        // Form view for adding/editing chapters
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddNewChapter
            onClose={handleClose}
            onSubmit={() => {}}
            initialValues={selectedChapter}
            isEdit={isEditMode}
            className={classes}
            subject={subject}
            classId={classId}
            subjectId={subjectId}
            existingChapters={chapterResponse || []}
          />
        </Card>
      ) : (
        // Table view for displaying chapters
        <>
          {/* Filter controls for class and subject selection */}
          <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <CustomSelect
                  label="Class"
                  name="class"
                  options={allClass}
                  valueKey="id"
                  labelKey="name"
                  formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
                  value={classId}
                  onChange={(value) => {
                    const standard = allClass.find((std) => std.id === value);
                    setClasses(standard?.name || '');
                    setClassId(value as string);
                    // Reset subject selection when class changes
                    setSubjectId('');
                    setSubjectSelectValue('');
                    setSubject('');
                  }}
                />
                <CustomSelect
                  options={(() => {
                    const allOptions: SubjectOption[] = [];

                    subjectOptionsData?.data?.items?.forEach((item: any) => {
                      if (item.status === SubjectAssignmentStatus.Draft) return;

                      if (item.subjects?.length > 1 && item.electiveGroupName) {
                        // Elective group — each subject as its own dropdown entry
                        // API shape confirmed: { subjectId, subjectName, subjectCode, color }
                        item.subjects.forEach((sub: any, index: number) => {
                          const subId = sub.subjectId || String(index);
                          allOptions.push({
                            value: `${item.id}::${subId}`,
                            label: sub.subjectName || `${item.electiveGroupName} ${index + 1}`,
                            originalItem: item,
                            isElective: true,
                            electiveGroupId: item.id,
                          });
                        });
                      } else {
                        // Regular single subject
                        allOptions.push({
                          value: item.id,
                          label:
                            item.subjects?.[0]?.subject?.name ||
                            item.subjects?.[0]?.subjectName ||
                            '',
                          originalItem: item,
                          isElective: false,
                        });
                      }
                    });

                    return allOptions;
                  })()}
                  value={subjectSelectValue}
                  disabled={!classes}
                  onChange={(val) => {
                    const strVal = String(val);

                    // Resolve the individual subjectId for API calls.
                    // Elective: composite "assignmentId::subjectId" — extract the individual subjectId.
                    // Regular: value is item.id (assignment record) — look up subjects[0].subjectId.
                    const resolvedSubjectId = (() => {
                      if (strVal.includes('::')) {
                        return strVal.split('::')[1];
                      }
                      const selected = subjectOptionsData?.data?.items?.find(
                        (item: any) => item.id === strVal
                      );
                      return selected?.subjects?.[0]?.subjectId || strVal;
                    })();

                    const label = (() => {
                      if (strVal.includes('::')) {
                        // Composite key: "assignmentId::subjectId"
                        const [groupId, subId] = strVal.split('::');
                        const groupItem = subjectOptionsData?.data?.items?.find(
                          (item: any) => item.id === groupId
                        );
                        const matchedSub = groupItem?.subjects?.find(
                          (sub: any, idx: number) => (sub.subjectId || String(idx)) === subId
                        );
                        return matchedSub?.subjectName || '';
                      }
                      // Regular subject — value is item.id (assignment record)
                      const selected = subjectOptionsData?.data?.items?.find(
                        (item: any) => item.id === strVal
                      );
                      return (
                        selected?.subjects?.[0]?.subject?.name ||
                        selected?.subjects?.[0]?.subjectName ||
                        ''
                      );
                    })();

                    setSubject(label);
                    setSubjectSelectValue(strVal); // composite key — keeps dropdown display in sync
                    setSubjectId(resolvedSubjectId); // individual subjectId — used for API calls
                  }}
                  label="Subject"
                  valueKey="value"
                  labelKey="label"
                  isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
                  formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
                />
              </Box>
              {canAdd && (
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:layers-plus" width={18} />}
                  variant="contained"
                  onClick={() => {
                    bulkChapterDialog.onTrue();
                  }}
                  disabled={!classes || !subject}
                  sx={{ px: '32px' }}
                >
                  Add Chapters
                </Button>
              )}
            </Box>
          </Card>
          {/* Table component for displaying chapter data */}
          <ChapterTable
            canAdd={canAdd}
            canView={canView}
            canDelete={canDelete}
            onDelete={(chapter) => {
              setSelectedChapter(chapter as IChapter);
              deleteDialog.onTrue();
            }}
            isLoading={isChapterLoading || isChapterFetching}
            setEditData={setSelectedChapter}
            addChapterDialog={addChapterDialog}
            data={subjectId ? chapterResponse || [] : []}
            actions={actions}
            handleEyeClick={handleEyeClick}
            onViewDocuments={(chapter) => {
              setSelectedChapter(chapter as IChapter);
              viewDocumentDialog.onTrue();
            }}
            subjectId={subjectId}
            standardId={classId}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedChapter(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete chapter{' '}
            <strong>&quot;{selectedChapter?.chapterName}&quot;</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              try {
                await deleteChapter((selectedChapter as any).id).unwrap();
                shikshaMitraToast.success({ message: 'Chapter deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete chapter.',
                });
              }
              deleteDialog.onFalse();
              setSelectedChapter(null);
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomDialog
        maxWidth="md"
        open={viewDocumentDialog.value}
        handleClose={() => {
          viewDocumentDialog.onFalse();
          setSelectedChapter(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              Documents for {selectedChapter?.chapterNumber} Chapter
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View and download learning materials, worksheets, and other educational resources."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChapterDocuments chapter={selectedChapter} />
      </CustomDialog>
    </Box>
  );
};

export default Subjects;
