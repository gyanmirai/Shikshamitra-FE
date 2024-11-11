import React from 'react';

import { Box } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const CurrencySettingForDifferentRegionComponent = () => (
  <>
    {/* <Typography component="span" variant="h6">
      Currency Settings for Different Regions
    </Typography> */}
    <Box py="15px" display="flex" flexDirection="column" gap={3}>
      <CustomSelect
        label="Select region or country"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 230 } }}
      />
      <CustomSelect
        label="Select Currency"
        options={[]}
        value=""
        onChange={() => {}}
        formControlProps={{ sx: { maxWidth: 230 } }}
      />
    </Box>
  </>
);

export default CurrencySettingForDifferentRegionComponent;
