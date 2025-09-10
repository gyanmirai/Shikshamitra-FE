import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAssignTeacherProps } from './type';

const AssignTeacher: React.FC<IAssignTeacherProps> = ({
  teacherDialog,
  slotData,
  onTeacherSelect,
  onClose,
}) => {
  // Generate initial values with subjectCode as key
  const initialValues = React.useMemo(() => {
    const teachers: Record<string, string> = {};
    slotData.subjects.forEach((sub: any) => {
      teachers[sub.subjectCode] = sub.teacher || '';
    });
    return { teachers };
  }, [slotData]);

  const validationSchema = Yup.object().shape({
    teachers: Yup.object().shape(
      Object.fromEntries(
        slotData.subjects.map((sub: any) => [
          sub.subjectCode,
          Yup.string().required('Teacher is required'),
        ])
      )
    ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const updatedSubjects = slotData.subjects.map((sub: any) => ({
        ...sub,
        teacher: values.teachers[sub.subjectCode],
      }));
      onTeacherSelect({ ...slotData, subjects: updatedSubjects });
    },
  });

  return (
    <BackPopUpChecked
      initialValues={slotData.subjects}
      currentValues={slotData.subjects.map((s: any) => ({
        ...s,
        teacher: formik.values.teachers[s.subjectCode],
      }))}
    >
      <DialogScrollContent>
        <CustomizableTable
          tableId="assign-teacher-table"
          isFilter={false}
          isPagination={false}
          isSearch={false}
          noDataText={<>No Data Found</>}
          columns={[
            {
              id: 'subject',
              label: 'Subject',
              minWidth: '200px',
              align: 'left',
              isFilter: false,
            },
            {
              id: 'teacher',
              label: 'Teacher',
              isSort: false,
              minWidth: '200px',
              align: 'left',
              isFilter: false,
              render: (value, row: any) => {
                const fieldName = `teachers.${row.subjectCode}`;
                const hasError =
                  formik.touched.teachers?.[row.subjectCode] &&
                  formik.errors.teachers?.[row.subjectCode];

                return (
                  <CustomSelect
                    label="Teacher"
                    labelKey="name"
                    valueKey="id"
                    options={[
                      { id: 'Sharma Rajesh Kumar', name: 'Sharma Rajesh Kumar' },
                      { id: 'Patel Priya Dinesh', name: 'Patel Priya Dinesh' },
                      { id: 'Singh Amit Raj', name: 'Singh Amit Raj' },
                      { id: 'Gupta Neha Anil', name: 'Gupta Neha Anil' },
                      { id: 'Kumar Suresh Mohan', name: 'Kumar Suresh Mohan' },
                    ]}
                    value={formik.values.teachers[row.subjectCode]}
                    onChange={(val) => {
                      formik.setFieldValue(fieldName, val);
                    }}
                    onBlur={() => formik.setFieldTouched(fieldName, true)}
                    error={Boolean(hasError)}
                    helperText={hasError as string}
                    formControlProps={{
                      sx: {
                        minWidth: '150px',
                        width: '100%',
                        mb: 1,
                      },
                    }}
                  />
                );
              },
            },
          ]}
          data={slotData.subjects}
        />
      </DialogScrollContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose?.(null, false);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignTeacher;
