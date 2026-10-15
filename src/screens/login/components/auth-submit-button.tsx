import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';
import { getContrastRatio } from '@mui/material/styles';

const buttonTextColor = (background: string, text: string) =>
  getContrastRatio(background, text) >= 4.5 ? 'primary.contrastText' : 'grey.900';

export function AuthSubmitButton(props: Omit<ButtonProps, 'sx'>) {
  return (
    <Button
      fullWidth
      type="submit"
      variant="contained"
      color="primary"
      {...props}
      sx={({ palette: { primary } }) => ({
        minHeight: 48,
        borderRadius: 1.5,
        boxShadow: 'none',
        bgcolor: 'primary.main',
        color: buttonTextColor(primary.main, primary.contrastText),
        fontSize: '0.9375rem',
        '&:hover': {
          bgcolor: 'primary.dark',
          color: buttonTextColor(primary.dark, primary.contrastText),
          boxShadow: 'none',
        },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: 3 },
      })}
    />
  );
}
