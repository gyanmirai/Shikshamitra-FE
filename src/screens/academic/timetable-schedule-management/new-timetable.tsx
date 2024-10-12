import type { DropResult } from 'react-beautiful-dnd';

import * as yup from 'yup';
import React, { useState } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import { Box, Paper, Button, Switch, Typography, FormControlLabel } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

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

const CreateNewTimetable = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  return (
    <CustomSelect
      options={[
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
      ]}
      label="Grade"
      name="grade"
      value={selectedGrade}
      onChange={(val) => {
        setSelectedGrade(val as string);
      }}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
  );
};

const AddSubject = () => {
  const [items, setItems] = useState([
    { id: '1', subject: 'Math' },
    { id: '2', subject: 'English' },
    { id: '3', subject: 'Science' },
    { id: '4', subject: 'History' },
    { id: '5', subject: 'Geography' },
    { id: '6', subject: 'Physical Education' },
  ]); // Items to drag from

  const [droppedItems, setDroppedItems] = useState<any[]>([]); // Items dropped into Paper

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Handle the drag end event
  const onDragEnd = ({ destination, source }: DropResult) => {
    if (!destination) return;

    // Handling drag between the two lists (source -> drop)
    if (source.droppableId === 'sourceList' && destination.droppableId === 'dropArea') {
      const draggedItem = items[source.index];
      setDroppedItems([...droppedItems, draggedItem]);

      // Remove the item from the source list
      const newItems = Array.from(items);
      newItems.splice(source.index, 1);
      setItems(newItems);
    }

    // Reorder items within the source list
    if (source.droppableId === 'sourceList' && destination.droppableId === 'sourceList') {
      const newItems = reorder(items, source.index, destination.index);
      setItems(newItems);
    }

    // Reorder items within the dropped list
    if (source.droppableId === 'dropArea' && destination.droppableId === 'dropArea') {
      const newDroppedItems = reorder(droppedItems, source.index, destination.index);
      setDroppedItems(newDroppedItems);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" flexWrap="wrap">
        {/* Draggable list area */}
        <Droppable droppableId="sourceList">
          {(provided) => (
            <Paper
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flex: 1,
                margin: 2,
                minWidth: 350,
                padding: 2,
              }}
            >
              <h3>Add Subject</h3>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided2) => (
                    <Box
                      ref={provided2.innerRef}
                      {...provided2.draggableProps}
                      {...provided2.dragHandleProps}
                      sx={{
                        padding: 1,
                        marginBottom: 1,
                        borderRadius: 1,
                      }}
                    >
                      {item.subject}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>

        {/* Droppable area (Paper) with rearrangeable dropped items */}
        <Droppable droppableId="dropArea">
          {(provided) => (
            <Paper
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flex: 1,
                margin: 2,
                minWidth: 350,
                padding: 2,
              }}
            >
              <h3>List of Subjects</h3>
              {droppedItems.length > 0 ? (
                droppedItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided2) => (
                      <Box
                        ref={provided2.innerRef}
                        {...provided2.draggableProps}
                        {...provided2.dragHandleProps}
                        sx={{
                          padding: 1,
                          marginBottom: 1,
                          borderRadius: 1,
                        }}
                      >
                        {item.subject}
                      </Box>
                    )}
                  </Draggable>
                ))
              ) : (
                <p>No subject add yet.</p>
              )}
              {provided.placeholder}
            </Paper>
          )}
        </Droppable>
      </Box>
    </DragDropContext>
  );
};

const AssignTeacher = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<any>([]);
  return (
    <CustomSelect
      options={[
        { value: 'riya', label: 'riya' },
        { value: 'siya', label: 'siya' },
        { value: 'priya', label: 'priya' },
        { value: 'jiya', label: 'jiya' },
      ]}
      label="Assign teacher"
      name="teacher"
      multiple
      value={selectedTeacher}
      onChange={(val) => {
        setSelectedTeacher(val as string);
      }}
      formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
    />
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

const TimetableForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <CustomStepperWithFormik
      initialValues={{}}
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
            <StepComponent />
          </Box>
        );
      }}
    />
  );
};
