import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  TextField,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Grade {
  id: number;
  grade: string;
  range: string;
  startRange: number;
  endRange: number;
  descriptiveScale: string;
}

const tableGrades: Grade[] = [
  {
    id: 1,
    grade: 'A+',
    range: '95-100',
    startRange: 95,
    endRange: 100,
    descriptiveScale: 'Outstanding',
  },
  {
    id: 2,
    grade: 'A',
    range: '90-94',
    startRange: 90,
    endRange: 94,
    descriptiveScale: 'Satisfactory',
  },
  {
    id: 3,
    grade: 'B+',
    range: '85-89',
    startRange: 85,
    endRange: 89,
    descriptiveScale: 'Need Improvement',
  },
];

const GradingScale = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();

  const [grades, setGrades] = useState<Grade[]>(tableGrades);

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

  const handleSubmit = (values: any) => {
    const startRange = Number(values.startRange);
    const endRange = Number(values.endRange);
    const { descriptiveScale } = values;

    if (startRange >= endRange) {
      alert('Start range must be less than end range');
      return;
    }

    const hasOverlap = grades.some((g) => {
      if (isEdit && selectedGrade?.id === g.id) return false;
      return (
        (startRange >= g.startRange && startRange <= g.endRange) ||
        (endRange >= g.startRange && endRange <= g.endRange) ||
        (startRange <= g.startRange && endRange >= g.endRange)
      );
    });

    if (hasOverlap) {
      alert('Grade ranges cannot overlap');
      return;
    }

    if (isEdit && selectedGrade) {
      // Update existing grade
      setGrades((prevGrades) =>
        prevGrades.map((g) =>
          g.id === selectedGrade.id
            ? {
                ...g,
                grade: values.grade,
                range: `${startRange}-${endRange}`,
                startRange,
                endRange,
                descriptiveScale,
              }
            : g
        )
      );
    } else {
      // Create new grade
      const newGrade: Grade = {
        id: Math.max(...grades.map((g) => g.id)) + 1,
        grade: values.grade,
        range: `${startRange}-${endRange}`,
        startRange,
        endRange,
        descriptiveScale,
      };
      setGrades((prevGrades) => [...prevGrades, newGrade]);
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
            // setIsEdit(false);
            // setSelectedSubject(null);
          }}
        >
          Grade Scale
        </Button>
      </Box>
      <CustomizableTable
        tableId="grade-scale-table"
        columns={[
          { id: 'grade', label: 'Grade' },
          {
            id: 'range',
            label: 'Range',
          },
          {
            id: 'descriptiveScale',
            label: 'Descriptive Scale',
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
                  showDeleteIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setSelectedGrade(row as any);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedGrade(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={grades}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="contained">Save</Button>
      </Box>

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

      <CustomDialog
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
      </CustomDialog>
    </Box>
  );
};

export default GradingScale;

interface GradeFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: Grade | null;
  isEdit: boolean;
}

const GradeForm: React.FC<GradeFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const validationSchema = Yup.object().shape({
    grade: Yup.string().required('Grade is Required'),
    startRange: Yup.string().required('Start Range is Required'),
    endRange: Yup.string().required('End Range is Required'),
    descriptiveScale: Yup.string().required('Descriptive Scale is Required'),
  });

  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      startRange: data?.startRange || '',
      endRange: data?.endRange || '',
      descriptiveScale: data?.descriptiveScale || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Grade"
                name="grade"
                size="small"
                value={formik.values.grade}
                onChange={formik.handleChange}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Range"
                name="startRange"
                size="small"
                value={formik.values.startRange}
                onChange={formik.handleChange}
                error={formik.touched.startRange && Boolean(formik.errors.startRange)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Range"
                name="endRange"
                size="small"
                value={formik.values.endRange}
                onChange={formik.handleChange}
                error={formik.touched.endRange && Boolean(formik.errors.endRange)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomSelect
                fullWidth
                label="Descriptive Scale"
                name="descriptiveScale"
                size="small"
                options={[
                  { value: 'Outstanding', label: 'Outstanding' },
                  { value: 'Excellent', label: 'Excellent' },
                  { value: 'Good', label: 'Good' },
                  { value: 'Satisfactory', label: 'Satisfactory' },
                  { value: 'Needs Improvement', label: 'Needs Improvement' },
                  { value: 'Fail', label: 'Fail' },
                ]}
                value={formik.values.descriptiveScale}
                onChange={(val) => {
                  formik.setFieldValue('descriptiveScale', val);
                }}
                formControlProps={{
                  sx: { width: '100%', mixWidth: '200px' },
                }}
                error={formik.touched.descriptiveScale && Boolean(formik.errors.descriptiveScale)}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Create
            </Button>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
