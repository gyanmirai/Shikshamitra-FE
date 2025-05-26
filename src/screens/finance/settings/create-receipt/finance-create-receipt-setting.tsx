'use client';

import React, { useState } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TemplateOne from './Templates/templates-one';
import ChargesTemplateOne from './charges-templates/charges_template_one';
import FeeRefundTemplateOne from './fee-refund-templates/fee-refund-templates.one';

const FinanceCreateReceiptSetting = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('TemplateOne');

  const handleTemplateSelection = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  const handleSave = () => {
    console.log('Selected Template:', selectedTemplate);
  };

  const feeTemplates = [
    { id: 'TemplateOne', component: TemplateOne },
    // add more fee templates here later
  ];

  const chargeTemplates = [
    { id: 'TemplateTwo', component: ChargesTemplateOne },
    // add more charge templates here later
  ];

  const refundTemplates = [
    { id: 'TemplateThree', component: FeeRefundTemplateOne },
    // add more refund templates here later
  ];

  const links = [
    {
      name: 'Finance',
      href: '/finance/dashboard',
    },
    {
      name: 'Setting',
      href: '',
    },
    {
      name: 'Receipt Templates',
      href: '',
    },
  ];

  const renderTemplateSection = (title: string, templates: any[]) => (
    <Box mb={5} mt={5}>
      <Typography variant="h6" mb={2}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
        {templates.map((template) => {
          const TemplateComponent = template.component;
          return (
            <Box
              key={template.id}
              minWidth={400}
              maxWidth={450}
              sx={{ border: '1px solid #ccc', borderRadius: 2, p: 1, flexShrink: 0 }}
            >
              <TemplateComponent
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateSelection}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  return (
    <>
      <CustomBreadcrumbs
        heading="Receipt Templates"
        description="Choose and manage different receipt templates for fees, charges, and refunds. Customize them as per your institution’s needs for consistent and professional documentation."
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              handleSave();
            }}
          >
            Save
          </Button>
        }
      />

      {renderTemplateSection('Fee Receipt Templates', feeTemplates)}
      {renderTemplateSection('Charges Receipt Templates', chargeTemplates)}
      {renderTemplateSection('Refund Receipt Templates', refundTemplates)}
    </>
  );
};

export default FinanceCreateReceiptSetting;
