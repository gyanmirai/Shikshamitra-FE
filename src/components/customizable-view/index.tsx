// @ts-nocheck
import React from 'react';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';

import { Box, Chip, Typography } from '@mui/material';

// const initialSections = [
//   { id: '1', title: 'Section 1', content: 'Content for Section 1' },
//   { id: '2', title: 'Section 2', content: 'Content for Section 2' },
//   { id: '3', title: 'Section 3', content: 'Content for Section 3' },
//   { id: '4', title: 'Section 4', content: 'Content for Section 4' },
// ];

const Dashboard = ({ sections, setSections }: any) => {
  // const [sections, setSections] = useState(initialSections);

  const handleOnDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const reorderedSections = Array.from(sections);
    const [movedSection] = reorderedSections.splice(source.index, 1);
    reorderedSections.splice(destination.index, 0, movedSection);

    setSections(reorderedSections);
  };

  return (
    <Box
      sx={{ mb: 2, border: (theme) => `dashed 1px ${theme.vars.palette.divider}`, borderRadius: 1 }}
    >
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="titles" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                overflowX: 'auto',
                padding: 1,
              }}
            >
              <Typography>Customizable View :</Typography>
              {sections.map((section: any, index: number) => (
                <Draggable key={section.id} draggableId={section.id.toString()} index={index}>
                  {(p, snapshot) => (
                    <Chip
                      ref={p.innerRef}
                      {...p.draggableProps}
                      {...p.dragHandleProps}
                      elevation={snapshot.isDragging ? 6 : 1}
                      sx={{
                        cursor: 'grab',
                        userSelect: 'none',
                      }}
                      variant="outlined"
                      label={section.title}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default Dashboard;
