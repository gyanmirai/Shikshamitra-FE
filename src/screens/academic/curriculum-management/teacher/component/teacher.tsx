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
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const [classes, setClasses] = useState<string>('');
  const selectedSubject = searchParams?.subject ? searchParams?.subject : 'All';

  // const [selectedClass, setSelectedClass] = useState('All');
  // const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const [teacherData, setTeacherData] = useState<TTeacherData[]>(TeacherData);
  const dialog = useBoolean();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  // const classOptions = useMemo(() => {
  //   if (!classData) return [{ label: 'All', value: 'All' }];

  //   return [
  //     { label: 'All', value: 'All' },
  //     // eslint-disable-next-line no-unsafe-optional-chaining
  //     ...classData?.items.map((cls: any) => ({
  //       label: cls.name, // Adjust this based on your actual API response structure
  //       value: cls.id, // Adjust this based on your actual API response structure
  //     })),
  //   ];
  // }, [classData]);

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
        heading="Teacher"
        links={[{ name: 'Academic and Assignment' }, { name: 'Curriculum' }, { name: 'Teacher' }]}
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
        tableId="teacher-table"
        columns={[
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
