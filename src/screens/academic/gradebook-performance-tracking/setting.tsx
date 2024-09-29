import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import {
  Card,
  Grid,
  Button,
  Switch,
  Typography,
  CardContent,
  FormControlLabel,
} from '@mui/material';

const Setting = () => (
  <Grid container spacing={3} style={{ padding: 20 }}>
    {/* Grading Scales Section */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h5">Grading Scales</Typography>
          <Button variant="contained" startIcon={<AddIcon />} style={{ marginBottom: 20 }}>
            Add new grade scale
          </Button>
        </CardContent>
      </Card>
    </Grid>

    {/* Weighting Assignments Section */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h5">Weighting Assignments</Typography>
          <Button variant="contained" startIcon={<AddIcon />} style={{ marginBottom: 20 }}>
            Add new category
          </Button>
          {/* Example content for categories */}
          <Typography>Assignment 1 - 50%</Typography>
          <Typography>Assignment 2 - 50%</Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Notifications & Alerts Section */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h5">Notifications & Alerts</Typography>
          <FormControlLabel control={<Switch color="primary" />} label="Missing Grades Alert" />
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Overdue Assessments Alert"
          />
          <FormControlLabel control={<Switch color="primary" />} label="Performance Alerts" />
        </CardContent>
      </Card>
    </Grid>

    {/* Grade Submission Settings Section */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h5">Grade Submission Settings</Typography>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Reminder about upcoming grade submission deadlines"
          />
          {/* Example date picker and other settings could go here */}
          <Typography>Date Picker (Placeholder)</Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Dialog for Adding New Grade Scale */}
    {/* <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>Add New Grade Scale</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="grade-name"
          label="Grade Name"
          type="text"
          fullWidth
          variant="standard"
        />
        <TextField
          margin="dense"
          id="grade-range"
          label="Grade Range"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={handleDialogClose}>Save</Button>
      </DialogActions>
    </Dialog> */}
  </Grid>
);

export default Setting;
