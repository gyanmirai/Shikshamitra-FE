import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { DraggableField } from 'src/components/icard-creation';

const studentData = [{ name: 'John Doe', class: '10th-A', rollNumber: '123' }];

const IcardPreview = ({
  cardDimensions,
  cardBackgroundColor,
  cardBackground,
  fields = [],
}: any) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('A');
  return (
    <Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              cursor: 'pointer',
              outline: (theme) =>
                selectedDivision === 'A' ? `2px solid ${theme.vars.palette.primary.main}` : 'none',
            }}
            onClick={() => setSelectedDivision('A')}
          >
            A
          </Paper>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              cursor: 'pointer',
              outline: (theme) =>
                selectedDivision === 'B' ? `2px solid ${theme.vars.palette.primary.main}` : 'none',
            }}
            onClick={() => setSelectedDivision('B')}
          >
            B
          </Paper>
        </Box>

        <Box>
          <Paper
            elevation={4}
            sx={{
              position: 'relative',
              ...cardDimensions,
              mt: 2,
              backgroundColor: cardBackgroundColor,
              backgroundImage: cardBackground ? `url(${cardBackground})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {fields?.map((field: any) => (
              <DraggableField
                key={field.name}
                field={field}
                onDrag={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                isDrag={false}
              >
                {studentData[field.name] || field.dummyValue}
              </DraggableField>
            ))}
          </Paper>
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default IcardPreview;
