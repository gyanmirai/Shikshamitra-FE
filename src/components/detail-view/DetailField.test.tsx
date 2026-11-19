import { it, expect } from 'vitest';
import { Typography } from '@mui/material';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { DetailField } from './index';

it('matches the Subject Information typography when the standard label is selected', () => {
  render(
    <ThemeProvider theme={createTheme()}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
        Subject name
      </Typography>
      <DetailField label="Student name" value="Aarav Shah" labelAppearance="standard" />
    </ThemeProvider>
  );

  const reference = getComputedStyle(screen.getByText('Subject name'));
  const label = getComputedStyle(screen.getByText('Student name'));

  expect(label.fontWeight).toBe(reference.fontWeight);
  expect(label.color).toBe(reference.color);
  expect(label.fontSize).toBe(reference.fontSize);
  expect(label.lineHeight).toBe(reference.lineHeight);
  expect(label.marginBottom).toBe(reference.marginBottom);
  expect(label.textTransform).toBe(reference.textTransform);
  expect(screen.getByText('Aarav Shah')).toHaveClass('MuiTypography-body2');
});
