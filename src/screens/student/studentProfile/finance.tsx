import React from 'react';

import { Box, Card, Stack, Divider, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

import type { StudentTabsComponentType } from '.';

const Finance = (props: StudentTabsComponentType) => (
  <Box>
    <Stack direction="row" spacing={2} alignItems="center">
      <Card
        elevation={3}
        sx={{
          py: 2,
          textAlign: 'center',
          typography: 'h4',
          maxWidth: '250px',
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack width={1}>
            <Box fontSize="14px">
              Tuition Fee Status &nbsp;
              <Label variant="soft" color="success" fontSize="12px" display="inline-block">
                Paid
              </Label>
            </Box>
          </Stack>
        </Stack>
      </Card>
      <Card
        elevation={3}
        sx={{
          py: 2,
          textAlign: 'center',
          typography: 'h4',
          maxWidth: '250px',
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        >
          <Stack width={1}>
            <Box fontSize="14px">
              Scholarship amount &nbsp;
              <Label variant="soft" color="warning" fontSize="12px" display="inline-block">
                10,000
              </Label>
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Stack>

    <Divider sx={{ mt: 2 }} />
    <Typography
      variant="h6"
      sx={{
        p: 1,
        borderRadius: '5px',
        fontSize: '14px !important',
        fontWeight: 'bold',
      }}
    >
      Payment History
    </Typography>

    <CustomizableTable
      columns={[
        { id: 'date', label: 'Date' },
        { id: 'amount', label: 'Amount' },
        { id: 'mode', label: 'mode' },
      ]}
      data={[
        {
          date: '2023-06-30',
          amount: '5,000',
          mode: 'Bank Transfer',
        },
        {
          date: '2022-09-01',
          amount: '5,000',
          mode: 'Cash',
        },
      ]}
    />
  </Box>
);

export default Finance;
