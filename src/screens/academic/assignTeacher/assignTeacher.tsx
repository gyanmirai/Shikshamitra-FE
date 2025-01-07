'use client';

import type { Division, Standards } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AssignTeacher = () => {
  const assignTeacherDialog = useBoolean();
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses(firstClass.id);
        setDivisionOptions(firstClass?.divisions || []);
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assign Teacher"
        links={[{ name: 'Academic and Assignment' }, { name: 'Assign Teacher' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:arrow-right-circle" />}
            onClick={() => {
              assignTeacherDialog.onTrue();
            }}
          >
            Assign Teacher
          </Button>
        }
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            setClasses(val as string);
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
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />
      </Box>

      <CustomizableTable
        columns={[
          {
            id: 'fullName',
            label: 'Full Name',
          },
          {
            id: 'dob',
            label: 'DOB',
          },
          {
            id: 'age',
            label: 'Age',
          },
          {
            id: 'email',
            label: 'Email',
          },
          {
            id: 'mobileNo',
            label: 'Mobile No',
          },
          //   {
          //     id: 'category',
          //     label: 'Category',
          //   },
          //   {
          //     id: 'status',
          //     label: 'Status',
          //     render: (value) => (
          //       <Label
          //         color={
          //           value === 'Completed'
          //             ? 'error'
          //             : value === 'Active'
          //               ? 'primary'
          //               : value === 'Scheduled'
          //                 ? 'warning'
          //                 : 'default'
          //         }
          //       >
          //         {value}
          //       </Label>
          //     ),
          //   },
          //   {
          //     id: 'action',
          //     label: 'Action',
          //     isSort: false,
          //     render(value, row) {
          //       return (
          //         <ThreeDotsActions
          //           actions={(prop) => actions({ ...props, row })}
          //           placement="right-top"
          //           showEditIcon
          //           showDeleteIcon
          //           showViewIcon
          //           handleViewClick={() => {
          //             assignStudentDialog.onTrue();
          //             setSelectedActivity(row as Activity);
          //           }}
          //           handleEditClick={() => {
          //             setSelectedActivity(row as Activity);
          //             setIsEdit(true);
          //             dialog.onTrue();
          //           }}
          //           handleDeleteClick={() => {
          //             setSelectedActivity(row as Activity);
          //             deleteConfirmDialog.onTrue();
          //           }}
          //         />
          //       );
          //     },
          //   },
        ]}
        data={[]}
      />

      <CustomDialog
        open={assignTeacherDialog.value}
        handleClose={() => {
          assignTeacherDialog.onFalse();
        }}
        title={isEdit ? 'Update Classteacher' : 'Assign Classteacher'}
      >
        <AssignTeacherForm
          onSubmit={() => {}}
          onClose={assignTeacherDialog.onFalse}
          data={null}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default AssignTeacher;

interface TeacherData {
  teacherName: string;
}

interface AssignTeacherFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: TeacherData | null;
  isEdit: boolean;
}

const AssignTeacherForm: React.FC<AssignTeacherFormProps> = ({
  onSubmit,
  onClose,
  data,
  isEdit,
}) => {
  const validationSchema = Yup.object().shape({
    teacherName: Yup.string().required('Teacher Name is Required'),
  });

  const formik = useFormik({
    initialValues: {
      teacherName: data?.teacherName || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <CustomSelect
                label="Teacher Name"
                options={[
                  { value: 'ABC', label: 'ABC' },
                  { value: 'XYZ', label: 'XYZ' },
                  { value: 'PQR', label: 'PQR' },
                ]}
                onChange={(val) => {
                  formik.setFieldValue('teacherName', val);
                }}
                value={formik.values.teacherName}
                formControlProps={{
                  sx: { width: '100%' },
                }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
