import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface ColorPickerProps {
  colors?: string[];
  onSelect: (color: string) => void;
  initialColor?: string;
  disabled?: boolean;
}

const colorNames: Record<string, string> = {
  '#00B96B': 'Green',
  '#8E24AA': 'Purple',
  '#00BCD4': 'Cyan',
  '#0D47A1': 'Dark blue',
  '#4CAF50': 'Light green',
  '#FFB300': 'Amber',
  '#FF5722': 'Deep orange',
  '#8B0000': 'Dark red',
  '#1E90FF': 'Dodger blue',
  '#FF4500': 'Orange red',
  '#9C27B0': 'Purple',
  '#795548': 'Brown',
  '#607D8B': 'Blue grey',
  '#E91E63': 'Pink',
  '#F44336': 'Red',
  '#2196F3': 'Blue',
  '#009688': 'Teal',
  '#FFEB3B': 'Yellow',
  '#673AB7': 'Deep purple',
  '#3F51B5': 'Indigo',
  '#4DD0E1': 'Light cyan',
  '#AED581': 'Light green',
  '#BA68C8': 'Medium purple',
  '#F06292': 'Light pink',
  '#FFA726': 'Orange',
  '#A1887F': 'Taupe',
};
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
  disabled = false,
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
          disabled={disabled}
          aria-label={`${colorNames[color.toUpperCase()] ?? 'Colour'} (${color})`}
          aria-pressed={selectedColor === color}
          onClick={() => handleClick(color)}
          sx={{
            width: { xs: 44, sm: 20 },
            height: { xs: 44, sm: 20 },
            '@media (pointer: coarse)': { width: 44, height: 44 },
            borderRadius: '50%',
            color: (theme) => theme.palette.getContrastText(color),
            '&.Mui-focusVisible': {
              outline: '3px solid',
              outlineColor: 'text.primary',
              outlineOffset: 3,
            },
            p: 0,
            '&:hover .color-picker-swatch': {
              boxShadow: `0 0 0 4px ${color}44`,
              backgroundColor: `${color}99`, // Change the background color on hover with alpha
            },
          }}
        >
          <Box
            component="span"
            className="color-picker-swatch"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              flexShrink: 0,
              bgcolor: color,
              borderRadius: '50%',
              boxShadow: selectedColor === color ? `0 0 0 4px ${color}44` : 'none',
            }}
          >
            {selectedColor === color && <CheckIcon sx={{ fontSize: 14 }} />}
          </Box>
        </IconButton>
      ))}
    </Box>
  );
}
