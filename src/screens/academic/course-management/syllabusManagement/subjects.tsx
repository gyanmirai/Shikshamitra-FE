'use client';

// Client-side component declaration

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
// Import necessary types
import type { TabComponentType } from 'src/screens/hr/leave-request';

// Import Material-UI icons and components
import { Add } from '@mui/icons-material';
// Import custom components
import { Iconify } from 'src/components/iconify';
// Import custom hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
// Import Redux related functions
import { useGetClassQuery } from 'src/redux/class/classApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
// Import external dependencies
import React, { useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import chapterTableData from 'src/json/academic/syllabus/chapterTableData.json';
import { Box, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { AddNewChapter } from './addChapterForm';
// Import mock data
import { subjectTempData } from '../subjectsData';
import ChapterTable from './components/chapterTable';
import ChapterDocuments from './components/chapterDocuments';

import type { IChapter } from './type';

const Subjects = (props: TabComponentType) => {
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

  // State for managing selected subject
  const [subject, setSubject] = useState<string>('');
  // State for managing dialog open/close
  const [open, setOpen] = useState(false);
  // Custom hook for chapter dialog visibility
  const chapterDialog = useBoolean();
  const viewDocumentDialog = useBoolean();
  const deleteDialog = useBoolean();
  // Custom hook for add chapter dialog visibility
  const addChapterDialog = useBoolean();
  // State for storing subject data with initial temp data
  const [subjectData, setSubjectData] = useState<any>(subjectTempData);
  // State for storing subject table data
  const [chapterData, setChapterData] = useState<IChapter[]>(chapterTableData);
  // State for storing dialog data
  const [dialogData, setDialogData] = useState<any>([]);
  // State for managing selected chapter
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);
  // State for tracking edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // Query hook for fetching class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handler for viewing chapter details
  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);

    // Get chapters for all divisions for the selected subject
    const allDivisionChapters =
      selectedClassData?.divisions.map((division: any) => {
        const subjectDataOfClass = division.subjects.find((sub: any) => sub.name === subjectName);

        return {
          divisionName: division.name,
          chapters: subjectDataOfClass?.chapters || [],
          progress: subjectDataOfClass?.progress || 0,
        };
      }) || [];

    setDialogData(allDivisionChapters);
    chapterDialog.onTrue();
  };

  // Menu actions for table rows
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              // Commented navigation code
              // setSearchParams?.({
              //   tab: 'learningResources',
              //   class: classes,
              //   subject: row.subjectName,
              // });
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
            Add Learning Resources
          </MenuItem>
        </MenuList>
      </>
    ),
    []
  );

  const handleClose = (_e: any, isSubmit?: boolean) => {
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

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  const handleDelete = (id: string | undefined) => {
    if (selectedChapter) {
      setChapterData(chapterData.filter((ch) => ch.id !== id));
      deleteDialog.onFalse();
      shikshaMitraToast.success({
        message: (
          <>
            Chapter : <strong>{selectedChapter?.chapterName}</strong> deleted successfully from{' '}
            {subject} for Class {classes}.
          </>
        ),
      });
      setSelectedChapter(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addChapterDialog.value ? (
        <CustomBreadcrumbs
          // heading={selectedChapter ? 'Update Chapter' : 'Add Chapter'}
          heading="Chapters Management"
          description={
            selectedChapter
              ? 'Edit chapter details including name, sequence, and learning materials. Review and update chapter content to maintain curriculum accuracy and effectiveness.'
              : 'Add a new chapter to the selected subject and class. Specify chapter details, sequence, and attach relevant learning materials to build the curriculum structure.'
          }
          links={[
            // Links for form view (adding/editing chapter)
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Chapters Management' },
            // { name: selectedChapter ? 'Update Chapter' : 'Add Chapter' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          sx={{ px: 1, mb: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Chapters Management"
          description="Select a class and subject to manage chapters, including the chapter name, number, and associated learning materials."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Chapters Management' },
          ]}
          sx={{ mb: 2 }}
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
          />
        </Card>
      ) : (
        // Table view for displaying chapters
        <>
          {/* Filter controls for class and subject selection */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, ml: 1 }}>
              <CustomSelect
                label="Class"
                name="class"
                options={allClass}
                valueKey="name"
                labelKey="name"
                formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
                value={classes}
                onChange={(value) => {
                  setClasses(value as string);
                }}
              />
              <CustomSelect
                options={[
                  { value: 'Mathematics', label: 'Mathematics' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English', label: 'English' },
                  { value: 'History', label: 'History' },
                  { value: 'Geography', label: 'Geography' },
                ]}
                value={subject}
                disabled={!classes}
                onChange={(val) => {
                  setSubject(val as string);
                }}
                label="Subject"
                valueKey="value"
                labelKey="label"
                isLoading={isLoading}
                formControlProps={{ sx: { minWidth: '248px', width: '100%' } }}
              />
            </Box>
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                addChapterDialog.onTrue();
              }}
              disabled={!classes || !subject}
            >
              Chapter
            </Button>
          </Box>
          {/* Table component for displaying chapter data */}
          <ChapterTable
            onDelete={(chapter) => {
              setSelectedChapter(chapter as IChapter);
              deleteDialog.onTrue();
            }}
            setEditData={setSelectedChapter}
            addChapterDialog={addChapterDialog}
            data={chapterData}
            actions={actions}
            handleEyeClick={handleEyeClick}
            onViewDocuments={(chapter) => {
              setSelectedChapter(chapter as IChapter);
              viewDocumentDialog.onTrue();
            }}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedChapter(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete chapter <strong>{selectedChapter?.chapterName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              handleDelete(selectedChapter?.id);
            }}
          >
            Yes
          </Button>
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
            <Typography variant="h5">Documents for {selectedChapter?.chapterNo} Chapter</Typography>
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
