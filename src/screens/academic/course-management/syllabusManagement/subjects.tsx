'use client';

// Client-side component declaration

// Import necessary types
import type { TabComponentType } from 'src/screens/hr/leave-request';

// Import external dependencies
import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';

// Import Material-UI icons and components
import { Add } from '@mui/icons-material';
import {
  Box,
  Chip,
  Card,
  Button,
  MenuItem,
  MenuList,
  Typography,
  CircularProgress,
} from '@mui/material';

// Import custom hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

// Import Redux related functions
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

// Import custom components
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AddNewChapter } from './addChapterForm';
// Import mock data
import { subjectTempData } from '../subjectsData';

import type { IDocument, IChapterFormValues } from './type';

interface TableRow {
  subjectName: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  progress: number;
  material: {
    videos: number;
    pdfs: number;
  };
}

export const chapterData = [
  {
    id: 1,
    chapterNo: 1,
    chapterName: 'Introduction to Algebra',
    startDate: dayjs('2025-03-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-04-01').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Rajesh Sharma', 'Ms. Neha Verma'],
    viewMaterial: { videos: 5, pdfs: 3 },
    progress: 75,
  },
  {
    id: 2,
    chapterNo: 2,
    chapterName: 'Biology Basics',
    startDate: dayjs('2025-02-15').format('YYYY-MM-DD'),
    endDate: dayjs('2025-03-20').format('YYYY-MM-DD'),
    assignedTeacher: ['Ms. Priya Mehta'],
    viewMaterial: { videos: 8, pdfs: 4 },
    progress: 60,
  },
  {
    id: 3,
    chapterNo: 3,
    chapterName: 'Shakespeare’s Literature',
    startDate: dayjs('2025-01-10').format('YYYY-MM-DD'),
    endDate: dayjs('2025-02-05').format('YYYY-MM-DD'),
    assignedTeacher: ['Mrs. Kavita Shah', 'Mr. Ankit Tiwari'],
    viewMaterial: { videos: 6, pdfs: 2 },
    progress: 90,
  },
  {
    id: 4,
    chapterNo: 4,
    chapterName: 'World War History',
    startDate: dayjs('2025-04-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-05-15').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Arvind Joshi'],
    viewMaterial: { videos: 4, pdfs: 1 },
    progress: 50,
  },
  {
    id: 5,
    chapterNo: 5,
    chapterName: 'Data Structures and Algorithms',
    startDate: dayjs('2025-06-01').format('YYYY-MM-DD'),
    endDate: dayjs('2025-07-10').format('YYYY-MM-DD'),
    assignedTeacher: ['Mr. Vikas Nair', 'Ms. Divya Reddy'],
    viewMaterial: { videos: 10, pdfs: 5 },
    progress: 85,
  },
];

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
  const [subjectTableData, setSubjectTableData] = useState<TableRow[]>([]);
  // State for storing dialog data
  const [dialogData, setDialogData] = useState<any>([]);
  // State for managing selected chapter
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  // State for tracking edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  // Custom hook for managing URL search parameters
  const [params, setParams] = useSearchParam({ isForm: 'false' });
  // Query hook for fetching class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  // Effect to handle initial class selection and update subject table data
  useEffect(() => {
    // Set initial class if none selected
    if (!classes) {
      const firstClass = classData?.items[0];
      setClasses(firstClass?.name);
    }
    // Update subject table data when class changes
    if (classes) {
      const selectedClassData = subjectData.classes.find((cls: any) => cls.name === classes);
      if (selectedClassData) {
        const divisionData = selectedClassData.divisions;
        const firstDivisionSubjects = divisionData[0]?.subjects || [];

        // Map subjects to table format
        const subjects = firstDivisionSubjects.map((sub: any) => ({
          subjectName: sub.name,
          primaryTeacher: sub.primaryTeacher,
          secondaryTeacher: sub.secondaryTeacher,
          progress: sub.progress,
          material: sub.material,
        }));

        setSubjectTableData(subjects);
      } else {
        setSubjectTableData([]);
      }
    } else {
      setSubjectTableData([]);
    }
  }, [classData?.items, classes, subjectData]);

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
  const links =
    params.isForm === 'true'
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
          params.isForm === 'true'
            ? 'Create or update chapter details, including the title, content, and associated subject. Manage chapters efficiently by adding new ones or editing existing entries.'
            : 'Manage and organize chapters for each subject efficiently. View the list of chapters, add new ones, update existing chapters, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={params.isForm === 'true' ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              params.isForm === 'true'
                ? () => {
                    setParams({ isForm: 'false' });
                  }
                : () => {
                    setParams({ isForm: 'true' });
                  }
            }
          >
            {params.isForm === 'true' ? 'Back' : 'Chapter'}
          </Button>
        }
      />
      {/* Conditional rendering based on form state */}
      {params.isForm === 'true' ? (
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
          <CustomizableTable
            tableId="subjectTable"
            columns={[
              // Chapter number column
              {
                id: 'chapterNo',
                label: 'Chapter No',
                minWidth: '130px',
                align: 'left',
                filterType: 'number',
              },
              // Chapter name column
              {
                id: 'chapterName',
                label: 'Chapter Name',
                minWidth: '180px',
                align: 'left',
                filterType: 'string',
              },
              // Start date column
              {
                id: 'startDate',
                label: 'Start Date',
                minWidth: '120px',
                align: 'left',
                filterType: 'date',
              },
              // End date column
              {
                id: 'endDate',
                label: 'End Date',
                minWidth: '120px',
                align: 'left',
                filterType: 'date',
              },
              // Assigned teacher column with chip display
              {
                id: 'assignedTeacher',
                label: 'Secondary Teacher',
                minWidth: '200px',
                align: 'left',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((audience: string) => (
                      <Chip key={audience} label={audience} size="small" variant="outlined" />
                    ))}
                  </Box>
                ),
              },
              // View material column with eye icon
              {
                id: 'viewMaterial',
                label: 'View Material',
                minWidth: '150px',
                align: 'left',
                isFilter: false,
                render(value, row) {
                  // const { videos, pdfs } = value;
                  return <Iconify icon="mdi:eye" sx={{ ml: 7 }} />;
                },
              },
              // Progress column with circular progress indicator
              {
                id: 'progress',
                label: 'Progress',
                minWidth: '150px',
                align: 'left',
                render(value, row) {
                  return (
                    <Box sx={{ position: 'relative', display: 'inline-flex', ml: 7 }}>
                      <CircularProgress variant="determinate" value={value} />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ color: 'text.secondary' }}
                        >
                          {value}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                },
              },
              // Actions column with three dots menu
              {
                id: 'actions',
                label: 'Actions',
                minWidth: '200px',
                isSort: false,
                isFilter: false,
                align: 'left',
                sticky: true,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                      showEditIcon
                      showViewIcon
                      showDeleteIcon
                      handleViewClick={() => {
                        handleEyeClick(row.subjectName);
                      }}
                      handleEditClick={() => {}}
                      handleDeleteClick={() => {}}
                    />
                  );
                },
              },
            ]}
            data={chapterData}
          />
        </>
      )}
    </Box>
  );
};

export default Subjects;

// Interface for viewing subject chapter details
interface ViewSubjectChapterProps {
  onClose: () => void;
  chapterData: any;
  onAddNewChapter: () => void;
  onEditChapter: (chapter: any) => void;
}
