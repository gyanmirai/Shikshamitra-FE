import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface ColorPickerProps {
  colors?: string[];
  onSelect: (color: string) => void;
  initialColor?: string;
}

const staticColors = [
  '#00B96B', // green
  '#8E24AA', // purple
  '#00BCD4', // cyan
  '#0D47A1', // dark blue
  '#4CAF50', // light green
  '#FFB300', // amber
  '#FF5722', // deep orange
  '#8B0000', // dark red
  '#1E90FF', // dodger blue
  '#FF4500', // orange red
  '#9C27B0', // purple
  '#795548', // brown
  '#607D8B', // blue grey
  '#E91E63', // pink
  '#F44336', // red
  '#2196F3', // blue
  '#009688', // teal
  '#FFEB3B', // yellow
  '#673AB7', // deep purple
  '#3F51B5', // indigo
  '#4DD0E1', // light cyan
  '#AED581', // light green
  '#BA68C8', // medium purple
  '#F06292', // light pink
  '#FFA726', // orange
  '#A1887F', // taupe
];

export default function ColorPickerCircle({
  colors = staticColors,
  onSelect,
  initialColor,
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor || '');

  const handleClick = (color: string) => {
    setSelectedColor(color);
    onSelect(color);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap', // Allow wrapping to next line
        maxWidth: '100%', // Ensure box doesn't overflow container
      }}
    >
      {colors.map((color) => (
        <IconButton
          key={color}
          onClick={() => handleClick(color)}
          sx={{
            width: 20,
            height: 20,
            bgcolor: color,
            borderRadius: '50%',
            boxShadow: selectedColor === color ? `0 0 0 4px ${color}44` : 'none',
            color: '#fff',
            p: 0,
            '&:hover': {
              boxShadow: `0 0 0 4px ${color}44`,
              backgroundColor: `${color}99`, // Change the background color on hover with alpha
            },
          }}
        >
          {selectedColor === color && <CheckIcon fontSize="small" />}
        </IconButton>
      ))}
    </Box>
  );
}
