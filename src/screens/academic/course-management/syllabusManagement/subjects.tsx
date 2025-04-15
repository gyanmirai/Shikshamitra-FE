'use client';

// Client-side component declaration

// Import necessary types
import type { TabComponentType } from 'src/screens/hr/leave-request';

// Import external dependencies
import React, { useState, useCallback } from 'react';

// Import Material-UI icons and components
import { Add } from '@mui/icons-material';
import { Box, Card, Button, MenuItem, MenuList } from '@mui/material';

// Import custom hooks
import { useBoolean } from 'src/hooks/use-boolean';

// Import Redux related functions
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import chapterTableData from 'src/json/academic/syllabus/chapterTableData.json';

// Import custom components
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AddNewChapter } from './addChapterForm';
// Import mock data
import { subjectTempData } from '../subjectsData';
import ChapterTable from './components/chapterTable';

import type { IChapter, IDocument, IChapterFormValues } from './type';

const Subjects = (props: TabComponentType) => {
  // State for managing selected class
  const [classes, setClasses] = useState<string>('');
  // State for managing selected subject
  const [subject, setSubject] = useState<string>('');
  // State for managing dialog open/close
  const [open, setOpen] = useState(false);
  // Custom hook for chapter dialog visibility
  const chapterDialog = useBoolean();
  // Custom hook for add chapter dialog visibility
  const addChapterDialog = useBoolean();
  // State for storing subject data with initial temp data
  const [subjectData, setSubjectData] = useState<any>(subjectTempData);
  // State for tracking selected subject
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  // State for storing subject table data
  const [chapterData, setChapterData] = useState<IChapter[]>(chapterTableData);
  // State for storing dialog data
  const [dialogData, setDialogData] = useState<any>([]);
  // State for managing selected chapter
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  // State for tracking edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // Query hook for fetching class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Helper function to handle document uploads
  const handleDocumentUpload = async (files: File[]): Promise<IDocument[]> =>
    files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

  // Handler for chapter form submission (create/update)
  const handleChapterSubmit = async (values: IChapterFormValues) => {
    const updatedSubjectData = { ...subjectData };
    const selectedClass = updatedSubjectData.classes.find(
      (cls: { name: string }) => cls.name === classes
    );

    if (selectedClass) {
      // Process document uploads
      let newDocuments: IDocument[] = [];
      if (values.documents) {
        const filesToUpload = values.documents.filter((doc) => doc.file) as IDocument[];
        if (filesToUpload.length > 0) {
          const uploadedDocs = await handleDocumentUpload(filesToUpload.map((doc) => doc.file!));
          newDocuments = [
            ...values.documents.filter((doc) => !doc.file), // Keep existing documents
            ...uploadedDocs, // Add newly uploaded documents
          ];
        } else {
          newDocuments = values.documents;
        }
      }

      if (isEditMode && selectedChapter) {
        // Update existing chapter
        selectedClass.divisions.forEach((division: any) => {
          const subj = division.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            const newChapter = {
              chapterNo: values.chapterNo,
              chapterName: values.chapterName,
              assignedTeacher: values.assignedTeacher,
              content: values.content,
              startTime: values.startTime,
              endTime: values.endTime,
              documents: newDocuments,
              progress: subj.progress,
              assignments: subj.assignments,
            };
          }
        });
      } else {
        // Create new chapter with auto-incremented ID
        const newChapter = {
          id:
            Math.max(
              ...selectedClass.divisions.flatMap((div: any) =>
                div.subjects.flatMap((sub: any) => sub.chapters.map((ch: any) => ch.id))
              ),
              0
            ) + 1,
          chapterNo: values.chapterNo,
          chapterName: values.chapterName,
          assignedTeacher: values.assignedTeacher,
          content: values.content,
          startTime: values.startTime,
          endTime: values.endTime,
          documents: newDocuments,
          progress: 0,
          assignments: [],
        };

        // Add new chapter to all divisions
        selectedClass.divisions.forEach((division: any) => {
          const subj = division.subjects.find((sub: any) => sub.name === selectedSubject);
          if (subject) {
            subj.chapters.push({ ...newChapter });
          }
        });
      }

      // Update state with new data
      setSubjectData(updatedSubjectData);
      const updatedDialogData = selectedClass.divisions.map((division: any) => ({
        divisionName: division.name,
        chapters: division.subjects
          .filter((sub: any) => sub.name === selectedSubject)
          .flatMap((sub: any) => sub.chapters),
      }));

      setDialogData(updatedDialogData);
    }
    addChapterDialog.onFalse();
  };

  // Handler for editing existing chapters
  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    setIsEditMode(true);
    addChapterDialog.onTrue();
  };

  // Handler for viewing chapter details
  const handleEyeClick = (subjectName: string) => {
    const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);

    setSelectedSubject(subjectName);
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

  // Define navigation breadcrumb links based on form state
  const links = addChapterDialog.value
    ? [
        // Links for form view (adding/editing chapter)
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Syllabus', href: '/academic/courseSubjects' },
        { name: 'Syllabus Management' },
        { name: 'Add Chapter' },
      ]
    : [
        // Links for list view (showing chapters)
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Syllabus', href: '/academic/courseSubjects' },
        { name: 'Syllabus Management' },
      ];
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      <CustomBreadcrumbs
        heading="Syllabus"
        description={
          addChapterDialog.value
            ? 'Create or update chapter details, including the title, content, and associated subject. Manage chapters efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize chapters for each subject efficiently. View the list of chapters, add new ones, update existing chapters, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={addChapterDialog.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              addChapterDialog.value
                ? () => {
                    addChapterDialog.onFalse();
                  }
                : () => {
                    addChapterDialog.onTrue();
                  }
            }
          >
            {addChapterDialog.value ? 'Back' : 'Chapter'}
          </Button>
        }
      />
      {/* Conditional rendering based on form state */}
      {addChapterDialog.value ? (
        // Form view for adding/editing chapters
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddNewChapter
            onSubmit={handleChapterSubmit}
            selectedSubject={selectedSubject}
            initialValues={selectedChapter}
            isEdit={isEditMode}
          />
        </Card>
      ) : (
        // Table view for displaying chapters
        <>
          {/* Filter controls for class and subject selection */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <CustomSelect
              options={classData?.items || []}
              value={classes}
              onChange={(val) => {
                setClasses(val as string);
              }}
              label="Class"
              isLoading={isLoading}
              labelKey="name"
              valueKey="name"
              formControlProps={{ sx: { minWidth: 150, mb: 2 } }}
            />
            <CustomSelect
              options={[]}
              value={subject}
              onChange={(val) => {
                // setClasses(val as string);
                setSubject(val as string);
              }}
              label="Subject"
              isLoading={isLoading}
              formControlProps={{ sx: { minWidth: 150, mb: 2 } }}
            />
          </Box>
          {/* Table component for displaying chapter data */}
          <ChapterTable
            ediData={selectedChapter}
            setEditData={setSelectedChapter}
            addChapterDialog={addChapterDialog}
            data={chapterData}
            actions={actions}
            handleEyeClick={handleEyeClick}
          />
        </>
      )}
    </Box>
  );
};

export default Subjects;
