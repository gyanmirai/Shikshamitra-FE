import type { Standards } from 'src/types/school';

import * as yup from 'yup';
import React, { useState } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import { Box, Paper, Button, Switch, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

const NewTimetable = () => {
  const dialog = useBoolean();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={dialog.onTrue}>
          Create New Timetable
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'subjectName', label: 'Subject Name' },
          { id: 'assignTeacher', label: 'Assign Teacher' },
          { id: 'roomAssign', label: 'Room Assign' },
        ]}
        data={[
          { subjectName: 'Math', assignTeacher: 'Mr. Smith', roomAssign: 'Room 101' },
          { subjectName: 'English', assignTeacher: 'Ms. Johnson', roomAssign: 'Room 102' },
          { subjectName: 'Science', assignTeacher: 'Dr. Brown', roomAssign: 'Room 103' },
          { subjectName: 'History', assignTeacher: 'Mr. Davis', roomAssign: 'Room 104' },
          { subjectName: 'Geography', assignTeacher: 'Ms. Wilson', roomAssign: 'Room 105' },
        ]}
      />
      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="New Timetable"
      >
        <TimetableForm />
      </CustomDialog>
    </Box>
  );
};

export default NewTimetable;

const CreateNewTimetable = ({ formik }: any) => {
  // const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <CustomSelect
        label="Class"
        options={classData?.items || []}
        value={formik.values.class}
        isLoading={isLoading}
        labelKey="name"
        valueKey="id"
        onChange={(val) => {
          const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
          formik.setFieldValue('class', val as string);
          formik.setFieldValue('divisionOptions', selectedClass?.divisions || []);
        }}
        formControlProps={{ sx: { minWidth: 140 } }}
      />
      <CustomSelect
        label="Division"
        disabled={!formik.values.class}
        labelKey="name"
        valueKey="id"
        options={formik.values.divisionOptions}
        value={formik.values.division}
        onChange={(val) => {
          formik.setFieldValue('division', val as string);
        }}
        formControlProps={{ sx: { minWidth: 140 } }}
      />
    </Box>
  );
};

interface Subject {
  id: string;
  name: string;
}

interface Teacher {
  value: string;
  label: string;
}

interface TimePeriod {
  id: string;
  time: string;
  subject?: Subject | null;
  teachers?: Teacher[];
}

interface FormValues {
  class: string;
  division: string;
  divisionOptions: string[];
  timePeriods: TimePeriod[];
}

interface AddFormProps {
  formik: {
    values: FormValues;
    setFieldValue: (field: string, value: any) => void;
  };
}

const AddSubject = ({ formik }: AddFormProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Math' },
    { id: '2', name: 'English' },
    { id: '3', name: 'Science' },
    { id: '4', name: 'History' },
    { id: '5', name: 'Geography' },
    { id: '6', name: 'Physical Education' },
  ]);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Moving within the subjects list
    if (source.droppableId === 'subjectsList' && destination.droppableId === 'subjectsList') {
      const newSubjects = Array.from(subjects);
      const [reorderedItem] = newSubjects.splice(source.index, 1);
      newSubjects.splice(destination.index, 0, reorderedItem);
      setSubjects(newSubjects);
    }
    // Dropping from subjects list to a time period
    else if (
      source.droppableId === 'subjectsList' &&
      destination.droppableId.startsWith('period-')
    ) {
      const subjectIndex = source.index;
      const newSubjects = Array.from(subjects);
      const [subjectToMove] = newSubjects.splice(subjectIndex, 1);

      const newTimePeriods = formik.values?.timePeriods?.map((period: TimePeriod) => {
        if (period.id === destination.droppableId) {
          // If there's already a subject in this time period, move it back to the subjects list
          if (period.subject) {
            newSubjects.push(period.subject);
          }
          return { ...period, subject: subjectToMove };
        }
        return period;
      });

      setSubjects(newSubjects);
      formik.setFieldValue('timePeriods', newTimePeriods);
    }
    // Moving a subject from one time period to another
    else if (
      source.droppableId.startsWith('period-') &&
      destination.droppableId.startsWith('period-')
    ) {
      const newTimePeriods = Array.from(formik.values?.timePeriods);
      const sourcePeriod = newTimePeriods.find((period: any) => period.id === source.droppableId);
      const destPeriod = newTimePeriods.find(
        (period: any) => period.id === destination.droppableId
      );

      // Exchange subjects between time periods
      const tempSubject = sourcePeriod?.subject;
      if (sourcePeriod) sourcePeriod.subject = destPeriod?.subject || null;
      if (destPeriod) destPeriod.subject = tempSubject || null;

      formik.setFieldValue('timePeriods', newTimePeriods);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" flexDirection="column">
        <Typography variant="h6" sx={{ mb: 2 }}>
          {formik.values.class}/{formik.values.division}
        </Typography>

        {/* Subjects List */}
        <Droppable droppableId="subjectsList">
          {(provided) => (
            <Paper
              ref={provided.innerRef}
              {...provided.droppableProps}
              elevation={3}
              sx={{ p: 2, backgroundColor: 'background.default', mb: 2 }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Available Subjects
              </Typography>
              <Box display="flex" flexWrap="wrap">
                {subjects ? (
                  subjects.map((subject, index) => (
                    <Draggable key={subject.id} draggableId={subject.id} index={index}>
                      {(provided2, snapshot) => (
                        <Box
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          {...provided2.dragHandleProps}
                          sx={{
                            p: 1,
                            m: 0.5,
                            borderRadius: 1,
                            backgroundColor: snapshot.isDragging
                              ? 'secondary.light'
                              : 'secondary.main',
                            color: 'secondary.contrastText',
                          }}
                        >
                          {subject.name}
                        </Box>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    No Subjects Yet
                  </Typography>
                )}
                {provided.placeholder}
              </Box>
            </Paper>
          )}
        </Droppable>

        {/* Time Periods */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          List Of Subjects
        </Typography>
        <Box display="flex" flexWrap="wrap" sx={{ mb: 4 }}>
          {formik.values?.timePeriods?.map((period: any) => (
            <Droppable key={period.id} droppableId={period.id}>
              {(provided, snapshot) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  elevation={3}
                  sx={{
                    width: 160,
                    m: 1,
                    p: 2,
                    minHeight: 100,
                    backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'background.paper',
                  }}
                >
                  <Typography variant="subtitle1">{period.time}</Typography>
                  {period.subject ? (
                    <Draggable draggableId={`${period.id}-${period.subject.id}`} index={0}>
                      {(provided2, snapshot2) => (
                        <Box
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          {...provided2.dragHandleProps}
                          sx={{
                            p: 1,
                            mt: 1,
                            borderRadius: 1,
                            backgroundColor: snapshot2.isDragging ? 'primary.dark' : 'primary.main',
                            color: 'primary.contrastText',
                          }}
                        >
                          {period?.subject?.name}
                        </Box>
                      )}
                    </Draggable>
                  ) : (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Drop subject here
                    </Typography>
                  )}
                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          ))}
        </Box>
      </Box>
    </DragDropContext>
  );
};

const AssignTeacher = ({ formik }: AddFormProps) => {
  const teacherOptions: Teacher[] = [
    { value: 'riya', label: 'Riya' },
    { value: 'siya', label: 'Siya' },
    { value: 'priya', label: 'Priya' },
    { value: 'jiya', label: 'Jiya' },
  ];
  console.log('formik ----values===', formik.values);

  const handleTeacherChange = (periodId: string, selectedTeachers: Teacher[]) => {
    console.log('selected teachers----', selectedTeachers);

    const updatedTimePeriod = formik.values.timePeriods.map((period) => {
      if (period.id === periodId) {
        console.log('if called====');

        return {
          ...period,
          teachers: selectedTeachers,
        };
      }
      return period;
    });
    formik.setFieldValue('timePeriods', updatedTimePeriod);
  };

  return (
    <Box>
      {formik.values.timePeriods?.map((period) => (
        <Paper key={period.id} sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6">{period.subject?.name || 'Subject'}</Typography>

          <CustomSelect
            options={teacherOptions}
            label={`Assign teachers for ${period.subject?.name}`}
            name={`teachers-${period.id}`} // Unique name for each select
            multiple
            value={period.teachers || []} // Bind to selected teachers
            onChange={(val) => handleTeacherChange(period.id, val as Teacher[])} // Update teachers for the subject
            formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
          />
        </Paper>
      ))}
    </Box>
  );
};

const RoomAllocation = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="list of available rooms"
      name="class"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
    &nbsp;
    <FormControlLabel control={<Switch />} label="Auto Assign" />
  </Box>
);

const SetRecurrence = () => (
  <Box sx={{ margin: 5, display: 'flex', gap: 60 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <h3>Recurring Time Table Option</h3>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch />
        <Typography>Weekly</Typography>
        <Switch />
        <Typography>Monthly</Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <h3>Frequency Selection</h3>
      <CustomSelect
        options={[]}
        label="Frequency"
        name="frequency"
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
      />
    </Box>
  </Box>
);

const allTimetableSteps = [
  CreateNewTimetable,
  AddSubject,
  AssignTeacher,
  RoomAllocation,
  SetRecurrence,
];

const timePeriods: TimePeriod[] = [
  { id: 'period-1', time: '09:00 - 10:00', subject: null },
  { id: 'period-2', time: '10:00 - 11:00', subject: null },
  { id: 'period-3', time: '11:00 - 12:00', subject: null },
  { id: 'period-4', time: '12:00 - 13:00', subject: null },
  { id: 'period-5', time: '13:00 - 14:00', subject: null },
  { id: 'period-6', time: '14:00 - 15:00', subject: null },
];

const TimetableForm = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <CustomStepperWithFormik
      initialValues={{
        class: '',
        division: '',
        divisionOptions: [],
        timePeriods,
      }}
      steps={[
        'Create New Timetable',
        'Add Subject',
        'Assign Teacher',
        'Room Allocation',
        'Set Recurrence',
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
        const StepComponent = allTimetableSteps[step];
        return (
          <Box p={2}>
            <StepComponent formik={formik} />
          </Box>
        );
      }}
    />
  );
};
