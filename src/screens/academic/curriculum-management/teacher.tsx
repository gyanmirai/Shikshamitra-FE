'use client';

import { useFormik } from 'formik';
import React, { useMemo, useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Grid, Chip, Button, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface TTeacherData {
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

  const selectedClass = searchParams?.classId ? searchParams?.classId : 'All';
  const selectedSubject = searchParams?.subject ? searchParams?.subject : 'All';

  // const [selectedClass, setSelectedClass] = useState('All');
  // const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const [teacherData, setTeacherData] = useState<TTeacherData[]>(TeacherData);
  const dialog = useBoolean();

  console.log('teacher data---------', teacherData);

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

  const classOptions = useMemo(() => {
    if (!classData) return [{ label: 'All', value: 'All' }];
    console.log('class Data----', classData);

    return [
      { label: 'All', value: 'All' },
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...classData?.items.map((cls: any) => ({
        label: cls.name, // Adjust this based on your actual API response structure
        value: cls.id, // Adjust this based on your actual API response structure
      })),
    ];
  }, [classData]);

  const filteredData = useMemo(
    () =>
      teacherData.filter((item: any) => {
        const findClass = classData?.items?.find((c: any) => c.id === selectedClass);
        const matchesClass = selectedClass === 'All' || item.className === findClass?.name;
        const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
        return matchesClass && matchesSubject;
      }),
    [teacherData, classData?.items, selectedClass, selectedSubject]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Teacher"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Curriculum Management' },
          { name: 'Teacher' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <CustomSelect
          label="Class"
          name="class"
          options={classOptions}
          formControlProps={{ sx: { width: '150px' } }}
          value={selectedClass}
          onChange={(value) => {
            setSearchParams?.({ classId: value as string });
          }}
        />
        <CustomSelect
          label="Subject"
          name="subject"
          options={[
            { value: 'All', label: 'All' },
            { value: 'Math', label: 'Math' },
            { value: 'English', label: 'English' },
            { value: 'Science', label: 'Science' },
          ]}
          formControlProps={{ sx: { width: '150px' } }}
          value={selectedSubject}
          onChange={(value) => setSearchParams?.({ subject: value as string })}
        />
      </Box>
      <Grid2 container spacing={3}>
        <CustomizableTable
          columns={[
            {
              id: 'className',
              label: 'Class',
            },
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
              label: 'Action',
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
      </Grid2>
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

interface TeacherReassignProps {
  selectedTeacher: TTeacherData | null;
  onSubmit: (values: any) => void;
}

const TeacherReassign: React.FC<TeacherReassignProps> = ({ selectedTeacher, onSubmit }) => {
  console.log('selected teacher---', selectedTeacher);

  const formik = useFormik({
    initialValues: {
      assignedTeacher: selectedTeacher?.assignedTeacher || [],
    },
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Assigned Teacher"
                options={[
                  { value: 'John Doe', label: 'John Doe' },
                  { value: 'Jane Smith', label: 'Jane Smith' },
                  { value: 'Robert Johnson', label: 'Robert Johnson' },
                  { value: 'Emily Brown', label: 'Emily Brown' },
                  { value: 'Michael Wilson', label: 'Michael Wilson' },
                ]}
                name="assignedTeacher"
                multiple
                value={formik.values.assignedTeacher}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                onChange={(val) => {
                  formik.setFieldValue('assignedTeacher', val);
                }}
                error={formik.touched.assignedTeacher}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            Reassign
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
