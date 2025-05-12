import React from 'react';
import dayjs from 'dayjs';

import { Box, Grid, Typography } from '@mui/material';

import type { IInventoryManagementDetailsViewpProps } from '../inventory-interface';

// Reusable component
const InfoSection = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography sx={{ fontWeight: 400, fontSize: '14px', color: '#666' }}>{label}</Typography>
    <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>{value}</Typography>
  </Box>
);

const InventoryManagementDetailsView: React.FC<IInventoryManagementDetailsViewpProps> = ({
  data,
}) => {
  const {
    itemName,
    category,
    subCategory,
    resourceConditionStatus,
    resourceMeasurementUnit,
    quantity,
    available,
    location,
    campusName,
    buildingName,
    roomNumber,
    floorNumber,
    termAndCondition,
    warrantyExpiryDate,
    resourceImage,
    resourceBill,
    purchasedVendorName,
    resourcePurchaseDate,
    lastUpdatedDate,
    status,
  } = data;

  return (
    <Box>
      <Typography variant="h4" mb={1}>
        Item Details
      </Typography>
      <Typography variant="subtitle2" mb={3}>
        View complete information about this inventory item.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Item Name" value={itemName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Category" value={category} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Subcategory" value={subCategory} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Condition" value={resourceConditionStatus} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Measurement Unit" value={resourceMeasurementUnit} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Quantity" value={quantity} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoSection label="Campus" value={campusName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Building" value={buildingName} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Room Number" value={roomNumber} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Floor Number" value={floorNumber} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection label="Storage Location" value={location} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoSection label="Terms & Conditions" value={termAndCondition || 'N/A'} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection
            label="Warranty Expiry"
            value={warrantyExpiryDate ? dayjs(warrantyExpiryDate).format('DD MMM YYYY') : 'N/A'}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoSection label="Vendor Name" value={purchasedVendorName || 'N/A'} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoSection
            label="Purchase Date"
            value={resourcePurchaseDate ? dayjs(resourcePurchaseDate).format('DD MMM YYYY') : 'N/A'}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <InfoSection label="Resource Bill" value={resourceBill || 'N/A'} />
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <Box>
            <Typography sx={{ fontWeight: 400 }} variant="h6">Status</Typography>
            <Label color={InventoryItemStatusTypeColor[status as InventoryItemStatusType] as LabelColor}>
              {InventoryItemStatusType[status]}
            </Label>
          </Box>
        </Grid> */}

        {/* <Grid item xs={12} sm={6}>
          <InfoSection
            label="Last Updated"
            value={lastUpdatedDate ? dayjs(lastUpdatedDate).format('DD MMM YYYY hh:mm A') : 'N/A'}
          />
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default InventoryManagementDetailsView;
