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
import { useGetClassQuery } from 'src/redux/class/classApi';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Card, Stack, Button, MenuItem, MenuList } from '@mui/material';
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
import CreateQuestionDialog from '../../../examination/question-bank/components/CreateQuestionDialog';
import { SubjectAssignmentStatus } from '../../curriculum-management/subjectAssignment/enum/subjectType';
import ChapterQuestionsDialog from '../../../examination/question-bank/components/ChapterQuestionsDialog';
import {
  resolveSyllabusSubject,
  buildSyllabusSubjectOptions,
  type SyllabusAssignmentItem,
} from './subjectOptions';

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
  const canCreateQuestion = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.questionBank}.Add`
  );
  const canViewQuestions = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.questionBank}.View`
  );

  const [classes, setClasses] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [divisionId, setDivisionId] = useState<string>('all');
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
  const [createQuestionChapter, setCreateQuestionChapter] = useState<IChapter | null>(null);
  const [viewQuestionsChapter, setViewQuestionsChapter] = useState<IChapter | null>(null);

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
      // The endpoint is paginated by elective group. Syllabus needs every
      // constituent subject in the selected class, not just the first page.
      page: 0,
      pageSize: 100,
      status: SubjectAssignmentStatus.Published,
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
    params: {
      standardId: classId,
      subjectId,
      ...(divisionId && divisionId !== 'all' ? { divisionId } : {}),
    },
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

  const handleBulkClose = () => bulkChapterDialog.onFalse();

  const filteredChapters = (subjectId ? chapterResponse || [] : []) as IChapter[];

  const divisionOptions = useMemo(
    () => [
      { id: 'all', name: 'All Divisions' },
      ...(allClass.find((standard) => standard.id === classId)?.divisions || []),
    ],
    [allClass, classId]
  );

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
    setClassId(allClasses[0]?.id || '');
    setDivisionId('all');
  }, [medium]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addChapterDialog.value ? (
        <CustomBreadcrumbs
          sx={{ mb: 1, px: 1 }}
          // heading={selectedChapter ? 'Update Chapter' : 'Add Chapter'}
          heading="Syllabus"
          description={
            selectedChapter
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
          onBack={() => handleClose(null, false)}
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
      {addChapterDialog.value ? (
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
                gap: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 1 }}>
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
                    setDivisionId('all');
                    setSubjectId('');
                    setSubjectSelectValue('');
                    setSubject('');
                  }}
                />
                <CustomSelect
                  label="Division"
                  name="division"
                  options={divisionOptions}
                  valueKey="id"
                  labelKey="name"
                  disabled={!classId}
                  value={divisionId || 'all'}
                  onChange={(value) => setDivisionId(value as string)}
                  formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                />
                <CustomSelect
                  options={
                    buildSyllabusSubjectOptions(
                      (subjectOptionsData?.data?.items || []) as SyllabusAssignmentItem[]
                    ) as SubjectOption[]
                  }
                  value={subjectSelectValue}
                  disabled={!classes}
                  onChange={(val) => {
                    const strVal = String(val);
                    const resolved = resolveSyllabusSubject(
                      strVal,
                      (subjectOptionsData?.data?.items || []) as SyllabusAssignmentItem[]
                    );

                    // Resolve the individual subjectId for API calls.
                    // Elective: composite "assignmentId::subjectId" — extract the individual subjectId.
                    // Regular: value is item.id (assignment record) — look up subjects[0].subjectId.
                    const resolvedSubjectId = resolved.subjectId || strVal;

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

                    setSubject(resolved.label || label);
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
                <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:cloud-upload-outline" width={18} />}
                    variant="outlined"
                    onClick={() => {
                      bulkChapterDialog.onTrue();
                    }}
                    disabled={!classes || !subject}
                  >
                    Bulk Add
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Iconify icon="mdi:plus" width={18} />}
                    variant="contained"
                    onClick={() => {
                      setSelectedChapter(null);
                      setIsEditMode(false);
                      addChapterDialog.onTrue();
                    }}
                    disabled={!classes || !subject}
                  >
                    Add Chapter
                  </Button>
                </Stack>
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
            data={filteredChapters}
            actions={actions}
            handleEyeClick={handleEyeClick}
            onViewDocuments={(chapter) => {
              setSelectedChapter(chapter as IChapter);
              viewDocumentDialog.onTrue();
            }}
            onCreateQuestion={canCreateQuestion ? setCreateQuestionChapter : undefined}
            onViewQuestions={canViewQuestions ? setViewQuestionsChapter : undefined}
            subjectId={subjectId}
            standardId={classId}
          />
        </>
      )}

      <BulkChapterForm
        open={bulkChapterDialog.value}
        onClose={handleBulkClose}
        className={classes}
        subject={subject}
        classId={classId}
        subjectId={subjectId}
        existingChapters={chapterResponse || []}
      />

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
        maxWidth="xs"
        open={viewDocumentDialog.value}
        handleClose={() => {
          viewDocumentDialog.onFalse();
          setSelectedChapter(null);
        }}
        title={`Documents for ${selectedChapter?.chapterName || 'Chapter'}`}
        titleInfo="Review the saved learning materials and worksheets attached to this chapter."
      >
        <ChapterDocuments chapter={selectedChapter} />
      </CustomDialog>

      {/* Create Question Dialog */}
      <CreateQuestionDialog
        open={canCreateQuestion && Boolean(createQuestionChapter)}
        onClose={() => setCreateQuestionChapter(null)}
        initialStandardId={createQuestionChapter?.standardId || ''}
        initialSubjectId={createQuestionChapter?.subjectId || ''}
        initialChapterId={createQuestionChapter?.id || ''}
        chapterName={createQuestionChapter?.chapterName}
      />

      {/* View Chapter Questions Dialog */}
      <ChapterQuestionsDialog
        open={canViewQuestions && Boolean(viewQuestionsChapter)}
        onClose={() => setViewQuestionsChapter(null)}
        chapterId={viewQuestionsChapter?.id || ''}
        subjectId={viewQuestionsChapter?.subjectId}
        standardId={viewQuestionsChapter?.standardId}
        chapterName={viewQuestionsChapter?.chapterName}
      />
    </Box>
  );
};

export default Subjects;
