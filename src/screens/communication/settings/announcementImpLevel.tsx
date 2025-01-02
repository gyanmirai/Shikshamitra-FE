import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

interface TImportant {}

const AnnouncementImpLevel = (props: TabComponentType) => {
  const dialog = useBoolean();
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="flex-end" mb={3}>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            onClick={() => {
              dialog.onTrue();
            }}
          >
            Add Important Level
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AnnouncementImpLevel;
