import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add, Create } from '@mui/icons-material';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface TGradingScale {
  minMarks: number;
  maxMarks: number;
  grade: string;
}

interface TGrade {
  id: number;
  totalMarks: number;
  gradingScale: TGradingScale[] | null;
}

const tableGrades: TGrade[] = [
  {
    id: 1,
    totalMarks: 80,
    gradingScale: [
      { minMarks: 72, maxMarks: 80, grade: 'A+' },
      { minMarks: 64, maxMarks: 71, grade: 'A' },
      { minMarks: 56, maxMarks: 63, grade: 'B+' },
      { minMarks: 48, maxMarks: 55, grade: 'B' },
      { minMarks: 40, maxMarks: 47, grade: 'C+' },
      { minMarks: 32, maxMarks: 39, grade: 'C' },
      { minMarks: 0, maxMarks: 31, grade: 'F' },
    ],
  },
];

const GradingScale = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<TGrade | null>(null);
  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const [grades, setGrades] = useState<TGrade[]>(tableGrades);

  const handleCloseDialog = () => {
    setSelectedGrade(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedGrade) {
      setGrades(grades.filter((grade) => grade.id !== selectedGrade.id));
      deleteConfirmDialog.onFalse();
      setSelectedGrade(null);
    }
  };

  const handleSubmit = (values: any) => {};

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
          Grade Scale
        </Button>
      </Box>
      <CustomizableTable
        tableId="gradesTable"
        columns={[
          { id: 'totalMarks', label: 'Total Marks' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {}}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setSelectedGrade(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedGrade(row as any);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={grades}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Grade' : 'Add Grade'}
      >
        <GradeForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedGrade}
          isEdit={isEdit}
        />{' '}
      </CustomDialog>

      {/* <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Grade"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete Grade {selectedGrade?.grade} ?
          </DialogContentText>
        </DialogContent>{' '}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog> */}
    </Box>
  );
};

export default GradingScale;

interface GradeFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: TGrade | null;
  isEdit: boolean;
}

const GradeForm: React.FC<GradeFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const validationSchema = Yup.object().shape({
    totalMarks: Yup.string().required('TotalMarks is Required'),
    gradingScale: Yup.array().of(
      Yup.object().shape({
        minMarks: Yup.number().required('Min Marks is Required'),
        maxMarks: Yup.number().required('Max Marks is Required'),
        grade: Yup.string().required('Grade is Required'),
      })
    ),
  });

  const formik = useFormik({
    initialValues: {
      totalMarks: data?.totalMarks || 0,
      gradingScale: data?.gradingScale || [],
    },
    // validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleAddGradingScale = () => {
    const updatedGradingScale = [
      ...formik.values.gradingScale,
      { minMarks: 0, maxMarks: 0, grade: '' },
    ];
    formik.setFieldValue('gradingScale', updatedGradingScale);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Marks"
                name="totalMarks"
                size="small"
                value={formik.values.totalMarks}
                onChange={formik.handleChange}
                error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h4>Grading Scale</h4>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={handleAddGradingScale}
                >
                  Grading Scale
                </Button>
              </Box>

              {formik.values.gradingScale?.map((scale: TGradingScale, index: number) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Min Marks"
                      name={`gradingScale.${index}.minMarks`}
                      size="small"
                      value={scale.minMarks}
                      onChange={formik.handleChange}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.minMarks &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.minMarks)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Max Marks"
                      name={`gradingScale.${index}.maxMarks`}
                      size="small"
                      value={scale.maxMarks}
                      onChange={formik.handleChange}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.maxMarks &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.maxMarks)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <CustomSelect
                      fullWidth
                      label="Grade"
                      options={[
                        { value: 'A+', label: 'A+' },
                        { value: 'A', label: 'A' },
                        { value: 'A-', label: 'A-' },
                        { value: 'B+', label: 'B+' },
                        { value: 'B', label: 'B' },
                        { value: 'B-', label: 'B-' },
                        { value: 'C+', label: 'C+' },
                        { value: 'C', label: 'C' },
                        { value: 'C-', label: 'C-' },
                        { value: 'D+', label: 'D+' },
                        { value: 'D', label: 'D' },
                        { value: 'D-', label: 'D-' },
                        { value: 'F', label: 'F' },
                      ]}
                      name={`gradingScale.${index}.grade`}
                      size="small"
                      value={scale.grade}
                      onChange={(val) => {
                        formik.setFieldValue(`gradingScale.${index}.grade`, val);
                      }}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.grade &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.grade)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Iconify
                      icon="mdi:trash"
                      onClick={() => {
                        const updatedGradingScale = [...formik.values.gradingScale]; // Copy array
                        updatedGradingScale.splice(index, 1); // Remove row
                        formik.setFieldValue('gradingScale', updatedGradingScale); // Update state
                      }}
                      sx={{ cursor: 'pointer', mt: 1, color: 'error' }}
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Create />}
            variant="contained"
            onClick={() => {
              formik.handleSubmit();
            }}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
