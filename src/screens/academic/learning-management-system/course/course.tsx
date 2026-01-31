'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import React, { useState, useEffect, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, MenuItem, MenuList, Typography, CircularProgress } from '@mui/material';

import ViewAssignmentData from './component/assignmentData';
import { subjectTempData } from '../../course-management/subjectsData';
import { AddNewChapter } from '../../course-management/syllabusManagement/addChapterForm';

import type {
  IDocument,
  IChapterFormValues,
} from '../../course-management/syllabusManagement/type';

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

const Course = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const addChapterDialog = useBoolean();
  const viewAssignmentDialog = useBoolean();
  const [subjectData] = useState<any>(subjectTempData);
  const [, setSelectedSubject] = useState<string>('');
  const [subjectTableData, setSubjectTableData] = useState<TableRow[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }

        const selectedClassData = subjectData.classes.find(
          (cls: any) => cls.name === selectedClass?.name
        );
        if (selectedClassData) {
          const divisionData = selectedClassData.divisions;
          const firstDivisionSubjects = divisionData[0]?.subjects || [];

          const subjects = firstDivisionSubjects.map((subject: any) => ({
            subjectName: subject.name,
            primaryTeacher: subject.primaryTeacher,
            secondaryTeacher: subject.secondaryTeacher,
            progress: subject.progress,
            material: subject.material,
          }));

          setSubjectTableData(subjects);
        } else {
          setSubjectTableData([]);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }

        const selectedClassData = subjectData.classes.find(
          (cls: any) => cls.name === firstClass?.name
        );
        if (selectedClassData) {
          const divisionData = selectedClassData.divisions;
          const firstDivisionSubjects = divisionData[0]?.subjects || [];

          const subjects = firstDivisionSubjects.map((subject: any) => ({
            subjectName: subject.name,
            primaryTeacher: subject.primaryTeacher,
            secondaryTeacher: subject.secondaryTeacher,
            progress: subject.progress,
            material: subject.material,
          }));

          setSubjectTableData(subjects);
        } else {
          setSubjectTableData([]);
        }
      }
    }
  }, [classData, classes, setSearchParams, subjectData.classes]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDocumentUpload = async (files: File[]): Promise<IDocument[]> =>
    files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

  const handleChapterSubmit = async (values: IChapterFormValues) => {
    const updatedSubjectData = { ...subjectData };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const selectedClass = updatedSubjectData.classes.find(
      (cls: { name: string }) => cls.name === classes
    );

    // if (selectedClass) {
    //   // Handle document uploads first
    //   let newDocuments: IDocument[] = [];
    //   if (values.documents) {
    //     const filesToUpload = values.documents.filter((doc: any) => doc.file) as IDocument[];
    //     if (filesToUpload.length > 0) {
    //       const uploadedDocs = await handleDocumentUpload(filesToUpload.map((doc) => doc.file!));
    //       newDocuments = [
    //         ...values.documents.filter((doc: any) => !doc.file), // Keep existing documents
    //         ...uploadedDocs, // Add newly uploaded documents
    //       ];
    //     } else {
    //       newDocuments = values.documents;
    //     }
    //   }

    //   if (isEditMode && selectedChapter) {
    //     // Update existing chapter
    //     selectedClass.divisions.forEach((div: any) => {
    //       const subject = div.subjects.find((sub: any) => sub.name === selectedSubject);
    //       if (subject) {
    //         const chapterIndex = subject.chapters.findIndex(
    //           (ch: any) => ch.id === selectedChapter.id
    //         );
    //         if (chapterIndex !== -1) {
    //           subject.chapters[chapterIndex] = {
    //             ...subject.chapters[chapterIndex],
    //             chapterName: values.chapterName,
    //             assignedTeacher: values.assignedTeacher,
    //             content: values.content,
    //             timeLine: values.timeLine,
    //             documents: newDocuments,
    //             progress: subject.chapters[chapterIndex].progress,
    //             assignments: subject.chapters[chapterIndex].assignments,
    //           };
    //         }
    //       }
    //     });
    //   } else {
    //     // Create new chapter
    //     const newChapter = {
    //       id:
    //         Math.max(
    //           ...selectedClass.divisions.flatMap((div: any) =>
    //             div.subjects.flatMap((sub: any) => sub.chapters.map((ch: any) => ch.id))
    //           ),
    //           0
    //         ) + 1,
    //       chapterName: values.chapterName,
    //       assignedTeacher: values.assignedTeacher,
    //       content: values.content,
    //       timeLine: values.timeLine,
    //       documents: newDocuments,
    //       progress: 0,
    //       assignments: [],
    //     };

    //     selectedClass.divisions.forEach((div: any) => {
    //       const subject = div.subjects.find((sub: any) => sub.name === selectedSubject);
    //       if (subject) {
    //         subject.chapters.push({ ...newChapter });
    //       }
    //     });
    //   }

    //   setSubjectData(updatedSubjectData);
    //   const updatedDialogData = selectedClass.divisions.map((div: any) => ({
    //     divisionName: div.name,
    //     chapters: div.subjects
    //       .filter((subject: any) => subject.name === selectedSubject)
    //       .flatMap((subject: any) => subject.chapters),
    //   }));

    //   setDialogData(updatedDialogData);
    // }
    addChapterDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setSelectedSubject(row.subjectName);
              addChapterDialog.onTrue();
              setIsEditMode(false);
              setSelectedChapter(null);
            }}
          >
            <Iconify icon="mdi:plus" />
            Chapter
          </MenuItem>

          <MenuItem
            onClick={() => {
              viewAssignmentDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:eye" />
            View Assignments
          </MenuItem>
        </MenuList>
      </>
    ),
    [addChapterDialog, viewAssignmentDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Course"
        links={[{ name: 'Academics' }, { name: 'Learning Management System' }, { name: 'Course' }]}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />
      </Box>
      <CustomizableTable
        tableId="course-table"
        columns={[
          {
            id: 'subjectName',
            label: 'Subject Name',
          },
          { id: 'primaryTeacher', label: 'Primary Teacher' },
          {
            id: 'secondaryTeacher',
            label: 'Secondary Teacher',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip key={audience} label={audience} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'progress',
            label: 'Progress',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
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
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={subjectTableData}
      />

      <CustomDialog
        title={isEditMode ? `Edit ${selectedChapter.chapterName} Chapter` : 'Add New Chapter'}
        open={addChapterDialog.value}
        handleClose={addChapterDialog.onFalse}
        maxWidth="sm"
      >
        <AddNewChapter
          onClose={addChapterDialog.onFalse}
          onSubmit={handleChapterSubmit}
          initialValues={selectedChapter}
          isEdit={isEditMode}
        />
      </CustomDialog>

      <CustomDialog
        title="View Assignment"
        open={viewAssignmentDialog.value}
        handleClose={viewAssignmentDialog.onFalse}
        maxWidth="xl"
      >
        <ViewAssignmentData />
      </CustomDialog>
    </Box>
  );
};

export default Course;
