import type { TabComponentType } from 'src/screens/hr/leave-request';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Create } from '@mui/icons-material';
import {
  Box,
  Grid,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface TExamType {
  id: number;
  examType: string;
  description: string;
  status: string;
}

const examTypes: TExamType[] = [
  {
    id: 1,
    examType: 'Midterm',
    description: 'Comprehensive mid-semester examination covering first half of course material.',
    status: 'Publish',
  },
  {
    id: 2,
    examType: 'Final',
    description: 'Comprehensive end-of-semester examination covering entire course material.',
    status: 'UnPublish',
  },
  {
    id: 3,
    examType: 'Diagnostic',
    description: 'Assessment to identify student strengths and areas for improvement.',
    status: 'Publish',
  },
  {
    id: 4,
    examType: 'Quarterly',
    description: 'Periodic assessment to track student progress throughout the year.',
    status: 'UnPublish',
  },
  {
    id: 5,
    examType: 'Entrance',
    description: 'Examination for admission or placement purposes.',
    status: 'Publish',
  },
];

const SettingType = (props: TabComponentType) => (
  <Box>
    <ExamTypeSettings />
    <AssessmentTypeSettings />
  </Box>
);

export default SettingType;

const ExamTypeSettings = () => {
  const dialog = useBoolean();
  const [examTypeTable, setExamTypeTable] = useState<TExamType[]>(examTypes);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<any | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setExamTypeTable((prevSubject) =>
        prevSubject.map((examType) =>
          examType.id === id ? { ...examType, status: newValue } : examType
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedExamType(null);
  };

  const handleDelete = (comingExamType: any) => {
    setExamTypeTable((prevData) =>
      prevData.filter((examType) => examType.id !== comingExamType.id)
    );
    handleCloseDialog();
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedExamType) {
      setExamTypeTable(
        examTypeTable.map((examType) => (examType.id === values.id ? values : examType))
      );
    } else {
      setExamTypeTable([...examTypeTable, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedExamType(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Exam Type</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Exam Type
        </Button>
      </Box>
      <CustomizableTable
        tableId="examTypeTable"
        columns={[
          { id: 'examType', label: 'Exam Type' },
          { id: 'description', label: 'Description' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
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
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    confirmDeleteDialog.onTrue();
                    setSelectedExamType(row);
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setSelectedExamType(row);
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={examTypeTable}
      />

      <CustomDialog
        title={isEdit ? 'Edit Exam Type' : 'Create Exam Type'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <ExamTypeForm data={selectedExamType} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Exam Type?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirmDeleteDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Exam Type?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDeleteDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedExamType);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

interface ExamTypeFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

const ExamTypeForm: React.FC<ExamTypeFormProps> = ({ onSubmit, data = null, isEdit = false }) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: {
      examType: data?.examType || '',
      description: data?.description || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Exam Type"
                name="examType"
                size="small"
                value={formik.values.examType}
                onChange={formik.handleChange}
                error={formik.touched.examType && Boolean(formik.errors.examType)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                size="small"
                rows={4}
                multiline
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              startIcon={<Create />}
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.publish} />}
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};

interface TAssessmentType {
  id: number;
  assessmentType: string;
  description: string;
  status: string;
}

const initialAssessmentData: TAssessmentType[] = [
  {
    id: 1,
    assessmentType: 'Formative',
    description: 'Ongoing assessments to monitor student learning and provide feedback.',
    status: 'Publish',
  },
  {
    id: 2,
    assessmentType: 'Summative',
    description: 'End-of-unit assessments to evaluate student learning outcomes.',
    status: 'Publish',
  },
  {
    id: 3,
    assessmentType: 'Diagnostic',
    description: "Initial assessment to identify students' strengths and learning needs.",
    status: 'UnPublish',
  },
  {
    id: 4,
    assessmentType: 'Benchmark',
    description: 'Standardized tests to compare student performance against specific standards.',
    status: 'Publish',
  },
  {
    id: 5,
    assessmentType: 'Performance-Based',
    description:
      "Assessments that evaluate students' ability to apply skills in real-world contexts.",
    status: 'UnPublish',
  },
];

const AssessmentTypeSettings = () => {
  const dialog = useBoolean();
  const [assessmentTypeData, setAssessmentTypeData] =
    useState<TAssessmentType[]>(initialAssessmentData);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<any | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setAssessmentTypeData((prevSubject) =>
        prevSubject.map((assessmentType) =>
          assessmentType.id === id ? { ...assessmentType, status: newValue } : assessmentType
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedAssessmentType(null);
  };

  const handleDelete = (comingAssessmentType: any) => {
    setAssessmentTypeData((prevData) =>
      prevData.filter((assessmentType) => assessmentType.id !== comingAssessmentType.id)
    );
    handleCloseDialog();
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedAssessmentType) {
      setAssessmentTypeData(
        assessmentTypeData.map((assessmentType) =>
          assessmentType.id === values.id ? values : assessmentType
        )
      );
    } else {
      setAssessmentTypeData([...assessmentTypeData, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedAssessmentType(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6">Assessment Type</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Assessment Type
        </Button>
      </Box>
      <CustomizableTable
        tableId="assessment-type"
        columns={[
          { id: 'assessmentType', label: 'Assessment Type' },
          { id: 'description', label: 'Description' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
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
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    confirmDeleteDialog.onTrue();
                    setSelectedAssessmentType(row);
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setSelectedAssessmentType(row);
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={assessmentTypeData}
      />

      <CustomDialog
        title={isEdit ? 'Edit Assessment Type' : 'Create Assessment Type'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <AssessmentTypeForm data={selectedAssessmentType} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Assessment Type?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirmDeleteDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Assessment Type?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDeleteDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedAssessmentType);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

interface AssessmentTypeFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

const AssessmentTypeForm: React.FC<AssessmentTypeFormProps> = ({
  onSubmit,
  data = null,
  isEdit = false,
}) => {
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));

  const formik = useFormik({
    initialValues: {
      assessmentType: data?.assessmentType || '',
      description: data?.description || '',
    },
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      });
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assessment Type"
                name="assessmentType"
                size="small"
                value={formik.values.assessmentType}
                onChange={formik.handleChange}
                error={formik.touched.assessmentType && Boolean(formik.errors.assessmentType)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                size="small"
                rows={4}
                multiline
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              startIcon={<Create />}
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.publish} />}
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
