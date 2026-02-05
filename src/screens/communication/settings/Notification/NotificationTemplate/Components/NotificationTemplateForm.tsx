'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import NotificationTemplatePreview from './NotificationTemplatePreview';
import NotificationTemplateFormFields from './NotificationTemplateFormFields';
import { useNotificationTemplateForm } from '../hooks/useNotificationTemplateForm';

import type { INotificationTemplateFormProps } from '../types';

const NotificationTemplateForm: React.FC<INotificationTemplateFormProps> = ({
  open,
  onClose,
  editData,
}) => {
  const {
    formik,
    tag,
    setTag,
    roleOptions,
    roleLoading,
    isSubmitting,
    handleEditorChange,
    handleTagKeyDown,
    handleDeleteTag,
  } = useNotificationTemplateForm({ onClose, editData });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <Scrollbar
            sx={{
              p: 2,
              height: '100%',
              '& .simplebar-wrapper': {
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <Grid container spacing={2}>
              {/* Form Fields Section */}
              <Grid size={{ xs: 6 }}>
                <NotificationTemplateFormFields
                  formik={formik}
                  roleOptions={roleOptions}
                  roleLoading={roleLoading}
                  tag={tag}
                  setTag={setTag}
                  handleTagKeyDown={handleTagKeyDown}
                  handleDeleteTag={handleDeleteTag}
                  handleEditorChange={handleEditorChange}
                />
              </Grid>

              {/* Preview Section */}
              {formik.values && formik.values.templateName && (
                <Grid size={{ xs: 6 }}>
                  <NotificationTemplatePreview values={formik.values} />
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          {/* Actions */}
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onClose(null, false)}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <LoadingButton
              loading={isSubmitting}
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={editData ? 16 : 20}
                  height={editData ? 16 : 20}
                />
              }
              type="submit"
              variant="contained"
              size="small"
              onClick={(e: any) => formik.handleSubmit(e)}
            >
              {editData ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default NotificationTemplateForm;
