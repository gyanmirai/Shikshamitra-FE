import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import { Box, Paper, Stack, Divider, Typography } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import IncomeFormFields from './IncomeFormFields';
import IncomeFormActions from './IncomeFormActions';
import { useIncomeForm } from '../hooks/useIncomeForm';

import type { IIncomeTrackingFormProps } from '../types';

const IncomeTrackingForm: React.FC<IIncomeTrackingFormProps> = ({ open, onClose, editData }) => {
  const {
    formik,
    incomeCategoryOptions,
    paymentMethodOptions,
    currentYear,
    addLoading,
    updateLoading,
    uploadLoading,
    incomeOptionsLoading,
    handleFileUpload,
  } = useIncomeForm(onClose, editData);

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    incomeDetails: true,
    additionalNotes: true,
  });

  const handleAccordionToggle = useCallback((panel: string) => {
    setExpandedPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  }, []);

  const handleFileChange = useCallback(
    async (files: (File | string)[]) => {
      try {
        const uploadedUrl = await handleFileUpload(files);
        formik.setFieldValue('document', uploadedUrl);
        shikshaMitraToast.success({
          message: 'Document uploaded successfully',
        });
      } catch (error) {
        console.error('File upload error:', error);
      }
    },
    [formik, handleFileUpload]
  );

  const handleSubmit = useCallback(() => {
    const fieldToPanelMap: Record<string, string> = {
      categoryId: 'incomeDetails',
      categoryTags: 'incomeDetails',
      name: 'incomeDetails',
      amount: 'incomeDetails',
      paymentMethod: 'incomeDetails',
      paymentDate: 'incomeDetails',
      notes: 'additionalNotes',
    };

    formik.validateForm().then((errors) => {
      const errorKeys = Object.keys(errors);
      if (errorKeys.length > 0) {
        const panelsToOpen: Record<string, boolean> = {};
        errorKeys.forEach((key) => {
          if (fieldToPanelMap[key]) {
            panelsToOpen[fieldToPanelMap[key]] = true;
          }
        });
        setExpandedPanels((prev) => ({ ...prev, ...panelsToOpen }));
      }
      formik.handleSubmit();
    });
  }, [formik]);

  if (!open.value) return null;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar
          sx={{
            height: '100%',
            p: 2,
          }}
        >
          <IncomeFormFields
            formik={formik}
            incomeCategoryOptions={incomeCategoryOptions?.items || []}
            paymentMethodOptions={paymentMethodOptions}
            currentYear={currentYear}
            incomeOptionsLoading={incomeOptionsLoading}
            expandedPanels={expandedPanels}
            onAccordionToggle={handleAccordionToggle}
          />

          {/* ── Section: Attachments ──────────────────────────── */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              transition: 'box-shadow 0.2s ease',
              '&:hover': { boxShadow: 4 },
            }}
          >
            <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
              <Iconify icon="mdi:paperclip" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Attachments
              </Typography>
              <Typography variant="caption" color="text.secondary">
                — Supporting document
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <CustomUpload
              onChange={(files) => {
                handleFileChange(files);
              }}
              value={formik.values.document ? [formik.values.document] : []}
              label="Drag & drop file here, or click to browse"
              outputFormat="file"
            />
          </Paper>
        </Scrollbar>

        <IncomeFormActions
          onClose={onClose}
          isLoading={addLoading || updateLoading || uploadLoading}
          isEdit={!!editData}
          onSubmit={handleSubmit}
        />
      </Box>
    </BackPopUpChecked>
  );
};

export default IncomeTrackingForm;
