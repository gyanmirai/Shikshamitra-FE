import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargesQuery } from 'src/redux/finance/charge-management/chargeApi';

import ChargesApprovalTable from './components/ApptovalChangeTable';
import ChargeDetailsCard from '../charges-manage/component/ViewChargeForm';

import type { IChargeData } from '../charges-manage/component/type';

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
            <Typography variant="h5">Charge Request Review</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal allows the admin to review complete details of a specific charge request and take action to approve or reject it."
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
