import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  DialogContent,
  DialogActions,
  LinearProgress,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

// Enum for Assignment Types
enum AssignmentType {
  HOMEWORK = 'Homework',
  QUIZ = 'Quiz',
  MIDTERM = 'Midterm',
  FINAL = 'Final',
  PROJECT = 'Project',
}

// Interface for Assignment Weightage
interface AssignmentWeightage {
  id: number;
  assignmentType: AssignmentType;
  weightage: number;
}

// Initial dummy data
const initialWeightages: AssignmentWeightage[] = [
  {
    id: 1,
    assignmentType: AssignmentType.HOMEWORK,
    weightage: 20,
  },
  {
    id: 2,
    assignmentType: AssignmentType.QUIZ,
    weightage: 30,
  },
  {
    id: 3,
    assignmentType: AssignmentType.MIDTERM,
    weightage: 50,
  },
];

const AssignmentWeightageManagement = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedWeightage, setSelectedWeightage] = useState<AssignmentWeightage | null>(null);
  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();

  const [weightages, setWeightages] = useState<AssignmentWeightage[]>(initialWeightages);

  const handleCloseDialog = () => {
    setSelectedWeightage(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedWeightage) {
      setWeightages(weightages.filter((weightage) => weightage.id !== selectedWeightage.id));
      deleteConfirmDialog.onFalse();
      setSelectedWeightage(null);
    }
  };

  const handleSubmit = (values: any) => {
    const weightage = Number(values.weightage);

    // Validate total weightage
    const totalWeightage =
      weightages.reduce(
        (total, w) => (w.id === selectedWeightage?.id ? total : total + w.weightage),
        0
      ) + weightage;

    if (totalWeightage > 100) {
      alert('Total weightage cannot exceed 100%');
      return;
    }

    if (isEdit && selectedWeightage) {
      // Update existing weightage
      setWeightages((prevWeightages) =>
        prevWeightages.map((w) =>
          w.id === selectedWeightage.id
            ? {
                ...w,
                assignmentType: values.assignmentType,
                weightage,
              }
            : w
        )
      );
    } else {
      // Create new weightage
      const newWeightage: AssignmentWeightage = {
        id: Math.max(...weightages.map((w) => w.id)) + 1,
        assignmentType: values.assignmentType,
        weightage,
      };
      setWeightages((prevWeightages) => [...prevWeightages, newWeightage]);
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
          }}
        >
          Weightage
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          {
            id: 'assignmentType',
            label: 'Assignment Type',
          },
          {
            id: 'weightage',
            label: 'Weightage',
            render: (value) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* <LinearProgress
                  variant="determinate"
                  value={value}
                  sx={{ flexGrow: 1, height: 10 }}
                /> */}
                <Typography variant="body2">{value}%</Typography>
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
                  showDeleteIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setSelectedWeightage(row as any);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedWeightage(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={weightages}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="contained">Save</Button>
      </Box>

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Weightage' : 'Add Weightage'}
      >
        <WeightageForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedWeightage}
          isEdit={isEdit}
          existingWeightages={weightages}
        />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Weightage"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedWeightage?.assignmentType} weightage?
          </DialogContentText>
        </DialogContent>
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

export default AssignmentWeightageManagement;

interface WeightageFormProps {
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: AssignmentWeightage | null;
  isEdit: boolean;
  existingWeightages: AssignmentWeightage[];
}

const WeightageForm: React.FC<WeightageFormProps> = ({
  onSubmit,
  onClose,
  data,
  isEdit,
  existingWeightages,
}) => {
  const validationSchema = Yup.object().shape({
    assignmentType: Yup.string().required('Assignment Type is Required'),
    weightage: Yup.number()
      .required('Weightage is Required')
      .min(0, 'Weightage must be at least 0')
      .max(100, 'Weightage cannot exceed 100'),
  });

  const formik = useFormik({
    initialValues: {
      assignmentType: data?.assignmentType || '',
      weightage: data?.weightage || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleWeightageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    formik.setFieldValue('weightage', value);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
                label="Assignment Type"
                options={[
                  { value: 'Homework', label: 'Homework' },
                  { value: 'Quiz', label: 'Quiz' },
                  { value: 'Exam', label: 'Exam' },
                ]}
                onChange={(val) => {
                  formik.setFieldValue('assignmentType', val);
                }}
                value={formik.values.assignmentType}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Weightage (%)"
                  name="weightage"
                  type="number"
                  size="small"
                  value={formik.values.weightage}
                  onChange={handleWeightageChange}
                  error={formik.touched.weightage && Boolean(formik.errors.weightage)}
                  helperText={formik.touched.weightage && formik.errors.weightage}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: 100,
                    },
                  }}
                />
                <LinearProgress
                  variant="determinate"
                  value={Number(formik.values.weightage)}
                  sx={{ flexGrow: 1, height: 10 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
