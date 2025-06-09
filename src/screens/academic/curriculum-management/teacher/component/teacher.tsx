'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Chip, Button, Avatar, Checkbox, TextField, Autocomplete } from '@mui/material';

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
import { TeacherListPopover } from '../../subject/component/subjectCardComponent';

import type { ITeacher } from './type';
import type { ITeacherOption } from '../../subject/component/type';

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
  const teacherOptions: ITeacherOption[] = [
    {
      value: 't1',
      label: 'Sharma Riya Kumar',
      department: 'Mathematics Department',
      avatar: 'https://yourcdn.com/riya.png',
    },
    {
      value: 't2',
      label: 'Patel Ankit Rajesh',
      department: 'Science Department',
      avatar: 'https://yourcdn.com/ankit.png',
    },
    {
      value: 't3',
      label: 'Desai Priya Mahesh',
      department: 'English Department',
      avatar: 'https://yourcdn.com/priya.png',
    },
    {
      value: 't4',
      label: 'Singh Rahul Vikram',
      department: 'Social Studies Department',
      avatar: 'https://yourcdn.com/rahul.png',
    },
    {
      value: 't5',
      label: 'Mehta Neha Suresh',
      department: 'Hindi Department',
      avatar: 'https://yourcdn.com/neha.png',
    },
  ];
  // State to store the selected division
  const [division, setDivision] = useState<string>('');

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
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // State to store the selected teacher for reassignment
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>([]);

  // State to store and manage the teacher assignment data
  const [teacherData, setTeacherData] = useState<ITeacher[]>(teacherTableData);

  // Boolean state to control dialog visibility
  const dialog = useBoolean();

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

  const subjectList = [
    'math',
    'english',
    'science',
    'history',
    'geography',
    'computer',
    'physics',
    'chemistry',
    'biology',
  ];
  const divisionList = ['A', 'B', 'C'];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Teachers Assignment"
        description="Assign teachers to subjects for each division to ensure accurate and organized class management. Streamline the process by selecting the appropriate teacher for each subject and division."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Curriculum Management', href: '/academic/curriculumSubjects' },
          { name: 'Teachers Assignment' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CustomSelect
            label="Class"
            name="class"
            options={allClass}
            valueKey="id"
            labelKey="name"
            formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
            value={classes}
            onChange={(value) => {
              setClasses(value as string);
            }}
          />
        </Box>
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={() => {}} size="small">
            Reset
          </Button>
          <Button startIcon={<Save />} variant="contained" size="small">
            Save
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        tableId="teacher-table"
        noDataText={<>No Teachers Data Found Select Class and Division</>}
        isSearch={false}
        isFilter={false}
        columns={[
          {
            id: 'subject',
            label: 'Subject',
            filterType: 'string',
            align: 'left',
            minWidth: '100px',
            sticky: true,
          },
          ...divisionList.map((div) => ({
            id: div,
            label: `Division ${div}`,
            isFilter: false,
            isSort: false,
            render: (value: any, row: any) => (
              <Autocomplete
                multiple
                options={teacherOptions}
                getOptionLabel={(option) => option.label}
                value={row[div] ? teacherOptions.filter((opt) => row[div].includes(opt.value)) : []}
                onChange={(_, newValue) => {
                  const updatedTableData = tableData.map((divisionData) => {
                    if (divisionData.division === div) {
                      return {
                        ...divisionData,
                        subjects: {
                          ...divisionData.subjects,
                          [row.subject]: newValue.map((teacher) => teacher.value),
                        },
                      };
                    }
                    return divisionData;
                  });

                  setTableData(updatedTableData);
                }}
                renderInput={(params) => (
                  <TextField label="Assign Teachers" {...params} variant="outlined" size="small" />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.label}
                  </li>
                )}
                sx={{ width: '100%', minWidth: '350px' }}
                renderTags={(val) => {
                  if (val.length === 0) return null;
                  const first = val[0];
                  const remainingCount = val.length - 1;
                  return [
                    <Chip
                      key={first.value}
                      variant="soft"
                      avatar={<Avatar>{first.label.charAt(0)}</Avatar>}
                      label={first.label}
                      sx={{ ml: 1 }}
                      size="small"
                    />,
                    remainingCount > 0 && (
                      <TeacherListPopover
                        key="more-count"
                        teachers={val.slice(1)}
                        count={remainingCount}
                      />
                    ),
                  ];
                }}
              />
            ),
          })),
        ]}
        data={subjectList.map((subject) => {
          const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);

          const row: any = { subject: formattedSubject };

          divisionList.forEach((div) => {
            const divisionData = tableData.find((d) => d.division === div);
            row[div] =
              divisionData?.subjects[formattedSubject as keyof typeof divisionData.subjects] || [];
          });

          return row;
        })}
      />
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
