'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useMemo, useState } from 'react';

import { Box, Button } from '@mui/material';
import { RestartAlt } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import teacherTableData from 'src/json/academic/curriculum/teacherTableData.json';

import { Iconify } from 'src/components/iconify';
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

  const [tableData, setTableData] = useState([
    {
      division: 'A',
      subjects: {
        Math: 'teacher1',
        english: '',
        science: 'teacher3',
      },
    },
    {
      division: 'B',
      subjects: {
        Math: 'teacher2',
        english: 'teacher1',
        science: '',
      },
    },
    {
      division: 'C',
      subjects: {
        Math: '',
        english: 'teacher3',
        science: 'teacher2',
      },
    },
  ]);

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

  /**
   * Handles the opening of send notification dialog
   * @description Toggles the notification dialog visibility state to true
   * if it's currently not visible
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const handleTeacherChange = (div: string, subject: string, newTeacher: String) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.division === div
          ? {
              ...row,
              subjects: {
                ...row.subjects,
                [subject]: newTeacher,
              },
            }
          : row
      )
    );
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Teacher"
        description="Assign teachers to subjects for each division to ensure accurate and organized class management. Streamline the process by selecting the appropriate teacher for each subject and division."
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Curriculum', href: '/academic/curriculum-management' },
          { name: 'Teacher' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CustomSelect
            label="Class"
            name="class"
            options={classData?.items || []}
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => {}}
          >
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
          placeholder: 'Search by Subject, Assigned Teacher',
          label: 'Search by Subject, Assigned Teacher',
        }}
        columns={[
          {
            id: 'division',
            label: 'Division',
            filterType: 'string',
            minWidth: 70,
            align: 'left',
          },
          ...subjectList.map((subject) => ({
            id: subject,
            label: subject.charAt(0).toUpperCase() + subject.slice(1), // Fixed capitalization
            isFilter: false,
            isSort: false,
            render: (value: any, row: any) => (
              <CustomSelect
                size="small"
                value={row.subjects?.[subject] || ''}
                options={[
                  { label: 'Mr. Sharma', value: 'teacher1' },
                  { label: 'Ms. Patel', value: 'teacher2' },
                  { label: 'Mr. Khan', value: 'teacher3' },
                ]}
                onChange={(val) => handleTeacherChange(row.division, subject, val as string)}
                placeholder="Assign Teacher"
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
