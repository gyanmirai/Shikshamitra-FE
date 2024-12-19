import React from 'react';

import { Box, Grid, Card, Switch, Checkbox, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import type { TabComponentType } from '../hr/leave-request';

const Settings = (props: TabComponentType) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Card sx={{ p: 3 }}>
      <Grid container spacing={1}>
        <Grid container item spacing={3}>
          <Grid item xs={4}>
            <Typography variant="h5" gutterBottom>
              Assignment Preferences
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" gutterBottom>
              Create New Rubric
            </Typography>
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={4}>
            <CustomSelect
              label="Templates"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 340 } }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              name="rubricTitle"
              label="Rubric Title"
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              name="defaultDurationForExam"
              label="Default Duration For Exam"
              onChange={() => {}}
              size="small"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              name="rubricDescription"
              placeholder="Rubric Description"
              multiline
              rows={3}
              size="small"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              name="criteriaName"
              label="Criteria Name"
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={4}>
            <CustomSelect
              label="Late Submission Rule"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 340 } }}
            />
          </Grid>
          <Grid item xs={4}>
            <CustomSelect
              label="Performance Level"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 340 } }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              name="weightage"
              label="Weightage"
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={4}>
            <CustomSelect
              label="Grading Scale"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 340 } }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch />
        <Typography>Re-evaluation Policy</Typography>
      </Box>
    </Card>

    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Setting Section
      </Typography>
      <Typography variant="h5" gutterBottom marginLeft="2px">
        Examination Section
      </Typography>
      <Grid container spacing={1}>
        <Grid container item spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Examination Setting
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Assessment Setting
            </Typography>
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="defaultDurationForExam"
              label="Default Duration For Exam"
              onChange={() => {}}
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="gradingRules"
              label="Grading Rules"
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="gradingScale"
              label="Grading Scale"
              onChange={() => {}}
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="submissionDeadlines"
              label="Submission Deadlines"
              onChange={() => {}}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container item spacing={3}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Switch />
              <Typography>Re-evaluation Policy</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <CustomSelect
              label="Rubric Templates"
              options={[]}
              value=""
              onChange={() => {}}
              formControlProps={{ sx: { minWidth: 340 } }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Checkbox onChange={() => {}} inputProps={{ 'aria-label': 'controlled' }} />
        <Typography>Overdue assessments</Typography>
      </Box>
      <Grid container direction="column" spacing={1}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Assessment Section
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Grading Rules"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 520 } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="rubrics"
            style={{ width: '520px' }}
            label="Rubrics"
            onChange={() => {}}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            name="assesmentDeadline"
            label="Assesment Deadline"
            style={{ width: '520px' }}
            onChange={() => {}}
            size="small"
          />
        </Grid>
      </Grid>
    </Card>
  </Box>
);
export default Settings;
