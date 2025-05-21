'use client';

import React, { useState } from 'react';

import { Box, Grid, Button, Typography } from '@mui/material';

import TemplateOne from './Templates/templates-one';

const templates = [{ id: 'TemplateOne', component: TemplateOne }];

const FinanceCreateReceiptSetting = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('TemplateOne');

  const handleTemplateSelection = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  const handleSave = () => {
    console.log('Selected Template:', selectedTemplate);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={4}>
        <Typography variant="h5">Select a Template For Fee Receipt</Typography>
        <Button sx={{ mr: '20px' }} size="small" variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Box>

      {/* Responsive Grid Layout */}
      <Grid container spacing={2}>
        {templates.map((template) => {
          const TemplateComponent = template.component;
          return (
            <Grid item xs={6} sm={4} md={4} key={template.id}>
              <TemplateComponent
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateSelection}
              />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default FinanceCreateReceiptSetting;
