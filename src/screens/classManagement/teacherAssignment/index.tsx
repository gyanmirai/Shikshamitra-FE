'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

// import { useGetClassQuery } from 'src/redux/class/classApi';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import sortQueryString from 'src/utils/sort-query-string';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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
import {
  useGetTeacherAssignmentsQuery,
  useUpdateTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/teacherAssignmentApi/teacherAssignmentApi';

import { TeacherListPopover } from '../../academic/curriculum-management/subjectAssignment/component/subjectAssignmentForm/TeacherSelectionFields';

import type { ITeacherOption } from '../../academic/curriculum-management/subjectAssignment/component/type';

const TeacherAssignment = ({
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

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [focusedCells, setFocusedCells] = useState<{ division: string; subject: string }[]>([]);

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [originalTableData, setOriginalTableData] = useState<any[]>([]);

  const selectedClass = useMemo(
    () => allClass.find((cls) => cls.id === classes),
    [allClass, classes]
  );

  const divisions = useMemo(() => selectedClass?.divisions || [], [selectedClass]);

  // // Fetch Subjects
  // const { data: subjectsData } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetSubjectsQuery,
  //   params: {
  //     academicMediumId: medium?.id,
  //     classId: classes,
  //   },
  // });

  // useEffect(() => {
  //   if (subjectsData) {
  //     setSubjectList(subjectsData);
  //   }
  // }, [subjectsData]);

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  // Fetch Assignments
  const { data: assignmentsData, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTeacherAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      classId: classes,
      ...query,
    },
  });

  // Initialize Table Data
  useEffect(() => {
    if (divisions.length > 0 && subjectList.length > 0) {
      const newTableData = divisions.map((div: any) => {
        const row: any = {
          divisionId: div.id,
          divisionName: div.name,
          subjects: {},
        };

        // Initialize subject buckets
        subjectList.forEach((sub: any) => {
          row.subjects[sub.id] = [];
        });

        // Fill with assignments if available
        if (assignmentsData && assignmentsData.length > 0) {
          assignmentsData.forEach((assignment: any) => {
            if (assignment.divisionId === div.id) {
              row.subjects[assignment.subjectId] = assignment.teacherIds || [];
            }
          });
        }

        return row;
      });

      setTableData(newTableData);
      setOriginalTableData(JSON.parse(JSON.stringify(newTableData))); // Deep copy
    }
  }, [divisions, subjectList, assignmentsData]);

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
      Object.entries(division.subjects).forEach(([subjectId, teachers]) => {
        const originalTeachers = originalTableData[divIndex]?.subjects[subjectId];
        if (JSON.stringify(teachers) !== JSON.stringify(originalTeachers)) {
          const subjectName = subjectList.find((s) => s.id === subjectId)?.name;
          if (subjectName) modifiedSubjects.add(subjectName);
        }
      });
    });

    return Array.from(modifiedSubjects);
  };

  const handleReset = () => {
    setTableData(JSON.parse(JSON.stringify(originalTableData)));
    setFocusedCells([]);
    resetConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Teachers assignment reset successfully' });
  };

  const [updateTeacherAssignments, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateTeacherAssignmentsMutation,
  });

  const handleSave = async () => {
    if (!medium?.id || !classes) return;

    try {
      const assignments: any[] = [];

      tableData.forEach((row) => {
        Object.entries(row.subjects).forEach(([subjectId, teacherIds]) => {
          if (Array.isArray(teacherIds) && teacherIds.length > 0) {
            assignments.push({
              divisionId: row.divisionId,
              subjectId,
              teacherIds,
            });
          }
        });
      });

      const payload = {
        academicMediumId: medium.id,
        classId: classes,
        assignments,
      };

      await updateTeacherAssignments(payload).unwrap();
      refetch();
      setOriginalTableData(JSON.parse(JSON.stringify(tableData)));
      setFocusedCells([]);
      saveConfirmDialog.onFalse();
      shikshaMitraToast.success({ message: 'Teachers assignment saved successfully' });
    } catch (error) {
      console.error(error);
      shikshaMitraToast.error({ message: 'Failed to save assignments' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Teachers Assignment"
        description="Assign teachers to subjects for each division to ensure accurate and organized class management. Streamline the process by selecting the appropriate teacher for each subject and division."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Teachers Assignment' },
        ]}
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
            sx={{ px: '32px' }}
          >
            Reset
          </Button>
          <LoadingButton
            startIcon={<Save />}
            variant="contained"
            size="small"
            onClick={() => {
              saveConfirmDialog.onTrue();
            }}
            loading={isSaving}
            disabled={!hasChanges}
            sx={{ px: '32px' }}
          >
            Save
          </LoadingButton>
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
            minWidth: '90px',
            sticky: true,
            render: (value: any, row: any) => (
              <Typography variant="caption" fontSize="13px">
                {row.divisionName}
              </Typography>
            ),
          },
          ...subjectList.map((subject) => ({
            id: subject.id,
            label: `${subject.name.charAt(0).toUpperCase() + subject.name.slice(1)} ${
              subject.code ? `(${subject.code})` : ''
            }`,
            isFilter: false,
            isSort: false,
            render: (_value: any, row: any) => {
              const currentTeachers = row.subjects[subject.id] || [];
              const isCellFocused = focusedCells.some(
                (cell) => cell.division === row.divisionId && cell.subject === subject.id
              );
              return (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={teacherOptions}
                  getOptionLabel={(option) => option.name}
                  value={teacherOptions.filter((opt) => currentTeachers.includes(opt.value))}
                  onChange={(_, newValue) => {
                    const updatedTableData = [...tableData];
                    const divisionIndex = updatedTableData.findIndex(
                      (d) => d.divisionId === row.divisionId
                    );

                    if (divisionIndex !== -1) {
                      updatedTableData[divisionIndex] = {
                        ...updatedTableData[divisionIndex],
                        subjects: {
                          ...updatedTableData[divisionIndex].subjects,
                          [subject.id]: newValue.map((teacher) => teacher.value),
                        },
                      };
                      setTableData(updatedTableData);
                    }

                    const newFocus = { division: row.divisionId, subject: subject.id };
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
        data={tableData}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
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
          <LoadingButton
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleSave}
            loading={isSaving}
          >
            Save
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default TeacherAssignment;
