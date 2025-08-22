import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargesQuery } from 'src/redux/chargesApi/chargesApi';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';

import ChargesApprovalTable from './Components/ApptovalChangeTable';
import ChargeDetailsCard from '../ChargesManage/Component/ViewChargeForm';

import type { IChargeData } from '../ChargesManage/Component/type';

const ApproveManage = () => {
  // State to store the currently selected charge data for viewing details
  const [selectedChargeData, setSelectedChargeData] = useState<IChargeData | null>(null);

  // Custom hook to manage dialog open/close state
  const viewChargeDetailsDialog = useBoolean();

  // Fetch charges data using custom hook that combines query and mutation functionality
  const { data: chargeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
  });
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChargesApprovalTable
        data={chargeData}
        onView={(data) => {
          viewChargeDetailsDialog.onTrue();
          setSelectedChargeData(data);
        }}
      />
      <CustomDialog
        open={viewChargeDetailsDialog.value}
        handleClose={() => {
          viewChargeDetailsDialog?.onFalse();
          setSelectedChargeData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Charge</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays the details of the selected charge."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <ChargeDetailsCard charge={selectedChargeData} isActionShow />
      </CustomDialog>
    </Box>
  );
};

export default ApproveManage;
