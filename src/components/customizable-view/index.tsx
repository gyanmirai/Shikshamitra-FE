// @ts-nocheck
import React from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

// const initialSections = [
//   { id: '1', title: 'Section 1', content: 'Content for Section 1' },
//   { id: '2', title: 'Section 2', content: 'Content for Section 2' },
//   { id: '3', title: 'Section 3', content: 'Content for Section 3' },
//   { id: '4', title: 'Section 4', content: 'Content for Section 4' },
// ];

const CustomizableView = ({ sections, setSections, dashBoardSections }: any) => {
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
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="components">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps}>
            {sections.map((section: any, index: number) => (
              <Draggable key={section.id} draggableId={section.id.toString()} index={index}>
                {(p, snapshot) => (
                  <Grid2
                    container
                    spacing={2}
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    elevation={snapshot.isDragging ? 6 : 1}
                    sx={{
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                    // variant="outlined"
                    // label={section.title}
                  >
                    {' '}
                    {dashBoardSections[section.id]}
                  </Grid2>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CustomizableView;
