'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Chip,
  Button,
  Avatar,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TeacherListPopover } from '../../subject/component/subjectCardComponent';

import type { ITeacherOption } from '../../subject/component/type';

const Teacher = ({
  searchParams,
  setSearchParams,
}: {
  searchParams?: Record<string, string>;
  setSearchParams?: (obj: Record<string, any>) => void;
}) => {
  // Dialog control states for reset and save confirmations
  const resetConfirmDialog = useBoolean();
  // Dialog state for save confirmation popup
  const saveConfirmDialog = useBoolean();

  const teacherOptions: ITeacherOption[] = [
    {
      value: 't1',
      name: 'Sharma Riya Kumar',
      department: 'Mathematics Department',
      avatar: 'https://yourcdn.com/riya.png',
    },
    {
      value: 't2',
      name: 'Patel Ankit Rajesh',
      department: 'Science Department',
      avatar: 'https://yourcdn.com/ankit.png',
    },
    {
      value: 't3',
      name: 'Desai Priya Mahesh',
      department: 'English Department',
      avatar: 'https://yourcdn.com/priya.png',
    },
    {
      value: 't4',
      name: 'Singh Rahul Vikram',
      department: 'Social Studies Department',
      avatar: 'https://yourcdn.com/rahul.png',
    },
    {
      value: 't5',
      name: 'Mehta Neha Suresh',
      department: 'Hindi Department',
      avatar: 'https://yourcdn.com/neha.png',
    },
  ];

  // Get global state values from Redux store
  // currentBoard - Selected board (e.g. CBSE, ICSE)
  // medium - Selected medium of instruction (e.g. English, Hindi)
  // setMedium - Function to update the selected medium
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);
  // State for managing class data
  const [allClass, setAllClass] = useState<Standards[]>([]); // Stores list of all available classes
  const [classes, setClasses] = useState<string>(''); // Currently selected class

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initial mock data structure for teacher assignments
  // Each object represents a division with subject-teacher mappings
  // Empty strings indicate unassigned teachers
  const initialTableData = [
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
  ];

  const [tableData, setTableData] = useState(initialTableData);
  const [originalTableData, setOriginalTableData] = useState(initialTableData);

  // Check if there are any changes in the table data
  const hasChanges = useMemo(
    () => JSON.stringify(tableData) !== JSON.stringify(originalTableData),
    [tableData, originalTableData]
  );

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Get modified subjects
  const getModifiedSubjects = () => {
    const modifiedSubjects = new Set<string>();

    tableData.forEach((division, divIndex) => {
      Object.entries(division.subjects).forEach(([subject, teachers]) => {
        if (
          JSON.stringify(teachers) !==
          JSON.stringify(
            originalTableData[divIndex].subjects[subject as keyof typeof division.subjects]
          )
        ) {
          modifiedSubjects.add(subject);
        }
      });
    });

    return Array.from(modifiedSubjects);
  };

  const handleReset = () => {
    setTableData(originalTableData);
    resetConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Teachers assignment reset successfully' });
  };

  const handleSave = () => {
    setOriginalTableData(tableData);
    saveConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Teachers assignment saved successfully' });
  };

  const subjectList = [
    { name: 'math', code: 'MTH', color: '#FF5733' },
    { name: 'english', code: 'ENG', color: '#33FF57' },
    { name: 'science', code: 'SCI', color: '#3357FF' },
    { name: 'social science', code: 'SST', color: '#FF33F5' },
    { name: 'computer', code: 'COM', color: '#33FFF5' },
    { name: 'gujarati', code: 'GUJ', color: '#FFB533' },
    { name: 'hindi', code: 'HIN', color: '#FF3333' },
    { name: 'marathi', code: 'MAR', color: '#33FF33' },
    { name: 'sanskrit', code: 'SNS', color: '#3333FF' },
  ];
  const divisionList = ['A', 'B', 'C', 'D', 'E'];

  // Rest of your code remains the same until the buttons section

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Teachers Assignment"
        description="Assign teachers to subjects for each division to ensure accurate and organized class management. Streamline the process by selecting the appropriate teacher for each subject and division."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
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
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={() => {
              resetConfirmDialog.onTrue();
            }}
            size="small"
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            size="small"
            onClick={() => {
              saveConfirmDialog.onTrue();
            }}
            disabled={!hasChanges}
          >
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
            minWidth: '150px',
            sticky: true,
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 18,
                    borderRadius: 1,
                    backgroundColor: row.subjectColor,
                  }}
                />
                <Typography variant="caption">
                  {value} ({row.subjectCode})
                </Typography>
              </Box>
            ),
          },
          ...divisionList.map((div) => ({
            id: div,
            label: `Division ${div}`,
            isFilter: false,
            isSort: false,
            render: (value: any, row: any) => (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={teacherOptions}
                getOptionLabel={(option) => option.name}
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
                  <TextField label="Select Teachers" {...params} variant="outlined" size="small" />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.name}
                  </li>
                )}
                sx={{ width: '100%', minWidth: '330px' }} // Removed pr: 0 and reduced minWidth
                renderTags={(val) => {
                  if (val.length === 0) return null;
                  const first = val[0];
                  const remainingCount = val.length - 1;
                  return [
                    <Chip
                      key={first.value}
                      variant="soft"
                      avatar={<Avatar>{first.name.charAt(0)}</Avatar>}
                      label={first.name}
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
          const formattedSubject = subject.name.charAt(0).toUpperCase() + subject.name.slice(1);

          const row: any = {
            subject: formattedSubject,
            subjectCode: subject.code,
            subjectColor: subject.color,
          };

          divisionList.forEach((div) => {
            const divisionData = tableData.find((d) => d.division === div);
            row[div] =
              divisionData?.subjects[formattedSubject as keyof typeof divisionData.subjects] || [];
          });

          return row;
        })}
      />

      <ConfirmDialog
        title="Reset"
        open={resetConfirmDialog.value}
        onClose={resetConfirmDialog.onFalse}
        content="Are you sure you want to reset all changes?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={handleReset}
            size="small"
          >
            Reset
          </Button>
        }
      />

      <ConfirmDialog
        title="Save"
        open={saveConfirmDialog.value}
        onClose={saveConfirmDialog.onFalse}
        content={
          <>
            Are you sure you want to save the <strong>{getModifiedSubjects().join(', ')}</strong>{' '}
            changes?
          </>
        }
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleSave}
          >
            Save
          </Button>
        }
      />
    </Box>
  );
};

export default Teacher;
