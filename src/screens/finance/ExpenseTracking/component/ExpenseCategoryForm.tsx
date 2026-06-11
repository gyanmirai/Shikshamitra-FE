import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import { Box, Paper, Stack, Button, Divider, Typography } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import ExpenseFormFields from './ExpenseFormFields';
import { useExpenseForm } from '../hooks/useExpenseForm';

import type { IExpenseFormProps } from './type';

const ExpenseCategoryForm: React.FC<IExpenseFormProps> = ({ open, onClose, editData }) => {
  const {
    formik,
    addLoading,
    updateLoading,
    uploadLoading,
    categoryOptions,
    paymentMethodOptions,
    currentYear,
    categoryOptionsLoading,
    handleFileUpload,
  } = useExpenseForm({ onClose, editData });

  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({
    expenseDetails: true,
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
      categoryId: 'expenseDetails',
      categoryTags: 'expenseDetails',
      name: 'expenseDetails',
      amount: 'expenseDetails',
      paymentDate: 'expenseDetails',
      paymentMethod: 'expenseDetails',
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
          <ExpenseFormFields
            formik={formik}
            categoryOptions={categoryOptions?.items || []}
            currentYear={currentYear}
            paymentMethodOptions={paymentMethodOptions}
            categoryOptionsLoading={categoryOptionsLoading}
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

        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onClose(null, false)}
            color="inherit"
            disabled={addLoading || updateLoading || uploadLoading}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            loading={addLoading || updateLoading || uploadLoading}
            disabled={addLoading || updateLoading || uploadLoading}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={16}
                height={16}
              />
            }
            onClick={handleSubmit}
            type="button"
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </Box>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExpenseCategoryForm;
