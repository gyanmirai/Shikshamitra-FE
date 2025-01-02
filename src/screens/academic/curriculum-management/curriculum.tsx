import type { Dayjs } from 'dayjs';

import React from 'react';
import { useFormik } from 'formik';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, MenuItem, MenuList, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Curriculum = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mt: 1 }}>
        {/* <Typography variant="h4">Curriculum Management</Typography> */}

        <Button size="small" startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          New Curriculum
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'assignGradeClass', label: 'Assign Grade Class' },
          { id: 'assignTeacher', label: 'Assign Teacher' },
          { id: 'resource', label: 'Resource' },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        //   confirm.onTrue();
                        pop.onClose();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        sx={{ height: '16px', width: '16px' }}
                      />
                      Delete
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        //   modal.onTrue();
                        pop.onClose();
                      }}
                    >
                      <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                      Edit
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={[
          {
            subjectName: 'Maths',
            assignGradeClass: 'Grade-1',
            assignTeacher: 'Teacher-1',
            resource: 'Resource-1',
          },
        ]}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Create New Curriculum">
        <CurriculumForm />
      </CustomDialog>
    </Box>
  );
};

export default Curriculum;

interface Values {
  grade: string;
  subject: string;
  teacher: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

const CurriculumForm = () => {
  const formik = useFormik<Values>({
    initialValues: {
      grade: '',
      subject: '',
      teacher: '',
      startDate: null,
      endDate: null,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ background: 'background.neutral', p: 3 }}>
        <Stack spacing={3}>
          <Box display="flex" flexDirection="row" gap={2}>
            <CustomSelect
              label="Grade"
              name="grade"
              options={[]}
              formControlProps={{ fullWidth: true }}
              value={formik.values.grade}
              onChange={(value) => formik.setFieldValue('grade', value)}
            />
            <CustomSelect
              label="Subject"
              name="subject"
              options={[]}
              formControlProps={{ fullWidth: true }}
              value={formik.values.subject}
              onChange={(value) => formik.setFieldValue('subject', value)}
            />
            <CustomSelect
              label="Teacher"
              name="teacher"
              options={[]}
              formControlProps={{ fullWidth: true }}
              value={formik.values.teacher}
              onChange={(value) => formik.setFieldValue('teacher', value)}
            />
          </Box>
          {/* <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Drag Your Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              /> */}

          <Upload />
          <Box display="flex" flexDirection="row" gap={2}>
            <DatePicker
              label="Start Date"
              name="startDate"
              value={formik.values.startDate}
              onChange={(value) => formik.setFieldValue('startDate', value)}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              name="endDate"
              value={formik.values.endDate}
              onChange={(value) => formik.setFieldValue('endDate', value)}
              format="DD-MM-YYYY"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};
