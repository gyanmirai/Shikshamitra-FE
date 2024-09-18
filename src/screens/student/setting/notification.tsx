import React, { useState } from 'react';

import { Save } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Button, TextField, CardHeader, CardContent } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const Notification = () => {
  const [trigger, setTrigger] = useState<string>('');
  const [threshold, setThreshold] = useState('');
  const [action, setAction] = useState('');
  const [template, setTemplate] = useState('');

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" py={2}>
        <Button startIcon={<Save />} variant="contained">
          Save
        </Button>
      </Box>
      <Card>
        <CardHeader title="New Rule" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={3}>
              <CustomSelect
                options={[]}
                label="Event trigger"
                value={trigger}
                onChange={(val) => setTrigger(val as string)}
                formControlProps={{
                  fullWidth: true,
                }}
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                fullWidth
                label="Threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid xs={3}>
              <CustomSelect
                options={[
                  { label: 'Send Email', value: 'sendEmail' },
                  { label: 'Push Notification', value: 'pushNotification' },
                ]}
                label="Action"
                value={action}
                onChange={(val) => setAction(val as string)}
                formControlProps={{
                  fullWidth: true,
                }}
              />
            </Grid>
            <Grid xs={3}>
              <Button variant="contained">Add Rule</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ my: 2 }}>
        <CardHeader title="Notification Templates" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={3}>
              <CustomSelect
                options={[]}
                label="Predefined Templates"
                value={template}
                onChange={(val) => setTemplate(val as string)}
                formControlProps={{
                  fullWidth: true,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Notification;
