import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { styled } from '@mui/material/styles';

export const StyledTab = styled(Tab)(({ theme }) => ({
  margin: '0px 2px',
  padding: '6px 16px',
  //   border: '2px solid',
  textTransform: 'none',
  outline: `2px solid ${theme.vars.palette.grey[400]}`,
  //   outline: `1px solid ${theme.palette.primary.main}`,
  color: theme.vars.palette.common.black,
  fontWeight: 600,
  backgroundColor: theme.vars.palette.grey[200],
  zIndex: 1,
  minHeight: '32px',
  borderRadius: '10px',
  transition: 'all 0.3s ease-in-out',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.vars.palette.common.white,
    fontWeight: 600,
    border: 'none',
    outline: 'none',
  },
  '&:hover': {
    backgroundColor: `${theme.vars.palette.grey[300]}`,
    color: theme.vars.palette.common.black,
    fontWeight: 600,
    // outline: 'none',
  },
  '&.Mui-focusVisible': { backgroundColor: 'rgba(100, 95, 228, 0.32)' },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  width: '50%',
  alignItems: 'flex-end',
  '& .MuiTabs-flexContainer': {
    justifyContent: 'flex-start',
    paddingLeft: '16px',
    fontWeight: 700,
    gap: '16px',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  '& .MuiTabs-indicator': { display: 'none' },
  '& .MuiTabs-scrollButtons': {
    background: theme.vars.palette.background.paper,
    boxShadow: theme.customShadows.z1,
    fontWeight: 600,
    border: `2px solid ${theme.vars.palette.grey[400]}`,
    height: '28px',
    width: '28px',
    borderRadius: '50%',
    color: theme.palette.primary.main,
    position: 'absolute',

    zIndex: '99',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '& .MuiTabs-scrollButtons:nth-child(4)': { right: -16 },
  '& .MuiTabs-scrollButtons:first-of-type': { left: -16 },
}));

export const StyledMainDiv = styled('div')(({ theme }) => ({
  height: '5px',
  backgroundColor: theme.vars.palette.grey[400],
  //   backgroundColor: theme.palette.primary.main,
  //   marginTop: '37px',
  position: 'absolute',
  left: '0',
  width: '100%',
  top: '50%',
  transform: 'translateY(-50%)',
}));

export const StyledTabDiv = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  bottom: '-14px',
}));
