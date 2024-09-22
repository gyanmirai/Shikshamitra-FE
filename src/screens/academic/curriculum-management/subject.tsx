import React from 'react';
import { useFormik } from 'formik';

import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Subject = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <CustomSelect
        label="Class"
        name="class"
        options={[]}
        formControlProps={{ sx: { width: '200px' } }}
        value=""
        onChange={(value) => {}}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="h4">Subjects Management</Typography>

        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Add Subject
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
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Add Subject">
        <SubjectForm />
      </CustomDialog>
    </Box>
  );
};

export default Subject;

const SubjectForm = () => {
  const formik = useFormik({
    initialValues: {
      subjectName: '',
      grade: '',
      class: '',
      description: '',
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ background: 'background.neutral', p: 3 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            name="subjectName"
            label="Subject Name"
            value={formik.values.subjectName}
            onChange={formik.handleChange}
            size="small"
          />
          <CustomSelect
            label="Grade"
            name="grade"
            options={[]}
            formControlProps={{ fullWidth: true }}
            value={formik.values.grade}
            onChange={(value) => formik.setFieldValue('grade', value)}
          />
          <CustomSelect
            label="Class"
            name="class"
            options={[]}
            formControlProps={{ fullWidth: true }}
            value={formik.values.class}
            onChange={(value) => formik.setFieldValue('class', value)}
          />
          <TextField
            multiline
            rows={4}
            fullWidth
            name="description"
            label="brief description of the subject"
            value={formik.values.description}
            onChange={formik.handleChange}
            size="small"
          />
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
