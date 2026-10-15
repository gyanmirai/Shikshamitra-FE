import type { Theme } from '@mui/material/styles';

export const academicValidationStyles = (theme: Theme) => ({
  '& .MuiFormHelperText-root.Mui-error, & .MuiInputLabel-root.Mui-error': {
    color: theme.palette.error.dark,
    ...theme.applyStyles('dark', { color: theme.palette.error.light }),
  },
});
