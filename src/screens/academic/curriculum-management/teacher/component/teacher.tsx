'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Save } from '@mui/icons-material';
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
  const resetConfirmDialog = useBoolean();
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

  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  const [focusedCells, setFocusedCells] = useState<{ division: string; subject: string }[]>([]);

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const initialTableData = [
    {
      division: 'A',
      subjects: {
        Math: [],
        English: [],
        Science: [],
        History: [],
        Geography: [],
        Computer: [],
        Physics: [],
        Chemistry: [],
        Biology: [],
      },
    },
    {
      division: 'B',
      subjects: {
        Math: [],
        English: [],
        Science: [],
        History: [],
        Geography: [],
        Computer: [],
        Physics: [],
        Chemistry: [],
        Biology: [],
      },
    },
    {
      division: 'C',
      subjects: {
        Math: [],
        English: [],
        Science: [],
        History: [],
        Geography: [],
        Computer: [],
        Physics: [],
        Chemistry: [],
        Biology: [],
      },
    },
    {
      division: 'D',
      subjects: {
        Math: [],
        English: [],
        Science: [],
        History: [],
        Geography: [],
        Computer: [],
        Physics: [],
        Chemistry: [],
        Biology: [],
      },
    },
    {
      division: 'E',
      subjects: {
        Math: [],
        English: [],
        Science: [],
        History: [],
        Geography: [],
        Computer: [],
        Physics: [],
        Chemistry: [],
        Biology: [],
      },
    },
  ];

  const [tableData, setTableData] = useState(initialTableData);
  const [originalTableData, setOriginalTableData] = useState(initialTableData);

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
    setFocusedCells([]);
    resetConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Teachers assignment reset successfully' });
  };

  const handleSave = () => {
    setOriginalTableData(tableData);
    setFocusedCells([]);
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
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
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
            id: 'division',
            label: 'Division',
            filterType: 'string',
            align: 'left',
            minWidth: '80px',
            sticky: true,
            render: (value: string) => (
              <Typography variant="caption" fontSize="13px">
                {value}
              </Typography>
            ),
          },
          ...subjectList.map((subject) => ({
            id: subject.name,
            label: `${subject.name.charAt(0).toUpperCase() + subject.name.slice(1)} (${subject.code})`,
            isFilter: false,
            isSort: false,
            render: (_value: any, row: any) => {
              const isCellFocused = focusedCells.some(
                (cell) => cell.division === row.division && cell.subject === subject.name
              );
              return (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={teacherOptions}
                  getOptionLabel={(option) => option.name}
                  value={
                    row[subject.name]
                      ? teacherOptions.filter((opt) => row[subject.name].includes(opt.value))
                      : []
                  }
                  onChange={(_, newValue) => {
                    const updatedTableData = [...tableData];
                    const divisionIndex = updatedTableData.findIndex(
                      (d) => d.division === row.division
                    );

                    if (divisionIndex !== -1) {
                      updatedTableData[divisionIndex] = {
                        ...updatedTableData[divisionIndex],
                        subjects: {
                          ...updatedTableData[divisionIndex].subjects,
                          [subject.name.charAt(0).toUpperCase() + subject.name.slice(1)]:
                            newValue.map((teacher) => teacher.value),
                        },
                      };
                      setTableData(updatedTableData);
                    }

                    const newFocus = { division: row.division, subject: subject.name };
                    setFocusedCells((prev) => {
                      const exists = prev.some(
                        (cell) =>
                          cell.division === newFocus.division && cell.subject === newFocus.subject
                      );

                      if (newValue.length === 0) {
                        return prev.filter(
                          (cell) =>
                            !(
                              cell.division === newFocus.division &&
                              cell.subject === newFocus.subject
                            )
                        );
                      }

                      if (!exists) {
                        return [...prev, newFocus];
                      }

                      return prev;
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      label="Select Teachers"
                      {...params}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: 'rgba(0, 0, 0, 0.5)',
                            borderWidth: '2px',
                          },
                        },
                        width: '330px',
                      }}
                    />
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
                  renderTags={(val, getTagProps) => {
                    if (val.length === 0) return null;
                    const first = val[0];
                    const remainingCount = val.length - 1;
                    return [
                      <Chip
                        avatar={<Avatar>{first.name.charAt(0)}</Avatar>}
                        label={first.name}
                        size="small"
                        variant="soft"
                        sx={{ ml: 1 }}
                        {...getTagProps({ index: 0 })} // includes key + onDelete
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isCellFocused ? 'primary.main' : 'rgba(0,0,0,0.23)',
                        borderWidth: isCellFocused ? 2 : 1,
                      },
                      '&:hover fieldset': {
                        borderColor: isCellFocused ? 'primary.main' : undefined,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isCellFocused ? 'primary.main' : undefined,
                      },
                    },
                  }}
                />
              );
            },
          })),
        ]}
        data={divisionList.map((division) => {
          const divisionData = tableData.find((d) => d.division === division);
          const row: any = { division };

          subjectList.forEach((subject) => {
            const formattedSubject = subject.name.charAt(0).toUpperCase() + subject.name.slice(1);
            row[subject.name] =
              divisionData?.subjects[formattedSubject as keyof typeof divisionData.subjects] || [];
          });

          return row;
        })}
      />

      <ConfirmDialog
        title="Reset"
        open={resetConfirmDialog.value}
        onClose={resetConfirmDialog.onFalse}
        content="Are you sure you want to reset all changes ?"
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
            changes ?
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
