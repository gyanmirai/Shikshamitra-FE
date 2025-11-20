import type { RootState } from 'src/redux/store';

import React from 'react';
import { Box } from '@mui/system';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { StyledTab, StyledTabs, StyledMainDiv } from './styled';

interface TabItem {
  value: string | number;
  label: string;
}

interface TabsComponentProps {
  tabs: TabItem[];
  value: string | number;
  onChange?: (event: React.SyntheticEvent, value: any) => void;
}

const TabsComponent = ({ tabs, value, onChange }: TabsComponentProps) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  function a11yProps(index: number) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <StyledMainDiv />
      <Box key="np" sx={{ width: '100%', height: '100%' }}>
        {/* <StyledMainDiv> */}
        {/* <StyledTabDiv> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'end',
          }}
        >
          <StyledTabs
            value={value}
            onChange={(e: React.SyntheticEvent, val: any) => {
              console.log('val', val);
              if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
                onChange?.(e, val);
                dispatch(setIsChanges(false));
              } else if (!isChanges) {
                onChange?.(e, val);
              }
            }}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="basic tabs example"
            centered
            sx={{
              width: '100%',
            }}
          >
            {tabs?.map((tabItem: TabItem, index: number) => (
              <StyledTab
                value={tabItem.value}
                label={tabItem.label}
                {...a11yProps(index)}
                key={index}
              />
            ))}
          </StyledTabs>
        </Box>
      </Box>
    </div>
  );
};

export default TabsComponent;
