import React, { useState } from 'react';

import { Grid } from '@mui/material';

import CustomDialog from 'src/components/customDialog';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { EcommerceSalesOverview } from 'src/sections/overview/e-commerce/ecommerce-sales-overview';

export const _ecommerceSalesOverview = ['Software License', 'Hardware', 'Project Funding'].map(
  (label, index) => ({
    label,
    totalAmount: 500,
    value: 50,
  })
);
interface FinanceBudgetAllocationDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

const FinanceBudgetAllocationDialog: React.FC<FinanceBudgetAllocationDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  return (
    <CustomDialog
      title="Budget Allocation Panel"
      open={dialogValue}
      handleClose={onClose}
      maxWidth="lg"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AnalyticsCurrentVisits
            chart={{
              series: [
                { label: 'Software License', value: 3500 },
                { label: 'Hardware', value: 2500 },
                { label: 'Project funding', value: 1500 },
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid xs={12} md={6} lg={8}>
            <EcommerceSalesOverview title="" data={_ecommerceSalesOverview} />
          </Grid>
        </Grid>
      </Grid>
    </CustomDialog>
  );
};

export default FinanceBudgetAllocationDialog;
