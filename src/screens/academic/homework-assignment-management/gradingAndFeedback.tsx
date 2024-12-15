import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  ListItemText,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const GradingAndFeedback = (props: TabComponentType) => (
  <Box sx={{ p: 1 }}>
    <Typography variant="h6" gutterBottom>
      Grading Rubric
    </Typography>
    <CustomizableTable
      columns={[
        { id: 'criteriaName', label: 'Criteria Name' },
        { id: 'scoreInput', label: 'Score Input' },
        { id: 'totalScore', label: 'Total Score' },
        {
          id: 'action',
          label: 'Action',
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem>
                      <Iconify icon="solar:pen-bold" />
                      <ListItemText>Edit</ListItemText>
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={[
        {
          criteriaName: 'Content',
          scoreInput: '20',
          totalScore: '20',
        },
        {
          criteriaName: 'Oraganization',
          scoreInput: '20',
          totalScore: '20',
        },
        {
          criteriaName: 'Grammar',
          scoreInput: '20',
          totalScore: '20',
        },
        {
          criteriaName: 'Oraganization',
          scoreInput: '20',
          totalScore: '20',
        },
        {
          criteriaName: 'Grammar',
          scoreInput: '20',
          totalScore: '20',
        },
      ]}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
      <Typography variant="h6" gutterBottom>
        Feedback Templates
      </Typography>
      <TextField
        placeholder="Detailed Feedback"
        multiline
        rows={4}
        sx={{ maxWidth: '300px', width: '100%' }}
      />
      <CustomSelect
        label="Quick Feedback"
        options={[
          { value: 'greatJob', label: 'Great Job' },
          { value: 'needsImprovement', label: 'Needs Improvement' },
          { value: 'missingKeyDetails', label: 'Missing Key Details' },
        ]}
        value=""
        onChange={() => {}}
        formControlProps={{
          fullWidth: true,
          sx: { maxWidth: '300px', width: '100%', marginBottom: 8 },
        }}
      />
    </Box>
    <Button
      color="secondary"
      variant="contained"
      sx={{ maxWidth: '200px', width: '100%', marginLeft: '110px', marginBottom: '20px' }}
    >
      Insert
    </Button>
  </Box>
);

export default GradingAndFeedback;
