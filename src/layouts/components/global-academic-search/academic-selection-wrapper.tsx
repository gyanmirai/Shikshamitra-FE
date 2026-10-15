import { Box } from '@mui/material';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

export const AcademicSelectionWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error',
})<{ error: boolean }>(({ theme, error }) => ({
  borderRadius: 5,
  ...(error && {
    animation: `${keyframes`
      0% { box-shadow: 0 0 0 0 ${theme.palette.warning.main}99; }
      70% { box-shadow: 0 0 0 6px ${theme.palette.warning.main}00; }
      100% { box-shadow: 0 0 0 0 ${theme.palette.warning.main}00; }
    `} 1.5s infinite`,
    border: `1px solid ${theme.palette.warning.main}90`,
  }),
}));
