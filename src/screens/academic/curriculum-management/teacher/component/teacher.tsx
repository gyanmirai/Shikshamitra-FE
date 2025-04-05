'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useMemo, useState } from 'react';

import { Box, Chip } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import TeacherReassign from './teacherReassignForm';

export interface TTeacherData {
  id: number;
  subject: string;
  className: string;
  assignedTeacher: string[];
}

const TeacherData: TTeacherData[] = [
  {
    id: 1,
    subject: 'Math',
    className: '1',
    assignedTeacher: ['John Doe'],
  },
  {
    id: 2,
    subject: 'Science',
    className: '1',
    assignedTeacher: ['Jane Smith'],
  },
  {
    id: 3,
    subject: 'English',
    className: '2',
    assignedTeacher: ['Robert Johnson'],
  },
  {
    id: 4,
    subject: 'History',
    className: '3',
    assignedTeacher: ['Emily Brown'],
  },
  {
    id: 5,
    subject: 'Physical Education',
    className: '1',
    assignedTeacher: ['Michael Wilson'],
  },
];

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
  const [teacherData, setTeacherData] = useState<TTeacherData[]>(TeacherData);

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
    }
  };
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <CustomSelect
          label="Class"
          name="class"
          options={classData?.items || []}
          formControlProps={{ sx: { width: '150px' } }}
          value={classes}
          labelKey="name"
          valueKey="id"
          onChange={(value) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === value);
            setClasses(selectedClass?.id);
            setDivisionOptions(selectedClass?.divisions || []);
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
            const selectedDivision = divisionOptions.find((i: Division) => val === i.id);
            setDivision(val as string);
          }}
          formControlProps={{ sx: { width: '150px' } }}
        />
      </Box>
      <CustomizableTable
        // onSendNotification={handlerSendNotification}
        // showCheckbox={selectedTeacher.length !== 0}
        tableId="teacher-table"
        columns={[
          // {
          //   id: 'checkBox',
          //   align: 'left',
          //   minWidth: '60px',
          //   isSort: false,
          //   isFilter: false,
          //   label: '',
          //   renderColumn() {
          //     return (
          //       <Checkbox
          //         checked={
          //           !!filteredData?.length && selectedTeacher?.length === filteredData?.length
          //         }
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedTeacher(filteredData || []);
          //           } else {
          //             setSelectedTeacher([]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          //   render(value, row) {
          //     return (
          //       <Checkbox
          //         checked={selectedTeacher.some((i: any) => i.id === row.id)}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedTeacher([...selectedTeacher, row]);
          //           } else {
          //             setSelectedTeacher(selectedTeacher.filter((i: any) => i.id !== row.id));
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
          {
            id: 'subject',
            label: 'Subject',
          },
          {
            id: 'assignedTeacher',
            label: 'Assigned Teacher',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip key={audience} label={audience} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'action',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setSelectedTeacher(row as any);
                  }}
                />
              );
            },
          },
        ]}
        data={filteredData}
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
