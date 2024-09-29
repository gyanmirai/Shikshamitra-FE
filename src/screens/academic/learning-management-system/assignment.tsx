import * as yup from 'yup';
import { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  Switch,
  MenuItem,
  MenuList,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import { CalendarView } from 'src/sections/calendar/view';

const Assignment = () => {
  const isCalendarView = useBoolean(true);
  const dialog = useBoolean();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Upcoming Assignments & Deadlines</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          sx={{ mb: 2 }}
          onClick={dialog.onTrue}
        >
          Add Assignment
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ mr: 2 }}>List View</Typography>
          <Switch
            inputProps={{ 'aria-label': 'Toggle view' }}
            checked={isCalendarView.value}
            onChange={() => isCalendarView.onToggle()}
          />
          <Typography sx={{ ml: 1 }}>Calendar View</Typography>
        </Box>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }}>
            Adjust Deadline
          </Button>
          <Button variant="contained">Export List</Button>
        </Box>
      </Box>

      {isCalendarView.value ? (
        <CalendarView />
      ) : (
        <CustomizableTable
          columns={[
            { id: 'assignmentTitle', label: 'Assignment Title' },
            { id: 'course', label: 'Course' },
            { id: 'dueDate', label: 'Due Date' },
            {
              id: 'status',
              label: 'Status',
              render: (value, row: any) => (
                <Label color={value === 'Pending' ? 'warning' : 'success'}>{value}</Label>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              render: (value, row: any) => (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem>
                        <Iconify icon="mdi:eye" sx={{ mr: 2 }} />
                        View Assignment
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:pencil" sx={{ mr: 2 }} />
                        Grade Assignment
                      </MenuItem>
                      <MenuItem>
                        <Iconify icon="mdi:bell" sx={{ mr: 2 }} />
                        Send Reminder
                      </MenuItem>
                    </MenuList>
                  )}
                />
              ),
            },
          ]}
          data={[
            {
              assignmentTitle: 'Assignment 1',
              course: 'Course 1',
              dueDate: '2021-01-01',
              status: 'Pending',
            },
          ]}
        />
      )}
      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create New Assignment"
      >
        <AssignmentForm />
      </CustomDialog>
    </Box>
  );
};

export default Assignment;

const TitleAndDescription = () => (
  <Box display="flex" gap={2}>
    <TextField label="Assignment Title" />
    <TextField label="Assignment Description" />
  </Box>
);

const AttachMaterials = () => <Upload />;

const SetDueDate = () => <DatePicker label="Due Date" format="DD-MM-YYYY" />;

const AssignToClassSection = () => (
  <Box display="flex" gap={2}>
    <CustomSelect
      options={[]}
      value=""
      label="Assign To Class"
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
    />
    <CustomSelect
      options={[]}
      value=""
      label="Assign To Section"
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
    />
  </Box>
);

const SetEvaluationCriteria = () => (
  <>
    <Box display="flex" gap={2}>
      <CustomSelect
        options={[]}
        value=""
        label="Points"
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        size="small"
      />
      <CustomSelect
        options={[]}
        value=""
        label="Weightage"
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        size="small"
      />
      <TextField label="Feedback" size="small" />
    </Box>
    <Box mt={2}>
      <FormControlLabel control={<Checkbox />} label="Include predefined rubrics" />
    </Box>
  </>
);

const allStep = [
  TitleAndDescription,
  AttachMaterials,
  SetDueDate,
  AssignToClassSection,
  SetEvaluationCriteria,
];

const AssignmentForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
      steps={[
        'Title & Description',
        'Attach Materials',
        'Set Due Date',
        'Assign to Class/Section',
        'Set Evaluation Criteria',
      ]}
      activeStep={activeStep}
      handleBack={() => {
        setActiveStep(activeStep - 1);
      }}
      // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
      validationSchema={yup.object().shape({})}
      handleNext={(isLastStep, _values) => {
        if (isLastStep) return;
        setActiveStep(activeStep + 1);
      }}
      renderItem={({ formik, activeStep: step }: any) => {
        const StepComponent = allStep[step];
        return (
          <Box p={2}>
            <StepComponent />
          </Box>
        );
      }}
    />
  );
};
