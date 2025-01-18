import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Switch, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const initialRubricData = [
  {
    id: 1, // Unique identifier for each row
    class: '10',
    subjectName: 'Mathematics',
    pointScale: 5,
    objective: 'Assess problem-solving skills.',
    rubricDescription: 'Evaluate students on accuracy, clarity, and methodology.',
    date: '2024-12-15',
    status: true, // Published
  },
  {
    id: 2,
    class: '9',
    subjectName: 'Science',
    pointScale: 3,
    objective: 'Test understanding of basic scientific concepts.',
    rubricDescription: 'Focus on explanation, logic, and application.',
    date: '2024-12-16',
    status: false, // Unpublished
  },
  {
    id: 3,
    class: '11',
    subjectName: 'History',
    pointScale: 4,
    objective: 'Evaluate analytical and critical thinking skills.',
    rubricDescription: 'Assess argument quality, use of evidence, and historical accuracy.',
    date: '2024-12-18',
    status: true, // Published
  },
  {
    id: 4,
    class: '8',
    subjectName: 'English',
    pointScale: 6,
    objective: 'Assess comprehension and writing skills.',
    rubricDescription: 'Evaluate grammar, coherence, and creativity in essays.',
    date: '2024-12-19',
    status: false, // Unpublished
  },
  {
    id: 5,
    class: '12',
    subjectName: 'Physics',
    pointScale: 10,
    objective: 'Measure understanding of core physics concepts.',
    rubricDescription: 'Evaluate derivations, calculations, and practical examples.',
    date: '2024-12-20',
    status: true, // Published
  },
];

const RubricManagement = () => {
  const dialog = useBoolean();
  const [rubricData, setRubricData] = useState(initialRubricData);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            dialog.onTrue();
          }}
          size="small"
          variant="contained"
        >
          Rubric
        </Button>
      </Box>
      <CustomizableTable
        tableId="rubricTable"
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'subjectName', label: 'Subject Name', minWidth: '150px', align: 'left' },
          { id: 'pointScale', label: 'Point Scale', minWidth: '150px', align: 'left' },
          { id: 'objective', label: 'Objective' },
          {
            id: 'rubricDescription',
            label: 'Rubric Description',
            minWidth: '200px',
            align: 'left',
          },
          { id: 'date', label: 'Date' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: boolean, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value}
                  onChange={() => {
                    // setPendingStatusChange({
                    //   id: row.id, // Use row.id instead of undefined 'id'
                    //   value: !value,
                    // });
                    // confirmPublishDialog.onTrue();
                  }}
                />
              </Box>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showThreeDots={false}
                  showViewIcon
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {}}
                  handleEditClick={() => {}}
                  handleViewClick={() => {}}
                />
              );
            },
          },
        ]}
        data={rubricData}
      />

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="New Rubric"
      >
        <RubricCreationForm />
      </CustomDialog>
    </Box>
  );
};

export default RubricManagement;

// interface AddNewAssessmentProps {
//   onSubmit: (values: TAssessment) => void;
//   data: TAssessment | null;
//   isEdit: boolean;
// }

const RubricCreationForm = () => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<any[]>([]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CustomSelect
                options={classData?.items || []}
                value={classes}
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  //   formik.setFieldValue('className', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'history', label: 'History' },
                  { value: 'english', label: 'English' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Point Scale"
                options={[
                  { value: '3', label: '3' },
                  { value: '4', label: '4' },
                  { value: '5', label: '5' },
                  { value: '6', label: '6' },
                  { value: '7', label: '7' },
                ]}
                value=""
                onChange={(val) => {
                  // formik.setFieldValue('subject', val)
                }}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rubric Objective"
                name="objective"
                value=""
                // onChange={formik.handleChange}
                // error={formik.touched.assesmentTitle && Boolean(formik.errors.assesmentTitle)}
                // helperText={formik.touched.assesmentTitle && formik.errors.assesmentTitle}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rubric Description"
                name="description"
                value=""
                // onChange={formik.handleChange}
                // error={formik.touched.assesmentTitle && Boolean(formik.errors.assesmentTitle)}
                // helperText={formik.touched.assesmentTitle && formik.errors.assesmentTitle}
                size="small"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={dayjs()}
                onChange={(val) => {
                  //   formik.setFieldValue('dueDate', val);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    // error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                  },
                }}
                disablePast
              />
              {/* {formik.touched.dueDate && formik.errors.dueDate && (
                <FormHelperText error>{String(formik.errors.dueDate)}</FormHelperText>
              )} */}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button variant="contained">Generate Rubric</Button>
        </DialogActions>
      </form>
    </Box>
  );
};
