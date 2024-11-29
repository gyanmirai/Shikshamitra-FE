import React, { useState } from 'react';

import { Save } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Button,
  Switch,
  FormGroup,
  CardHeader,
  CardContent,
  FormControlLabel,
} from '@mui/material';

import { Editor } from 'src/components/editor';

const Notification = () => {
  const [template, setTemplate] = useState('');

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" py={2}>
        <Button startIcon={<Save />} variant="contained">
          Save
        </Button>
      </Box>
      <Card sx={{ p: 2 }}>
        <FormGroup>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable Email Notifications"
          />
          <FormControlLabel control={<Switch />} label="Enable SMS Notifications" />
        </FormGroup>
      </Card>

      <Card sx={{ my: 2 }}>
        <CardHeader title="Notification Templates" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Editor
                // onChange={(value) => {
                //   setFieldValue('description', value);
                // }}
                // value={values.description}
                placeholder="Notification Format"
                sx={{ height: '100%' }}
                slotProps={{
                  wrap: {
                    height: '100%',
                  },
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
