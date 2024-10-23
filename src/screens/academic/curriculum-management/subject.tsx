import { useFormik } from 'formik';
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MuiColorInput } from 'mui-color-input';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
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
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Add Subject"
      >
        <SubjectForm />
      </CustomDialog>
    </Box>
  );
};

export default Subject;

const SubjectForm = () => {
  const [subjectColor, setSubjectColor] = useState('');
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

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                options={classData?.items || []}
                label="Class"
                isLoading={isLoading}
                value=""
                labelKey="name"
                valueKey="id"
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 180 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Subject Name" name="subjectName" size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Assigned Teacher(s)"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="assignedTeacher"
                value=""
                formControlProps={{ sx: { minWidth: 180 } }}
                onChange={() => {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <UploadBox
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
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Resources"
                options={[
                  { value: 'laptop', label: 'Laptop' },
                  { value: 'projector', label: 'Projector' },
                  { value: 'textbook', label: 'Textbook' },
                ]}
                name="resource"
                onChange={() => {}}
                value=""
                formControlProps={{ sx: { minWidth: 180 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Learning Goals"
                name="learningGoal"
                value=""
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <MuiColorInput
                placeholder="Subject Color"
                size="small"
                format="hex"
                value={subjectColor}
                onChange={(e) => {
                  setSubjectColor(e);
                }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" onClick={() => {}}>
            Save Draft
          </Button>
          <Button type="submit" variant="contained">
            Publish
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
