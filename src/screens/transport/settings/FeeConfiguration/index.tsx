'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Box, Card, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import StopBasedModel from './Components/StopBasedModel';
import ZoneBasedModel from './Components/ZoneBasedModel';
import FeeModelSelection from './Components/FeeModelSelection';
import DistanceBasedModel from './Components/DistanceBasedModel';
import FlatRateConfiguration from './Components/FlatRateConfiguration';

const FeeConfiguration = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [selectedModel, setSelectedModel] = useState('flat-rate');

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      // Reset logic here
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb && (
        <CustomBreadcrumbs
          heading="Fee Configuration"
          description="This screen is used to configure the transport fee structure for the school. It allows users to choose one of four transport fee models — Flat-Rate, Distance-Based, Stop-Based, or Zone-Based — and set up the corresponding fee configuration as per the selected model."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Setting', href: '/transport/settings/vehicleType' },
            { name: 'Fee Configuration' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
          <FeeModelSelection selectedModel={selectedModel} onModelChange={setSelectedModel} />
        </Card>

        {selectedModel === 'flat-rate' && (
          <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
            <FlatRateConfiguration />
          </Card>
        )}

        {selectedModel === 'distance-based' && (
          <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
            <DistanceBasedModel />
          </Card>
        )}

        {selectedModel === 'stop-based' && (
          <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
            <StopBasedModel />
          </Card>
        )}

        {selectedModel === 'zone-based' && (
          <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
            <ZoneBasedModel />
          </Card>
        )}
      </Box>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={1}
        p={2}
        sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 1,
        }}
      >
        <Button variant="outlined" size="small" onClick={(e) => handleClose(e, false)}>
          Reset
        </Button>
        <Button variant="contained" size="small" onClick={(e) => handleClose(e, true)}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default FeeConfiguration;
