import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const DayRangeSlider = styled(Slider)(({ theme }) => ({
  maxWidth: 380,
  height: 6,
  padding: '10px 0',
  '& .MuiSlider-track': {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
    border: 'none',
  },
  '& .MuiSlider-rail': {
    height: 6,
    borderRadius: 3,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : theme.palette.grey[300],
    opacity: 1,
  },
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: theme.palette.grey[100],
    border: `2px solid ${theme.palette.grey[400]}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0 0 0 6px ${
        theme.palette.mode === 'dark' ? 'rgba(160,160,160,0.25)' : 'rgba(0,0,0,0.08)'
      }`,
    },
    '&.Mui-active': {
      boxShadow: `0 0 0 8px ${
        theme.palette.mode === 'dark' ? 'rgba(160,160,160,0.30)' : 'rgba(0,0,0,0.10)'
      }`,
    },
    '&:before': { display: 'none' },
  },
  '& .MuiSlider-mark': {
    height: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[400],
    top: '50%',
    transform: 'translateY(-50%)',
    '&.MuiSlider-markActive': {
      backgroundColor: theme.palette.grey[500],
    },
  },
  '& .MuiSlider-markLabel': {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    top: 28,
    '&.MuiSlider-markLabelActive': {
      color: theme.palette.text.primary,
      fontWeight: 600,
    },
  },
  '&.Mui-disabled': {
    '& .MuiSlider-track': { backgroundColor: theme.palette.action.disabled },
    '& .MuiSlider-thumb': { borderColor: theme.palette.action.disabled },
  },
}));
