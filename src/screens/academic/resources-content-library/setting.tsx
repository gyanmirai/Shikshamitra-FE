import React from 'react';

import { Box, Button, Switch, Divider, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import CustomSelect from 'src/components/custom-select';

import { FileStorageOverview } from 'src/sections/file-manager/file-storage-overview';

const GB = 1000000000 * 24;
const Setting = () => (
  <Box>
    <Typography variant="h6">Notifications</Typography>

    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch />
        <Typography>New Resources</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch />
        <Typography>Shared Content</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch />
        <Typography>Content Updates</Typography>
      </Box>
    </Box>
    <Divider sx={{ my: 2 }} />
    <Box display="flex" gap={2} flexWrap="wrap">
      <CustomSelect options={[]} label="Who can upload resources" value="" onChange={() => {}} />
      <CustomSelect options={[]} label="Who can edit resources" value="" onChange={() => {}} />
      <CustomSelect options={[]} label="Who can edit resources" value="" onChange={() => {}} />
      <Button variant="contained" color="error">
        Reset
      </Button>
      <Button variant="contained">Save</Button>
    </Box>
    <FileStorageOverview
      total={GB}
      chart={{ series: 76 }}
      data={[
        {
          name: 'Images',
          usedStorage: GB / 2,
          filesCount: 223,
          icon: (
            <Box component="img" src={`${CONFIG.site.basePath}/assets/icons/files/ic-img.svg`} />
          ),
        },
        {
          name: 'Media',
          usedStorage: GB / 5,
          filesCount: 223,
          icon: (
            <Box component="img" src={`${CONFIG.site.basePath}/assets/icons/files/ic-video.svg`} />
          ),
        },
        {
          name: 'Documents',
          usedStorage: GB / 5,
          filesCount: 223,
          icon: (
            <Box
              component="img"
              src={`${CONFIG.site.basePath}/assets/icons/files/ic-document.svg`}
            />
          ),
        },
        {
          name: 'Other',
          usedStorage: GB / 10,
          filesCount: 223,
          icon: (
            <Box component="img" src={`${CONFIG.site.basePath}/assets/icons/files/ic-file.svg`} />
          ),
        },
      ]}
      sx={{ mt: 2 }}
    />
  </Box>
);

export default Setting;
