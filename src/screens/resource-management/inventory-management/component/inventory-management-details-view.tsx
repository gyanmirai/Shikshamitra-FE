import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, Typography } from '@mui/material';

import {
  InventoryItemStatusType,
  InventoryItemStatusTypeColor,
} from 'src/enums/inventory-item-status';

import { Label } from 'src/components/label';

import type { IInventoryManagementDetailsViewpProps } from '../inventory-interface';

// Reusable component for rendering label sections
const InfoSection = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box display="flex" flexDirection="column">
    <Typography sx={{ fontWeight: 400 }} variant="h6">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600 }} variant="h6">
      {value}
    </Typography>
  </Box>
);

const InventoryManagementDetailsView: React.FC<IInventoryManagementDetailsViewpProps> = ({
  data,
}) => {
  const { itemCode, name, category, quantity, available, location, status, lastUpdatedDate } = data;

  return (
    <>
      <Typography variant="h4">Item Detail</Typography>
      <Typography variant="subtitle2">
        View complete information about this inventory item.
      </Typography>

      {/* Information Sections */}
      <Box pt="30px" display="flex" justifyContent="space-between" alignItems="center">
        <InfoSection label="Item Code" value={itemCode} />
        <InfoSection label="Category" value={category} />
      </Box>

      <Box pt="30px" display="flex" justifyContent="space-between" alignItems="center">
        <InfoSection label="Item Name" value={name} />
      </Box>

      <Box pt="30px" display="flex" justifyContent="space-between" alignItems="center">
        <InfoSection label="Total Quantity" value={quantity} />
        <InfoSection label="Total Available" value={available} />
      </Box>

      <Box pt="30px" display="flex" justifyContent="space-between" alignItems="center">
        <InfoSection label="Storage Location" value={location} />
      </Box>

      <Box pt="30px" display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" flexDirection="column">
          <Typography sx={{ fontWeight: 400 }} variant="h6">
            Status
          </Typography>
          <Label
            color={InventoryItemStatusTypeColor[status as InventoryItemStatusType] as LabelColor}
          >
            {InventoryItemStatusType[status]}
          </Label>
        </Box>
        <InfoSection label="Last Updated" value="-" />
      </Box>
    </>
  );
};

export default InventoryManagementDetailsView;
