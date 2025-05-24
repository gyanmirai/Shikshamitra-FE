'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useMemo, useState } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Box, Button, Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import teacherTableData from 'src/json/academic/curriculum/teacherTableData.json';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import TeacherReassign from './teacherReassignForm';

import type { ITeacher } from './type';

const Teacher = ({
  searchParams,
  setSearchParams,
}: {
  searchParams?: Record<string, string>;
  setSearchParams?: (obj: Record<string, any>) => void;
}) => {
  // Query hook to fetch class data from the API
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // State to store the table data with division and subject-teacher mappings
  const [tableData, setTableData] = useState([
    {
      division: 'A',
      subjects: {
        Math: 'teacher1',
        English: '',
        Science: 'teacher3',
        History: 'teacher4',
        Geography: '',
        Computer: 'teacher2',
        Physics: 'teacher5',
        Chemistry: '',
        Biology: 'teacher6',
      },
    },
    {
      division: 'B',
      subjects: {
        Math: 'teacher2',
        English: 'teacher1',
        Science: '',
        History: '',
        Geography: 'teacher3',
        Computer: '',
        Physics: 'teacher6',
        Chemistry: 'teacher2',
        Biology: '',
      },
    },
    {
      division: 'C',
      subjects: {
        Math: '',
        English: 'teacher3',
        Science: 'teacher2',
        History: 'teacher1',
        Geography: '',
        Computer: 'teacher4',
        Physics: '',
        Chemistry: 'teacher5',
        Biology: 'teacher3',
      },
    },
  ]);

  // Array of available teachers with their IDs and names for selection
  const teacherOptions = [
    { id: '1', name: 'Teacher 1' },
    { id: '2', name: 'Teacher 2' },
    { id: '3', name: 'Teacher 3' },
    { id: '4', name: 'Teacher 4' },
    { id: '5', name: 'Teacher 5' },
  ];
  // State to store the selected division
  const [division, setDivision] = useState<string>('');

  // State to store available division options
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // State to store the selected class
  const [classes, setClasses] = useState<string>('');

  // Get selected subject from search params, default to 'All' if not present
  const selectedSubject = searchParams?.subject ? searchParams?.subject : 'All';

  // State to store the selected teacher for reassignment
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>([]);

  // State to store and manage the teacher assignment data
  const [teacherData, setTeacherData] = useState<ITeacher[]>(teacherTableData);

  // Boolean state to control dialog visibility
  const dialog = useBoolean();

  // State to track which teacher entry is being edited
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sendInstantNotificationDialogValue = useBoolean();

  /**
   * Handles the reassignment of teachers to a selected subject/class
   * @param values Object containing array of assigned teacher names
   * @description Updates the teacher data when teachers are reassigned to a subject.
   * If a teacher is selected, finds and updates their assignment in the data array,
   * then closes the dialog and resets the selection.
   */
  const handleTeacherReassignment = (values: { assignedTeacher: string[] }) => {
    if (selectedTeacher) {
      const updatedData = teacherData.map((row) =>
        row.id === selectedTeacher.id ? { ...row, assignedTeacher: values.assignedTeacher } : row
      );
      setTeacherData(updatedData);
      dialog.onFalse();
      setSelectedTeacher(null);
      shikshaMitraToast.success({ message: 'Teachar added successfully' });
    }
  };

  const subjectList = ['math', 'english', 'science'];

  /**
   * Filters the teacher data based on selected class and subject
   * @returns {Array} Filtered array of teacher data
   * @description Memoized function that filters teacher data based on:
   * 1. Matching class name from the selected class ID
   * 2. Matching subject (if 'All' is selected, includes all subjects)
   * Dependencies: teacherData, classData, selectedSubject, classes
   */
  const filteredData = useMemo(
    () =>
      teacherData.filter((item: any) => {
        const findClass = classData?.items?.find((c: any) => c.id === classes);
        const matchesClass = item.className === findClass?.name;
        const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
        return matchesClass && matchesSubject;
      }),
    [teacherData, classData?.items, selectedSubject, classes]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assign Teachers to Subject"
        description="Assign teachers to subjects for each division to ensure accurate and organized class management. Streamline the process by selecting the appropriate teacher for each subject and division."
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculumSubjects' },
          { name: 'Assign Teachers to Subject' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CustomSelect
            label="Class"
            name="class"
            options={classData?.items || []}
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            value={classes}
            labelKey="name"
            valueKey="id"
            onChange={(value) => {
              const selectedClass: Standards = classData.items.find(
                (i: Standards) => i.id === value
              );
              setClasses(selectedClass?.id);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
          />
        </Box>
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>
          <Button startIcon={<Save />} variant="contained">
            Save
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        // onSendNotification={handlerSendNotification}
        // showCheckbox={selectedTeacher.length !== 0}
        tableId="teacher-table"
        noDataText={<>No Teachers Data Found Select Class and Division</>}
        searchFieldProps={{
          placeholder: 'Search by Subject, Assigned Teacher...',
          label: 'Search by Subject, Assigned Teacher...',
          sx: {
            maxWidth: '500px',
            width: '100%',
          },
        }}
        columns={[
          {
            id: 'division',
            label: 'Division',
            filterType: 'string',
            minWidth: 90,
            align: 'left',
          },
          ...subjectList.map((subject) => ({
            id: subject,
            label: subject.charAt(0).toUpperCase() + subject.slice(1), // Fixed capitalization
            isFilter: false,
            isSort: false,
            render: (value: any, row: any) => (
              <Autocomplete
                multiple
                options={teacherOptions}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name}
                value={teacherOptions.filter((opt) => division.includes(opt.id))}
                onChange={(_, newValue) => {}}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.name}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Assign Teacher" variant="outlined" size="small" />
                )}
                sx={{ minWidth: '200px', width: '100%' }}
              />
            ),
          })),
        ]}
        data={tableData}
      />{' '}
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedTeacher}
        />
      )}
      <CustomDialog
        title="Reassign Teacher"
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
        }}
        maxWidth="sm"
      >
        <TeacherReassign selectedTeacher={selectedTeacher} onSubmit={handleTeacherReassignment} />
      </CustomDialog>
    </Box>
  );
};

export default Teacher;
