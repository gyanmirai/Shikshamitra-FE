'use client';

import type { Division, Standards } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

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
      />
      <CustomSelect
        label="Select Organization"
        options={[
          { value: 'Pre Primary', label: 'Pre Primary' },
          { value: 'Primary', label: 'Primary' },
          { value: 'Secondary', label: 'Secondary' },
          { value: 'Higher Secondary', label: 'Higher Secondary' },
        ]}
        value=""
        onChange={(val) => {
          // formik.setFieldValue('organization', val);
        }}
        formControlProps={{ fullWidth: true, sx: { maxWidth: '200px', mb: 2 } }}
      />

      <CustomizableTable
        tableId="assignTeacherTable"
        columns={[
          {
            id: 'className',
            label: 'Class',
          },
          {
            id: 'division',
            label: 'Division',
          },
          {
            id: 'classTeacher',
            label: 'Class Teacher',
            render(value, row) {
              return (
                <CustomSelect
                  label="Class Teacher"
                  options={[
                    { value: 'ABC', label: 'ABC' },
                    { value: 'XYZ', label: 'XYZ' },
                    { value: 'PQR', label: 'PQR' },
                  ]}
                  value=""
                  onChange={(val) => {
                    // formik.setFieldValue('organization', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: '200px' } }}
                />
              );
            },
          },
        ]}
        data={[
          {
            className: '1',
            division: 'A',
            classTeacher: '',
          },
          {
            className: '1',
            division: 'B',
            classTeacher: '',
          },
          {
            className: '3',
            division: 'C',
            classTeacher: '',
          },
          {
            className: '4',
            division: 'D',
            classTeacher: '',
          },
        ]}
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
        <DialogActions sx={{ px: 0 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
