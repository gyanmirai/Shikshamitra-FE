'use client';

// Client-side component declaration

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
// Import necessary types
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useSelector, useDispatch } from 'react-redux';
// Import external dependencies
import React, { useState, useEffect, useCallback } from 'react';

// Import Material-UI icons and components
import { Add } from '@mui/icons-material';
import { Box, Card, Button, MenuItem, MenuList } from '@mui/material';

// Import custom hooks
import { useBoolean } from 'src/hooks/use-boolean';

// Import Redux related functions
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import chapterTableData from 'src/json/academic/syllabus/chapterTableData.json';

// Import custom components
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const handleDelete = (id: string | undefined) => {
    if (selectedChapter) {
      setChapterData(chapterData.filter((ch) => ch.id !== id));
      deleteDialog.onFalse();
      setSelectedChapter(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addChapterDialog.value ? (
        <CustomBreadcrumbs
          heading={selectedChapter ? 'Update Chapter' : 'Add Chapter'}
          description={
            selectedChapter
              ? 'Update existing chapter information including title, content, learning objectives, and associated materials. Make necessary modifications to keep the curriculum current and aligned with educational goals.'
              : 'Create a new chapter by providing essential details such as title, content outline, and learning objectives. Add educational materials and resources to enhance student learning experience.'
          }
          links={[
            // Links for form view (adding/editing chapter)
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Chapters Management' },
            { name: selectedChapter ? 'Update Chapter' : 'Add Chapter' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Chapters Management"
          description="Manage your academic syllabus by organizing chapters and subjects. Create, update and track chapter progress across different classes and divisions. Add learning resources and documents to enhance the learning experience."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
            { name: 'Chapters Management' },
          ]}
          sx={{ px: 1, mb: 2 }}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CustomSelect
                label="Class"
                name="class"
                options={allClass}
                valueKey="name"
                labelKey="name"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                value={classes}
                onChange={(value) => {
                  setClasses(value as string);
                }}
              />
              <CustomSelect
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                  { value: 'history', label: 'History' },
                  { value: 'geography', label: 'Geography' },
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
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
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
        }}
        title={`${selectedChapter?.chapterName} Documents`}
      >
        <ChapterDocuments documents={selectedChapter?.documents} />
      </CustomDialog>
    </Box>
  );
};

export default Subjects;
