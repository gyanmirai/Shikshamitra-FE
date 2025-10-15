'use client';

import { debounce } from 'lodash';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { notificationTemplateValidationSchema } from './notificationTemplateValidation';
import { getNotificationTemplateInitialValues } from './getNotificationTemplateInitialValues';

import type { INotificationTemplateFormProps } from './type';

const NotificationTemplateForm: React.FC<INotificationTemplateFormProps> = ({
  open,
  onClose,
  editData,
}) => {
  const [tag, setTag] = useState('');
  const { data: roleOptions, isLoading: roleLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const formik = useFormik({
    initialValues: getNotificationTemplateInitialValues(editData),
    validationSchema: notificationTemplateValidationSchema,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({
          message: `Template : ${values.templateName} has been successfully updated`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Template : ${values.templateName} has been successfully created`,
        });
      }
      onClose(null, true);
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditorChange = useCallback(
    debounce((value, setFieldValue) => {
      setFieldValue('message', value);
    }, 300),
    []
  );

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tag.trim();
      if (trimmed && !formik.values.hashtags.includes(trimmed)) {
        formik.setFieldValue('hashtags', [...formik.values.hashtags, trimmed]);
        setTag('');
      }
    }
  };

  const handleDelete = (deleteTag: any) => {
    formik.setFieldValue(
      'hashtags',
      formik.values.hashtags.filter((t) => t !== deleteTag)
    );
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ height: '100%' }}>
            <DialogScrollContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <SectionCard title="Basic Information">
                    {/* Template Name */}
                    <Grid size={12}>
                      <ShakingTextField
                        error={
                          !!(formik.touched.templateName && formik.errors.templateName) || false
                        }
                      >
                        <TextField
                          fullWidth
                          label="Template Name *"
                          name="templateName"
                          size="small"
                          value={formik.values.templateName}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[^a-zA-Z0-9\s]/g, '')
                              .split(' ')
                              .map((word) =>
                                word
                                  ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  : ''
                              )
                              .join(' ');
                            formik.setFieldValue('templateName', value);
                          }}
                          error={formik.touched.templateName && Boolean(formik.errors.templateName)}
                          helperText={
                            (formik.touched.templateName && formik.errors.templateName) as string
                          }
                        />
                      </ShakingTextField>
                    </Grid>

                    {/* Target Role */}
                    <Grid size={12}>
                      <CustomSelect
                        options={roleOptions?.items || []}
                        value={formik.values.targetRole}
                        isLoading={roleLoading}
                        name="targetRole"
                        label="Role *"
                        valueKey="name"
                        labelKey="name"
                        onChange={(val) => {
                          formik.setFieldValue('targetRole', val);
                        }}
                        error={formik.touched.targetRole && Boolean(formik.errors.targetRole)}
                        helperText={
                          ((formik.touched.targetRole && formik.errors.targetRole) as string) || ''
                        }
                      />
                    </Grid>

                    {/* Subject */}
                    <Grid size={12}>
                      <ShakingTextField
                        error={!!(formik.touched.subject && formik.errors.subject) || false}
                      >
                        <TextField
                          fullWidth
                          label="Subject *"
                          name="subject"
                          size="small"
                          value={formik.values.subject}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/[^a-zA-Z\s]/g, '')
                              .split(' ')
                              .map((word) =>
                                word
                                  ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                  : ''
                              )
                              .join(' ');
                            formik.setFieldValue('subject', value);
                          }}
                          error={formik.touched.subject && Boolean(formik.errors.subject)}
                          helperText={(formik.touched.subject && formik.errors.subject) as string}
                        />
                      </ShakingTextField>
                    </Grid>

                    {/* Message Body */}
                    <Grid size={12}>
                      <ShakingTextField
                        error={!!(formik.touched.message && formik.errors.message) || false}
                      >
                        <Editor
                          value={formik.values.message}
                          onChange={(value) => handleEditorChange(value, formik.setFieldValue)}
                          placeholder="Message"
                          error={!!(formik.touched.message && formik.errors.message)}
                          helperText={(formik.touched.message && formik.errors.message) || ''}
                        />
                      </ShakingTextField>
                    </Grid>

                    {/* Tags */}
                    <Grid size={{ xs: 12 }}>
                      {/* Render Chips */}

                      {/* Input with Add Button */}

                      <TextField
                        fullWidth
                        size="small"
                        label="Tags"
                        placeholder="Type a tag and press Enter"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.5,
                                alignItems: 'center',
                                maxWidth: '100%',
                              }}
                            >
                              {formik.values.hashtags.map((t, index) => (
                                <Chip
                                  key={index}
                                  label={t}
                                  onDelete={() => handleDelete(t)}
                                  size="small"
                                />
                              ))}
                            </Box>
                          ),
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                            minHeight: 'auto',
                            pt: '10px',
                          },
                          '& .MuiInputBase-input': {
                            flexGrow: 1,
                            minWidth: '80px',
                            mb: '4px',
                          },
                        }}
                      />
                    </Grid>
                  </SectionCard>
                </Grid>
                {formik.values && formik.values.templateName && (
                  <Grid size={{ xs: 6 }}>
                    <SectionCard title="Preview">
                      {' '}
                      <Grid size={12}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          sx={{ p: 2, border: '1px solid grey', borderRadius: 2 }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            Subject : {formik.values.subject || 'No Subject'}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          {/* Message */}
                          <Typography variant="subtitle1" fontWeight="bold">
                            Dear {`{${formik.values.targetRole}_name}`},
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              component="div"
                              variant="body2"
                              dangerouslySetInnerHTML={{ __html: formik.values.message || '' }}
                            />
                          </Box>
                          {/* Hashtags */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {formik.values.hashtags?.map((value: string, index: number) => (
                              <Chip
                                key={index}
                                label={`#${value}`}
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    </SectionCard>
                  </Grid>
                )}
              </Grid>
            </DialogScrollContent>
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
            <Button
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
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default NotificationTemplateForm;
